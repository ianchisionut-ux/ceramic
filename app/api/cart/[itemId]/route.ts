// app/api/cart/[itemId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/cart/:itemId - modifica numarul de cutii
// body: { boxes: number }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const { boxes } = await req.json();

  if (!boxes || boxes <= 0) {
    return NextResponse.json({ error: "Cantitate invalida" }, { status: 400 });
  }

  const item = await prisma.cartItem.findUnique({ include: { variant: true }, where: { id: itemId } });
  if (!item) return NextResponse.json({ error: "Produsul nu exista in cos" }, { status: 404 });

  if (boxes > item.variant.stockBoxes) {
    return NextResponse.json(
      { error: `Stoc insuficient. Disponibile: ${item.variant.stockBoxes} cutii` },
      { status: 409 }
    );
  }

  const updated = await prisma.cartItem.update({ where: { id: itemId }, data: { boxes } });
  return NextResponse.json({ success: true, item: updated });
}

// DELETE /api/cart/:itemId - elimina produsul din cos
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  await prisma.cartItem.delete({ where: { id: itemId } });
  return NextResponse.json({ success: true });
}
