import { UserGlobalProgress, StageProgress } from "../types";

const STORAGE_KEY = "globallingo_user_progress_v1";

export function loadUserProgress(): UserGlobalProgress {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return ensureProgressDefaults(parsed);
    }
  } catch (e) {
    console.error("Failed to load progress from localStorage", e);
  }

  return getDefaultProgress();
}

export function saveUserProgress(progress: UserGlobalProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error("Failed to save progress", e);
  }
}

function getDefaultProgress(): UserGlobalProgress {
  const today = new Date().toISOString().split("T")[0];
  return {
    selectedLanguageId: "ja", // Default to Japanese as popular choice or "en"
    totalXp: 0,
    streakDays: 1,
    lastActiveDate: today,
    languages: {
      ja: {
        languageId: "ja",
        currentStageId: 1,
        completedStages: {},
        earnedXp: 0,
        learnedWords: [],
        totalTimeMinutes: 0,
      },
    },
    badges: [],
    bookmarkedWords: [],
  };
}

function ensureProgressDefaults(parsed: any): UserGlobalProgress {
  const today = new Date().toISOString().split("T")[0];
  const defaults = getDefaultProgress();

  const progress: UserGlobalProgress = {
    selectedLanguageId: parsed.selectedLanguageId || defaults.selectedLanguageId,
    totalXp: parsed.totalXp || 0,
    streakDays: parsed.streakDays || 1,
    lastActiveDate: parsed.lastActiveDate || today,
    languages: parsed.languages || defaults.languages,
    badges: parsed.badges || [],
    bookmarkedWords: parsed.bookmarkedWords || [],
  };

  // Check streak
  if (parsed.lastActiveDate) {
    const last = new Date(parsed.lastActiveDate);
    const curr = new Date(today);
    const diffDays = Math.floor((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      // Continued streak
      progress.streakDays += 1;
      progress.lastActiveDate = today;
    } else if (diffDays > 1) {
      // Broken streak
      progress.streakDays = 1;
      progress.lastActiveDate = today;
    }
  }

  return progress;
}

export function recordStageCompletion(
  currentProgress: UserGlobalProgress,
  languageId: string,
  stageId: number,
  score: number,
  xpEarned: number,
  newWords: string[]
): { updatedProgress: UserGlobalProgress; newlyUnlockedBadges: string[] } {
  const updated = { ...currentProgress };

  if (!updated.languages[languageId]) {
    updated.languages[languageId] = {
      languageId,
      currentStageId: 1,
      completedStages: {},
      earnedXp: 0,
      learnedWords: [],
      totalTimeMinutes: 0,
    };
  }

  const langProg = { ...updated.languages[languageId] };
  const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1;

  const existing = langProg.completedStages[stageId];
  const stageRecord: StageProgress = {
    stageId,
    stars: Math.max(stars, existing?.stars || 0),
    score: Math.max(score, existing?.score || 0),
    completedAt: new Date().toISOString(),
    attemptsCount: (existing?.attemptsCount || 0) + 1,
  };

  langProg.completedStages = {
    ...langProg.completedStages,
    [stageId]: stageRecord,
  };

  if (langProg.currentStageId <= stageId && stageId < 80) {
    langProg.currentStageId = stageId + 1;
  }

  langProg.earnedXp += xpEarned;
  updated.totalXp += xpEarned;

  // Add words
  const wordsSet = new Set([...langProg.learnedWords, ...newWords]);
  langProg.learnedWords = Array.from(wordsSet);
  langProg.totalTimeMinutes += 6;

  updated.languages[languageId] = langProg;

  // Check badges
  const newlyUnlockedBadges: string[] = [];
  const completedCount = Object.keys(langProg.completedStages).length;

  const checkBadge = (badgeId: string, condition: boolean) => {
    if (condition && !updated.badges.includes(badgeId)) {
      updated.badges.push(badgeId);
      newlyUnlockedBadges.push(badgeId);
    }
  };

  checkBadge("first_step", completedCount >= 1);
  checkBadge("foundation_tier_1", completedCount >= 10);
  checkBadge("daily_talker_20", completedCount >= 20);
  checkBadge("structure_master_30", completedCount >= 30);
  checkBadge("globe_trotter_40", completedCount >= 40);
  checkBadge("halfway_hero_50", completedCount >= 50);
  checkBadge("fluent_speaker_60", completedCount >= 60);
  checkBadge("professional_70", completedCount >= 70);
  checkBadge("polyglot_master_80", completedCount >= 80);
  checkBadge("streak_3", updated.streakDays >= 3);
  checkBadge("xp_1000", updated.totalXp >= 1000);

  saveUserProgress(updated);
  return { updatedProgress: updated, newlyUnlockedBadges };
}
