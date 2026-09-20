import type { InternalPracticeQuestion } from "./practice.types";
import { normalizeAnswerText, normalizeMatchText } from "./text";

export function evaluateAnswer(
  question: InternalPracticeQuestion,
  studentAnswer: string,
): boolean {
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
