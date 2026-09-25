import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const department = typeof body.department === "string" ? body.department.trim() : "";
    const requestedRole = body.role === "STAFF" ? "STAFF" : "STUDENT";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Full name, email and password are required." },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try signing in instead." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Self-registration can only create STUDENT or STAFF accounts —
    // ADMIN is provisioned manually (via seed/DB), never through this route.
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: requestedRole,
        department: department || null,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Something went wrong while creating your account. Please try again." },
      { status: 500 }
    );
  }
}
