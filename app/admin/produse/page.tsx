// app/admin/produse/page.tsx
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminProductsPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/cont/login");

  const products = await prisma.product.findMany({
    include: { variants: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 500 }}>Produse</h1>
        <Link
          href="/admin/produse/nou"
          style={{ padding: "8px 14px", background: "#185fa5", color: "white", borderRadius: "6px", textDecoration: "none", fontSize: "13px" }}
        >
          Adauga produs
        </Link>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
            <th style={{ padding: "8px" }}>Produs</th>
            <th style={{ padding: "8px" }}>Categorie</th>
            <th style={{ padding: "8px" }}>Variante</th>
            <th style={{ padding: "8px" }}>Stoc total (mp)</th>
            <th style={{ padding: "8px" }}>Status</th>
            <th style={{ padding: "8px" }}></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p: (typeof products)[number]) => {
            const stockSqm = p.variants.reduce((sum, v) => sum + v.stockBoxes * Number(v.sqmPerBox), 0);
            return (
              <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}>{p.name}</td>
                <td style={{ padding: "8px" }}>{p.category.name}</td>
                <td style={{ padding: "8px" }}>{p.variants.length}</td>
                <td style={{ padding: "8px" }}>{stockSqm.toFixed(1)}</td>
                <td style={{ padding: "8px" }}>{p.isActive ? "activ" : "inactiv"}</td>
                <td style={{ padding: "8px" }}>
                  <Link href={`/admin/produse/${p.id}`} style={{ color: "#185fa5" }}>
                    Editeaza
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
