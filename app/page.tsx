import Link from "next/link";
import { ShieldCheck, Users, BookOpen, BarChart3, GraduationCap, ArrowRight, LogIn } from "lucide-react";

const features = [
  ["Student Portal", "View attendance, courses, marks and your student record."],
  ["Faculty Portal", "Record attendance, manage classes and update academic data."],
  ["Admin Portal", "Manage students, faculty, courses and system controls."],
  ["Live Records", "A single platform for organized academic records."]
];

type Portal = {
  title: string;
  role: string;
  desc: string;
  icon: "student" | "faculty" | "admin";
  loginRole: "student" | "faculty" | "admin";
};

const portals: Portal[] = [
  { title: "Student Portal", role: "Students", desc: "Attendance, marks & profile", icon: "student", loginRole: "student" },
  { title: "Faculty Portal", role: "Faculty", desc: "Classes & attendance", icon: "faculty", loginRole: "faculty" },
  { title: "Admin Portal", role: "Administrator", desc: "System management", icon: "admin", loginRole: "admin" }
];

function PortalIcon({ icon }: { icon: Portal["icon"] }) {
  if (icon === "student") return <Users size={24} />;
  if (icon === "faculty") return <GraduationCap size={24} />;
  return <ShieldCheck size={24} />;
}

const systemCards = [
  { title: "Students", desc: "Central student records", icon: <Users size={20} />, href: "/login" },
  { title: "Courses", desc: "Subject management", icon: <BookOpen size={20} />, href: "/login" },
  { title: "Attendance", desc: "Track & analyze", icon: <BarChart3 size={20} />, href: "/login" },
  { title: "Secure", desc: "Role-based access", icon: <ShieldCheck size={20} />, href: "/login" }
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
            {systemCards.map(card => (
              <Link
                href={card.href}
                key={card.title}
                className="stat"
                style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}
                aria-label={card.title + " - sign in"}
              >
                {card.icon}<strong>{card.title}</strong><span>{card.desc}</span>
              </Link>
            ))}
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
          {portals.map((portal) => (
            <Link href={"/login?role=" + portal.loginRole} key={portal.title} className="feature"
              style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>
              <PortalIcon icon={portal.icon} />
              <b style={{ marginTop: 14 }}>{portal.title}</b>
              <span>{portal.desc}</span>
              <span style={{ display: "inline-flex", marginTop: 18, color: "#9dc5ff", fontWeight: 700 }}>
                Sign in as {portal.role} <ArrowRight size={15} style={{ marginLeft: 6 }} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="features" className="features">
        {features.map(([title, text]) => (
          <Link
            href="/login"
            className="feature"
            key={title}
            style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}
            aria-label={title + " - sign in"}
          >
            <b>{title}</b><span>{text}</span>
            <span style={{ display: "inline-flex", marginTop: 14, color: "#9dc5ff", fontWeight: 700 }}>
              Open <ArrowRight size={15} style={{ marginLeft: 6 }} />
            </span>
          </Link>
        ))}
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 6vw 80px", color: "#8196ae" }}>
        ASRS • Attendance & Student Record System • IIT Bhilai
      </div>
    </main>
  );
}
