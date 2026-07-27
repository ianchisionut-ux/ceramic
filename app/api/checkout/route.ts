// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// preturi simplificate de livrare - in productie: calcul pe zona/greutate reala
const DELIVERY_FEE_CURIER = 85;
const DELIVERY_FEE_RIDICARE = 0;

// POST /api/checkout
// body: { cartId, addressId?, guestEmail?, guestAddress?, deliveryMethod, paymentMethod }
export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();
  const { cartId, addressId, guestEmail, deliveryMethod, paymentMethod } = body;

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cosul este gol" }, { status: 400 });
  }

  if (!session?.user?.id && !guestEmail) {
    return NextResponse.json({ error: "Email obligatoriu pentru comanda ca vizitator" }, { status: 400 });
  }

  // verificare stoc final, inainte de a crea comanda (poate s-a schimbat intre timp)
  for (const item of cart.items) {
    if (item.boxes > item.variant.stockBoxes) {
      return NextResponse.json(
        { error: `Stoc insuficient pentru ${item.variant.product.name}` },
        { status: 409 }
      );
    }
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.boxes) * Number(item.variant.sqmPerBox) * Number(item.variant.pricePerSqm),
    0
  );
  const deliveryFee = deliveryMethod === "ridicare_depozit" ? DELIVERY_FEE_RIDICARE : DELIVERY_FEE_CURIER;
  const total = subtotal + deliveryFee;

  const orderNumber = `${Date.now()}`.slice(-6);

  // tranzactie: creeaza comanda + scade stocul + goleste cosul, sau anuleaza totul
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id ?? null,
        guestEmail: session?.user?.id ? null : guestEmail,
        addressId: addressId ?? null,
        status: "PENDING",
        deliveryMethod,
        paymentMethod,
        subtotal,
        deliveryFee,
        total,
        items: {
          create: cart.items.map((item) => ({
            variantId: item.variantId,
            boxes: item.boxes,
            pricePerSqm: item.variant.pricePerSqm,
            sqmPerBox: item.variant.sqmPerBox,
            lineTotal:
              Number(item.boxes) * Number(item.variant.sqmPerBox) * Number(item.variant.pricePerSqm),
          })),
        },
      },
      include: { items: { include: { variant: { include: { product: true } } } } },
    });

    for (const item of cart.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stockBoxes: { decrement: item.boxes } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  const recipientEmail = session?.user?.email ?? guestEmail;

  // plata la livrare (ramburs) - comanda se confirma direct, fara pasul de plata online
  if (paymentMethod === "ramburs") {
    await prisma.order.update({ where: { id: order.id }, data: { status: "CONFIRMED" } });

    if (recipientEmail) {
      await resend.emails.send({
        from: "Comenzi ceramic-evo <comenzi@ceramic-evo.ro>",
        to: recipientEmail,
        subject: `Comanda ta #${order.orderNumber} a fost inregistrata`,
        html: buildOrderEmailHtml(order),
      });
    }

    return NextResponse.json({ success: true, orderNumber: order.orderNumber, total });
  }

  // plata cu cardul - redirectioneaza spre Stripe Checkout
  // comanda ramane PENDING pana la confirmarea webhook-ului (vezi app/api/webhooks/stripe)
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: recipientEmail ?? undefined,
    line_items: order.items.map((item) => ({
      price_data: {
        currency: "ron",
        product_data: { name: `${item.variant.product.name} (${item.boxes} cutii)` },
        unit_amount: Math.round(Number(item.lineTotal) * 100),
      },
      quantity: 1,
    })),
    shipping_options:
      deliveryFee > 0
        ? [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: { amount: deliveryFee * 100, currency: "ron" },
                display_name: "Curier paletizat",
              },
            },
          ]
        : undefined,
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/comanda/succes?order=${order.orderNumber}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=1`,
  });

  return NextResponse.json({ success: true, orderNumber: order.orderNumber, checkoutUrl: checkoutSession.url });
}

function buildOrderEmailHtml(order: {
  orderNumber: string;
  total: unknown;
  items: { boxes: number; variant: { product: { name: string } } }[];
}) {
  const rows = order.items
    .map((i) => `<tr><td>${i.variant.product.name}</td><td>${i.boxes} cutii</td></tr>`)
    .join("");

  return `
    <h2>Multumim pentru comanda #${order.orderNumber}</h2>
    <table>${rows}</table>
    <p>Total: ${order.total} RON</p>
    <p>Iti vom trimite un email separat cand comanda este expediata.</p>
  `;
}
