"use client";

import {
  ActivityEntry,
  Category,
  Priority,
  SLA_HOURS,
  Status,
  Ticket,
} from "./types";

/**
 * This module simulates the persistence layer described in schema.sql
 * (tickets + ticket_activity_history) entirely on the client via
 * localStorage, so the assessment app runs without a live database.
 * Swap these functions for real fetch() calls to REST/DB endpoints
 * when wiring up an actual backend — the shapes match the SQL schema.
 */

const TICKETS_KEY = "ssts_tickets_v1";
const ACTIVITY_KEY = "ssts_activity_v1";

function nowIso() {
  return new Date().toISOString();
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function slaDueDate(priority: Priority, from: Date = new Date()) {
  return addHours(from, SLA_HOURS[priority]);
}

function seedTickets(): Ticket[] {
  const created = (hoursAgo: number) =>
    addHours(new Date(), -hoursAgo).toISOString();

  return [
    {
      id: "a1111111-aaaa-1111-aaaa-111111111111",
      ticketNumber: "TCK-1001",
      title: "Duplicate fee deduction for semester 5",
      description:
        "My account shows two deductions of ₹45,000 for the same semester. Please refund the extra amount.",
      category: "Fees",
      priority: "high",
      status: "in_progress",
      studentId: "11111111-1111-1111-1111-111111111111",
      studentName: "Ananya Rao",
      assignedStaffId: "33333333-3333-3333-3333-333333333333",
      assignedStaffName: "Priya Nair",
      slaDueAt: addHours(new Date(), 6).toISOString(),
      createdAt: created(18),
      updatedAt: created(2),
    },
    {
      id: "a2222222-aaaa-2222-aaaa-222222222222",
      ticketNumber: "TCK-1002",
      title: "Attendance shortage despite medical leave",
      description:
        "I was marked absent for 5 classes in March even though I submitted a medical certificate. Please correct my attendance record.",
      category: "Attendance",
      priority: "urgent",
      status: "open",
      studentId: "22222222-2222-2222-2222-222222222222",
      studentName: "Rohan Mehta",
      slaDueAt: addHours(new Date(), -3).toISOString(),
      createdAt: created(20),
      updatedAt: created(20),
    },
    {
      id: "a3333333-aaaa-3333-aaaa-333333333333",
      ticketNumber: "TCK-1003",
      title: "Lost student ID card",
      description:
        "I lost my ID card near the library. I need a replacement card issued before my end-semester exams.",
      category: "ID Cards",
      priority: "medium",
      status: "resolved",
      studentId: "11111111-1111-1111-1111-111111111111",
      studentName: "Ananya Rao",
      assignedStaffId: "44444444-4444-4444-4444-444444444444",
      assignedStaffName: "Suresh Kumar",
      slaDueAt: addHours(new Date(), -24).toISOString(),
      resolvedAt: created(24),
      createdAt: created(120),
      updatedAt: created(24),
    },
    {
      id: "a4444444-aaaa-4444-aaaa-444444444444",
      ticketNumber: "TCK-1004",
      title: "Bonafide certificate for passport application",
      description:
        "I need a bonafide certificate urgently for a passport application appointment next week.",
      category: "Certificates",
      priority: "high",
      status: "open",
      studentId: "22222222-2222-2222-2222-222222222222",
      studentName: "Rohan Mehta",
      slaDueAt: addHours(new Date(), 20).toISOString(),
      createdAt: created(4),
      updatedAt: created(4),
    },
    {
      id: "a5555555-aaaa-5555-aaaa-555555555555",
      ticketNumber: "TCK-1005",
      title: "Scholarship amount not credited",
      description:
        "The merit scholarship for this semester has not been credited to my fee account yet. Please check and update.",
      category: "Fees",
      priority: "low",
      status: "closed",
      studentId: "11111111-1111-1111-1111-111111111111",
      studentName: "Ananya Rao",
      assignedStaffId: "33333333-3333-3333-3333-333333333333",
      assignedStaffName: "Priya Nair",
      slaDueAt: addHours(new Date(), -48).toISOString(),
      resolvedAt: created(72),
      createdAt: created(240),
      updatedAt: created(72),
    },
  ];
}

function seedActivity(): ActivityEntry[] {
  const at = (hoursAgo: number) => addHours(new Date(), -hoursAgo).toISOString();
  return [
    {
      id: crypto.randomUUID(),
      ticketId: "a1111111-aaaa-1111-aaaa-111111111111",
      actorName: "Ananya Rao",
      actorRole: "student",
      action: "created",
      notes: "Ticket submitted by student",
      createdAt: at(18),
    },
    {
      id: crypto.randomUUID(),
      ticketId: "a1111111-aaaa-1111-aaaa-111111111111",
      actorName: "Priya Nair",
      actorRole: "staff",
      action: "reassigned",
      fieldChanged: "assignedStaff",
      newValue: "Priya Nair",
      notes: "Assigned to Accounts Office",
      createdAt: at(10),
    },
    {
      id: crypto.randomUUID(),
      ticketId: "a1111111-aaaa-1111-aaaa-111111111111",
      actorName: "Priya Nair",
      actorRole: "staff",
      action: "status_changed",
      fieldChanged: "status",
      oldValue: "open",
      newValue: "in_progress",
      notes: "Verifying payment gateway logs",
      createdAt: at(2),
    },
    {
      id: crypto.randomUUID(),
      ticketId: "a3333333-aaaa-3333-aaaa-333333333333",
      actorName: "Ananya Rao",
      actorRole: "student",
      action: "created",
      notes: "Ticket submitted by student",
      createdAt: at(120),
    },
    {
      id: crypto.randomUUID(),
      ticketId: "a3333333-aaaa-3333-aaaa-333333333333",
      actorName: "Suresh Kumar",
      actorRole: "staff",
      action: "status_changed",
      fieldChanged: "status",
      oldValue: "open",
      newValue: "resolved",
      notes: "New ID card issued at counter 2",
      createdAt: at(24),
    },
    {
      id: crypto.randomUUID(),
      ticketId: "a5555555-aaaa-5555-aaaa-555555555555",
      actorName: "Ananya Rao",
      actorRole: "student",
      action: "created",
      notes: "Ticket submitted by student",
      createdAt: at(240),
    },
    {
      id: crypto.randomUUID(),
      ticketId: "a5555555-aaaa-5555-aaaa-555555555555",
      actorName: "Priya Nair",
      actorRole: "staff",
      action: "status_changed",
      fieldChanged: "status",
      oldValue: "open",
      newValue: "resolved",
      notes: "Scholarship credited",
      createdAt: at(96),
    },
    {
      id: crypto.randomUUID(),
      ticketId: "a5555555-aaaa-5555-aaaa-555555555555",
      actorName: "Priya Nair",
      actorRole: "staff",
      action: "status_changed",
      fieldChanged: "status",
      oldValue: "resolved",
      newValue: "closed",
      notes: "Confirmed by student",
      createdAt: at(72),
    },
  ];
}

function ensureSeeded() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(TICKETS_KEY)) {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(seedTickets()));
  }
  if (!localStorage.getItem(ACTIVITY_KEY)) {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(seedActivity()));
  }
}

