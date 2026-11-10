import { prisma } from "../prisma.js";

function pad(value) {
  return String(value).padStart(2, "0");
}

export function toDayKey(date) {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) {
    return null;
  }
  return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
}

function dayKeyToUtcMidnight(key) {
  return Date.parse(`${key}T00:00:00.000Z`);
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function computeStreakFromDayKeys(dayKeys, todayKey) {
  const unique = [...new Set(dayKeys.filter(Boolean))].sort();
  if (unique.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      lastActiveDate: null,
    };
  }

  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i += 1) {
    const diff = Math.round(
      (dayKeyToUtcMidnight(unique[i]) - dayKeyToUtcMidnight(unique[i - 1])) /
        DAY_MS,
    );
    if (diff === 0) {
      continue;
    }
    if (diff === 1) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longestStreak) {
      longestStreak = run;
    }
  }

  const lastActiveDate = unique[unique.length - 1];
  const gapFromToday = Math.round(
    (dayKeyToUtcMidnight(todayKey) - dayKeyToUtcMidnight(lastActiveDate)) /
      DAY_MS,
  );

  let currentStreak = 0;
  if (gapFromToday === 0 || gapFromToday === 1) {
    currentStreak = 1;
    for (let i = unique.length - 1; i > 0; i -= 1) {
      const diff = Math.round(
        (dayKeyToUtcMidnight(unique[i]) - dayKeyToUtcMidnight(unique[i - 1])) /
          DAY_MS,
      );
      if (diff === 1) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalActiveDays: unique.length,
    lastActiveDate,
  };
}

export async function getLearningStreak(userId, now = new Date()) {
  const todayKey = toDayKey(now) ?? toDayKey(new Date());
  const [learningRows, practiceRows] = await Promise.all([
    prisma.learningActivity.findMany({
      where: { userId },
      select: { createdAt: true },
    }),
    prisma.practiceSession.findMany({
      where: { userId },
      select: { completedAt: true },
    }),
  ]);

  const dayKeys = [];
  for (const row of learningRows) {
    const key = toDayKey(row.createdAt);
    if (key !== null) {
      dayKeys.push(key);
    }
  }
  for (const row of practiceRows) {
    const key = toDayKey(row.completedAt);
    if (key !== null) {
      dayKeys.push(key);
    }
  }

  return computeStreakFromDayKeys(dayKeys, todayKey);
}
