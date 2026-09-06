# Security notes

- Keep Firebase Admin credentials (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) only in Vercel/server environment variables.
- Never expose Firebase Admin credentials or service credentials to browser code.
- Keep Firestore rules deployed alongside application changes and review role/ownership checks whenever a new collection is added.
- Student academic records, attendance, marks, contact information, and staff account data are private and must remain access-controlled.
- Rotate any credential that has ever been committed as a secret, even after removing it from the current source tree.
