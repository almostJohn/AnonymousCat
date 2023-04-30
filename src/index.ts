import "reflect-metadata";
import process from "node:process";
import { Backend } from "@skyra/i18next-backend";
import i18next from "i18next";
import { URL, fileURLToPath, pathToFileURL } from "node:url";
import {
	createClient,
	createCommands,
	createPostgres,
	createRedis,
	type Command,
	type Event,
	kCommands,
	dynamicImport,
	container,
	logger,
	commandInfo,
} from "@almostjohn/pretty-framework";
import { GatewayIntentBits, Options, Partials } from "discord.js";
import readdirp from "readdirp";

await createPostgres();
await createRedis();

const client = createClient({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	partials: [Partials.Channel, Partials.Message],
	makeCache: Options.cacheWithLimits({ MessageManager: 100 }),
});

createCommands();

const commandFiles = readdirp(fileURLToPath(new URL("commands", import.meta.url)), {
	fileFilter: "*.js",
	directoryFilter: "!sub",
});
const eventFiles = readdirp(fileURLToPath(new URL("events", import.meta.url)), {
	fileFilter: "*.js",
});

try {
	const commands = container.resolve<Map<string, Command>>(kCommands);

	await i18next.use(Backend).init({
		backend: {
			paths: [new URL("locales/{{lng}}/{{ns}}.json", import.meta.url)],
		},
		cleanCode: true,
		preload: ["en-US", "en-GB", "de", "es-ES", "ja", "ko", "pl", "zh-CH", "zh-TW"],
		supportedLngs: ["en-US", "en-GB", "de", "es-ES", "ja", "ko", "pl", "zh-CH", "zh-TW"],
		fallbackLng: ["en-US"],
		returnNull: false,
		returnEmptyString: false,
	});

	for await (const dir of commandFiles) {
		const cmdInfo = commandInfo(dir.path);

		if (!cmdInfo) {
			continue;
		}

		const dynamic = dynamicImport<new () => Command>(async () => import(pathToFileURL(dir.fullPath).href));
		const command = container.resolve<Command>((await dynamic()).default);
		logger.info(
			{ command: { name: command.name?.join(", ") ?? cmdInfo.name } },
			`Registering command: ${command.name?.join(", ") ?? cmdInfo.name}`,
		);

		if (command.name) {
			for (const name of command.name) {
				commands.set(name.toLowerCase(), command);
			}
		} else {
			commands.set(cmdInfo.name.toLowerCase(), command);
		}
	}

	for await (const dir of eventFiles) {
		const dynamic = dynamicImport<new () => Event>(async () => import(pathToFileURL(dir.fullPath).href));
		const event_ = container.resolve<Event>((await dynamic()).default);
		logger.info({ event: { name: event_.name, event: event_.event } }, `Registering event: ${event_.name}`);

		if (event_.disabled) {
			continue;
		}

		void event_.execute();
	}

	await client.login(process.env.DISCORD_BOT_TOKEN!);
} catch (error_) {
	const error = error_ as Error;
	logger.error(error, error.message);
}
