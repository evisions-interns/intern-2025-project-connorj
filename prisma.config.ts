import { defineConfig } from "prisma/config";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

import "dotenv/config";

export default defineConfig({
  earlyAccess: true,
  async adapter() {
    const { env } = await import("./src/env");

    return new PrismaLibSQL({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });
  },
});