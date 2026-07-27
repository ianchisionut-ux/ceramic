// components/AdminNav.tsx
import Link from "next/link";

export default function AdminNav({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  return (
    <nav
      style={{
        display: "flex",
        gap: "20px",
        padding: "12px 0",
        marginBottom: "20px",
        borderBottom: "1px solid var(--color-border)",
        fontSize: "13px",
      }}
    >
      <Link href="/admin/produse" style={{ color: "var(--color-text)", textDecoration: "none" }}>
        Produse
      </Link>
      <Link href="/admin/comenzi" style={{ color: "var(--color-text)", textDecoration: "none" }}>
        Comenzi
      </Link>
      {isSuperAdmin && (
        <Link href="/admin/utilizatori" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
          Utilizatori
        </Link>
      )}
    </nav>
  );
}
