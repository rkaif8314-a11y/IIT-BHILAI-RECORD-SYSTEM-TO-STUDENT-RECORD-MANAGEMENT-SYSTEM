"use client";

import { FormEvent, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("Signing in…");

    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const profile = await getDoc(doc(db, "profiles", credential.user.uid));
      const role = profile.exists() ? profile.data().role : "student";

      if (role === "admin") window.location.assign("/admin");
      else if (role === "faculty") window.location.assign("/faculty");
      else window.location.assign("/student");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unable to sign in.";
      setMessage(text);
    }
  }

  return (
    <main className="page">
      <nav className="nav">
        <div className="brand">
          <a href="/" style={{ color: "inherit", textDecoration: "none" }} aria-label="Back to ASRS">←</a>
          <div className="logo">A</div>
          <div>ASRS<small>Firebase secure sign in</small></div>
        </div>
      </nav>

      <section style={{ maxWidth: 520, margin: "0 auto", padding: "70px 20px" }}>
        <span className="eyebrow">ASRS Authentication</span>
        <h1 style={{ fontSize: 48, letterSpacing: "-.04em" }}>Sign in</h1>
        <p style={{ color: "#9db0c7" }}>Use your registered ASRS account.</p>

        <form onSubmit={submit} className="panel">
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
              style={input}
            />
          </label>

          <label style={{ display: "block", marginTop: 16 }}>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
              style={input}
            />
          </label>

          <button type="submit" className="button primary" style={{ marginTop: 20, cursor: "pointer", width: "100%" }}>
            Sign in
          </button>

          {message && <p style={{ color: "#9db0c7", lineHeight: 1.6 }}>{message}</p>}
        </form>
      </section>
    </main>
  );
}

const input = {
  display: "block",
  width: "100%",
  marginTop: 8,
  padding: 13,
  borderRadius: 12,
  background: "#0c1b2d",
  color: "#fff",
  border: "1px solid rgba(255,255,255,.12)",
};
