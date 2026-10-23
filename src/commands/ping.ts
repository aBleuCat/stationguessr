import {
	type ChatInputCommandInteraction,
	type Locale,
	SlashCommandBuilder,
} from "discord.js";
import { Temporal } from "@js-temporal/polyfill"; // In case we are using LTS or some other earlier version of node.js

function formatTime(time: Temporal.Instant, locale: Locale) {
	return time.toLocaleString(locale, {
		timeZone: "UTC", // Fallback timezone
		dateStyle: "short",
		timeStyle: "long",
	});
}

const pingCommand = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("See if the bot is online"),
	async execute(interaction: ChatInputCommandInteraction) {
		const { locale } = interaction;
		const timeSent = Temporal.Instant.fromEpochMilliseconds(
			interaction.createdTimestamp,
		);
		const now = Temporal.Now.instant();
		const latency = now
			.since(timeSent)
			.total({ unit: "milliseconds" });

		return interaction.reply({
			content:
				`Pong!\nResponded in ${latency} milliseconds\n` +
				`Command sent at ${formatTime(timeSent, locale)} ` +
				`and processed at ${formatTime(now, locale)}`,
		});
	},
};

export default pingCommand;
