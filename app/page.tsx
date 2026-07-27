// app/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    prisma.category.findMany({ where: { parentId: null } }),
    prisma.product.findMany({
      where: { isActive: true, featured: true },
      include: { variants: true, images: { take: 1, orderBy: { position: "asc" } } },
      take: 4,
    }),
  ]);

  return (
    <main>
      <section
        style={{
          padding: "5rem 2rem",
          textAlign: "center",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
            fontWeight: 500,
            marginBottom: "12px",
          }}
        >
          Portelanata rectificata
        </p>
        <h1 style={{ fontSize: "34px", fontWeight: 500, margin: "0 0 16px", letterSpacing: "-0.01em" }}>
          Gresie pentru fiecare spatiu al casei tale
        </h1>
        <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", maxWidth: "460px", margin: "0 auto 28px" }}>
          Baie, bucatarie, living sau exterior - o colectie ingrijita, la un raport
          calitate-pret potrivit pentru orice proiect de amenajare.
        </p>
        <Link
          href="/produse"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            background: "var(--color-primary)",
            color: "var(--color-bg)",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          Vezi toate produsele
        </Link>
      </section>

      <section style={{ padding: "3rem 2rem" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "16px" }}>Cumpara dupa spatiu</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
          {categories.map((c: (typeof categories)[number]) => (
            <Link
              key={c.id}
              href={`/produse?categorie=${c.slug}`}
              style={{
                display: "block",
                padding: "24px 16px",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "10px",
                textDecoration: "none",
                color: "var(--color-text)",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section style={{ padding: "1rem 2rem 4rem" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "16px" }}>Recomandate</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            {featured.map((product: (typeof featured)[number]) => {
              const minPrice = Math.min(...product.variants.map((v: (typeof product.variants)[number]) => Number(v.pricePerSqm)));
              return (
                <Link
                  key={product.id}
                  href={`/produse/${product.slug}`}
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    textDecoration: "none",
                    color: "inherit",
                    background: "var(--color-surface)",
                  }}
                >
                  <div style={{ height: "150px", background: "var(--color-bg)" }}>
                    {product.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].altText ?? product.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                  </div>
                  <div style={{ padding: "12px" }}>
                    <p style={{ fontWeight: 500, marginBottom: "4px", fontSize: "14px" }}>{product.name}</p>
                    <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>de la {minPrice} RON/mp</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
