"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { addDoc, collection, getDocs, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";

type Profile = {
  id: string;
  fullName?: string;
  rollNo?: string;
  department?: string;
  role?: "student" | "faculty" | "admin" | string;
};

type Course = {
  id: string;
  courseCode?: string;
  courseName?: string;
};

const tabs = ["Overview", "Students", "Faculty", "Courses"] as const;
type Tab = (typeof tabs)[number];

export default function AdminPortal() {
  const [user, setUser] = useState<{ uid: string; email: string | null } | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<Tab>("Overview");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const db = getFirebaseDb();
    const [profileSnap, courseSnap] = await Promise.all([
      getDocs(collection(db, "profiles")),
      getDocs(collection(db, "courses")),
    ]);
    setProfiles(profileSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Profile)));
    setCourses(courseSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Course)));
  }

  useEffect(() => {
    return onAuthStateChanged(getFirebaseAuth(), async (currentUser) => {
      if (!currentUser) {
        window.location.replace("/login");
        return;
      }

      try {
        const profile = await getDoc(doc(getFirebaseDb(), "profiles", currentUser.uid));
        if (!profile.exists() || profile.data().role !== "admin") {
          window.location.replace("/student");
          return;
        }
        setUser({ uid: currentUser.uid, email: currentUser.email });
        await loadData();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load admin data.");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  async function createCourse() {
    const courseCode = code.trim().toUpperCase();
    const courseName = name.trim();

    if (!courseCode || !courseName) {
      setMessage("Enter both a course code and course name.");
      return;
    }

    try {
      await addDoc(collection(getFirebaseDb(), "courses"), {
        courseCode,
        courseName,
        createdAt: serverTimestamp(),
      });
      setCode("");
      setName("");
      setMessage("Course created successfully.");
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create the course.");
    }
  }

  if (loading || !user) {
    return <main className="page"><div className="loading">Loading admin console…</div></main>;
  }

  const students = profiles.filter((profile) => profile.role === "student");
  const faculty = profiles.filter((profile) => profile.role === "faculty");

  return (
    <main className="page">
      <nav className="nav">
        <a href="/" className="brand" style={{ color: "inherit", textDecoration: "none" }}>
          <div className="logo">A</div>
          <div>ASRS<small>Admin Console</small></div>
        </a>
        <div className="nav-actions">
          <span className="navtag">{user.email}</span>
          <button className="button small" onClick={() => signOut(getFirebaseAuth())}>Sign out</button>
        </div>
      </nav>

      <section className="dashboard">
        <div className="dash-head">
          <div>
            <span className="eyebrow">System control</span>
            <h1>Administration.</h1>
            <p>Manage the academic system using live Firestore records.</p>
          </div>
        </div>

        {message && <div className="status">{message}</div>}

        <div className="tabs">
          {tabs.map((item) => (
            <button
              type="button"
              className={"button " + (tab === item ? "active" : "")}
              onClick={() => setTab(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>

        {tab === "Overview" && (
          <div className="metric-grid">
            <div className="metric"><b>{students.length}</b><span>Students</span></div>
            <div className="metric"><b>{faculty.length}</b><span>Faculty</span></div>
            <div className="metric"><b>{courses.length}</b><span>Courses</span></div>
            <div className="metric"><b>{profiles.filter((p) => p.role === "admin").length}</b><span>Administrators</span></div>
          </div>
        )}

        {tab === "Courses" && (
          <div className="dashboard-grid">
            <section className="panel">
              <div className="section-title">
                <div><span>Create course</span><small>Saved directly to Firestore</small></div>
              </div>
              <label>Course code<input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CSL100" /></label>
              <label>Course name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Computer Programming" /></label>
              <button type="button" className="button primary wide" onClick={createCourse}>Create course</button>
            </section>

            <section className="panel">
              <div className="section-title"><span>Courses</span><small>{courses.length} total</small></div>
              {courses.length ? (
                <div className="list">
                  {courses.map((course) => (
                    <div className="list-row" key={course.id}>
                      <div><b>{course.courseCode || "Course"}</b><span>{course.courseName || "Untitled course"}</span></div>
                    </div>
                  ))}
                </div>
              ) : <div className="empty">No courses yet. Create the first course.</div>}
            </section>
          </div>
        )}

        {(tab === "Students" || tab === "Faculty") && (
          <section className="panel">
            <div className="section-title">
              <div><span>{tab}</span><small>Live profiles collection</small></div>
              <em>{tab === "Students" ? students.length : faculty.length} records</em>
            </div>
            {(tab === "Students" ? students : faculty).length ? (
              <div className="list">
                {(tab === "Students" ? students : faculty).map((profile) => (
                  <div className="list-row" key={profile.id}>
                    <div>
                      <b>{profile.fullName || "Unnamed user"}</b>
                      <span>{profile.rollNo || profile.department || "No additional details"}</span>
                    </div>
                    <em>{profile.role}</em>
                  </div>
                ))}
              </div>
            ) : <div className="empty">No {tab.toLowerCase()} profiles yet.</div>}
          </section>
        )}
      </section>
    </main>
  );
}
