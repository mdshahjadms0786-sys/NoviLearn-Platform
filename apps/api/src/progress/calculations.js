export function computeMastery(stats) {
  if (stats.learningCount <= 0 && stats.practiceCount <= 0) {
    return "NOT_STARTED";
  }
  if (stats.practiceCount <= 0) {
    return "LEARNING";
  }
  if (
    stats.practiceCount >= 2 &&
    stats.bestAccuracy !== null &&
    stats.averageAccuracy !== null &&
    stats.bestAccuracy >= 80 &&
    stats.averageAccuracy >= 80
  ) {
    return "STRONG";
  }
  return "PRACTICING";
}
export function computeTopicProgress(stats) {
  const learningComponent = (Math.min(stats.learningCount, 4) / 4) * 50;
  const practiceComponent = (Math.min(stats.practiceCount, 3) / 3) * 30;
  const accuracyComponent = ((stats.averageAccuracy ?? 0) / 100) * 20;
  const raw = learningComponent + practiceComponent + accuracyComponent;
  return Math.round(Math.min(100, Math.max(0, raw)));
}
