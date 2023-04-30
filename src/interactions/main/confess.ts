import { ApplicationCommandOptionType } from "discord-api-types/v10";

export const ConfessCommand = {
	name: "confess",
	description: "Compose a confession message.",
	options: [
		{
			name: "message",
			description: "The message you want to compose.",
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
} as const;
