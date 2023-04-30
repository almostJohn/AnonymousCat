import { container, kSQL } from "@almostjohn/pretty-framework";
import type { Snowflake } from "discord.js";
import type { Sql } from "postgres";

export enum SettingsKeys {
	LogChannelId = "log_channel_id",
	Locale = "locale",
	ForceLocale = "force_locale",
}

export async function getGuildSetting<T = string>(guildId: Snowflake, prop: SettingsKeys, table = "guild_settings") {
	const sql = container.resolve<Sql<{}>>(kSQL);

	const [data] = await sql.unsafe<[{ value: boolean | string | null }?]>(
		`select ${prop} as value
            from ${table}
            where guild_id = $1`,
		[guildId],
	);

	return (data?.value ?? null) as unknown as T;
}
