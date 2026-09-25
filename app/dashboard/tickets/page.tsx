"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LifeBuoy,
  LogOut,
  Search,
  ArrowUpRight,
  Inbox,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getTickets, getSlaState, formatCountdown, updateTicketStatus } from "@/lib/store";
import { CATEGORIES, Category, Priority, Status, Ticket } from "@/lib/types";
import { StatusBadge, PriorityBadge, CategoryTag, SlaBadge } from "@/components/badges";

const STATUSES: Status[] = ["open", "in_progress", "resolved", "closed"];
const PRIORITIES: Priority[] = ["urgent", "high", "medium", "low"];

export default function StaffDashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [slaFilter, setSlaFilter] = useState<"all" | "overdue" | "due_soon">("all");

  useEffect(() => {
    if (!loading && (!user || user.role === "student")) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) setTickets(getTickets());
  }, [user]);

  function refresh() {
    setTickets(getTickets());
  }

  const filtered = useMemo(() => {
    return tickets
      .filter((t) => {
        const q = query.trim().toLowerCase();
        if (
          q &&
          !t.title.toLowerCase().includes(q) &&
          !t.ticketNumber.toLowerCase().includes(q) &&
          !t.studentName.toLowerCase().includes(q)
        ) {
          return false;
        }
        if (statusFilter !== "all" && t.status !== statusFilter) return false;
        if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
        if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
        if (slaFilter !== "all" && getSlaState(t) !== slaFilter) return false;
        return true;
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [tickets, query, statusFilter, priorityFilter, categoryFilter, slaFilter]);

  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === "open").length;
    const overdue = tickets.filter((t) => getSlaState(t) === "overdue").length;
    const dueSoon = tickets.filter((t) => getSlaState(t) === "due_soon").length;
    const resolvedToday = tickets.filter(
      (t) =>
        (t.status === "resolved" || t.status === "closed") &&
        t.resolvedAt &&
        new Date(t.resolvedAt).toDateString() === new Date().toDateString()
    ).length;
    return { open, overdue, dueSoon, resolvedToday };
  }, [tickets]);

  if (loading || !user) return null;

  function quickAdvance(t: Ticket) {
    const next: Record<Status, Status> = {
      open: "in_progress",
      in_progress: "resolved",
      resolved: "closed",
      closed: "closed",
    };
    updateTicketStatus(t.id, next[t.status], user!.name, user!.role === "admin" ? "admin" : "staff");
    refresh();
  }

  return (
    <div className="min-h-screen">
      <TopBar name={user.name} onLogout={() => { logout(); router.push("/login"); }} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-brand-navyDark">
              Ticket queue
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {filtered.length} of {tickets.length} tickets shown
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={<Inbox size={16} />} label="Open" value={stats.open} tone="navy" />
          <StatCard icon={<AlertTriangle size={16} />} label="Overdue" value={stats.overdue} tone="rose" />
          <StatCard icon={<Clock size={16} />} label="Due soon" value={stats.dueSoon} tone="amber" />
          <StatCard icon={<CheckCircle2 size={16} />} label="Resolved today" value={stats.resolvedToday} tone="emerald" />
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, ticket # or student..."
              className="w-full rounded-lg border border-neutral-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-navy"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | "all")}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-navy"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | "all")}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-navy"
          >
            <option value="all">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p} className="capitalize">
                {p}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category | "all")}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-navy"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={slaFilter}
            onChange={(e) => setSlaFilter(e.target.value as "all" | "overdue" | "due_soon")}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-navy"
          >
            <option value="all">All SLA states</option>
            <option value="overdue">Overdue</option>
            <option value="due_soon">Due soon</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Ticket</th>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">SLA</th>
                  <th className="px-4 py-3 font-medium">Assigned</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((t) => {
                  const slaState = getSlaState(t);
                  return (
                    <tr key={t.id} className="hover:bg-neutral-50/70">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => router.push(`/tickets/${t.id}`)}
                          className="text-left"
                        >
                          <p className="font-medium text-brand-navyDark hover:underline">
                            {t.title}
                          </p>
                          <p className="text-xs text-neutral-400">{t.ticketNumber}</p>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-neutral-700">{t.studentName}</td>
                      <td className="px-4 py-3">
                        <CategoryTag category={t.category} />
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="px-4 py-3">
                        <SlaBadge state={slaState} label={formatCountdown(t.slaDueAt)} />
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {t.assignedStaffName || (
                          <span className="text-neutral-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {t.status !== "closed" && (
                            <button
                              onClick={() => quickAdvance(t)}
                              className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:border-brand-navy hover:text-brand-navy"
                            >
                              {t.status === "open"
                                ? "Start"
                                : t.status === "in_progress"
                                ? "Resolve"
                                : "Close"}
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/tickets/${t.id}`)}
                            className="flex items-center gap-1 rounded-md bg-brand-navy/5 px-2.5 py-1 text-xs font-medium text-brand-navy hover:bg-brand-navy/10"
                          >
                            View <ArrowUpRight size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-neutral-400">
                      No tickets match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "navy" | "rose" | "amber" | "emerald";
}) {
  const tones: Record<string, string> = {
    navy: "bg-brand-navy/5 text-brand-navy",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className={`mb-2 inline-flex items-center justify-center rounded-lg p-1.5 ${tones[tone]}`}>
        {icon}
      </div>
      <p className="font-display text-2xl font-bold text-neutral-900">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}

function TopBar({ name, onLogout }: { name: string; onLogout: () => void }) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
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
