import type { Pool } from "../types.js";

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
			normalizer: (string) => string.replaceAll(",", ""),
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
