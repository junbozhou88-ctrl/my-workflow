import { defineConfig } from "drizzle-kit";

// 仅用于生成 migration SQL（输出到 ./drizzle）；
// 实际应用到 D1 由 `wrangler d1 migrations apply` 完成。
export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dialect: "sqlite",
});
