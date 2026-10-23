import {
	type ChatInputCommandInteraction,
	MessageFlags,
	SlashCommandBuilder,
} from "discord.js";
import { stationNormalizer } from "../data/quiz-pools.js";
import stationsQuestionBank from "../lib/helpers/load-question-bank-json.js";
import type { Pool, PreQuiz } from "../types.js";
import { isGuildTextBasedChannel } from "../type-utils.js";
import { newQuiz } from "../lib/helpers/quiz-helpers.js";
import { getWeightedSample } from "../lib/helpers/random-helpers.js";

const difficultyWeight = {
	easy: Math.log10,
	medium: (ridership: number) => ridership,
	hard: (ridership: number) => 1 / Math.sqrt(ridership),
};

const isDifficulty = (
	difficulty: string,
): difficulty is "easy" | "medium" | "hard" =>
	new Set(["easy", "medium", "hard"]).has(difficulty);

function arrayInArray<T>(subset: T[], superset: T[]) {
	const supersetSet = new Set(superset);
	return subset.every((item) => supersetSet.has(item));
}

function anyOfArrayInArray<T>(options: T[], superset: T[]) {
	const supersetSet = new Set(superset);
	return options.some((item) => supersetSet.has(item));
}

function isRepeatType(
	repeat: string,
): repeat is "all" | "questions" | "none" {
	const repeatTypes = new Set(["all", "questions", "none"]);
	return repeatTypes.has(repeat);
}

function filtersToPool(
	tags: string[][],
	exclude: string[],
	difficulty: "easy" | "medium" | "hard",
	length: number,
): Pool {
	const pool = stationsQuestionBank
		.filter((item) => {
			let doesMatch = false;
			for (const option of tags) {
				if (
					arrayInArray(option, item.tags) &&
					!anyOfArrayInArray(exclude, item.tags)
				) {
					doesMatch = true;
				}
			}

			return doesMatch;
		})
		.map((item) => {
			const { tags: itemTags, answer, ...poolFields } = item;
			const answerRegex = new RegExp(answer, "iv");
			return { ...poolFields, answer: answerRegex };
		});

	const samplePool = getWeightedSample(
		pool,
		length,
		({ ridership }) => difficultyWeight[difficulty](ridership),
	);

	return {
		pool: samplePool,
		metadata: {
			normalizer: stationNormalizer,
		},
	};
}

function stringToFilters(string: string): [string[][], string[]] {
	const items = string.split(", ");
	const exclude = items
		.filter((item) => item.startsWith("--"))
		.map(
			(item) =>
				/^--(?<exclusion>.*)$/v.exec(item)?.groups?.exclusion,
		)
		.filter((item) => item !== undefined);
	const conditions = items
		.filter((item) => !item.startsWith("--"))
		.map((item) => item.split(" & "));
	return [conditions, exclude];
}

const testQuizCommand = {
	data: new SlashCommandBuilder()
		.setName("testfilterquiz")
		.setDescription("Beta - Test new quiz feature")
		.addStringOption((option) =>
			option
				.setName("title")
				.setDescription("Title of the quiz")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("condition")
				.setDescription("What type of questions to filter")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("difficulty")
				.setDescription(
					"How difficult should the questions be (based on ridership)",
				)
				.addChoices(
					{ name: "Easy", value: "easy" },
					{ name: "Medium", value: "medium" },
					{ name: "Hard", value: "hard" },
				)
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
		if (!channel) {
			return interaction.reply({
				content: "Failed to find your channel",
				flags: [MessageFlags.Ephemeral],
			});
		}

		if (!isGuildTextBasedChannel(channel)) {
			return interaction.reply({
				content:
					"You can't start a quiz in this type of channel",
				flags: [MessageFlags.Ephemeral],
			});
		}

		const title = interaction.options.getString("title");
		const condition = interaction.options.getString("condition");
		const difficulty =
			interaction.options.getString("difficulty");
		const repeat =
			interaction.options.getString("repeat-type") ?? "none";
		const rounds = interaction.options.getNumber("rounds") ?? 5;
		const ansWindow =
			interaction.options.getNumber("answer-window") ?? 10;
		if (
			title === null ||
			condition === null ||
			repeat === null ||
			rounds === null ||
			ansWindow === null ||
			difficulty === null ||
			!isDifficulty(difficulty)
		) {
			return interaction.reply({
				content: "Failed to get some of your inputs",
				flags: [MessageFlags.Ephemeral],
			});
		}

		if (!isRepeatType(repeat)) {
			return interaction.reply({
				content: "That repeat type is invalid",
				flags: [MessageFlags.Ephemeral],
			});
		}

		const pool = filtersToPool(
			...stringToFilters(condition),
			difficulty,
			rounds,
		);

		const quiz: PreQuiz = {
			title,
			delay: 5,
			pool,
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
