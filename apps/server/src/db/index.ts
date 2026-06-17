import { drizzle } from "drizzle-orm/d1";
import { tickets } from "./schema";

const schema = { tickets };

export function createDb(d1: D1Database) {
	return drizzle(d1, { schema });
}

export type Db = ReturnType<typeof createDb>;
