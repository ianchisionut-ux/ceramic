// app/api/admin/variants/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const { stockBoxes, pricePerSqm } = await req.json();

  const variant = await prisma.productVariant.update({
    where: { id },
    data: {
      ...(stockBoxes !== undefined && { stockBoxes }),
      ...(pricePerSqm !== undefined && { pricePerSqm }),
    },
  });

  return NextResponse.json({ success: true, variant });
}
