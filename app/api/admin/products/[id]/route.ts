// app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, description, isActive, finish } = body;

  const product = await prisma.product.update({
    where: { id },
    data: { name, description, isActive, finish },
  });

  return NextResponse.json({ success: true, product });
}

// nu stergem definitiv - dezactivam produsul, ca sa nu pierdem istoricul comenzilor vechi
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
