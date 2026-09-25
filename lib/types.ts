export type UserRole = "student" | "staff" | "admin";

export type Priority = "low" | "medium" | "high" | "urgent";

export type Status = "open" | "in_progress" | "resolved" | "closed";

export type Category = "Fees" | "Attendance" | "ID Cards" | "Certificates";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

export interface ActivityEntry {
  id: string;
  ticketId: string;
  actorName: string;
  actorRole: UserRole;
  action:
    | "created"
    | "status_changed"
    | "reassigned"
    | "priority_changed"
    | "commented";
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  notes?: string;
  createdAt: string; // ISO
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  studentId: string;
  studentName: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  slaDueAt: string; // ISO
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORIES: Category[] = [
  "Fees",
  "Attendance",
  "ID Cards",
  "Certificates",
];

// SLA windows in hours, keyed by priority
export const SLA_HOURS: Record<Priority, number> = {
  urgent: 4,
  high: 24,
  medium: 48,
  low: 72,
};