export function getTickets(): Ticket[] {
  ensureSeeded();
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(TICKETS_KEY) || "[]");
}

export function getTicket(id: string): Ticket | undefined {
  return getTickets().find((t) => t.id === id);
}

export function getActivity(ticketId: string): ActivityEntry[] {
  ensureSeeded();
  if (typeof window === "undefined") return [];
  const all: ActivityEntry[] = JSON.parse(
    localStorage.getItem(ACTIVITY_KEY) || "[]"
  );
  return all
    .filter((a) => a.ticketId === ticketId)
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
}

function saveTickets(tickets: Ticket[]) {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

function pushActivity(entry: Omit<ActivityEntry, "id" | "createdAt">) {
  ensureSeeded();
  const all: ActivityEntry[] = JSON.parse(
    localStorage.getItem(ACTIVITY_KEY) || "[]"
  );
  all.push({ ...entry, id: crypto.randomUUID(), createdAt: nowIso() });
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(all));
}

let ticketCounter = 1006;

export function createTicket(input: {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  studentId: string;
  studentName: string;
}): Ticket {
  const tickets = getTickets();
  const ticket: Ticket = {
    id: crypto.randomUUID(),
    ticketNumber: `TCK-${ticketCounter++}`,
    title: input.title,
    description: input.description,
    category: input.category,
    priority: input.priority,
    status: "open",
    studentId: input.studentId,
    studentName: input.studentName,
    slaDueAt: slaDueDate(input.priority).toISOString(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  tickets.unshift(ticket);
  saveTickets(tickets);
  pushActivity({
    ticketId: ticket.id,
    actorName: input.studentName,
    actorRole: "student",
    action: "created",
    notes: "Ticket submitted by student",
  });
  return ticket;
}

export function updateTicketStatus(
  ticketId: string,
  newStatus: Status,
  actorName: string,
  actorRole: "staff" | "admin",
  notes?: string
) {
  const tickets = getTickets();
  const idx = tickets.findIndex((t) => t.id === ticketId);
  if (idx === -1) return;
  const old = tickets[idx].status;
  tickets[idx] = {
    ...tickets[idx],
    status: newStatus,
    updatedAt: nowIso(),
    resolvedAt:
      newStatus === "resolved" || newStatus === "closed"
        ? nowIso()
        : tickets[idx].resolvedAt,
  };
  saveTickets(tickets);
  pushActivity({
    ticketId,
    actorName,
    actorRole,
    action: "status_changed",
    fieldChanged: "status",
    oldValue: old,
    newValue: newStatus,
    notes,
  });
}

export function reassignTicket(
  ticketId: string,
  staffId: string,
  staffName: string,
  actorName: string,
  actorRole: "staff" | "admin"
) {
  const tickets = getTickets();
  const idx = tickets.findIndex((t) => t.id === ticketId);
  if (idx === -1) return;
  const old = tickets[idx].assignedStaffName || "Unassigned";
  tickets[idx] = {
    ...tickets[idx],
    assignedStaffId: staffId,
    assignedStaffName: staffName,
    updatedAt: nowIso(),
  };
  saveTickets(tickets);
  pushActivity({
    ticketId,
    actorName,
    actorRole,
    action: "reassigned",
    fieldChanged: "assignedStaff",
    oldValue: old,
    newValue: staffName,
    notes: `Reassigned to ${staffName}`,
  });
}

export function addComment(
  ticketId: string,
  actorName: string,
  actorRole: "staff" | "admin",
  notes: string
) {
  pushActivity({
    ticketId,
    actorName,
    actorRole,
    action: "commented",
    notes,
  });
  const tickets = getTickets();
  const idx = tickets.findIndex((t) => t.id === ticketId);
  if (idx !== -1) {
    tickets[idx] = { ...tickets[idx], updatedAt: nowIso() };
    saveTickets(tickets);
  }
}

// ---- SLA helpers -----------------------------------------------------------

export type SlaState = "overdue" | "due_soon" | "on_track" | "closed";

export function getSlaState(ticket: Ticket): SlaState {
  if (ticket.status === "resolved" || ticket.status === "closed") {
    return "closed";
  }
  const due = +new Date(ticket.slaDueAt);
  const remainingMs = due - Date.now();
  if (remainingMs < 0) return "overdue";
  if (remainingMs < 4 * 60 * 60 * 1000) return "due_soon"; // < 4h
  return "on_track";
}

export function formatCountdown(iso: string): string {
  const diffMs = +new Date(iso) - Date.now();
  const overdue = diffMs < 0;
  const abs = Math.abs(diffMs);
  const hours = Math.floor(abs / (1000 * 60 * 60));
  const mins = Math.floor((abs % (1000 * 60 * 60)) / (1000 * 60));
  const label = `${hours}h ${mins}m`;
  return overdue ? `Overdue by ${label}` : `${label} remaining`;
}
