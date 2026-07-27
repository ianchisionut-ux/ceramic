// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { mergeGuestCartIntoUser } from "@/lib/cart";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { email, password, firstName, lastName, phone } = await req.json();

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ error: "Toate campurile sunt obligatorii" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Exista deja un cont cu acest email" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, phone },
  });

  // daca vizitatorul avea un cos inceput ca guest, il mutam pe noul cont
  const cookieStore = await cookies();
  const guestToken = cookieStore.get("guest_cart_token")?.value;
  if (guestToken) {
    const guestCart = await prisma.cart.findUnique({ where: { guestToken } });
    if (guestCart) {
      await mergeGuestCartIntoUser(guestCart.id, user.id);
      cookieStore.delete("guest_cart_token");
    }
  }

  return NextResponse.json({ success: true, userId: user.id });
}
