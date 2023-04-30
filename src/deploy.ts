import process from "node:process";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { ConfessCommand, PingCommand, SetupCommand } from "./interactions/index.js";

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN!);

try {
	console.log("Started refreshing interaction (/) commands");

	await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), {
		body: [ConfessCommand, PingCommand, SetupCommand],
	});

	console.log("Successfully reloaded interaction (/) commands");
} catch (error) {
	console.error(error);
}
