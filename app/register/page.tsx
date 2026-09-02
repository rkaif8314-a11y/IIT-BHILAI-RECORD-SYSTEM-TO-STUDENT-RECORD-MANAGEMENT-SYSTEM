"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";

export default function Register() {
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dept, setDept] = useState("CSE");
  const [msg, setMsg] = useState("");
  const [existingAccount, setExistingAccount] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setExistingAccount(false);
    setMsg("Creating account…");

    try {
      const auth = getFirebaseAuth();
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await setDoc(doc(getFirebaseDb(), "profiles", credential.user.uid), {
        fullName: name.trim(),
        rollNo: roll.trim(),
        department: dept,
        role: "student",
        createdAt: serverTimestamp(),
      });

      window.location.replace("/student");
    } catch (error) {
      const code =
        error && typeof error === "object" && "code" in error
          ? String((error as { code: string }).code)
          : "";

      if (code.includes("auth/email-already-in-use")) {
        setExistingAccount(true);
        setMsg("An account already exists with this email address.");
      } else if (code.includes("auth/weak-password")) {
        setMsg("Password is too weak. Please use at least 6 characters.");
      } else if (code.includes("auth/invalid-email")) {
        setMsg("Please enter a valid email address.");
      } else if (code.includes("auth/operation-not-allowed")) {
        setMsg("Email/password authentication is not enabled in Firebase.");
      } else {
        setMsg(
          error instanceof Error
            ? error.message
            : "Could not create the account. Please try again."
        );
      }

      setBusy(false);
    }
  }

  return (
    <main className="page">
      <nav className="nav">
        <Link
          href="/"
          className="brand"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          <div className="logo">A</div>
          <div>
            ASRS
            <small>Student registration</small>
          </div>
        </Link>
        <Link href="/login" className="button">
          Sign in
        </Link>
      </nav>

      <section className="auth-shell">
        <div className="auth-card">
          <span className="eyebrow">New student</span>
          <h1>Create account.</h1>
          <p>
            Registration creates a Student account and profile in Firebase.
          </p>

          <form onSubmit={submit}>
            <label>
              Full name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </label>

            <label>
              Roll number
              <input
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                required
              />
            </label>

            <label>
              Department
              <select value={dept} onChange={(e) => setDept(e.target.value)}>
                <option>CSE</option>
                <option>ECE</option>
                <option>EE</option>
                <option>ME</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>

            <button className="button primary wide" disabled={busy}>
              {busy ? "Creating…" : "Create account"}
            </button>
          </form>

          {msg && (
            <div className="status">
              {msg}
              {existingAccount && (
                <>
                  {" "}
                  <Link href="/login" style={{ textDecoration: "underline" }}>
                    Sign in instead →
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
