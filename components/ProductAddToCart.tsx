"use client";
// components/ProductAddToCart.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";

type Variant = {
  id: string;
  size: string;
  pricePerSqm: number;
  sqmPerBox: number;
  stockBoxes: number;
};

export default function ProductAddToCart({ variants }: { variants: Variant[] }) {
  const router = useRouter();
  const [variantId, setVariantId] = useState(variants[0]?.id);
  const [desiredSqm, setDesiredSqm] = useState(10);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const boxesNeeded = Math.ceil(desiredSqm / variant.sqmPerBox);
  const total = boxesNeeded * variant.sqmPerBox * variant.pricePerSqm;

  async function addToCart() {
    setStatus("loading");
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, desiredSqm }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setMessage(data.error ?? "A aparut o eroare");
      return;
    }
    setStatus("success");
    setMessage("Adaugat in cos");
    router.refresh();
  }

  return (
    <div>
      <p style={{ fontSize: "22px", fontWeight: 500, margin: "0 0 4px" }}>
        {variant.pricePerSqm} RON <span style={{ fontSize: "13px", fontWeight: 400, color: "#666" }}>/ mp</span>
      </p>
      <p style={{ fontSize: "12px", color: variant.stockBoxes > 0 ? "#0f6e56" : "#a32d2d", margin: "0 0 16px" }}>
        {variant.stockBoxes > 0 ? `In stoc · ${(variant.stockBoxes * variant.sqmPerBox).toFixed(1)} mp disponibili` : "Stoc epuizat"}
      </p>

      <p style={{ fontSize: "12px", fontWeight: 500, color: "#666", margin: "0 0 6px" }}>Dimensiune</p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => setVariantId(v.id)}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              border: v.id === variantId ? "1px solid #185fa5" : "1px solid #ddd",
              borderRadius: "6px",
              background: "white",
            }}
          >
            {v.size}
          </button>
        ))}
      </div>

      <p style={{ fontSize: "12px", fontWeight: 500, color: "#666", margin: "0 0 6px" }}>Suprafata dorita (mp)</p>
      <input
        type="number"
        value={desiredSqm}
        min={1}
        onChange={(e) => setDesiredSqm(Number(e.target.value))}
        style={{ width: "100px", padding: "6px 10px", marginBottom: "6px" }}
      />
      <p style={{ fontSize: "12px", color: "#666", margin: "0 0 16px" }}>
        Necesare: <strong>{boxesNeeded} cutii</strong> ({(boxesNeeded * variant.sqmPerBox).toFixed(2)} mp) - total {total.toFixed(0)} RON
      </p>

      <button
        onClick={addToCart}
        disabled={status === "loading" || variant.stockBoxes === 0}
        style={{ width: "100%", padding: "10px", background: "#185fa5", color: "white", border: "none", borderRadius: "6px" }}
      >
        {status === "loading" ? "Se adauga..." : "Adauga in cos"}
      </button>
      {message && (
        <p style={{ fontSize: "12px", marginTop: "8px", color: status === "error" ? "#a32d2d" : "#0f6e56" }}>{message}</p>
      )}
    </div>
  );
}
