import questionBank from "../../data/question-bank.json" with { type: "json" };
import { requireQuestionBank } from "../../type-utils.js";

export const stationsQuestionBank = requireQuestionBank(questionBank);
