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