// prisma/seed.ts
// Ruleaza cu: npx prisma db seed
// Populeaza categorii + produse reale + variante, in locul placeholder-elor de pe site

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ---------- Categorii ----------
  const baie = await prisma.category.upsert({
    where: { slug: "baie" },
    update: {},
    create: {
      slug: "baie",
      name: "Baie",
      seoTitle: "Gresie pentru baie | ceramic-evo",
      seoDescription:
        "Gresie antiderapanta si mozaic pentru baie, portelanata rectificata, rezistenta la umezeala.",
    },
  });

  const bucatarie = await prisma.category.upsert({
    where: { slug: "bucatarie" },
    update: {},
    create: {
      slug: "bucatarie",
      name: "Bucatarie",
      seoTitle: "Gresie pentru bucatarie | ceramic-evo",
      seoDescription: "Gresie rezistenta la pete si trafic intens pentru bucatarie.",
    },
  });

  const exterior = await prisma.category.upsert({
    where: { slug: "exterior" },
    update: {},
    create: {
      slug: "exterior",
      name: "Exterior",
      seoTitle: "Gresie pentru terasa si exterior | ceramic-evo",
      seoDescription: "Gresie rezistenta la inghet-dezghet pentru terase si spatii exterioare.",
    },
  });

  const living = await prisma.category.upsert({
    where: { slug: "living" },
    update: {},
    create: {
      slug: "living",
      name: "Living",
      seoTitle: "Gresie pentru living | ceramic-evo",
      seoDescription: "Gresie imitatie lemn si finisaje elegante pentru living.",
    },
  });

  // ---------- Produse ----------
  const products = [
    {
      slug: "gresie-antiderapanta",
      name: "Gresie antiderapanta",
      description:
        "Gresie portelanata rectificata cu finisaj antiderapant, ideala pentru bai si zone cu trafic intens de apa. Rezistenta la uzura si usor de intretinut.",
      categoryId: baie.id,
      finish: "antiderapant",
      featured: true,
      variants: [
        { size: "30x60", pricePerSqm: 110, sqmPerBox: 1.44, stockBoxes: 300, sku: "GA-3060" },
        { size: "60x60", pricePerSqm: 125, sqmPerBox: 1.44, stockBoxes: 180, sku: "GA-6060" },
      ],
    },
    {
      slug: "gresie-mozaic",
      name: "Gresie mozaic",
      description: "Gresie mozaic decorativa, adauga un plus de culoare si creativitate spatiilor umede.",
      categoryId: baie.id,
      finish: "mat",
      featured: false,
      variants: [{ size: "30x30", pricePerSqm: 150, sqmPerBox: 1.0, stockBoxes: 90 , sku: "GM-3030"}],
    },
    {
      slug: "gresie-neagra-mata",
      name: "Gresie neagra mata",
      description: "Finisaj elegant si sofisticat, potrivit pentru living sau baie moderna.",
      categoryId: living.id,
      finish: "mat",
      featured: true,
      variants: [{ size: "60x60", pricePerSqm: 130, sqmPerBox: 1.44, stockBoxes: 150, sku: "GN-6060" }],
    },
    {
      slug: "gresie-imitatie-lemn",
      name: "Gresie imitatie lemn",
      description: "Aspect natural de lemn, perfect pentru un design cald si primitor in living sau dormitor.",
      categoryId: living.id,
      finish: "mat",
      featured: true,
      variants: [{ size: "20x120", pricePerSqm: 150, sqmPerBox: 1.44, stockBoxes: 120, sku: "GIL-20120" }],
    },
    {
      slug: "gresie-rezistenta-la-pete",
      name: "Gresie rezistenta la pete",
      description: "Ideala pentru bucatarii cu trafic intens, usor de curatat.",
      categoryId: bucatarie.id,
      finish: "lucios",
      featured: false,
      variants: [{ size: "30x60", pricePerSqm: 160, sqmPerBox: 1.44, stockBoxes: 100, sku: "GRP-3060" }],
    },
    {
      slug: "gresie-terasa",
      name: "Gresie pentru terasa",
      description: "Rezistenta la intemperii si inghet-dezghet, ideala pentru terase si spatii exterioare.",
      categoryId: exterior.id,
      finish: "antiderapant",
      featured: true,
      variants: [{ size: "60x60", pricePerSqm: 140, sqmPerBox: 1.44, stockBoxes: 200, sku: "GT-6060" }],
    },
  ];

  for (const p of products) {
    const { variants, ...productData } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: productData,
    });

    for (const v of variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {},
        create: { ...v, productId: product.id },
      });
    }
  }

  console.log("Seed complet.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
