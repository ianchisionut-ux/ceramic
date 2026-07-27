// prisma.config.ts
// Trebuie sa stea in radacina proiectului, langa package.json.
// In Prisma 7, aici se configureaza schema, seed-ul si DATABASE_URL,
// nu in package.json.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
