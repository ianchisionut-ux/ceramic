// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-guard";

const validRoles = ["CUSTOMER", "ADMIN", "SUPER_ADMIN"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const superAdmin = await requireSuperAdmin();
  if (!superAdmin) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const { role } = await req.json();

  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Rol invalid" }, { status: 400 });
  }

  // nu te poti retrograda singur, ca sa nu ramai fara niciun super admin din greseala
  if (id === superAdmin.id && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Nu iti poti schimba propriul rol" }, { status: 400 });
  }

  const user = await prisma.user.update({ where: { id }, data: { role } });
  return NextResponse.json({ success: true, user });
}
