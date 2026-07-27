// app/layout.tsx
// Daca proiectul are deja un app/layout.tsx, imbina doar <Header /> si
// referinta catre iconsul Tabler in el, in loc sa suprascrii fisierul.
import type { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "gresie. | Gresie portelanata rectificata",
  description: "Gresie portelanata rectificata pentru baie, bucatarie, living si exterior.",
  icons: { icon: "/logo.jpg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tabler-icons/2.44.0/iconfont/tabler-icons.min.css" />
      </head>
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", color: "#111" }}>
        <Header />
        {children}
      </body>
    </html>
  );
}
