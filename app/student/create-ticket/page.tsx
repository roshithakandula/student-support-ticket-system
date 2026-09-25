"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LifeBuoy,
  LogOut,
  Send,
  Clock3,
  CheckCircle2,
  ListChecks,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { createTicket, slaDueDate } from "@/lib/store";
import { CATEGORIES, Category, Priority, SLA_HOURS } from "@/lib/types";
import { PriorityBadge, CategoryTag } from "@/components/badges";

const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];

export default function CreateTicketPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const [category, setCategory] = useState<Category>("Fees");
  const [priority, setPriority] = useState<Priority>("medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState<{ number: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const dueDate = useMemo(() => slaDueDate(priority), [priority]);

  if (loading || !user) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please fill in both a title and a description.");
      return;
    }
    setError("");
    const ticket = createTicket({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      studentId: user!.id,
      studentName: user!.name,
    });
    setSubmitted({ number: ticket.ticketNumber });
    setTitle("");
    setDescription("");
  }

  return (
    <div className="min-h-screen">
      <TopBar name={user.name} onLogout={() => { logout(); router.push("/login"); }} />

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-brand-navyDark">
            Raise a support ticket
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Tell us what's wrong — we'll route it to the right office and track
            it against a response deadline.
          </p>
        </div>

        {submitted && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={20} />
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Ticket {submitted.number} submitted
              </p>
              <p className="text-sm text-emerald-700">
                A staff member will pick this up shortly. You can track progress
                from your dashboard.
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="mt-2">
                <CategoryTag category={category} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p} className="capitalize">
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
              <div className="mt-2">
                <PriorityBadge priority={priority} />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary, e.g. Duplicate fee deduction for semester 5"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe the issue in detail — dates, amounts, reference numbers, anything staff will need."
              className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
            />
          </div>

          {/* Dynamic SLA preview */}
          <div className="flex items-center gap-3 rounded-xl bg-brand-navy/5 px-4 py-3 ring-1 ring-inset ring-brand-navy/10">
            <Clock3 className="shrink-0 text-brand-navy" size={20} />
            <div className="text-sm">
              <span className="font-medium text-brand-navyDark">
                Response deadline:
              </span>{" "}
              <span className="text-neutral-700">
                within {SLA_HOURS[priority]} hours — by{" "}
                {dueDate.toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <a
              href="/student/create-ticket"
              onClick={(e) => {
                e.preventDefault();
                router.push("/dashboard/tickets");
              }}
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-brand-navy"
            >
              <ListChecks size={16} />
              View all tickets
            </a>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-navyDark"
            >
              <Send size={16} />
              Submit ticket
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function TopBar({ name, onLogout }: { name: string; onLogout: () => void }) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy text-white">
            <LifeBuoy size={18} />
          </div>
          <span className="font-display text-base font-bold text-brand-navyDark">
            Campus Helpdesk
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500">
            Signed in as <span className="font-medium text-neutral-800">{name}</span>
          </span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
