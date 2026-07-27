"use client";
// app/cont/login/page.tsx
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleSubmit() {
    setStatus("loading");
    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setStatus("error");
      return;
    }
    router.push("/cont");
  }

  return (
    <main style={{ padding: "3rem 2rem", maxWidth: "380px", margin: "0 auto", textAlign: "center" }}>
      <p style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", letterSpacing: "-0.02em" }}>gresie.</p>

      <h1 style={{ fontSize: "18px", fontWeight: 500, marginBottom: "20px" }}>Autentificare</h1>

      <input
        type="email"
        placeholder="email@exemplu.ro"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px", textAlign: "left" }}
      />
      <input
        type="password"
        placeholder="Parola"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "16px", textAlign: "left" }}
      />

      {status === "error" && (
        <p style={{ color: "var(--color-danger)", fontSize: "13px", marginBottom: "12px" }}>Email sau parola incorecte.</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={status === "loading"}
        style={{ width: "100%", padding: "10px", background: "var(--color-primary)", color: "white", border: "none", borderRadius: "6px", marginBottom: "16px" }}
      >
        {status === "loading" ? "Se autentifica..." : "Intra in cont"}
      </button>

      <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
        Nu ai cont? <Link href="/cont/inregistrare">Inregistreaza-te</Link>
      </p>
    </main>
  );
}
