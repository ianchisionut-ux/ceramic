// app/comanda/succes/page.tsx
import Link from "next/link";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <main style={{ padding: "4rem 2rem", maxWidth: "420px", margin: "0 auto", textAlign: "center" }}>
      <p style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", letterSpacing: "-0.02em" }}>gresie.</p>

      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "var(--color-success-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          fontSize: "24px",
        }}
      >
        <i className="ti ti-check" />
      </div>

      <h1 style={{ fontSize: "20px", fontWeight: 500, marginBottom: "8px" }}>Comanda a fost inregistrata</h1>
      {order && (
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "20px" }}>
          Numarul comenzii tale este <strong>#{order}</strong>. Vei primi un email de confirmare in scurt timp.
        </p>
      )}

      <Link
        href="/produse"
        style={{ display: "inline-block", padding: "10px 20px", background: "var(--color-primary)", color: "white", borderRadius: "6px", textDecoration: "none", fontSize: "13px" }}
      >
        Continua cumparaturile
      </Link>
    </main>
  );
}
