import type {Message} from 'discord.js';
import config from '../config.js';
import queueMessage from '../helpers/queue-message.js';
import {isGuildTextBasedChannel} from '../../type-utils.js';

const triggerMap = new Map<string, string>();

function didNewTrigger(string: string): boolean {
	const matches = /^(?<trigger>.*?) => (?<response>.*)$/v.exec(
		string,
	);
	if (
		matches?.groups?.trigger === undefined ||
		matches.groups.response === undefined
	) {
		return false;
	}

	triggerMap.set(matches.groups.trigger, matches.groups.response);
	return true;
}

function testMessageTrigger(message: Message) {
	const {content, channel, author} = message;
	if (config.ADMINS.has(author.id)) {
		const didNewTrig = didNewTrigger(content);
		if (didNewTrig) return;
	}

	if (!isGuildTextBasedChannel(channel)) return;

	if (triggerMap.has(content)) {
		queueMessage({
			channel,
			content: triggerMap.get(content) ?? 'smth bad happened',
		}).catch((error: unknown) => {
			console.error(error);
		});
	}
}

export default testMessageTrigger;
