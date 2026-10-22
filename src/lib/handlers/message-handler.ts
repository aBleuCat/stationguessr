import {
	Events,
	type Message,
	type Client,
} from "discord.js";
import testMessageTrigger from "../triggers/message-trigger.js";
import handleQuiz from "../triggers/quiz-handler.js";

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
		testMessageTrigger(message);
		await handleQuiz(message);
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
	client.on(Events.MessageCreate, (discordMessage: Message) => {
		(async (message: Message) => {
			if (!message.guild) {
				return executeDMHandlers(message, client);
			}

			if (message.author.bot) return;
			
			await executePrimaryHandlers(message, client);
			await executeSecondaryHandlers(message, client);
		})(discordMessage);
	});
}

export default registerMessageHandler;
