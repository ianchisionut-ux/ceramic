// components/Header.tsx
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 24px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
        <Image src="/logo.jpg" alt="gresie." width={36} height={36} style={{ borderRadius: "4px" }} />
        <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.02em" }}>
          gresie.
        </span>
      </Link>

      <nav style={{ display: "flex", gap: "24px", fontSize: "13px" }}>
        <Link href="/produse" style={{ color: "var(--color-text)", textDecoration: "none" }}>
          Produse
        </Link>
        <Link href="/produse?categorie=baie" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
          Baie
        </Link>
        <Link href="/produse?categorie=bucatarie" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
          Bucatarie
        </Link>
        <Link href="/produse?categorie=exterior" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
          Exterior
        </Link>
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        <Link href="/cont/login" style={{ color: "var(--color-text)", textDecoration: "none" }} aria-label="Contul meu">
          <i className="ti ti-user" style={{ fontSize: "18px" }} />
        </Link>
        <Link href="/cos" style={{ color: "var(--color-text)", textDecoration: "none" }} aria-label="Cosul meu">
          <i className="ti ti-shopping-cart" style={{ fontSize: "18px" }} />
        </Link>
      </div>
    </header>
  );
}
