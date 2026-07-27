// app/admin/comenzi/page.tsx
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { redirect } from "next/navigation";
import OrderStatusSelect from "@/components/OrderStatusSelect";

export default async function AdminOrdersPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/cont/login");

  const orders = await prisma.order.findMany({
    include: { user: true, items: { include: { variant: { include: { product: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 500, marginBottom: "1rem" }}>Comenzi</h1>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
            <th style={{ padding: "8px" }}>Nr.</th>
            <th style={{ padding: "8px" }}>Client</th>
            <th style={{ padding: "8px" }}>Produse</th>
            <th style={{ padding: "8px" }}>Total</th>
            <th style={{ padding: "8px" }}>Plata</th>
            <th style={{ padding: "8px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "8px" }}>#{o.orderNumber}</td>
              <td style={{ padding: "8px" }}>{o.user ? `${o.user.firstName} ${o.user.lastName}` : o.guestEmail}</td>
              <td style={{ padding: "8px" }}>{o.items.map((i) => i.variant.product.name).join(", ")}</td>
              <td style={{ padding: "8px" }}>{Number(o.total).toFixed(0)} RON</td>
              <td style={{ padding: "8px" }}>{o.paymentStatus}</td>
              <td style={{ padding: "8px" }}>
                <OrderStatusSelect orderId={o.id} currentStatus={o.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
