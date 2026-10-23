import wordsToNumbers from "@codecompose/words-to-numbers";
import type { Pool, PoolQuestion } from "../types.js";

export const stationNormalizer = (string: string): string => {
	string = string
		// Rule 0: We cannot spell
		.replaceAll(/\bfourty\b/giv, "forty")
		.replaceAll(/'|\./gv, "")
		// Rule 3: Dashes, ampersands, the word “and,” and slashes are interchangeable wherever applicable.
		.replaceAll(/\s?[&\/]\s?/gv, " ")
		.replaceAll(/(?:\s|-)and(?:\s|-)/giv, " ")
		// Rule 4: Abbreviations for street, road, avenue, road, parkway, boulevard, drive, lane, place,
		// turnpike, square, center, heights, expressway, saint are acceptable.
		.replaceAll(/\bstr?\b(?!\s+george)/giv, "Street")
		.replaceAll(/\bsts\b/giv, "Streets")
		.replaceAll(/\brd\b/giv, "Road")
		.replaceAll(/\bave?\b/giv, "Avenue")
		.replaceAll(/\bp(?:kw?|rkw)y\b/giv, "Parkway")
		.replaceAll(/\bbl?vd\b/giv, "Boulevard")
		.replaceAll(/\bdr\b/giv, "Drive")
		.replaceAll(/\bln\b/giv, "Lane")
		.replaceAll(/\bpl\b/giv, "Place")
		.replaceAll(/\btr?pke?\b/giv, "Turnpike")
		.replaceAll(/\bsq\b/giv, "Square")
		.replaceAll(/\bhts\b/giv, "Heights")
		.replaceAll(/\bst\b/giv, "Saint")
		// Also Rule 12: Any common non-American spellings (like centre instead of center) is acceptable.
		.replaceAll(/\b(?:ctr|centre)\b/giv, "Center")
		.replaceAll(/\bexpw?y\b/giv, "Expressway");
	// Rule 5: An ordinal word is acceptable in the place of an ordinal numeral and vice versa.
	string = String(wordsToNumbers(string) ?? string);
	string = string
		// Rule 6: Suffixes like “th” after a number are optional.
		.replaceAll(/(?<=\d)(?:th|st|nd|rd)\b/giv, "")
		// Rule 7: North, South, East, and West can be replaced by N, S, E, and W respectively, followed by optional periods.
		.replaceAll(/\bn\b/giv, "North")
		.replaceAll(/\be\b/giv, "East")
		.replaceAll(/\bs\b/giv, "South")
		.replaceAll(/\bw\b/giv, "West")
		// Rule 8: The word station and terminal, and any other generic noun that is applicable to dozens of stations,
		// is optional wherever applicable.
		.replaceAll(/\b(?:station|terminal)\s?/giv, "")
		.replaceAll(/\b(?:the|a)\s+/giv, "")
		.replaceAll(/\s+/gv, " ");

	return string.trim();
};

const pools: Record<string, Pool> = {
	/** **Placeholder** - The pool "mathTest" is a placeholder for testing */
	mathTest: {
		pool: [
			{
				question: "0+0=",
				answer: /^0$/v,
				answerTxt: "0",
			},
			{
				question: "2+2=",
				answer: /^4$/v,
				answerTxt: "4",
			},
			{
				question: "8+8=",
				answer: /^16$/v,
				answerTxt: "16",
			},
			{
				question: "10,000+10,000=",
				answer: /^20000$/v,
				answerTxt: "20,000",
			},
			{
				question: "1,000,000*10=",
				answer: /^(?:10000000|ten-? ?million)$/iv,
				answerTxt: "10,000,000",
			},
			{
				question: "900000000000000*900000000000000",
				answer: /^(?:810(?:000){9}|eight-? ?hundred-? ?ten-? ?octillion)$/iv,
				answerTxt: "eight hundred ten octillion", // As per request from my younger brother
			},
			{
				question: "8.1*10.1=",
				answer: /^81\.81$/v,
				answerTxt: "81.81",
			},
		],
		metadata: {
			normalizer: (string) =>
				String(
					wordsToNumbers(string) ??
						string.replaceAll(",", ""),
				),
		},
	},
	/** **Placeholder** - The pool "test" is a placeholder for testing */
	test: {
		pool: [
			{
				question: "respond with test",
				answer: /test/iv,
				answerTxt: "test",
				image: [
					"https://cdn.discordapp.com/attachments/1068188325380374548/1516102329164763168/tier_newer.gif",
					"https://cdn.discordapp.com/attachments/1282840454278156353/1519826942659133500/umayyadNOW.gif",
				],
			},
			{
				question: "respond with trial",
				answer: /trial/iv,
				answerTxt: "trial",
				image: [
					"https://cdn.discordapp.com/attachments/1358244650716106865/1503170758363320491/togif.gif",
					"https://cdn.discordapp.com/attachments/1448818023921094679/1500295196506591385/attachment.gif",
				],
			},
		],
		metadata: {
			normalizer: (string) =>
				string.replaceAll("the", "").trim(),
		},
	},
};

export default pools;
