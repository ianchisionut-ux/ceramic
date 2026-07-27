// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const products = await prisma.product.findMany({
    include: { variants: true, category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const body = await req.json();
  const { name, slug, description, categoryId, finish, variants } = body;

  if (!name || !slug || !categoryId || !variants?.length) {
    return NextResponse.json({ error: "Campuri obligatorii lipsa" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description: description ?? "",
      categoryId,
      finish,
      variants: {
        create: variants.map((v: { size: string; pricePerSqm: number; sqmPerBox: number; stockBoxes: number; sku: string }) => v),
      },
    },
    include: { variants: true },
  });

  return NextResponse.json({ success: true, product });
}
