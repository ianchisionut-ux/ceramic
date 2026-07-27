// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: "Semnatura webhook invalida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { orderId?: string }; customer_email?: string };
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: "CONFIRMED", paymentStatus: "paid" },
        include: { items: { include: { variant: { include: { product: true } } } } },
      });

      const recipientEmail = session.customer_email;
      if (recipientEmail) {
        await resend.emails.send({
          from: "Comenzi ceramic-evo <comenzi@ceramic-evo.ro>",
          to: recipientEmail,
          subject: `Plata confirmata - comanda #${order.orderNumber}`,
          html: `<h2>Plata a fost confirmata pentru comanda #${order.orderNumber}</h2><p>Total: ${order.total} RON</p>`,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
