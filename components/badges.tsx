import type { ReactElement } from "react";
import { AlertTriangle, Clock, CheckCircle2, XCircle, CircleDot } from "lucide-react";
import { Priority, Status } from "@/lib/types";
import { SlaState } from "@/lib/store";

export function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; cls: string; icon: ReactElement }> = {
    open: {
      label: "Open",
      cls: "bg-slate-100 text-slate-700 ring-slate-300",
      icon: <CircleDot size={12} />,
    },
    in_progress: {
      label: "In progress",
      cls: "bg-blue-50 text-blue-700 ring-blue-300",
      icon: <Clock size={12} />,
    },
    resolved: {
      label: "Resolved",
      cls: "bg-emerald-50 text-emerald-700 ring-emerald-300",
      icon: <CheckCircle2 size={12} />,
    },
    closed: {
      label: "Closed",
      cls: "bg-neutral-100 text-neutral-500 ring-neutral-300",
      icon: <XCircle size={12} />,
    },
  };
  const m = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${m.cls}`}
    >
      {m.icon}
      {m.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    low: "bg-slate-50 text-slate-600 ring-slate-300",
    medium: "bg-amber-50 text-amber-700 ring-amber-300",
    high: "bg-orange-50 text-orange-700 ring-orange-300",
    urgent: "bg-rose-50 text-rose-700 ring-rose-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${map[priority]}`}
    >
      {priority}
    </span>
  );
}

export function CategoryTag({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[#0f2f4c]/5 px-2 py-1 text-xs font-medium text-[#0f2f4c] ring-1 ring-inset ring-[#0f2f4c]/15">
      {category}
    </span>
  );
}

export function SlaBadge({ state, label }: { state: SlaState; label: string }) {
  if (state === "closed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
        —
      </span>
    );
  }
  const map: Record<Exclude<SlaState, "closed">, string> = {
    overdue: "bg-rose-600 text-white",
    due_soon: "bg-amber-500 text-white",
    on_track: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-300",
  };
  const text: Record<Exclude<SlaState, "closed">, string> = {
    overdue: "Overdue",
    due_soon: "Due soon",
    on_track: "On track",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${map[state as Exclude<SlaState, "closed">]}`}
      title={label}
    >
      {state !== "on_track" && <AlertTriangle size={12} />}
      {text[state as Exclude<SlaState, "closed">]}
    </span>
  );
}
