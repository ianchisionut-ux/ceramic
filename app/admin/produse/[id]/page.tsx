"use client";
// app/admin/produse/[id]/page.tsx
import { useEffect, useState, use } from "react";

type Variant = { id: string; size: string; pricePerSqm: number; stockBoxes: number };
type Product = { id: string; name: string; description: string; isActive: boolean; variants: Variant[] };

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => setProduct(data.products.find((p: Product) => p.id === id) ?? null));
  }, [id]);

  if (!product) return <main style={{ padding: "2rem" }}>Se incarca...</main>;

  async function saveProduct() {
    setSaving(true);
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: product?.name, description: product?.description, isActive: product?.isActive }),
    });
    setSaving(false);
  }

  async function saveVariant(variantId: string, stockBoxes: number, pricePerSqm: number) {
    await fetch(`/api/admin/variants/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockBoxes, pricePerSqm }),
    });
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "480px" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 500, marginBottom: "1rem" }}>Editeaza produs</h1>

      <input
        value={product.name}
        onChange={(e) => setProduct({ ...product, name: e.target.value })}
        style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
      />
      <textarea
        value={product.description}
        onChange={(e) => setProduct({ ...product, description: e.target.value })}
        style={{ width: "100%", padding: "8px", marginBottom: "8px", minHeight: "80px" }}
      />
      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", marginBottom: "14px" }}>
        <input type="checkbox" checked={product.isActive} onChange={(e) => setProduct({ ...product, isActive: e.target.checked })} />
        Produs activ (vizibil pe site)
      </label>

      <button onClick={saveProduct} disabled={saving} style={{ padding: "8px 14px", background: "#185fa5", color: "white", border: "none", borderRadius: "6px", marginBottom: "20px" }}>
        {saving ? "Se salveaza..." : "Salveaza"}
      </button>

      <p style={{ fontSize: "13px", fontWeight: 500, marginBottom: "8px" }}>Variante - stoc si pret</p>
      {product.variants.map((v: (typeof product.variants)[number]) => (
        <div key={v.id} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "13px", width: "60px" }}>{v.size}</span>
          <input
            type="number"
            defaultValue={v.pricePerSqm}
            onBlur={(e) => saveVariant(v.id, v.stockBoxes, Number(e.target.value))}
            style={{ width: "90px", padding: "6px" }}
            aria-label="Pret per mp"
          />
          <input
            type="number"
            defaultValue={v.stockBoxes}
            onBlur={(e) => saveVariant(v.id, Number(e.target.value), v.pricePerSqm)}
            style={{ width: "90px", padding: "6px" }}
            aria-label="Stoc in cutii"
          />
        </div>
      ))}
    </main>
  );
}
