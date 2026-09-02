"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      return onAuthStateChanged(auth, async (user) => {
        if (!user) return;
        try {
          const snap = await getDoc(doc(getFirebaseDb(), "profiles", user.uid));
          const role = snap.exists() ? snap.data().role : "student";
          window.location.replace(role === "admin" ? "/admin" : role === "faculty" ? "/faculty" : "/student");
        } catch {}
      });
    } catch {}
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("Authenticating securely…");
    try {
      const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
      const snap = await getDoc(doc(getFirebaseDb(), "profiles", credential.user.uid));
      const role = snap.exists() ? snap.data().role : "student";
      window.location.replace(role === "admin" ? "/admin" : role === "faculty" ? "/faculty" : "/student");
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String((error as {code:string}).code) : "";
      setMessage(code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")
        ? "Email or password is incorrect."
        : error instanceof Error ? error.message : "Unable to sign in.");
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <nav className="nav">
        <Link href="/" className="brand" style={{color:"inherit",textDecoration:"none"}}>
          <div className="logo">A</div><div>ASRS<small>Secure Academic Records</small></div>
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
