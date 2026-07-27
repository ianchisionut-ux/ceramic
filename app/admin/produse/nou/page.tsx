"use client";
// app/admin/produse/nou/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    finish: "",
    size: "",
    pricePerSqm: 0,
    sqmPerBox: 1.44,
    stockBoxes: 0,
    sku: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  function update(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit() {
    setStatus("loading");
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        slug: form.slug,
        description: form.description,
        categoryId: form.categoryId,
        finish: form.finish,
        variants: [
          {
            size: form.size,
            pricePerSqm: form.pricePerSqm,
            sqmPerBox: form.sqmPerBox,
            stockBoxes: form.stockBoxes,
            sku: form.sku,
          },
        ],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setError(data.error ?? "Eroare la salvare");
      return;
    }
    router.push("/admin/produse");
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "480px" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 500, marginBottom: "1rem" }}>Produs nou</h1>

      <input placeholder="Nume produs" value={form.name} onChange={(e) => update("name", e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "8px" }} />
      <input placeholder="Slug (ex: gresie-antiderapanta)" value={form.slug} onChange={(e) => update("slug", e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "8px" }} />
      <input placeholder="ID categorie" value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "8px" }} />
      <input placeholder="Finisaj (mat/lucios/antiderapant)" value={form.finish} onChange={(e) => update("finish", e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "8px" }} />
      <textarea placeholder="Descriere" value={form.description} onChange={(e) => update("description", e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "14px", minHeight: "80px" }} />

      <p style={{ fontSize: "13px", fontWeight: 500, marginBottom: "8px" }}>Prima varianta</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
        <input placeholder="Dimensiune (30x60)" value={form.size} onChange={(e) => update("size", e.target.value)} style={{ padding: "8px" }} />
        <input placeholder="SKU" value={form.sku} onChange={(e) => update("sku", e.target.value)} style={{ padding: "8px" }} />
        <input type="number" placeholder="Pret / mp" value={form.pricePerSqm} onChange={(e) => update("pricePerSqm", Number(e.target.value))} style={{ padding: "8px" }} />
        <input type="number" placeholder="mp / cutie" value={form.sqmPerBox} onChange={(e) => update("sqmPerBox", Number(e.target.value))} style={{ padding: "8px" }} />
        <input type="number" placeholder="Stoc (cutii)" value={form.stockBoxes} onChange={(e) => update("stockBoxes", Number(e.target.value))} style={{ padding: "8px" }} />
      </div>

      {error && <p style={{ color: "var(--color-danger)", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

      <button onClick={submit} disabled={status === "loading"} style={{ width: "100%", padding: "10px", background: "var(--color-primary)", color: "white", border: "none", borderRadius: "6px" }}>
        {status === "loading" ? "Se salveaza..." : "Salveaza produsul"}
      </button>
    </main>
  );
}
