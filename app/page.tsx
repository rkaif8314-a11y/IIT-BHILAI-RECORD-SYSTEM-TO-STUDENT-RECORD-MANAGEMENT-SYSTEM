import Link from "next/link";
import { ShieldCheck, Users, BookOpen, BarChart3, GraduationCap, ArrowRight, LogIn } from "lucide-react";

const features = [
  ["Student Portal", "View attendance, courses, marks and your student record."],
  ["Faculty Portal", "Record attendance, manage classes and update academic data."],
  ["Admin Portal", "Manage students, faculty, courses and system controls."],
  ["Live Records", "A single platform for organized academic records."]
];

const portals = [
  ["Student Portal", "Students", "Attendance, marks & profile", "/login", Users],
  ["Faculty Portal", "Faculty", "Classes & attendance", "/login", GraduationCap],
  ["Admin Portal", "Administrator", "System management", "/login", ShieldCheck]
];

export default function Home() {
  return (
    <main className="page">
      <nav className="nav">
        <Link href="/" className="brand" style={{ color: "inherit", textDecoration: "none" }}>
          <div className="logo">A</div>
          <div>ASRS<small>Attendance & Student Record System</small></div>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="navtag">IIT Bhilai • Academic Records</div>
          <Link href="/login" className="button" style={{ padding: "9px 14px" }}>
            <LogIn size={15} /> Sign in
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div>
          <span className="eyebrow">ASRS • Digital Academic Records</span>
          <h1>Attendance &<br /><span>Student Records.</span></h1>
          <p>
            A secure academic record platform for attendance, courses, marks
            and student information — built for students, faculty and administrators.
          </p>
          <div className="actions">
            <Link className="button primary" href="/login">Enter ASRS <ArrowRight size={16} /></Link>
            <Link className="button" href="#features">System features</Link>
          </div>
        </div>

        <div className="panel">
          <div className="panelhead"><strong>ASRS System</strong><span className="dot" /></div>
          <div className="stats">
            <div className="stat"><Users size={20} /><strong>Students</strong><span>Central records</span></div>
            <div className="stat"><BookOpen size={20} /><strong>Courses</strong><span>Subject management</span></div>
            <div className="stat"><BarChart3 size={20} /><strong>Attendance</strong><span>Track & analyze</span></div>
            <div className="stat"><ShieldCheck size={20} /><strong>Secure</strong><span>Role-based access</span></div>
          </div>
        </div>
      </section>

      <section id="portals" style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 6vw 55px" }}>
        <span className="eyebrow">Access your workspace</span>
        <h2 style={{ fontSize: "clamp(30px,4vw,46px)", margin: "16px 0 10px", letterSpacing: "-.04em" }}>
          Choose your portal
        </h2>
        <p style={{ color: "#9db0c7", marginBottom: 24 }}>
          Sign in with your ASRS account. Your role automatically determines the portal you can access.
        </p>
        <div className="features" style={{ padding: 0, gridTemplateColumns: "repeat(3,1fr)" }}>
          {portals.map(([title, role, desc, href, Icon]) => (
            <Link href={href as string} key={title as string} className="feature"
              style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>
              <Icon size={24} />
              <b style={{ marginTop: 14 }}>{title as string}</b>
              <span>{desc as string}</span>
              <span style={{ display: "inline-flex", marginTop: 18, color: "#9dc5ff", fontWeight: 700 }}>
                Sign in as {role as string} <ArrowRight size={15} style={{ marginLeft: 6 }} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="features" className="features">
        {features.map(([title, text]) => (
          <article className="feature" key={title}>
            <b>{title}</b><span>{text}</span>
          </article>
        ))}
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 6vw 80px", color: "#8196ae" }}>
        ASRS • Attendance & Student Record System • IIT Bhilai
      </div>
    </main>
  );
}
