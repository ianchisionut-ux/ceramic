// app/produse/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import ProductAddToCart from "@/components/ProductAddToCart";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { variants: true, images: { orderBy: { position: "asc" } }, category: true },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: product.seoTitle ?? `${product.name} | ceramic-evo`,
    description: product.seoDescription ?? product.description.slice(0, 155),
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const minPrice = Math.min(...product.variants.map((v: (typeof product.variants)[number]) => Number(v.pricePerSqm)));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i: (typeof product.images)[number]) => i.url),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "RON",
      lowPrice: minPrice,
      offerCount: product.variants.length,
      availability: product.variants.some((v) => v.stockBoxes > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "960px", margin: "0 auto" }}>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p style={{ fontSize: "12px", color: "#999", marginBottom: "14px" }}>
        Acasa / {product.category.name} / {product.name}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div>
          <div style={{ height: "320px", background: "#f5f5f5", borderRadius: "12px" }}>
            {product.images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0].url}
                alt={product.images[0].altText ?? product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }}
              />
            )}
          </div>
        </div>

        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 500, margin: "0 0 4px" }}>{product.name}</h1>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "16px" }}>
            {product.material} {product.finish ? `· finisaj ${product.finish}` : ""}
          </p>

          <ProductAddToCart
            variants={product.variants.map((v: (typeof product.variants)[number]) => ({
              id: v.id,
              size: v.size,
              pricePerSqm: Number(v.pricePerSqm),
              sqmPerBox: Number(v.sqmPerBox),
              stockBoxes: v.stockBoxes,
            }))}
          />
        </div>
      </div>

      <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #eee" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "8px" }}>Descriere</h2>
        <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#444" }}>{product.description}</p>
      </div>
    </main>
  );
}
