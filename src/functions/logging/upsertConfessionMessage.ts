import { resolveTextChannel } from "@almostjohn/pretty-framework";
import i18next from "i18next";
import type { Guild } from "discord.js";
import { getGuildSetting, SettingsKeys } from "../settings/getGuildSetting.js";
import { generateConfessionMessage } from "./generateConfessionMessage.js";

let count = 0;

function increment(): number {
	count++;
	return count;
}

export async function upsertConfessionMessage(guild: Guild, message: string) {
	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);
	const logChannel = resolveTextChannel(guild, await getGuildSetting(guild.id, SettingsKeys.LogChannelId));
	const newCount = increment();

	let embed = generateConfessionMessage(message, locale);

	embed = {
		...embed,
		footer: {
			text: i18next.t("logging.confession.footer", {
				confess_id: newCount,
				lng: locale,
			}),
		},
	};

	await logChannel!.send({ embeds: [embed] });
}
