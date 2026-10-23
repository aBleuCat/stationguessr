import {EmbedBuilder, type APIEmbedField} from 'discord.js';

/**
 Converts a dictionary object into a Discord Embed with fields.
 @param title The title of the embed. Appears in bold text at the top of the embed.
 @param dict The key-value data.
 @param style The style of the embed. Inline: The fields are side by side. Leaderboard: The names are on the left side, the values are on the right side.
 @param sortFn Function that is provided for the .sort() callback. The dictionary is converted to an array and sorted before use.
 */
function dictToEmbed<T>(
	title: string,
	dict: Record<string, T>,
	style: 'normal' | 'inline' | 'leaderboard' = 'normal',
	sortFn?: (a: [string, T], b: [string, T]) => number,
): EmbedBuilder {
	const dictArray = Object.entries(dict);
	if (sortFn) dictArray.sort(sortFn);
	let fields: APIEmbedField[] = [];
	if (style === 'leaderboard') {
		const players = dictArray.map(([key]) => key).join('\n');
		const scores = dictArray
			.map(([, value]) => String(value))
			.join('\n');
		fields = [
			{
				name: 'Player',
				value: players === '' ? 'none' : players,
				inline: true,
			},
			{
				name: 'Score',
				value: scores === '' ? '-' : scores,
				inline: true,
			},
		];
	} else {
		const isInline = style === 'inline';
		fields = dictArray.slice(0, 25).map(([key, value]) => ({
			name: key,
			// eslint-disable-next-line unicorn/prefer-unicode-code-point-escapes
			value: String(value) === '' ? '\u200B' : String(value), // Prevent empty string errors
			isInline,
		}));
	}

	const embed = new EmbedBuilder().setTitle(title).addFields(fields);

	return embed;
}

export default dictToEmbed;
