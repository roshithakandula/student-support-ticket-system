import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user || (session.user.role !== "STAFF" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staff = await prisma.user.findMany({
    where: { role: { in: ["STAFF", "ADMIN"] } },
    select: { id: true, name: true, department: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ staff });
}
