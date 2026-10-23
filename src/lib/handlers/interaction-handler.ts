import {
	type ChatInputCommandInteraction,
	Events,
	MessageFlags,
	type Client,
	type Interaction,
} from "discord.js";

export async function handleCommandError(
	error: unknown,
	interaction: ChatInputCommandInteraction,
) {
	const errorMessage =
		error instanceof Error
			? error.message
			: "Error message could not be found";

	console.error(error);

	// No flags allowed in edit reply
	if (interaction.replied || interaction.deferred) {
		await interaction
			.editReply({
				content: `Error: ${errorMessage}`,
			})
			.catch(() => undefined);
		return;
	}

	await interaction
		.reply({
			content: `Error: ${errorMessage}`,
			flags: [MessageFlags.Ephemeral],
		})
		.catch(() => undefined);
}

// Registration for index.ts
function registerInteractionHandler(client: Client) {
	client.on(
		Events.InteractionCreate,
		(interaction: Interaction) => {
			void handleInteraction(client, interaction);
		},
	);
}

async function handleInteraction(
	client: Client,
	interaction: Interaction,
) {
	if (interaction.isAutocomplete()) {
		return handleAutocomplete(client, interaction);
	}

	if (interaction.isChatInputCommand()) {
		return handleSlashCommand(client, interaction);
	}
}

// Subhandlers
async function handleAutocomplete(
	client: Client,
	interaction: Interaction,
) {
	if (!interaction.isAutocomplete()) return;
	const command = client.commands.get(interaction.commandName);
	if (command?.autocomplete) {
		await command
			.autocomplete(interaction)
			.catch((error: unknown) => {
				console.error("Autocomplete Error:", error);
			});
	}
}

async function handleSlashCommand(
	client: Client,
	interaction: Interaction,
) {
	if (!interaction.isChatInputCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) {
		await interaction
			.reply({
				content:
					"This command is currently unavailable. The bot may be updating.",
				flags: [MessageFlags.Ephemeral],
			})
			.catch(() => undefined);
		return;
	}

	if (interaction.commandName !== "orbital") {
		const logMessage = `[COMMAND]: ${interaction.user.tag} used /${interaction.commandName} in guild ${interaction.guildId}`;
		console.log(logMessage);
	}

	try {
		await command.execute(interaction);
	} catch (error: unknown) {
		handleCommandError(error, interaction).catch(() => undefined);
	}
}

export default registerInteractionHandler;
