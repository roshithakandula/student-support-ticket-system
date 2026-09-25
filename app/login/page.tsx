"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import {
  LifeBuoy,
  ChevronRight,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  UserPlus,
  CheckCircle2,
  LogIn,
} from "lucide-react";

type Tab = "signin" | "register";
type Role = "STUDENT" | "STAFF";

/**
 * Campus Helpdesk — combined sign-in / registration screen.
 * Assignment 4: Student Support & Ticket Management System
 * Author: Roshitha Kandula
 */
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab: Tab = searchParams.get("mode") === "register" ? "register" : "signin";
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(15,47,76,0.10),transparent)]"
      />

      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy text-white shadow-sm">
            <LifeBuoy size={22} />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-brand-navyDark">
              Campus Helpdesk
            </p>
            <p className="text-sm text-neutral-500">
              Student Support &amp; Ticket Management
            </p>
          </div>
        </div>

        <div className="card-container">
          {/* Sign in / Register tab toggle */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-neutral-100 p-1">
            <button
              type="button"
              onClick={() => setTab("signin")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${
                tab === "signin"
                  ? "bg-white text-brand-navy shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <LogIn size={15} />
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setTab("register")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${
                tab === "register"
                  ? "bg-white text-brand-navy shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <UserPlus size={15} />
              Create account
            </button>
          </div>

          {tab === "signin" ? <SignInForm /> : <RegisterForm onDone={() => setTab("signin")} />}
        </div>

        <details className="mx-auto mt-5 max-w-xs rounded-lg border border-neutral-200 bg-white/60 px-3 py-2 text-xs text-neutral-500">
          <summary className="cursor-pointer select-none font-medium text-neutral-600">
            Demo accounts
          </summary>
          <div className="mt-2 space-y-1">
            <p>Student — student@edumerge.com / student123</p>
            <p>Staff — support@edumerge.com / admin123</p>
            <p>Admin — admin@edumerge.com / admin123</p>
          </div>
        </details>
      </div>
    </div>
  );
}

function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setSubmitting(true);
    const result = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });

    if (!result || result.error) {
      setError("Invalid email or password.");
      setSubmitting(false);
      return;
    }

    const session = await getSession();
    const role = session?.user?.role;

    if (role === "STUDENT") {
      router.push("/student/create-ticket");
    } else {
      router.push("/dashboard/tickets");
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@edumerge.com"
          className="form-field-input"
          autoComplete="email"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          className="form-field-input"
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-navy py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navyDark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Sign in"}
        {!submitting && <ChevronRight size={16} />}
      </button>
    </form>
  );
}

function RegisterForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Full name, email and password are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          department: department.trim(),
          role,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onDone();
        router.replace("/login?mode=signin");
      }, 1400);
    } catch {
      setError("Network error — please check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="text-emerald-600" size={36} />
        <p className="page-header text-lg">Account created</p>
        <p className="page-subtitle">Switching to sign in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-neutral-100 p-1">
        <button
          type="button"
          onClick={() => setRole("STUDENT")}
          className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${
            role === "STUDENT"
              ? "bg-white text-brand-navy shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <GraduationCap size={15} />
          Student
        </button>
        <button
          type="button"
          onClick={() => setRole("STAFF")}
          className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${
            role === "STAFF"
              ? "bg-white text-brand-navy shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <ShieldCheck size={15} />
          Staff
        </button>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Full name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Roshitha Kandula"
          className="form-field-input"
          autoComplete="name"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@edumerge.com"
          className="form-field-input"
          autoComplete="email"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          {role === "STUDENT" ? "Branch / Department" : "Department"}
        </label>
        <input
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder={role === "STUDENT" ? "e.g. B.Tech CSE" : "e.g. Accounts Office"}
          className="form-field-input"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="form-field-input"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Confirm password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
            className="form-field-input"
            autoComplete="new-password"
          />
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-navy py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navyDark disabled:cursor-not-allowed disabled:opacity-60"
      >
        <UserPlus size={16} />
        {submitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
