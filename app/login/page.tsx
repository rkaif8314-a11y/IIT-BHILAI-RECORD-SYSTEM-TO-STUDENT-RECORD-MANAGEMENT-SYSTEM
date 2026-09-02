"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
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

  async function routeUser(uid: string, userEmail: string | null) {
    const db = getFirebaseDb();
    const ref = doc(db, "profiles", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        fullName: userEmail?.split("@")[0] || "Student",
        rollNo: "",
        department: "",
        role: "student",
        email: userEmail || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const profile = (await getDoc(ref)).data() || {};
    window.location.replace(destination(profile.role));
  }

  useEffect(() => {
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
        <Link href="/register" className="button">Create student account</Link>
      </nav>

      <section className="auth-shell">
        <div className="auth-card">
          <div className="auth-icon"><ShieldCheck size={26}/></div>
          <span className="eyebrow">Firebase Authentication</span>
          <h1>Welcome back.</h1>
          <p>Sign in to open your role-based ASRS workspace.</p>
          <form onSubmit={submit}>
            <label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" required /></label>
            <label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete="current-password" required /></label>
            <button className="button primary wide" disabled={busy}>{busy ? "Signing in…" : "Sign in"} <ArrowRight size={17}/></button>
          </form>
          {message && <div className="status">{message}</div>}
          <div className="auth-note">Students can create an account. Faculty and administrator accounts are provisioned by an administrator.</div>
        </div>
      </section>
    </main>
  );
}
