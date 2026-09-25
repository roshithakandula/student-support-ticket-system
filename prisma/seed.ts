import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ---- Categories ----------------------------------------------------
  const categoryDefs = [
    { name: "Fees", description: "Tuition, fines, refunds and payment issues", defaultSlaHours: 48 },
    { name: "Attendance", description: "Attendance correction and shortage appeals", defaultSlaHours: 24 },
    { name: "ID Cards", description: "New, lost or damaged student ID cards", defaultSlaHours: 72 },
    { name: "Certificates", description: "Bonafide, transcript and provisional certificates", defaultSlaHours: 96 },
  ];
  for (const c of categoryDefs) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  // ---- Demo users (author: Roshitha Kandula) --------------------------
  const passwordHash = (plain: string) => bcrypt.hash(plain, 10);

  const student = await prisma.user.upsert({
    where: { email: "student@edumerge.com" },
    update: {},
    create: {
      name: "Roshitha Kandula",
      email: "student@edumerge.com",
      passwordHash: await passwordHash("student123"),
      role: "STUDENT",
      department: "B.Tech CSE",
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "support@edumerge.com" },
    update: {},
    create: {
      name: "Support Staff",
      email: "support@edumerge.com",
      passwordHash: await passwordHash("admin123"),
      role: "STAFF",
      department: "Accounts Office",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@edumerge.com" },
    update: {},
    create: {
      name: "Dr. Meena Iyer",
      email: "admin@edumerge.com",
      passwordHash: await passwordHash("admin123"),
      role: "ADMIN",
      department: "Student Affairs",
    },
  });

  // ---- One sample ticket + activity entry so the dashboard isn't empty -
  const feesCategory = await prisma.category.findUniqueOrThrow({ where: { name: "Fees" } });

  const existingTicket = await prisma.ticket.findUnique({ where: { ticketNumber: "TCK-1001" } });
  if (!existingTicket) {
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: "TCK-1001",
        title: "Duplicate fee deduction for semester 5",
        description:
          "My account shows two deductions of ₹45,000 for the same semester. Please refund the extra amount.",
        categoryId: feesCategory.id,
        priority: "HIGH",
        status: "IN_PROGRESS",
        studentId: student.id,
        assignedStaffId: staff.id,
        slaDueAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
      },
    });

    await prisma.ticketActivity.createMany({
      data: [
        {
          ticketId: ticket.id,
          actorId: student.id,
          action: "created",
          notes: "Ticket submitted by student",
        },
        {
          ticketId: ticket.id,
          actorId: staff.id,
          action: "status_changed",
          fieldChanged: "status",
          oldValue: "OPEN",
          newValue: "IN_PROGRESS",
          notes: "Verifying payment gateway logs",
        },
      ],
    });
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
