import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProvisionBody = {
  fullName?: string;
  email?: string;
  password?: string;
  department?: string;
  employeeId?: string;
  role?: "faculty" | "admin";
};

function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) return fail("Authentication required.", 401);

    const idToken = authorization.slice("Bearer ".length).trim();
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const caller = await adminAuth.verifyIdToken(idToken);

    const callerProfile = await adminDb.collection("profiles").doc(caller.uid).get();
    const callerRole = callerProfile.exists && typeof callerProfile.data()?.role === "string"\n      ? callerProfile.data()?.role.trim().toLowerCase()\n      : "";\n    if (!callerProfile.exists || callerRole !== "admin") {
      return fail("Only an authorized ASRS administrator can provision accounts.", 403);
    }

    const body = (await request.json()) as ProvisionBody;
    const fullName = body.fullName?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password || "";
    const department = body.department?.trim();
    const employeeId = body.employeeId?.trim();
    const role = body.role;

    if (!fullName || !email || !password || !department || !employeeId) {
      return fail("Name, email, password, department and employee ID are required.");
    }
    if (role !== "faculty" && role !== "admin") {
      return fail("Only Faculty or Administrator accounts can be provisioned here.");
    }
    if (password.length < 6) return fail("Temporary password must be at least 6 characters.");

    const existingProfile = await adminDb.collection("profiles")
      .where("email", "==", email).limit(1).get();
    if (!existingProfile.empty) return fail("An ASRS profile already exists for this email.", 409);

    let createdUser;
    try {
      createdUser = await adminAuth.createUser({
        email, password, displayName: fullName, emailVerified: false,
      });

      await adminDb.collection("profiles").doc(createdUser.uid).set({
        fullName, email, department, employeeId, role,
        createdBy: caller.uid, createdAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        ok: true,
        message: role === "faculty" ? "Faculty account created successfully." : "Administrator account created successfully.",
        uid: createdUser.uid, email, role,
      });
    } catch (error) {
      if (createdUser?.uid) {
        try { await adminAuth.deleteUser(createdUser.uid); } catch {}
      }
      throw error;
    }
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error
      ? String((error as { code: string }).code) : "";

    if (code.includes("auth/id-token-expired") || code.includes("auth/argument-error")) {
      return fail("Your admin session expired. Sign in again.", 401);
    }
    if (code.includes("auth/email-already-exists")) {
      return fail("This email already has a Firebase Authentication account.", 409);
    }

    console.error("Provisioning error:", error);
    return fail(error instanceof Error ? error.message : "Unable to provision the account.", 500);
  }
}
