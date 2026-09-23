import { normalizeAnswerText, normalizeMatchText } from "./text.js";
export function evaluateAnswer(question, studentAnswer) {
  switch (question.type) {
    case "mcq":
    case "true_false":
      return (
        normalizeMatchText(studentAnswer) ===
        normalizeMatchText(question.correctAnswer)
      );
    case "short_answer": {
      const expected = normalizeAnswerText(studentAnswer);
      return question.acceptedAnswers.some(
        (accepted) => normalizeAnswerText(accepted) === expected,
      );
    }
  }
}
