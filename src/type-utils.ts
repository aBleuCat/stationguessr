import {
	type GuildTextBasedChannel,
	type TextChannel,
	type NewsChannel,
	ChannelType,
} from "discord.js";
import type { AnyChannel, QuestionBank } from "./types.js";

export function isGuildTextBasedChannel(
	channel: AnyChannel,
): channel is GuildTextBasedChannel {
	return channel.isTextBased() && !channel.isDMBased();
}

export function requireGuildTextBasedChannel(
	channel:
		| AnyChannel
		| undefined
		// eslint-disable-next-line @typescript-eslint/no-restricted-types
		| null,
): GuildTextBasedChannel {
	if (channel && isGuildTextBasedChannel(channel)) return channel;
	throw new Error(
		`Expected a guild text-based channel but received: ${channel?.type ?? "null"}`,
	);
}

function isWebhookableChannel(
	channel: AnyChannel,
): channel is TextChannel | NewsChannel {
	return (
		"type" in channel &&
		(channel.type === ChannelType.GuildText ||
			channel.type === ChannelType.GuildAnnouncement)
	);
}

export function requireWebhookableChannel(
	// eslint-disable-next-line @typescript-eslint/no-restricted-types
	channel: AnyChannel | null | undefined,
): TextChannel | NewsChannel {
	if (channel && isWebhookableChannel(channel)) return channel;
	throw new Error(
		`Expected a text or announcements channel but received: ${channel?.type ?? "null"}`,
	);
}

export function isQuestionBank(bank: unknown): bank is QuestionBank {
	if (!Array.isArray(bank)) return false;
	for (const item of bank as unknown[]) {
		if (
			typeof item !== "object" ||
			item === null ||
			!(
				"question" in item &&
				"answer" in item &&
				"answerTxt" in item &&
				"tags" in item &&
				"ridership" in item
			)
		) {
			return false;
		}

		// eslint-disable-next-line unicorn/prefer-combined-guards
		if (
			typeof item.question !== "string" ||
			typeof item.answer !== "string" ||
			typeof item.answerTxt !== "string" ||
			!Array.isArray(item.tags) ||
			typeof item.ridership !== "number"
		) {
			return false;
		}

		// eslint-disable-next-line unicorn/prefer-combined-guards
		if (
			"image" in item &&
			!(
				typeof item.image === "string" ||
				Array.isArray(item.image)
			)
		) {
			return false;
		}
	}

	return true;
}

export function requireQuestionBank(bank: unknown): QuestionBank {
	if (!isQuestionBank(bank)) {
		throw new Error(
			"The given question bank did not meet the requirements of being a question bank",
		);
	}

	return bank;
}
