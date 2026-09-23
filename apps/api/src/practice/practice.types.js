export function toClientQuestion(question) {
  return {
    id: question.id,
    type: question.type,
    question: question.question,
    ...(question.options !== undefined
      ? {
          options: question.options,
        }
      : {}),
  };
}
export function toClientPracticeSet(session) {
  return {
    sessionId: session.sessionId,
    topic: session.topic,
    config: session.config,
    questions: session.questions.map(toClientQuestion),
  };
}
