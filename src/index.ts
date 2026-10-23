// Node.js
import process from 'node:process';
import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
// .env
import dotenv from 'dotenv';
// Libraries
import {
	Client,
	GatewayIntentBits,
	Collection,
	Events,
	REST,
	Routes,
	SlashCommandBuilder,
	type RESTPostAPIChatInputApplicationCommandsJSONBody,
	ApplicationIntegrationType,
	InteractionContextType,
} from 'discord.js';
// Types
import type {Command} from './types.js';
// Handlers
import registerInteractionHandler from './lib/handlers/interaction-handler.js';
import registerMessageHandler from './lib/handlers/message-handler.js';
import {doBranchShit} from './data/quiz-pools.js';
// Tasks
/*
insert tasks here
*/
// Logging
/*
insert logging here
*/

dotenv.config();

const isDev = process.argv[2] === 'dev';

if (isDev) {
	if (!process.env.BETA_TOKEN) {
		throw new Error('BETA_TOKEN not found in .env');
	}

	if (!process.env.BETA_CLIENT_ID) {
		throw new Error('BETA_CLIENT_ID not found in .env');
	}

	if (!process.env.BETA_GUILD_ID) {
		throw new Error('BETA_GUILD_ID not found in .env');
	}
} else {
	if (!process.env.TOKEN) {
		throw new Error('Bot token not found in .env');
	}

	if (!process.env.CLIENT_ID) {
		throw new Error('Client ID not found in .env');
	}
}

const envToken = isDev ? process.env.BETA_TOKEN : process.env.TOKEN;
const envClientId = isDev
	? process.env.BETA_CLIENT_ID
	: process.env.CLIENT_ID;
const envGuildId = isDev
	? process.env.BETA_GUILD_ID
	: process.env.GUILD_ID;
const envMongoUri = isDev
	? process.env.BETA_MONGO_URI
	: process.env.MONGO_URI;

// Narrow from string | undefined — guaranteed by the throws above
if (!envToken || !envClientId || !envGuildId) {
	throw new Error(
		'Required env vars missing after validation (should be unreachable)',
	);
}

const PORT = Number.parseInt(process.env.PORT ?? '8000', 10);
http
	.createServer((_, result) => {
		result.writeHead(200, {'Content-Type': 'text/plain'});
		result.end('online');
	})
	.listen(PORT, '0.0.0.0', () => {
		console.log(`Web server routing active on port ${PORT}`);
	});

const thisFileExtension = import.meta.url.endsWith('.ts')
	? '.ts'
	: '.js';
/* eslint-disable @typescript-eslint/naming-convention */
const {GuildInstall, UserInstall} = ApplicationIntegrationType;
const {Guild, BotDM, PrivateChannel} = InteractionContextType;
/* eslint-enable @typescript-eslint/naming-convention */
// Client init
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildVoiceStates,
	],
	allowedMentions: {
		parse: ['users', 'roles'], // Prevent everyone pings unless overridden
	},
});

client.commands = new Collection();

function isCommand(commandObject: unknown): commandObject is Command {
	if (!commandObject || (typeof commandObject !== "object")) return false;
	for (const [key, value] of Object.entries(commandObject)) {
		if ((key === "data" && value instanceof SlashCommandBuilder) || (key === "execute" && typeof value === "function"))
			{continue;}

		if (key === 'autocomplete' && typeof value === 'function')
			continue;
		}

		return false;
	}

	return true;
}

type LoaderResult = [
	commandsData: RESTPostAPIChatInputApplicationCommandsJSONBody[],
	validCommands: Command[],
];

