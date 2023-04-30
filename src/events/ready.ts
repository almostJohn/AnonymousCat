import { on } from "node:events";
import { type Event, logger } from "@almostjohn/pretty-framework";
import i18next from "i18next";
import { Client, Events, PresenceUpdateStatus, ActivityType } from "discord.js";
import { injectable } from "tsyringe";
import { getGuildSetting, SettingsKeys } from "../functions/settings/getGuildSetting.js";

@injectable()
export default class implements Event {
	public name = "Client ready handling";

	public event = Events.ClientReady as const;

	public constructor(public readonly client: Client<true>) {}

	public async execute(): Promise<void> {
		for await (const _ of on(this.client, this.event)) {
			logger.info({ event: { name: this.name, event: this.event } }, "Caching status");
			for (const guild of this.client.guilds.cache.values()) {
				const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);

				this.client.user.setPresence({
					status: PresenceUpdateStatus.DoNotDisturb,
					activities: [
						{
							name: i18next.t("common.status", { lng: locale })!,
							type: ActivityType.Watching,
						},
					],
				});
			}

			logger.info(
				{ event: { name: this.name, event: this.event } },
				`Logged in as ${this.client.user.tag} (${this.client.user.id})`,
			);
		}
	}
}
