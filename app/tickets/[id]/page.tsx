"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LifeBuoy,
  LogOut,
  ArrowLeft,
  Clock3,
  UserCog,
  MessageSquare,
  CircleDot,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  getTicket,
  getActivity,
  updateTicketStatus,
  reassignTicket,
  addComment,
  getSlaState,
  formatCountdown,
} from "@/lib/store";
import { ActivityEntry, Status, Ticket } from "@/lib/types";
import { StatusBadge, PriorityBadge, CategoryTag, SlaBadge } from "@/components/badges";

const STATUS_FLOW: Status[] = ["open", "in_progress", "resolved", "closed"];

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, loading, logout } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null | undefined>(undefined);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [comment, setComment] = useState("");
  const [, forceTick] = useState(0);
  const [staffDirectory, setStaffDirectory] = useState<
    { id: string; name: string; department: string | null }[]
  >([]);

  useEffect(() => {
    if (!user || user.role === "student") return;
    fetch("/api/users/staff")
      .then((res) => (res.ok ? res.json() : { staff: [] }))
      .then((data) => setStaffDirectory(data.staff ?? []))
      .catch(() => setStaffDirectory([]));
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  function refresh() {
    const t = getTicket(params.id);
    setTicket(t ?? null);
    if (t) setActivity(getActivity(t.id));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // live SLA countdown tick
  useEffect(() => {
    const int = setInterval(() => forceTick((n) => n + 1), 60000);
    return () => clearInterval(int);
  }, []);

  if (loading || !user || ticket === undefined) return null;

  if (ticket === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="font-display text-lg font-semibold text-neutral-700">
            Ticket not found
          </p>
          <button
            onClick={() => router.push("/dashboard/tickets")}
            className="mt-3 text-sm text-brand-navy hover:underline"
          >
            Back to queue
          </button>
        </div>
      </div>
    );
  }

  const isStaff = user.role === "staff" || user.role === "admin";
  const slaState = getSlaState(ticket);

  function setStatus(status: Status) {
    updateTicketStatus(ticket!.id, status, user!.name, user!.role === "admin" ? "admin" : "staff");
    refresh();
  }

  function reassign(staffId: string) {
    const staff = staffDirectory.find((s) => s.id === staffId);
    if (!staff) return;
    reassignTicket(ticket!.id, staff.id, staff.name, user!.name, user!.role === "admin" ? "admin" : "staff");
    refresh();
  }

  function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    addComment(ticket!.id, user!.name, user!.role === "admin" ? "admin" : "staff", comment.trim());
    setComment("");
    refresh();
  }

  return (
    <div className="min-h-screen">
      <TopBar name={user.name} onLogout={() => { logout(); router.push("/login"); }} />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-brand-navy"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-neutral-400">
                  {ticket.ticketNumber}
                </span>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                <CategoryTag category={ticket.category} />
              </div>
              <h1 className="font-display text-xl font-bold text-brand-navyDark">
                {ticket.title}
              </h1>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                {ticket.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 border-t border-neutral-100 pt-4 text-xs text-neutral-500">
                <span>
                  Raised by{" "}
                  <span className="font-medium text-neutral-700">{ticket.studentName}</span>
                </span>
                <span>
                  Created{" "}
                  {new Date(ticket.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <span>
                  Last updated{" "}
                  {new Date(ticket.updatedAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Activity timeline */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-neutral-500">
                Activity timeline
              </h2>
              <ol className="space-y-5">
                {activity.map((a, i) => (
                  <li key={a.id} className="relative flex gap-3 pl-1">
                    <div className="flex flex-col items-center">
                      <ActivityIcon action={a.action} />
                      {i < activity.length - 1 && (
                        <div className="mt-1 h-full w-px flex-1 bg-neutral-200" />
                      )}
                    </div>
                    <div className="pb-1">
                      <p className="text-sm text-neutral-800">
                        <span className="font-medium">{a.actorName}</span>{" "}
                        <span className="text-neutral-500">{describeAction(a)}</span>
                      </p>
                      {a.notes && (
                        <p className="mt-0.5 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                          {a.notes}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-neutral-400">
                        {new Date(a.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              {isStaff && (
                <form onSubmit={submitComment} className="mt-6 flex gap-2 border-t border-neutral-100 pt-4">
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add an internal note..."
                    className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-navy"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-lg bg-brand-navy px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-navyDark"
                  >
                    <Send size={14} />
                    Post
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Side column */}
          <div className="space-y-6">
            {/* SLA countdown */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-neutral-500">
                <Clock3 size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wide">SLA countdown</h3>
              </div>
              <SlaBadge state={slaState} label={formatCountdown(ticket.slaDueAt)} />
              <p className="mt-2 text-sm text-neutral-600">
                {ticket.status === "resolved" || ticket.status === "closed"
                  ? "SLA closed — ticket resolved."
                  : formatCountdown(ticket.slaDueAt)}
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Due{" "}
                {new Date(ticket.slaDueAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {isStaff && (
              <>
                {/* Status control */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-neutral-500">
                    <RefreshCw size={16} />
                    <h3 className="text-xs font-bold uppercase tracking-wide">Update status</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_FLOW.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        disabled={s === ticket.status}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                          s === ticket.status
                            ? "bg-brand-navy text-white"
                            : "border border-neutral-200 text-neutral-600 hover:border-brand-navy hover:text-brand-navy"
                        }`}
                      >
                        {s.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reassignment */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-neutral-500">
                    <UserCog size={16} />
                    <h3 className="text-xs font-bold uppercase tracking-wide">Assigned staff</h3>
                  </div>
                  <select
                    value={ticket.assignedStaffId || ""}
                    onChange={(e) => reassign(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-navy"
                  >
                    <option value="" disabled>
                      Select staff member
                    </option>
                    {staffDirectory.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                        {s.department ? ` — ${s.department}` : ""}
                      </option>
                    ))}
                    {staffDirectory.length === 0 && (
                      <option value="" disabled>
                        Loading staff…
                      </option>
                    )}
                  </select>
                </div>
              </>
            )}

            {/* Student info */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-neutral-500">
                <MessageSquare size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wide">Requester</h3>
              </div>
              <p className="text-sm font-medium text-neutral-800">{ticket.studentName}</p>
              <p className="text-xs text-neutral-400">Student</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ActivityIcon({ action }: { action: ActivityEntry["action"] }) {
  const cls = "flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-white";
  switch (action) {
    case "created":
      return (
        <div className={`${cls} bg-slate-200 text-slate-600`}>
          <CircleDot size={12} />
        </div>
      );
    case "status_changed":
      return (
        <div className={`${cls} bg-blue-100 text-blue-600`}>
          <Clock size={12} />
        </div>
      );
    case "reassigned":
      return (
        <div className={`${cls} bg-amber-100 text-amber-600`}>
          <UserCog size={12} />
        </div>
      );
    case "commented":
      return (
        <div className={`${cls} bg-neutral-100 text-neutral-500`}>
          <MessageSquare size={12} />
        </div>
      );
    default:
      return (
        <div className={`${cls} bg-emerald-100 text-emerald-600`}>
          <CheckCircle2 size={12} />
        </div>
      );
  }
}

function describeAction(a: ActivityEntry): string {
  switch (a.action) {
    case "created":
      return "created the ticket";
    case "status_changed":
      return `changed status from ${a.oldValue?.replace("_", " ")} to ${a.newValue?.replace("_", " ")}`;
    case "reassigned":
      return `reassigned the ticket to ${a.newValue}`;
    case "commented":
      return "added a note";
    default:
      return "";
  }
}

function TopBar({ name, onLogout }: { name: string; onLogout: () => void }) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
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