async function loadCommandsHelper(
	files: string[],
	baseDir: string,
): Promise<LoaderResult> {
	const commandsData: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
		[];
	const validCommands: Command[] = [];

	// Map files to dynamic import promises for concurrent execution
	const commandPromises = files.map(async (file) => {
		const filePath = path.join(baseDir, file);
		const fileUrl = pathToFileURL(filePath).href;

		const commandModule: unknown = await import(fileUrl);
		if (
			commandModule &&
			typeof commandModule === 'object' &&
			'default' in commandModule
		) {
			return commandModule.default;
		}

		return commandModule;
	});

	const rawCommands = await Promise.all(commandPromises);

	for (const [index, command] of rawCommands.entries()) {
		if (!isCommand(command)) {
			const fileName = files[index];
			console.warn(
				`[WARNING] The command file "${fileName}" failed validation and was skipped.`,
			);
			continue;
		}

		// Only apply defaults if integrationTypes & contextTypes haven't been manually set in the file
		if (!command.data.integration_types) {
			command.data.setIntegrationTypes([GuildInstall, UserInstall]);
		}

		if (!command.data.contexts) {
			command.data.setContexts([Guild, BotDM, PrivateChannel]);
		}

		commandsData.push(command.data.toJSON());
		validCommands.push(command);
	}

	return [commandsData, validCommands];
}

// Load global commands from commands dir
const commandsPath = path.resolve(import.meta.dirname, 'commands');
const globalCommandFiles = fs
	.readdirSync(commandsPath)
	.filter(
		(file) =>
			file.endsWith(thisFileExtension) && !file.endsWith('.d.ts'),
	);
const [globalCommandsData, validCommands] = await loadCommandsHelper(
	globalCommandFiles,
	commandsPath,
);
for (const command of validCommands) {
	client.commands.set(command.data.name, command);
}

console.log(
	`Successfully validated ${validCommands.length} global commands.`,
);

// Activate when client logs in
client.once(Events.ClientReady, () => {
	(async () => {
		if (!client.user) {
			throw new Error('Client does not have user for some reason');
		}

		if (isDev) {
			console.log('[DEV MODE] Running with beta credentials');
		}

		console.log(`Logged in as ${client.user.tag}`);
		const options = {
			hostname: 'discord.com',
			port: 443,
			path: '/api/v10/gateway',
			method: 'GET',
			headers: {'User-Agent': 'RenderDiagnostic/1.0'},
		};

		const request = https.request(options, (result) => {
			console.log(`Discord API Status: ${result.statusCode}`);
			if (result.statusCode === 429) {
				console.error(
					`[API] IP Banned. Discord is probably rate-limiting this IP. Status ${result.statusCode}`,
				);
			} else if (result.statusCode === 200) {
				console.log(`[API] ✅ Discord API is reachable.`);
			} else {
				console.log(
					`[API] Received status ${result.statusCode} from Discord.`,
				);
			}
		});

		request.on('error', (error) => {
			console.error(`Network Error: ${error.message}`);
		});
		request.end();

		const rest = new REST({version: '10'}).setToken(envToken);
		try {
			console.log('Refreshing commands...');
			if (isDev) {
				// Dev: all commands go to the beta guild only
				await rest.put(
					Routes.applicationGuildCommands(envClientId, envGuildId),
					{
						body: [...globalCommandsData],
					},
				);
			} else {
				await rest.put(Routes.applicationCommands(envClientId), {
					body: globalCommandsData,
				});
			}

			console.log('Commands reloaded');
		} catch (error) {
			console.error(error);
		}
	})();
});

// Command execution DM log
client.on('interactionCreate', (interaction) => {
	(async (interaction) => {
		if (!interaction.isCommand()) return;
		const message = `Command: /${interaction.commandName} by ${interaction.user.tag} (${interaction.user.id}) in guild ${interaction.guildId}`;
		console.log(message);
	})(interaction);
});

// Register handlers and log in
registerInteractionHandler(client);
registerMessageHandler(client);

// Miscellaneous stuff
await doBranchShit();

await client.login(envToken);

// Prevent unhandled promise rejections from crashing the bot
process.on('unhandledRejection', (error) => {
	console.error('Unhandled Rejection:', error);
});
process.on('uncaughtException', (error) => {
	console.error('Uncaught Exception:', error);
});
