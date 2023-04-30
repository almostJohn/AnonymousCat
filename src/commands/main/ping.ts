import { Command, type InteractionParam, type ArgsParam, type LocaleParam } from "@almostjohn/pretty-framework";
import i18next from "i18next";
import type { PingCommand } from "../../interactions/index.js";

export default class extends Command<typeof PingCommand> {
	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof PingCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: args.hide ?? true });
		await interaction.editReply({ content: i18next.t("command.main.ping.success", { lng: locale }) });
	}
}
