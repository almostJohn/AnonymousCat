import {
	Command,
	type InteractionParam,
	type ArgsParam,
	type LocaleParam,
	resolveTextChannel,
	logger,
	createButton,
	createMessageActionRow,
} from "@almostjohn/pretty-framework";
import i18next from "i18next";
import { ButtonStyle, ComponentType } from "discord.js";
import type { ConfessCommand } from "../../interactions/index.js";
import { nanoid } from "nanoid";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";
import { upsertConfessionMessage } from "../../functions/logging/upsertConfessionMessage.js";

export default class extends Command<typeof ConfessCommand> {
	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof ConfessCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: true });

		const logChannel = resolveTextChannel(
			interaction.guild,
			await getGuildSetting(interaction.guildId, SettingsKeys.LogChannelId),
		);

		if (!logChannel) {
			throw new Error(i18next.t("common.errors.no_log_channel", { lng: locale })!);
		}

		const confessKey = nanoid();
		const cancelKey = nanoid();

		const confessButton = createButton({
			label: i18next.t("command.main.confess.buttons.execute", { lng: locale }),
			customId: confessKey,
			style: ButtonStyle.Danger,
		});
		const cancelButton = createButton({
			label: i18next.t("common.buttons.cancel", { lng: locale }),
			customId: cancelKey,
			style: ButtonStyle.Secondary,
		});

		await interaction.editReply({
			content: i18next.t("command.main.confess.pending", { lng: locale }),
			components: [createMessageActionRow([cancelButton, confessButton])],
		});

		const collectedInteraction = await reply
			.awaitMessageComponent({
				filter: (collected) => collected.user.id === interaction.user.id,
				componentType: ComponentType.Button,
				time: 15_000,
			})
			.catch(async () => {
				try {
					await interaction.editReply({ content: i18next.t("common.errors.timed_out", { lng: locale }) });
				} catch (error_) {
					const error = error_ as Error;
					logger.error(error, error.message);
				}

				return undefined;
			});

		if (collectedInteraction?.customId === cancelKey) {
			await collectedInteraction.update({
				content: i18next.t("command.main.confess.cancel", { lng: locale }),
				components: [],
			});
		} else if (collectedInteraction?.customId === confessKey) {
			await collectedInteraction.deferUpdate();

			await upsertConfessionMessage(collectedInteraction.guild, args.message);

			await collectedInteraction.editReply({
				content: i18next.t("command.main.confess.success", { lng: locale }),
				components: [],
			});
		}
	}
}
