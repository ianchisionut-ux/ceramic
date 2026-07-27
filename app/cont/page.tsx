// app/cont/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/cont/login");

  const [user, orders] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, include: { addresses: true } }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: { include: { variant: { include: { product: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 500, marginBottom: "4px" }}>
        Salut, {user?.firstName}
      </h1>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "24px" }}>{user?.email}</p>

      <h2 style={{ fontSize: "15px", fontWeight: 500, marginBottom: "12px" }}>Comenzile mele</h2>
      {orders.length === 0 && <p style={{ fontSize: "13px", color: "#666" }}>Nu ai comenzi inca.</p>}

      {orders.map((o) => (
        <div key={o.id} style={{ border: "1px solid #eee", borderRadius: "10px", padding: "12px", marginBottom: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "13px", fontWeight: 500 }}>Comanda #{o.orderNumber}</span>
            <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", background: "#f1f1f1" }}>{o.status}</span>
          </div>
          <p style={{ fontSize: "12px", color: "#666" }}>
            {o.items.length} produse - {Number(o.total).toFixed(0)} RON
          </p>
        </div>
      ))}

      <h2 style={{ fontSize: "15px", fontWeight: 500, margin: "24px 0 12px" }}>Adrese salvate</h2>
      {user?.addresses.length === 0 && <p style={{ fontSize: "13px", color: "#666" }}>Nu ai adrese salvate.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {user?.addresses.map((a) => (
          <div key={a.id} style={{ border: "1px solid #eee", borderRadius: "10px", padding: "10px" }}>
            <p style={{ fontSize: "12px", fontWeight: 500, marginBottom: "2px" }}>{a.label}</p>
            <p style={{ fontSize: "11px", color: "#666" }}>
              {a.street}, {a.city}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
