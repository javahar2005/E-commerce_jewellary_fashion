import path from "node:path";
import fs from "node:fs";
import { defineConfig } from "prisma/config";

// prisma.config.ts disables Prisma's automatic .env loading, so do it here.
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath) && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(envPath);
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
