"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";

type Profile = {
  fullName?: string;
  rollNo?: string;
  department?: string;
  role?: string;
  email?: string;
};

type Course = { id: string; courseCode?: string; courseName?: string; semester?: string };
type Mark = { id: string; assessment?: string; courseId?: string; score?: number; maxScore?: number };
type Attendance = { studentId?: string; status?: string };

export default function StudentPortal() {
  const [u, setU] = useState<{ uid: string; email: string | null } | null>(null);
  const [p, setP] = useState<Profile>({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [att, setAtt] = useState<Attendance[]>([]);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  async function load(uid: string) {
    try {
      const db = getFirebaseDb();
      const ps = await getDoc(doc(db, "profiles", uid));

      if (!ps.exists()) {
        setMsg("Your profile is missing. Please sign out and sign in again so ASRS can create it.");
        return;
      }

      setP(ps.data() as Profile);

      const en = await getDocs(query(
        collection(db, "enrollments"),
        where("studentId", "==", uid)
      ));

      const cs = await Promise.all(
        en.docs.map(async (e) => {
          const course = await getDoc(doc(db, "courses", String(e.data().courseId)));
          return course.exists() ? ({ id: course.id, ...course.data() } as Course) : null;
        })
      );
      setCourses(cs.filter((x): x is Course => Boolean(x)));

      const m = await getDocs(query(
        collection(db, "marks"),
        where("studentId", "==", uid)
      ));
      setMarks(m.docs.map((d) => ({ id: d.id, ...d.data() }) as Mark));

      const a = await getDocs(query(
        collection(db, "attendanceRecords"),
        where("studentId", "==", uid)
      ));
      setAtt(a.docs.map((d) => d.data() as Attendance));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not load records.");
    }
  }

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (x) => {
      if (!x) {
        window.location.replace("/login");
        return;
      }
      setU({ uid: x.uid, email: x.email });
      load(x.uid);
    });
  }, []);

  async function saveProfile() {
    if (!u) return;
    if (!p.fullName?.trim() || !p.rollNo?.trim() || !p.department?.trim()) {
      setMsg("Name, roll number and department are required.");
      return;
    }

    setSaving(true);
    setMsg("");

    try {
      await setDoc(doc(getFirebaseDb(), "profiles", u.uid), {
        fullName: p.fullName.trim(),
        rollNo: p.rollNo.trim(),
        department: p.department.trim(),
        email: u.email || p.email || "",
        role: p.role || "student",
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setEditing(false);
      setMsg("Profile saved to Firestore.");
      await load(u.uid);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (!u) return <main className="page"><div className="loading">Loading dashboard…</div></main>;

  const present = att.filter((x) => ["present", "late", "excused"].includes(x.status || "")).length;
  const pct = att.length ? Math.round((present / att.length) * 100) : null;

  return (
    <main className="page">
      <nav className="nav">
        <div className="brand">
          <div className="logo">A</div>
          <div>ASRS<small>Student Portal</small></div>
        </div>
        <div className="nav-actions">
          <span className="navtag">{u.email}</span>
          <button className="button small" onClick={() => signOut(getFirebaseAuth())}>Sign out</button>
        </div>
      </nav>

      <section className="dashboard">
        <div className="dash-head">
          <div>
            <span className="eyebrow">Student workspace</span>
            <h1>Welcome, {p.fullName || "Student"}.</h1>
            <p>{p.rollNo || "No roll number"} • {p.department || "Department"} • {u.email}</p>
          </div>
          <button type="button" className="button" onClick={() => setEditing((v) => !v)}>
            {editing ? "Close profile editor" : "Edit profile"}
          </button>
        </div>

        {msg && <div className="status">{msg}</div>}

        {editing && (
          <section className="panel" style={{ marginBottom: 18 }}>
            <div className="section-title">
              <div><span>My profile</span><small>Changes are saved directly to Firestore</small></div>
            </div>
            <div className="form-row">
              <label>Full name<input value={p.fullName || ""} onChange={(e) => setP({ ...p, fullName: e.target.value })} /></label>
              <label>Roll number<input value={p.rollNo || ""} onChange={(e) => setP({ ...p, rollNo: e.target.value })} /></label>
            </div>
            <label>Department<select value={p.department || "CSE"} onChange={(e) => setP({ ...p, department: e.target.value })}><option>CSE</option><option>ECE</option><option>EE</option><option>ME</option><option>Other</option></select></label>
            <button type="button" className="button primary wide" onClick={saveProfile} disabled={saving}>
              {saving ? "Saving…" : "Save profile"}
            </button>
          </section>
        )}

        <div className="metric-grid">
          <div className="metric"><b>{pct === null ? "—" : pct + "%"}</b><span>Attendance</span></div>
          <div className="metric"><b>{courses.length}</b><span>Enrolled courses</span></div>
          <div className="metric"><b>{marks.length}</b><span>Published marks</span></div>
          <div className="metric"><b>Student</b><span>Account role</span></div>
        </div>

        <div className="dashboard-grid">
          <section className="panel">
            <div className="section-title"><span>My courses</span><small>Live Firestore records</small></div>
            {courses.length ? (
              <div className="list">
                {courses.map((c) => (
                  <div className="list-row" key={c.id}>
                    <div><b>{c.courseCode || "Course"}</b><span>{c.courseName || "Untitled"}</span></div>
                    <em>{c.semester || "Current"}</em>
                  </div>
                ))}
              </div>
            ) : <div className="empty">No courses assigned yet.</div>}
          </section>

          <section className="panel">
            <div className="section-title"><span>Marks</span><small>Latest academic records</small></div>
            {marks.length ? (
              <div className="list">
                {marks.slice(0, 8).map((m) => (
                  <div className="list-row" key={m.id}>
                    <div><b>{m.assessment || "Assessment"}</b><span>{m.courseId || "Course"}</span></div>
                    <strong>{m.score ?? 0}/{m.maxScore ?? 0}</strong>
                  </div>
                ))}
              </div>
            ) : <div className="empty">No marks published yet.</div>}
          </section>
        </div>
      </section>
    </main>
  );
}
