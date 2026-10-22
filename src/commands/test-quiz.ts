import {
	type ChatInputCommandInteraction,
	MessageFlags,
	SlashCommandBuilder,
} from "discord.js";
import type { PreQuiz } from "../types.js";
import pools from "../data/quiz-pools.js";
import { newQuiz } from "../lib/helpers/quiz-helpers.js";
import { isGuildTextBasedChannel } from "../type-utils.js";

const poolOptions = [
	...Object.keys(pools).map((name) => ({ name, value: name })),
	{ name: "All pools", value: "all" }
];

function isRepeatType(
	repeat: string,
): repeat is "all" | "questions" | "none" {
	const repeatTypes = new Set(["all", "questions", "none"]);
	return repeatTypes.has(repeat);
}

const testQuizCommand = {
	data: new SlashCommandBuilder()
		.setName("testquiz")
		.setDescription("Beta - Test new quiz feature")
		.addStringOption((option) =>
			option
				.setName("title")
				.setDescription("Title of the quiz")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("pool")
				.setDescription("Which pool to select questions from")
				.setChoices(poolOptions)
				.setRequired(true),
		)
		.addNumberOption((option) =>
			option
				.setName("rounds")
				.setDescription(
					"The number of rounds the quiz should last",
				)
				.setRequired(false),
		)
		.addNumberOption((option) =>
			option
				.setName("answer-window")
				.setDescription(
					"The amount of time available to answer",
				)
				.setRequired(false),
		)
		.addStringOption((option) =>
			option
				.setName("repeat-type")
				.setDescription("the repeat type, duh")
				.addChoices(
					{
						name: "All, questions and images",
						value: "all",
					},
					{
						name: "Questions, but not images",
						value: "questions",
					},
					{ name: "None", value: "none" },
				)
				.setRequired(false),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const { channel } = interaction;
		if (!channel)
			{return interaction.reply({
				content: "Failed to find your channel",
				flags: [MessageFlags.Ephemeral],
			});}

		if (!isGuildTextBasedChannel(channel)) 
			{return interaction.reply({
				content: "You can't start a quiz in this type of channel",
				flags: [MessageFlags.Ephemeral],
			}); }

		const title = interaction.options.getString("title");
		const pool = interaction.options.getString("pool");
		const repeat =
			interaction.options.getString("repeat-type") ?? "none";
		const rounds = interaction.options.getNumber("rounds") ?? 5;
		const ansWindow =
			interaction.options.getNumber("answer-window") ?? 10;
		if (title === null || 
			pool === null ||
			repeat === null ||
			rounds === null ||
			ansWindow === null)
			{return interaction.reply({
				content: "Failed to get some of your inputs",
				flags: [MessageFlags.Ephemeral],
			});}

		if (!isRepeatType(repeat))
			{return interaction.reply({
				content: "That repeat type is invalid",
				flags: [MessageFlags.Ephemeral],
			});}

		const actualPool = pool === "all" ? Object.keys(pools) : pool;
		const quiz: PreQuiz = {
			title,
			delay: 5,
			pool: actualPool,
			rounds,
			ansWindow,
			repeat,
		};
		const result = await newQuiz(channel, quiz);
		return interaction.reply({
			content: result,
			flags: [MessageFlags.Ephemeral],
		});
	},
};

export default testQuizCommand;
