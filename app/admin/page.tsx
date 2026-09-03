"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { addDoc, collection, getDocs, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { UserPlus, ShieldCheck, GraduationCap } from "lucide-react";

type Profile = {
  id: string;
  fullName?: string;
  rollNo?: string;
  department?: string;
  employeeId?: string;
  email?: string;
  role?: "student" | "faculty" | "admin" | string;
};

type Course = { id: string; courseCode?: string; courseName?: string };
const tabs = ["Overview", "Students", "Faculty", "Accounts", "Courses"] as const;
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
  const [accountRole, setAccountRole] = useState<"faculty" | "admin">("faculty");
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountDepartment, setAccountDepartment] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);

  async function loadData() {
    const db = getFirebaseDb();
    const [profileSnap, courseSnap] = await Promise.all([
      getDocs(collection(db, "profiles")),
      getDocs(collection(db, "courses")),
    ]);
    setProfiles(profileSnap.docs.map((d) => {\n      const data = d.data();\n      return {\n        id: d.id,\n        ...data,\n        role: typeof data.role === "string" ? data.role.trim().toLowerCase() : data.role,\n      } as Profile;\n    }));
    setCourses(courseSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Course)));
  }

  useEffect(() => {
    return onAuthStateChanged(getFirebaseAuth(), async (currentUser) => {
      if (!currentUser) {
        window.location.replace("/login?role=admin");
        return;
      }
      try {
        const profile = await getDoc(doc(getFirebaseDb(), "profiles", currentUser.uid));
        if (!profile.exists() || profile.data().role !== "admin") {
          window.location.replace("/login");
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
        courseCode, courseName, createdAt: serverTimestamp(),
      });
      setCode(""); setName(""); setMessage("Course created successfully.");
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create the course.");
    }
  }

  async function provisionAccount() {
    if (!accountName.trim() || !accountEmail.trim() || !accountPassword || !accountDepartment.trim() || !employeeId.trim()) {
      setMessage("Complete every account field.");
      return;
    }
    setCreatingAccount(true);
    setMessage("Creating the Firebase account and ASRS profile…");
    try {
      const currentUser = getFirebaseAuth().currentUser;
      if (!currentUser) throw new Error("Admin session expired. Sign in again.");
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/provision-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({
          fullName: accountName,
          email: accountEmail,
          password: accountPassword,
          department: accountDepartment,
          employeeId,
          role: accountRole,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to create account.");
      setMessage(result.message + " The user can now sign in as " + (accountRole === "faculty" ? "Faculty" : "Administrator") + ".");
      setAccountName(""); setAccountEmail(""); setAccountPassword("");
      setAccountDepartment(""); setEmployeeId("");
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create account.");
    } finally {
      setCreatingAccount(false);
    }
  }

  if (loading || !user) {
    return <main className="page"><div className="loading">Loading admin console…</div></main>;
  }

  const students = profiles.filter((p) => p.role === "student");
  const faculty = profiles.filter((p) => p.role === "faculty");
  const admins = profiles.filter((p) => p.role === "admin");

  return (
    <main className="page">
      <nav className="nav">
        <a href="/" className="brand" style={{ color: "inherit", textDecoration: "none" }}>
          <div className="logo">A</div><div>ASRS<small>Admin Console</small></div>
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
            <p>Manage live academic records and provision trusted staff accounts.</p>
          </div>
        </div>

        {message && <div className="status">{message}</div>}

        <div className="tabs">
          {tabs.map((item) => (
            <button type="button" className={"button " + (tab === item ? "active" : "")}
              onClick={() => setTab(item)} key={item}>{item}</button>
          ))}
        </div>

        {tab === "Overview" && (
          <div className="metric-grid">
            <div className="metric"><b>{students.length}</b><span>Students</span></div>
            <div className="metric"><b>{faculty.length}</b><span>Faculty</span></div>
            <div className="metric"><b>{courses.length}</b><span>Courses</span></div>
            <div className="metric"><b>{admins.length}</b><span>Administrators</span></div>
          </div>
        )}

        {tab === "Accounts" && (
          <div className="dashboard-grid">
            <section className="panel">
              <div className="section-title">
                <div><span>Provision staff account</span><small>Creates Firebase Authentication + Firestore profile</small></div>
              </div>
              <div className="auth-note" style={{ marginBottom: 16 }}>
                Students must use Student Registration. This tool is only for Faculty and Administrators.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <button type="button" className={"button " + (accountRole === "faculty" ? "active" : "")}
                  onClick={() => setAccountRole("faculty")} disabled={creatingAccount}><GraduationCap size={16}/> Faculty</button>
                <button type="button" className={"button " + (accountRole === "admin" ? "active" : "")}
                  onClick={() => setAccountRole("admin")} disabled={creatingAccount}><ShieldCheck size={16}/> Administrator</button>
              </div>
              <label>Full name<input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Dr. Faculty Name" /></label>
              <label>Official email<input value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} type="email" placeholder="faculty@iitbhilai.ac.in" /></label>
              <label>Employee / Staff ID<input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="FAC001" /></label>
              <label>Department<input value={accountDepartment} onChange={(e) => setAccountDepartment(e.target.value)} placeholder="Electrical Engineering" /></label>
              <label>Temporary password<input value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} type="password" placeholder="At least 6 characters" /></label>
              <button type="button" className="button primary wide" onClick={provisionAccount} disabled={creatingAccount}>
                <UserPlus size={17}/>{creatingAccount ? "Creating account…" : "Create " + (accountRole === "faculty" ? "faculty" : "administrator") + " account"}
              </button>
            </section>

            <section className="panel">
              <div className="section-title"><span>Provisioned staff</span><small>{faculty.length + admins.length} total</small></div>
              {faculty.concat(admins).length ? (
                <div className="list">
                  {faculty.concat(admins).map((profile) => (
                    <div className="list-row" key={profile.id}>
                      <div><b>{profile.fullName || "Unnamed user"}</b><span>{profile.email || profile.employeeId || profile.department || "No details"}</span></div>
                      <em>{profile.role}</em>
                    </div>
                  ))}
                </div>
              ) : <div className="empty">No staff accounts have been provisioned yet.</div>}
            </section>
          </div>
        )}

        {tab === "Courses" && (
          <div className="dashboard-grid">
            <section className="panel">
              <div className="section-title"><div><span>Create course</span><small>Saved directly to Firestore</small></div></div>
              <label>Course code<input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CSL100" /></label>
              <label>Course name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Computer Programming" /></label>
              <button type="button" className="button primary wide" onClick={createCourse}>Create course</button>
            </section>
            <section className="panel">
              <div className="section-title"><span>Courses</span><small>{courses.length} total</small></div>
              {courses.length ? <div className="list">{courses.map((course) => (
                <div className="list-row" key={course.id}><div><b>{course.courseCode || "Course"}</b><span>{course.courseName || "Untitled course"}</span></div></div>
              ))}</div> : <div className="empty">No courses yet. Create the first course.</div>}
            </section>
          </div>
        )}

        {(tab === "Students" || tab === "Faculty") && (
          <section className="panel">
            <div className="section-title">
              <div><span>{tab}</span><small>Live profiles collection</small></div>
              <em>{tab === "Students" ? students.length : faculty.length} records</em>
            </div>
            {(tab === "Students" ? students : faculty).length ? <div className="list">
              {(tab === "Students" ? students : faculty).map((profile) => (
                <div className="list-row" key={profile.id}>
                  <div><b>{profile.fullName || "Unnamed user"}</b><span>{profile.email || profile.rollNo || profile.employeeId || profile.department || "No details"}</span></div>
                  <em>{profile.role}</em>
                </div>
              ))}
            </div> : <div className="empty">No {tab.toLowerCase()} profiles yet.</div>}
          </section>
        )}
      </section>
    </main>
  );
}
