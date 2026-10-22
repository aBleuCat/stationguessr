import { setTimeout as sleep } from "node:timers/promises";
import { EmbedBuilder, type Message } from "discord.js";
import { Temporal } from "@js-temporal/polyfill";
import { isGuildTextBasedChannel } from "../../type-utils.js";
import { quizzes, progressQuiz } from "../helpers/quiz-helpers.js";
import queueMessage from "../helpers/queue-message.js";

async function handleQuiz(message: Message) {
	const { channel } = message;
	if (!isGuildTextBasedChannel(channel)) return;
	const { author, content } = message;
	const channelId = channel.id;
	const quiz = quizzes.get(channelId);

	if (
		!quiz ||
		quiz.currentQuestion.status === "closed" ||
		quiz.currentQuestion.status === "idle"
	) {
		return;
	}

	// Normalizes messages using the quiz's normalizers
	let normalizedMessage: string;
	if (typeof quiz.normalize === "function") {
		normalizedMessage = quiz.normalize(content);
	} else if (Array.isArray(quiz.normalize)) {
		normalizedMessage = content;
		// If there are multiple normalizers, run through each one
		for (const normalizer of quiz.normalize) {
			normalizedMessage = normalizer(normalizedMessage);
		}
	} else {
		normalizedMessage = content;
	}

	if (!quiz.currentQuestion.answer.test(normalizedMessage)) return;

	if (quiz.timer) {
		clearTimeout(quiz.timer);
		quiz.timer = undefined;
	}

	quiz.currentQuestion.status = "closed";

	let responseMessage = `The answer to "${quiz.currentQuestion.question}" was "${quiz.currentQuestion.answerTxt}"`;
	if (quiz.startTime !== undefined) {
		const stopwatchTime = Temporal.Now.instant()
			.since(quiz.startTime)
			.total({ unit: "seconds" });
		responseMessage += `\n${author.displayName} answered in ${stopwatchTime.toFixed(2)}s`;
	}

	if (quiz.rounds > 0 && quiz.remainingPool.length > 0) {
		const unixTimestamp = Math.round(
			Temporal.Now.instant()
				.add({ milliseconds: Math.trunc(quiz.delay * 1000) })
				.epochMilliseconds / 1000,
		);
		responseMessage += `\n\n-# Next question <t:${unixTimestamp}:R>`; // Put it in the description because the footer does not support timestamps
	} else {
		responseMessage += "\n\nThat was the last question.";
	}

	quiz.scores[author.id] = (quiz.scores[author.id] ?? 0) + 1;

	const leader =
		Object.entries(quiz.scores).toSorted(
			([, a], [, b]) => b - a,
		)[0]?.[0] ?? undefined;
	const leaderName = leader === undefined
		? "Nobody"
		: (channel.guild?.members.cache.get(leader)?.displayName ??
			`User ${leader}`)

	const embed = new EmbedBuilder()
		.setTitle(`Correct, ${author.displayName}!`)
		.setDescription(responseMessage)
		.setFooter({
			text: `${leaderName} is in the lead!`,
		})
		.setColor("#a6e3a1");

	await queueMessage({
		channel,
		embeds: [embed],
		priority: 3,
	});

	await sleep(quiz.delay * 1000);
	progressQuiz(channel).catch((error: unknown) => {
		console.log(error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		void queueMessage({
			channel,
			content: `Error: ${errorMessage}`,
			priority: 4,
		});
	});
}

export default handleQuiz;
