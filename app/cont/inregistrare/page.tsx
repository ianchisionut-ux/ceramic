"use client";
// app/cont/inregistrare/page.tsx
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    setStatus("loading");
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setError(data.error ?? "Eroare la crearea contului");
      return;
    }

    // autentificare automata dupa inregistrare
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/cont");
  }

  return (
    <main style={{ padding: "3rem 2rem", maxWidth: "380px", margin: "0 auto", textAlign: "center" }}>
      <p style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", letterSpacing: "-0.02em" }}>gresie.</p>

      <h1 style={{ fontSize: "18px", fontWeight: 500, marginBottom: "20px" }}>Cont nou</h1>

      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
        <input placeholder="Prenume" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} style={{ flex: 1, padding: "10px" }} />
        <input placeholder="Nume" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} style={{ flex: 1, padding: "10px" }} />
      </div>
      <input
        type="email"
        placeholder="email@exemplu.ro"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px", textAlign: "left" }}
      />
      <input
        placeholder="Telefon"
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px", textAlign: "left" }}
      />
      <input
        type="password"
        placeholder="Parola"
        value={form.password}
        onChange={(e) => update("password", e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "16px", textAlign: "left" }}
      />

      {status === "error" && <p style={{ color: "#a32d2d", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={status === "loading"}
        style={{ width: "100%", padding: "10px", background: "#111", color: "white", border: "none", borderRadius: "6px", marginBottom: "16px" }}
      >
        {status === "loading" ? "Se creeaza contul..." : "Creeaza cont"}
      </button>

      <p style={{ fontSize: "13px", color: "#666" }}>
        Ai deja cont? <Link href="/cont/login">Autentifica-te</Link>
      </p>
    </main>
  );
}
