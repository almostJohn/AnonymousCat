import {
	Command,
	type ArgsParam,
	type InteractionParam,
	type LocaleParam,
	createButton,
	createMessageActionRow,
	logger,
	kRedis,
} from "@almostjohn/pretty-framework";
import i18next from "i18next";
import { inject, injectable } from "tsyringe";
import type { Redis } from "ioredis";
import { ButtonStyle, ComponentType } from "discord.js";
import { nanoid } from "nanoid";
import { insertGuildSetting } from "../../functions/settings/insertGuildSetting.js";
import type { SetupCommand } from "../../interactions/index.js";

@injectable()
export default class extends Command<typeof SetupCommand> {
	public constructor(
		// @ts-expect-error: tsyringe needs an update
		@inject(kRedis) public readonly redis: Redis,
	) {
		super();
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof SetupCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: true });

		const setKey = nanoid();
		const cancelKey = nanoid();

		const setButton = createButton({
			label: i18next.t("command.main.setup.buttons.execute", { lng: locale }),
			customId: setKey,
			style: ButtonStyle.Danger,
		});
		const cancelButton = createButton({
			label: i18next.t("common.buttons.cancel", { lng: locale }),
			customId: cancelKey,
			style: ButtonStyle.Secondary,
		});

		await interaction.editReply({
			content: i18next.t("command.main.setup.pending", {
				server_id: args.server_id,
				channel_id: args.channel_id,
				lng: locale,
			}),
			components: [createMessageActionRow([cancelButton, setButton])],
		});

		const collectedInteraction = await reply
			.awaitMessageComponent({
				filter: (collected) => collected.user.id === interaction.user.id,
				componentType: ComponentType.Button,
				time: 15_000,
			})
			.catch(async () => {
				try {
					await interaction.editReply({
						content: i18next.t("common.errors.timed_out", { lng: locale }),
						components: [],
					});
				} catch (error_) {
					const error = error_ as Error;
					logger.error(error, error.message);
				}

				return undefined;
			});

		if (collectedInteraction?.customId === cancelKey) {
			await collectedInteraction.update({
				content: i18next.t("command.main.setup.cancel", { lng: locale }),
				components: [],
			});
		} else if (collectedInteraction?.customId === setKey) {
			await collectedInteraction.deferUpdate();

			await this.redis.setex(`guild:${collectedInteraction.guildId}:setup`, 15, "");
			await insertGuildSetting({
				guildId: args.server_id,
				channelId: args.channel_id,
			});

			await collectedInteraction.editReply({
				content: i18next.t("command.main.setup.success"),
				components: [],
			});
		}
	}
}
