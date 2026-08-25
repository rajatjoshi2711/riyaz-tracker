import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations run against the unpooled connection; the app itself
    // connects via the pooled DATABASE_URL through a PrismaClient adapter (see src/lib/db.ts).
    url: process.env["DATABASE_URL_UNPOOLED"],
  },
});
