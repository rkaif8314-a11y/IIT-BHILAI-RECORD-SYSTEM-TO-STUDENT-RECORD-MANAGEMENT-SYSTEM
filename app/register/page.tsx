"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";

function firebaseMessage(code: string, fallback: string) {
  if (code.includes("auth/email-already-in-use")) return "This email already has an ASRS account.";
  if (code.includes("auth/weak-password")) return "Password must contain at least 6 characters.";
  if (code.includes("auth/invalid-email")) return "Please enter a valid email address.";
  if (code.includes("auth/operation-not-allowed")) return "Email/password sign-in is not enabled in Firebase.";
  if (code.includes("permission-denied")) return "Firebase denied the profile write. Check Firestore rules.";
  return fallback;
}

export default function Register() {
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dept, setDept] = useState("CSE");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const cleanName = name.trim();
    const cleanRoll = roll.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanRoll || !cleanEmail || password.length < 6) {
      setMessage("Please complete every field and use a password of at least 6 characters.");
      return;
    }

    setBusy(true);

    try {
      const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), cleanEmail, password);

      await setDoc(doc(getFirebaseDb(), "profiles", credential.user.uid), {
        fullName: cleanName,
        rollNo: cleanRoll,
        department: dept,
        role: "student",
        email: cleanEmail,
        createdAt: serverTimestamp(),
      });

      window.location.replace("/student");
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error
        ? String((error as { code: string }).code)
        : "";
      setMessage(firebaseMessage(code, error instanceof Error ? error.message : "Could not create the account."));
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <nav className="nav">
        <Link href="/" className="brand" style={{ color: "inherit", textDecoration: "none" }}>
          <div className="logo">A</div>
          <div>ASRS<small>Student registration</small></div>
        </Link>
        <Link href="/login" className="button">Sign in</Link>
      </nav>

      <section className="auth-shell">
        <div className="auth-card">
          <span className="eyebrow">New student</span>
          <h1>Create account.</h1>
          <p>Create your student login and personal ASRS profile.</p>

          <form onSubmit={submit}>
            <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your full name" required /></label>
            <label>Roll number<input value={roll} onChange={(e) => setRoll(e.target.value)} placeholder="B25EE023" required /></label>
            <label>Department<select value={dept} onChange={(e) => setDept(e.target.value)}><option>CSE</option><option>ECE</option><option>EE</option><option>ME</option><option>Other</option></select></label>
            <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" required /></label>
            <label>Password<input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="At least 6 characters" required /></label>
            <button type="submit" className="button primary wide" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
          </form>

          {message && (
            <div className="status">
              {message}
              {message.includes("already has") && <>{" "}<Link href="/login" style={{ textDecoration: "underline" }}>Sign in instead →</Link></>}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
