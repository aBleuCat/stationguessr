import {
	type ChatInputCommandInteraction,
	MessageFlags,
	SlashCommandBooleanOption,
	SlashCommandBuilder,
} from "discord.js";
import config from "../lib/config.js";
import { endQuiz, quizzes } from "../lib/helpers/quiz-helpers.js";
import {
	isAnyChannel,
	isGuildTextBasedChannel,
} from "../type-utils.js";

const endQuizCommand = {
	data: new SlashCommandBuilder()
		.setName("endquiz")
		.setDescription("End a quiz (admin only)")
		.addChannelOption((option) =>
			option
				.setName("channel")
				.setDescription(
					"Which channel is the quiz occuring in?",
				)
				.setRequired(false),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		if (!config.ADMINS.has(interaction.user.id)) {
			return interaction.reply({
				content: "You can't use this idiot",
				flags: [MessageFlags.Ephemeral],
			});
		}

		const channel =
			interaction.options.getChannel("channel") ??
			interaction.channel;
		if (
			!channel ||
			!isAnyChannel(channel) ||
			!isGuildTextBasedChannel(channel)
		) {
			return interaction.reply({
				content:
					"Couldn't figure out which channel to kill quiz in, or that channel is the wrong type",
				flags: [MessageFlags.Ephemeral],
			});
		}

		const doesExist = quizzes.has(channel.id);

		if (!doesExist) {
			return interaction.reply({
				content: "No quiz was in that channel",
				flags: [MessageFlags.Ephemeral],
			});
		}

		try {
			endQuiz(channel);
		} catch (error) {
			return interaction.reply({
				content: String(error),
				flags: [MessageFlags.Ephemeral],
			});
		}

		return interaction.reply({
			content: `Quiz was deleted from channel with id \`${channel.id}\``,
			flags: [MessageFlags.Ephemeral],
		});
	},
};

export default endQuizCommand;
