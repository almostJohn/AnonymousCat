import { container, kSQL } from "@almostjohn/pretty-framework";
import type { Sql } from "postgres";

export async function deleteGuildSetting() {
	const sql = container.resolve<Sql<{}>>(kSQL);

	const data = await sql`delete from guild_settings`;

	return data;
}
