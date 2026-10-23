/**
 Generates a random number between two bounds
 @param lower The inclusive lower bound
 @param upper The exclusive upper bound
 */
export const randNumber = (lower: number, upper: number) =>
	Math.random() * (upper - lower) + lower;

/**
 Generates a random integer between two bounds
 @param lower The inclusive lower bound
 @param upper The exclusive upper bound
 */
export const randInt = (lower: number, upper: number) =>
	Math.floor(randNumber(lower, upper));

/** 
 Pull a random item from any mutable or readonly array
 @returns Returns a randomly selected element, or undefined (usually when the array is empty or sparse)
 */
export const randItem = <T>(
	array: T[] | readonly T[],
): T | undefined => array[Math.floor(Math.random() * array.length)];

/**
 Take a sample from an array based on weights using the Efraimidis-Spirakis algorithm. Higher weight = higher likelihood to be in the sample.
 @param items The original array to take a sample from.
 @param count The size of the sample that is taken from `items`.
 @param getWeight How to determine the weight of each item in `items`. Negative weights and weights of 0 are never picked.
 */
export function getWeightedSample<T>(
	items: T[],
	count: number,
	getWeight: (item: T) => number,
): T[] {
	const scored = items
		.filter((item) => getWeight(item) > 0)
		.map((item) => ({
			item,
			key: Math.random() ** (1 / getWeight(item)),
		}));

	scored.sort((a, b) => b.key - a.key);

	return scored.slice(0, count).map((s) => s.item);
}

/**
 Fisher-yates shuffle algorithm
 @param array An array of any item. Should not be a sparse array.
 @param startAt Index where the shuffling should start at. Can be a positive or negative integer. Items before the shuffle index can be shuffled, but only the items after startIndex are guaranteed to be shuffled.
 */
export const shuffle = <T>(array: T[], startAt = 0): T[] => {
	const shuffled = [...array];
	const n = shuffled.length;

	const startIndex =
		startAt < 0 ? Math.max(0, n + startAt) : startAt;

	for (let i = startIndex; i < n; i++) {
		const j = Math.floor(Math.random() * (i + 1));

		// Swap
		// eslint-disable-next-line unicorn/no-unreadable-array-destructuring
		[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
	}

	return shuffled;
};
