import {
	Events,
	type Message,
	type Client,
} from "discord.js";

async function executeDMHandlers(
	message: Message,
	client: Client,
) {
	try {
		/* handler for DMs to the bot */
	} catch (error) {
		console.error("DM trigger error", error)
	}
}

async function executePrimaryHandlers(
	message: Message,
	client: Client,
) {
	try {
		/* primary message trigger functions */
	} catch (error) {
		console.error("Primary trigger error", error);
	}
}

async function executeSecondaryHandlers(message: Message, client: Client) {
	try {
		/* secondary message trigger function */
	} catch (error) {
		console.error("Secondary trigger error", error);
	}
}

function registerMessageHandler(client: Client) {
	client.on(Events.MessageCreate, (message: Message) => {
		(async (message: Message) => {
			if (!message.guild || !message.author) {
				executeDMHandlers(message, client);
				return;
			}

			if (message.author.bot) return;
			
			await executePrimaryHandlers(message, client);
			await executeSecondaryHandlers(message, client);
		})(message);
	});
}

export default registerMessageHandler;
