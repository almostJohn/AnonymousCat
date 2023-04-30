import { container, kSQL } from "@almostjohn/pretty-framework";
import type { Snowflake } from "discord.js";
import type { Sql } from "postgres";

export async function insertGuildSetting({ guildId, channelId }: { guildId: Snowflake; channelId: Snowflake }) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const guilds = await sql`
		insert into guild_settings (
			guild_id,
			log_channel_id
		) values (
			${guildId},
			${channelId}
		)
		returning *
	`;

	return guilds;
}
