"use client";
// app/cos/page.tsx
import { useEffect, useState } from "react";
import Link from "next/link";

type CartItem = {
  id: string;
  productName: string;
  size: string;
  boxes: number;
  sqm: number;
  pricePerSqm: number;
  lineTotal: number;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [cartId, setCartId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  async function loadCart() {
    setLoading(true);
    const res = await fetch("/api/cart");
    const data = await res.json();
    setItems(data.items);
    setSubtotal(data.subtotal);
    setCartId(data.cartId);
    setLoading(false);
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function updateBoxes(itemId: string, boxes: number) {
    if (boxes < 1) return;
    await fetch(`/api/cart/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boxes }),
    });
    loadCart();
  }

  async function removeItem(itemId: string) {
    await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    loadCart();
  }

  if (loading) return <main style={{ padding: "2rem" }}>Se incarca cosul...</main>;

  if (items.length === 0) {
    return (
      <main style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ marginBottom: "12px" }}>Cosul tau este gol.</p>
        <Link href="/produse">Vezi produsele disponibile</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 500, marginBottom: "1rem" }}>Cosul tau</h1>

      {items.map((item) => (
        <div
          key={item.id}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--color-border)" }}
        >
          <div>
            <p style={{ fontWeight: 500, marginBottom: "2px" }}>{item.productName}</p>
            <p style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
              {item.size} · {item.sqm.toFixed(2)} mp · {item.pricePerSqm} RON/mp
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="number"
              value={item.boxes}
              min={1}
              onChange={(e) => updateBoxes(item.id, Number(e.target.value))}
              style={{ width: "60px", padding: "4px 8px" }}
            />
            <span style={{ fontSize: "13px", fontWeight: 500, minWidth: "80px", textAlign: "right" }}>
              {item.lineTotal.toFixed(0)} RON
            </span>
            <button onClick={() => removeItem(item.id)} aria-label="Elimina produsul" style={{ border: "none", background: "none", cursor: "pointer" }}>
              &times;
            </button>
          </div>
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", fontSize: "16px", fontWeight: 500 }}>
        <span>Subtotal</span>
        <span>{subtotal.toFixed(0)} RON</span>
      </div>

      <Link
        href={`/checkout?cartId=${cartId}`}
        style={{ display: "block", textAlign: "center", padding: "12px", background: "var(--color-primary)", color: "white", borderRadius: "6px", textDecoration: "none" }}
      >
        Continua spre checkout
      </Link>
    </main>
  );
}
