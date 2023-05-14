import { truncateEmbed, ColorStyle } from "@almostjohn/pretty-framework";
import i18next from "i18next";

export function generateConfessionMessage(message: string, locale: string) {
	return truncateEmbed({
		title: i18next.t("logging.confession.title", { lng: locale })!,
		description: i18next.t("logging.confession.description", {
			msg: message,
			lng: locale,
		})!,
		color: ColorStyle.Blurple,
		timestamp: new Date().toISOString(),
	});
}
