// app/produse/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}): Promise<Metadata> {
  const { categorie } = await searchParams;
  if (!categorie) {
    return { title: "Gresie portelanata rectificata | ceramic-evo" };
  }
  const category = await prisma.category.findUnique({ where: { slug: categorie } });
  return {
    title: category?.seoTitle ?? `${category?.name} | ceramic-evo`,
    description: category?.seoDescription ?? undefined,
  };
}

export default async function ProduseListPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const { categorie } = await searchParams;

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ where: { parentId: null } }),
    prisma.product.findMany({
      where: {
        isActive: true,
        category: categorie ? { slug: categorie } : undefined,
      },
      include: { variants: true, images: { take: 1, orderBy: { position: "asc" } } },
      orderBy: { featured: "desc" },
    }),
  ]);

  return (
    <main style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "2rem", padding: "2rem" }}>
      <aside>
        <h2 style={{ fontSize: "14px", fontWeight: 500, marginBottom: "12px" }}>Categorii</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
          <li>
            <Link href="/produse">Toate</Link>
          </li>
          {categories.map((c: (typeof categories)[number]) => (
            <li key={c.id}>
              <Link href={`/produse?categorie=${c.slug}`}>{c.name}</Link>
            </li>
          ))}
        </ul>
      </aside>

      <section>
        <h1 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "1rem" }}>
          {categorie ? categories.find((c: (typeof categories)[number]) => c.slug === categorie)?.name : "Toate produsele"}
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          {products.map((product: (typeof products)[number]) => {
            const minPrice = Math.min(...product.variants.map((v: (typeof product.variants)[number]) => Number(v.pricePerSqm)));
            return (
              <Link
                key={product.id}
                href={`/produse/${product.slug}`}
                style={{ border: "1px solid var(--color-border)", borderRadius: "12px", overflow: "hidden", textDecoration: "none", color: "inherit" }}
              >
                <div style={{ height: "160px", background: "var(--color-bg)" }}>
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
                  <p style={{ fontWeight: 500, marginBottom: "4px" }}>{product.name}</p>
                  <p className="price" style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>de la {minPrice} RON/mp</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
