import questionBank from "../../data/question-bank.json" with { type: "json" };
import { requireQuestionBank } from "../../type-utils.js";

const stationsQuestionBank = requireQuestionBank(questionBank);

export default stationsQuestionBank;
