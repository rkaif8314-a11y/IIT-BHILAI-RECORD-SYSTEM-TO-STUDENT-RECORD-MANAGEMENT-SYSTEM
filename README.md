# ASRS — Attendance & Student Record System

Production-oriented Next.js application for student attendance and academic records.

## Stack
- Next.js + React + TypeScript
- Firebase Authentication
- Cloud Firestore
- Vercel deployment

## Firebase setup
1. Create a Firebase project and register a Web App.
2. Enable Email/Password Authentication.
3. Create a Cloud Firestore database.
4. Copy .env.example to .env.local and fill the Firebase web configuration.
5. Deploy firestore.rules with the Firebase CLI.

## Roles
Store a profiles/{uid} document with role equal to student, faculty, or admin.

## Collections
profiles, courses, enrollments, attendanceSessions, attendanceRecords, marks

## Vercel
Import this repository into Vercel, set the six NEXT_PUBLIC_FIREBASE_* environment variables, and deploy the asrs-production branch.

## Data Model

The core records map students to courses and academic activity. Profiles identify roles, enrollments connect students to courses, attendance sessions represent scheduled class events, attendance records capture participation, and marks store academic results. Access rules should ensure users can read or modify only the records permitted by their role and ownership.


## Deployment Verification

After deployment, verify authentication, role-based routing, Firestore access, and the main student/faculty/admin flows. Confirm all required Firebase environment variables are present, Firestore rules are deployed, and the production build completes successfully. Test both authorized and unauthorized paths before treating a deployment as ready.
