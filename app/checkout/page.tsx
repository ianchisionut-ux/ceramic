"use client";
// app/checkout/page.tsx
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function CheckoutForm() {
  const searchParams = useSearchParams();
  const cartId = searchParams.get("cartId") ?? "";

  const [form, setForm] = useState({
    guestEmail: "",
    street: "",
    city: "",
    postalCode: "",
    deliveryMethod: "curier",
    paymentMethod: "card",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submitOrder() {
    setStatus("loading");
    setError("");

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartId,
        guestEmail: form.guestEmail,
        deliveryMethod: form.deliveryMethod,
        paymentMethod: form.paymentMethod,
        // in productie: adresa se salveaza intai via /api/account/addresses
        // si se trimite addressId; simplificat aici pentru guest checkout
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setError(data.error ?? "A aparut o eroare la finalizarea comenzii");
      return;
    }

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else {
      window.location.href = `/comanda/succes?order=${data.orderNumber}`;
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 500, marginBottom: "1rem" }}>Finalizeaza comanda</h1>

      <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "6px" }}>Email</p>
      <input
        type="email"
        placeholder="email@exemplu.ro"
        value={form.guestEmail}
        onChange={(e) => update("guestEmail", e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "14px" }}
      />

      <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "6px" }}>Adresa de livrare</p>
      <input
        placeholder="Strada si numar"
        value={form.street}
        onChange={(e) => update("street", e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
      />
      <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
        <input placeholder="Oras" value={form.city} onChange={(e) => update("city", e.target.value)} style={{ flex: 1, padding: "8px" }} />
        <input
          placeholder="Cod postal"
          value={form.postalCode}
          onChange={(e) => update("postalCode", e.target.value)}
          style={{ flex: 1, padding: "8px" }}
        />
      </div>

      <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "6px" }}>Metoda de livrare</p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
        <label style={{ flex: 1, border: "1px solid var(--color-border-strong)", borderRadius: "6px", padding: "8px", fontSize: "13px" }}>
          <input
            type="radio"
            checked={form.deliveryMethod === "curier"}
            onChange={() => update("deliveryMethod", "curier")}
          />{" "}
          Curier (85 RON)
        </label>
        <label style={{ flex: 1, border: "1px solid var(--color-border-strong)", borderRadius: "6px", padding: "8px", fontSize: "13px" }}>
          <input
            type="radio"
            checked={form.deliveryMethod === "ridicare_depozit"}
            onChange={() => update("deliveryMethod", "ridicare_depozit")}
          />{" "}
          Ridicare depozit (gratuit)
        </label>
      </div>

      <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "6px" }}>Metoda de plata</p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <label style={{ flex: 1, border: "1px solid var(--color-border-strong)", borderRadius: "6px", padding: "8px", fontSize: "13px" }}>
          <input type="radio" checked={form.paymentMethod === "card"} onChange={() => update("paymentMethod", "card")} /> Card online
        </label>
        <label style={{ flex: 1, border: "1px solid var(--color-border-strong)", borderRadius: "6px", padding: "8px", fontSize: "13px" }}>
          <input
            type="radio"
            checked={form.paymentMethod === "ramburs"}
            onChange={() => update("paymentMethod", "ramburs")}
          />{" "}
          Plata la livrare
        </label>
      </div>

      {error && <p style={{ color: "var(--color-danger)", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

      <button
        onClick={submitOrder}
        disabled={status === "loading" || !cartId}
        style={{ width: "100%", padding: "12px", background: "var(--color-primary)", color: "white", border: "none", borderRadius: "6px" }}
      >
        {status === "loading" ? "Se proceseaza..." : "Trimite comanda"}
      </button>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main style={{ padding: "2rem" }}>Se incarca...</main>}>
      <CheckoutForm />
    </Suspense>
  );
}
