// app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";
import { auth } from "@/auth"; // NextAuth v5 - ajusteaza importul dupa configul tau

// GET /api/cart - returneaza cosul curent cu totaluri calculate
export async function GET() {
  const session = await auth();
  const cart = await getOrCreateCart(session?.user?.id ?? null);

  const items = cart.items.map((item) => ({
    id: item.id,
    productName: item.variant.product.name,
    size: item.variant.size,
    boxes: item.boxes,
    sqm: Number(item.boxes) * Number(item.variant.sqmPerBox),
    pricePerSqm: Number(item.variant.pricePerSqm),
    lineTotal: Number(item.boxes) * Number(item.variant.sqmPerBox) * Number(item.variant.pricePerSqm),
  }));

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);

  return NextResponse.json({ cartId: cart.id, items, subtotal });
}

// POST /api/cart - adauga o varianta de produs in cos
// body: { variantId: string, desiredSqm: number }
export async function POST(req: NextRequest) {
  const { variantId, desiredSqm } = await req.json();

  if (!variantId || !desiredSqm || desiredSqm <= 0) {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });
  }

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) {
    return NextResponse.json({ error: "Produsul nu a fost gasit" }, { status: 404 });
  }

  // rotunjire la cutie intreaga - aceeasi logica din mockup-ul de produs
  const boxesNeeded = Math.ceil(desiredSqm / Number(variant.sqmPerBox));

  if (boxesNeeded > variant.stockBoxes) {
    return NextResponse.json(
      { error: `Stoc insuficient. Disponibile: ${variant.stockBoxes} cutii` },
      { status: 409 }
    );
  }

  const session = await auth();
  const cart = await getOrCreateCart(session?.user?.id ?? null);

  const cartItem = await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    update: { boxes: { increment: boxesNeeded } },
    create: { cartId: cart.id, variantId, boxes: boxesNeeded },
  });

  return NextResponse.json({ success: true, cartItem, boxesAdded: boxesNeeded });
}
