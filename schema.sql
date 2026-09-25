-- ============================================================================
-- Student Support & Ticket Management System — PostgreSQL Schema
-- Assignment 4
-- Author: Roshitha Kandula
-- ============================================================================

-- Clean slate (safe to re-run during development)
DROP TABLE IF EXISTS ticket_activity_history CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS ticket_priority CASCADE;
DROP TYPE IF EXISTS ticket_status CASCADE;

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('student', 'staff', 'admin');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- ----------------------------------------------------------------------------
-- users
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(120)        NOT NULL,
    email           VARCHAR(180) UNIQUE NOT NULL,
    password_hash   VARCHAR(255)        NOT NULL DEFAULT 'demo-only-not-secure',
    role            user_role           NOT NULL DEFAULT 'student',
    department      VARCHAR(120),
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(80) UNIQUE NOT NULL,
    description     TEXT,
    default_sla_hours INTEGER NOT NULL DEFAULT 48
);

-- ----------------------------------------------------------------------------
-- tickets
-- ----------------------------------------------------------------------------
CREATE TABLE tickets (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number       VARCHAR(20) UNIQUE NOT NULL,
    title               VARCHAR(200)     NOT NULL,
    description         TEXT             NOT NULL,
    category_id         INTEGER          NOT NULL REFERENCES categories(id),
    priority            ticket_priority  NOT NULL DEFAULT 'medium',
    status              ticket_status    NOT NULL DEFAULT 'open',
    student_id          UUID             NOT NULL REFERENCES users(id),
    assigned_staff_id   UUID             REFERENCES users(id),
    sla_due_at          TIMESTAMPTZ      NOT NULL,
    resolved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ      NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ      NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_student ON tickets(student_id);
CREATE INDEX idx_tickets_assigned ON tickets(assigned_staff_id);
CREATE INDEX idx_tickets_sla_due ON tickets(sla_due_at);

-- ----------------------------------------------------------------------------
-- ticket_activity_history
-- ----------------------------------------------------------------------------
CREATE TABLE ticket_activity_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id       UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    actor_id        UUID REFERENCES users(id),
    action          VARCHAR(60) NOT NULL,   -- e.g. created, status_changed, reassigned, commented
    field_changed   VARCHAR(60),
    old_value       TEXT,
    new_value       TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_ticket ON ticket_activity_history(ticket_id);

-- Keep updated_at fresh on tickets
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tickets_updated_at
BEFORE UPDATE ON tickets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- Seed data
-- ============================================================================

-- Categories
INSERT INTO categories (name, description, default_sla_hours) VALUES
    ('Fees',         'Tuition, fines, refunds and payment issues',      48),
    ('Attendance',   'Attendance correction and shortage appeals',      24),
    ('ID Cards',     'New, lost or damaged student ID cards',           72),
    ('Certificates', 'Bonafide, transcript and provisional certificates', 96);

-- Users (2 students, 2 staff, 1 admin)
-- NOTE: password_hash below is a PLACEHOLDER, not a working bcrypt hash —
-- this raw SQL file has no way to compute one. For accounts that can
-- actually log in, run the Prisma seed script instead, which hashes real
-- passwords with bcryptjs at insert time:
--   npx prisma db push && npm run db:seed
-- (see prisma/seed.ts — same 5 users, real hashes, idempotent upserts)
--   student@edumerge.com / student123   (Roshitha Kandula)
--   support@edumerge.com / admin123
--   admin@edumerge.com   / admin123
INSERT INTO users (id, name, email, password_hash, role, department) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Roshitha Kandula', 'student@edumerge.com', 'set-via-prisma-seed', 'student', 'B.Tech CSE'),
    ('22222222-2222-2222-2222-222222222222', 'Rohan Mehta',      'rohan.mehta@campus.edu', 'set-via-prisma-seed', 'student', 'B.Tech ECE'),
    ('33333333-3333-3333-3333-333333333333', 'Support Staff',    'support@edumerge.com', 'set-via-prisma-seed', 'staff',   'Accounts Office'),
    ('44444444-4444-4444-4444-444444444444', 'Suresh Kumar',     'suresh.kumar@campus.edu', 'set-via-prisma-seed', 'staff',   'Examination Cell'),
    ('55555555-5555-5555-5555-555555555555', 'Dr. Meena Iyer',   'admin@edumerge.com', 'set-via-prisma-seed', 'admin',   'Student Affairs');

-- Tickets (5 dummy records spanning categories/priorities/statuses)
INSERT INTO tickets (id, ticket_number, title, description, category_id, priority, status, student_id, assigned_staff_id, sla_due_at, created_at, updated_at) VALUES
    ('a1111111-aaaa-1111-aaaa-111111111111', 'TCK-1001',
        'Duplicate fee deduction for semester 5',
        'My account shows two deductions of ₹45,000 for the same semester. Please refund the extra amount.',
        1, 'high', 'in_progress',
        '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333',
        now() + interval '6 hours', now() - interval '18 hours', now() - interval '2 hours'),

    ('a2222222-aaaa-2222-aaaa-222222222222', 'TCK-1002',
        'Attendance shortage despite medical leave',
        'I was marked absent for 5 classes in March even though I submitted a medical certificate. Please correct my attendance record.',
        2, 'urgent', 'open',
        '22222222-2222-2222-2222-222222222222', NULL,
        now() - interval '3 hours', now() - interval '20 hours', now() - interval '20 hours'),

    ('a3333333-aaaa-3333-aaaa-333333333333', 'TCK-1003',
        'Lost student ID card',
        'I lost my ID card near the library. I need a replacement card issued before my end-semester exams.',
        3, 'medium', 'resolved',
        '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444',
        now() - interval '1 day', now() - interval '5 days', now() - interval '1 day'),

    ('a4444444-aaaa-4444-aaaa-444444444444', 'TCK-1004',
        'Bonafide certificate for passport application',
        'I need a bonafide certificate urgently for a passport application appointment next week.',
        4, 'high', 'open',
        '22222222-2222-2222-2222-222222222222', NULL,
        now() + interval '20 hours', now() - interval '4 hours', now() - interval '4 hours'),

    ('a5555555-aaaa-5555-aaaa-555555555555', 'TCK-1005',
        'Scholarship amount not credited',
        'The merit scholarship for this semester has not been credited to my fee account yet. Please check and update.',
        1, 'low', 'closed',
        '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333',
        now() - interval '2 days', now() - interval '10 days', now() - interval '3 days');

-- Activity history
INSERT INTO ticket_activity_history (ticket_id, actor_id, action, field_changed, old_value, new_value, notes, created_at) VALUES
    ('a1111111-aaaa-1111-aaaa-111111111111', '11111111-1111-1111-1111-111111111111', 'created', NULL, NULL, NULL, 'Ticket submitted by student', now() - interval '18 hours'),
    ('a1111111-aaaa-1111-aaaa-111111111111', '33333333-3333-3333-3333-333333333333', 'reassigned', 'assigned_staff_id', NULL, 'Priya Nair', 'Assigned to Accounts Office', now() - interval '10 hours'),
    ('a1111111-aaaa-1111-aaaa-111111111111', '33333333-3333-3333-3333-333333333333', 'status_changed', 'status', 'open', 'in_progress', 'Verifying payment gateway logs', now() - interval '2 hours'),

    ('a3333333-aaaa-3333-aaaa-333333333333', '11111111-1111-1111-1111-111111111111', 'created', NULL, NULL, NULL, 'Ticket submitted by student', now() - interval '5 days'),
    ('a3333333-aaaa-3333-aaaa-333333333333', '44444444-4444-4444-4444-444444444444', 'status_changed', 'status', 'open', 'resolved', 'New ID card issued at counter 2', now() - interval '1 day'),

    ('a5555555-aaaa-5555-aaaa-555555555555', '11111111-1111-1111-1111-111111111111', 'created', NULL, NULL, NULL, 'Ticket submitted by student', now() - interval '10 days'),
    ('a5555555-aaaa-5555-aaaa-555555555555', '33333333-3333-3333-3333-333333333333', 'status_changed', 'status', 'open', 'resolved', 'Scholarship credited', now() - interval '4 days'),
    ('a5555555-aaaa-5555-aaaa-555555555555', '33333333-3333-3333-3333-333333333333', 'status_changed', 'status', 'resolved', 'closed', 'Confirmed by student', now() - interval '3 days');
