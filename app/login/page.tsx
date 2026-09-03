"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { ArrowRight, ShieldCheck } from "lucide-react";

function destination(role: unknown) {
  return role === "admin" ? "/admin" : role === "faculty" ? "/faculty" : "/student";
}

function errorCode(error: unknown) {
  return error && typeof error === "object" && "code" in error
    ? String((error as { code: string }).code)
    : "";
}

function errorMessage(error: unknown) {
  const code = errorCode(error);
  if (code.includes("permission-denied")) {
    return "Firestore denied access. The ASRS Firestore rules must be published in Firebase Console.";
  }
  if (code.includes("unavailable")) return "Firestore is temporarily unavailable. Try again.";
  if (code.includes("invalid-api-key")) return "Firebase API configuration is invalid.";
  return error instanceof Error ? error.message : "Unable to open your profile.";
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [expectedRole, setExpectedRole] = useState<"student" | "faculty" | "admin">("student");

  async function routeUser(uid: string, userEmail: string | null) {
    const db = getFirebaseDb();
    const ref = doc(db, "profiles", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      setMessage("This account has no ASRS profile yet. Faculty and administrator accounts must be provisioned by an administrator.");
      return;
    }

    const profile = snap.data() || {};
    // Normalize role values so legacy records such as "Admin" still work.\n    const actualRole = typeof profile.role === "string" ? profile.role.trim().toLowerCase() : "";

    if (!["student", "faculty", "admin"].includes(actualRole)) {
      setMessage("Your ASRS account does not have a valid role. Ask an administrator to provision it.");
      return;
    }

    if (actualRole !== expectedRole) {
      const names = { student: "Student", faculty: "Faculty", admin: "Administrator" };
      setMessage(`This account is registered as ${names[actualRole as "student" | "faculty" | "admin"]}. Select "${names[actualRole as "student" | "faculty" | "admin"]}" and sign in again.`);
      await getFirebaseAuth().signOut();
      return;
    }

    window.location.replace(destination(actualRole));
  }

  useEffect(() => {
    const role = new URLSearchParams(window.location.search).get("role");
    if (role === "student" || role === "faculty" || role === "admin") {
      setExpectedRole(role);
    }

    let unsubscribe: (() => void) | undefined;
    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) return;
        try {
          await routeUser(user.uid, user.email);
        } catch (error) {
          setMessage(errorMessage(error));
          setBusy(false);
        }
      });
    } catch (error) {
      setMessage(errorMessage(error));
    }
    return () => unsubscribe?.();
  }, []);

  async function resetPassword() {
    const targetEmail = email.trim().toLowerCase();

    if (!targetEmail) {
      setMessage("Enter your email address first, then choose Forgot password.");
      return;
    }

    setBusy(true);
    setMessage("Sending password reset email…");

    try {
      await sendPasswordResetEmail(getFirebaseAuth(), targetEmail);
      setMessage("Password reset email sent. Check your inbox and follow the reset link.");
    } catch (error) {
      const code = errorCode(error);
      setMessage(
        code.includes("user-not-found")
          ? "No ASRS account was found for this email."
          : code.includes("invalid-email")
            ? "Enter a valid email address."
            : errorMessage(error)
      );
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("Signing in and loading your ASRS profile…");

    try {
      const credential = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim().toLowerCase(),
        password
      );
      await routeUser(credential.user.uid, credential.user.email);
    } catch (error) {
      const code = errorCode(error);
      setMessage(
        code.includes("invalid-credential") ||
        code.includes("wrong-password") ||
        code.includes("user-not-found")
          ? "Email or password is incorrect."
          : errorMessage(error)
      );
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <nav className="nav">
        <Link href="/" className="brand" style={{ color: "inherit", textDecoration: "none" }}>
          <div className="logo">A</div>
          <div>ASRS<small>Secure Academic Records</small></div>
        </Link>
        {expectedRole === "student" ? (
          <Link href="/register" className="button">Create a new student account</Link>
        ) : (
          <span className="auth-nav-note">
            {expectedRole === "faculty"
              ? "Faculty accounts are provisioned by ASRS"
              : "Administrator accounts are provisioned by ASRS"}
          </span>
        )}
      </nav>

      <section className="auth-shell">
        <div className="auth-card">
          <div className="auth-icon"><ShieldCheck size={26}/></div>
          <span className="eyebrow">Firebase Authentication</span>
          <h1>Welcome back.</h1>
          <p>Sign in with your provisioned ASRS account. Students can register; faculty and administrators cannot create accounts from this page.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, margin: "20px 0" }}>
            {([
              ["student", "Student"],
              ["faculty", "Faculty"],
              ["admin", "Administrator"],
            ] as const).map(([role, label]) => (
              <button
                key={role}
                type="button"
                className={"button " + (expectedRole === role ? "active" : "")}
                onClick={() => { setExpectedRole(role); setMessage(""); }}
                disabled={busy}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="auth-note" style={{ marginBottom: 16 }}>
            Selected role: <strong>{expectedRole === "admin" ? "Administrator" : expectedRole === "faculty" ? "Faculty" : "Student"}</strong>
          </div>
          <form onSubmit={submit}>
            <label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" required /></label>
            <label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete="current-password" required /></label>
            <button className="button primary wide" disabled={busy}>{busy ? "Signing in…" : "Sign in"} <ArrowRight size={17}/></button>
            <button
              type="button"
              className="button wide"
              disabled={busy}
              onClick={resetPassword}
              style={{ marginTop: 10 }}
            >
              Forgot password?
            </button>
          </form>
          {message && <div className="status">{message}</div>}
          <div className="auth-note">Students can create an account. Faculty and Administrator accounts are created/provisioned separately by an ASRS administrator, then those users sign in here with their assigned credentials.</div>
        </div>
      </section>
    </main>
  );
}
