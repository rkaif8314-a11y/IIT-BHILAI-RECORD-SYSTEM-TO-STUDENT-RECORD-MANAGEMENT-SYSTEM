import "./globals.css";

export const metadata = { title: "ASRS — Attendance & Student Record System", description: "Attendance & Student Record System for academic record management." };

export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }