"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";

function codeOf(error: unknown) {
  return error && typeof error === "object" && "code" in error
    ? String((error as { code: string }).code)
    : "";
}

function messageFor(error: unknown) {
  const code = codeOf(error);
  if (code.includes("auth/email-already-in-use")) {
    return "This email already has a Firebase account. Go to Sign in and use that account. A new Firebase account cannot be created with the same email.";
  }
  if (code.includes("auth/invalid-api-key")) return "Firebase configuration is invalid.";
  if (code.includes("auth/operation-not-allowed")) return "Email/password authentication is disabled in Firebase Authentication.";
  if (code.includes("auth/weak-password")) return "Password must contain at least 6 characters.";
  if (code.includes("auth/invalid-email")) return "Please enter a valid email address.";
  if (code.includes("permission-denied") || code.includes("firestore/permission-denied")) {
    return "Firebase Authentication succeeded, but Firestore rejected the profile write. Publish the ASRS Firestore rules, then try again.";
  }
  if (code.includes("unavailable")) return "Firestore is temporarily unavailable. Please try again.";
  return error instanceof Error ? error.message : "Account creation failed.";
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
    if (busy) return;

    const cleanName = name.trim();
    const cleanRoll = roll.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanRoll || !cleanEmail || password.length < 6) {
      setMessage("Complete all fields. Password must contain at least 6 characters.");
      return;
    }

    setBusy(true);
    setMessage("Creating Firebase account and saving your student profile…");

    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();

      // One successful registration creates BOTH:
      // 1. Firebase Authentication user
      // 2. Firestore profiles/{uid} document
      const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);

      await setDoc(doc(db, "profiles", credential.user.uid), {
        fullName: cleanName,
        rollNo: cleanRoll,
        department: dept,
        email: cleanEmail,
        role: "student",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setMessage("Account and Firestore profile created successfully. Opening Student Portal…");
      window.location.replace("/student");
    } catch (error) {
      setMessage(messageFor(error));
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
          <p>One registration creates your Firebase login and your student profile in the ASRS Firestore database.</p>

          <form onSubmit={submit}>
            <label>Full name
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your full name" required />
            </label>
            <label>Roll number
              <input value={roll} onChange={(e) => setRoll(e.target.value)} placeholder="B25EE023" required />
            </label>
            <label>Department
              <select value={dept} onChange={(e) => setDept(e.target.value)}>
                <option>CSE</option><option>ECE</option><option>EE</option><option>ME</option><option>Other</option>
              </select>
            </label>
            <label>Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" required />
            </label>
            <label>Password
              <input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="At least 6 characters" required />
            </label>
            <button type="submit" className="button primary wide" disabled={busy}>
              {busy ? "Creating account…" : "Create account"}
            </button>
          </form>

          {message && <div className="status">{message}</div>}
          <div className="auth-note">
            Already registered? <Link href="/login">Sign in instead</Link>.
          </div>
        </div>
      </section>
    </main>
  );
}
