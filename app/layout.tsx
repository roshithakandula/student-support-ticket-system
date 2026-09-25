import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Campus Helpdesk — Student Support & Ticket Management",
  description:
    "Raise, track and resolve student support tickets across Fees, Attendance, ID Cards and Certificates. Assignment 4 — Student Support & Ticket Management System.",
  authors: [{ name: "Roshitha Kandula" }],
  creator: "Roshitha Kandula",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-[#F6F5F2] text-[#1A1D23] antialiased">
        <AuthProvider>
          <div className="flex-1">{children}</div>
        </AuthProvider>
        <footer className="border-t border-neutral-200 bg-white/60 py-4 text-center text-xs text-neutral-400">
          Campus Helpdesk — Assignment 4: Student Support &amp; Ticket Management System
          <br />
          Built by <span className="font-medium text-neutral-500">Roshitha Kandula</span>
        </footer>
      </body>
    </html>
  );
}
