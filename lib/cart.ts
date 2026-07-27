// lib/cart.ts
// Gaseste sau creeaza cosul curent. Pentru guest, id-ul cosului e tinut
// intr-un cookie httpOnly "guest_cart_id"; la login, cosul guest se
// muta pe userId (vezi mergGuestCartIntoUser, apelat din callback-ul de login).

import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const GUEST_COOKIE = "guest_cart_token";
const cartInclude = { items: { include: { variant: { include: { product: true } } } } };

export async function getOrCreateCart(userId: string | null) {
  if (userId) {
    return prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: cartInclude,
    });
  }

  const cookieStore = await cookies();
  let guestToken = cookieStore.get(GUEST_COOKIE)?.value;

  if (guestToken) {
    const existing = await prisma.cart.findUnique({ where: { guestToken }, include: cartInclude });
    if (existing) return existing;
  }

  guestToken = randomUUID();
  cookieStore.set(GUEST_COOKIE, guestToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 zile
  });

  return prisma.cart.create({
    data: { guestToken },
    include: cartInclude,
  });
}

export async function mergeGuestCartIntoUser(guestCartId: string, userId: string) {
  const userCart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const guestItems = await prisma.cartItem.findMany({ where: { cartId: guestCartId } });

  for (const item of guestItems) {
    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
      update: { boxes: { increment: item.boxes } },
      create: { cartId: userCart.id, variantId: item.variantId, boxes: item.boxes },
    });
  }

  await prisma.cart.delete({ where: { id: guestCartId } });
}
