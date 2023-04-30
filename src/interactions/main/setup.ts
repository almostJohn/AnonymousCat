import { ApplicationCommandOptionType } from "discord-api-types/v10";

export const SetupCommand = {
	name: "setup",
	description: "Setup AnonymousCat in your server.",
	options: [
		{
			name: "server_id",
			description: "The id of this server.",
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: "channel_id",
			description: "The id of the channel you want to post the anonymous message.",
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
} as const;
