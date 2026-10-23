import {
	type GuildTextBasedChannel,
	type TextChannel,
	type NewsChannel,
	ChannelType,
} from 'discord.js';
import type {AnyChannel} from './types.js';

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
		`Expected a guild text-based channel but received: ${channel?.type ?? 'null'}`,
	);
}

function isWebhookableChannel(
	channel: AnyChannel,
): channel is TextChannel | NewsChannel {
	return (
		channel &&
		'type' in channel &&
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
		`Expected a text or announcements channel but received: ${channel?.type ?? 'null'}`,
	);
}
