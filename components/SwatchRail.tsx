// components/SwatchRail.tsx
import Link from "next/link";

const swatches = [
  { label: "mozaic", slug: "baie", tone: "#2b2926", pattern: "radial-gradient(circle at 30% 30%, #3c3934 2px, transparent 2px)", size: "10px 10px" },
  { label: "marmura alba", slug: "living", tone: "#f2efe8", pattern: "repeating-linear-gradient(115deg, #e3ddd0 0 2px, transparent 2px 14px)", size: "auto" },
  { label: "marmura bej", slug: "bucatarie", tone: "#d8cdb8", pattern: "repeating-linear-gradient(70deg, #c4b494 0 1px, transparent 1px 18px)", size: "auto" },
  { label: "marmura inchisa", slug: "exterior", tone: "#241512", pattern: "repeating-linear-gradient(25deg, #7a2e22 0 1px, transparent 1px 22px)", size: "auto" },
  { label: "lemn", slug: "living", tone: "#a97a3f", pattern: "repeating-linear-gradient(90deg, #8f6339 0 2px, transparent 2px 16px)", size: "auto" },
];

export default function SwatchRail() {
  return (
    <div style={{ display: "flex", gap: "10px", overflowX: "auto", padding: "0 2px" }}>
      {swatches.map((s, i) => (
        <Link
          key={i}
          href={`/produse?categorie=${s.slug}`}
          style={{ textDecoration: "none", color: "var(--color-text)", flexShrink: 0 }}
        >
          <div
            style={{
              width: "84px",
              height: "84px",
              borderRadius: "8px",
              background: s.tone,
              backgroundImage: s.pattern,
              backgroundSize: s.size,
              border: "1px solid var(--color-border)",
            }}
            aria-hidden="true"
          />
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--color-text-secondary)",
              marginTop: "6px",
              textAlign: "center",
            }}
          >
            {s.label}
          </p>
        </Link>
      ))}
    </div>
  );
}
