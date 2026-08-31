export interface Language {
  id: string;
  name: string; // Arabic name, e.g. "اليابانية"
  nativeName: string; // Native name, e.g. "日本語 (Nihongo)"
  englishName: string; // e.g. "Japanese"
  flag: string; // Emoji flag or emblem
  script: string; // Writing script e.g. "كانجي وهيراغانا وكانا"
  bcp47: string; // Speech synthesis code e.g. "ja-JP"
  region: "asia" | "europe" | "africa_me" | "americas" | "classical";
  regionName: string; // e.g. "آسيا والمحيط الهادئ"
  family: string; // e.g. "اللغات الجابونية"
  difficultyLevel: 1 | 2 | 3 | 4 | 5; // 1 = Easy, 5 = Master/Challenging
  speakersCount: string; // e.g. "128 مليون متحدث"
  description: string;
  totalStages: number; // 80 stages
  sampleGreeting: {
    phrase: string;
    translation: string;
    pronunciation: string;
  };
  accentColor: string; // Tailwind color class e.g. "from-rose-500 to-red-600"
  badgeIcon: string;
}

export interface Stage {
  id: number; // 1 to 80
  stageNumber: number;
  tierIndex: number; // 1 to 8
  tierTitle: string; // e.g. "المستوى 1: التأسيس والأبجدية والأصوات"
  tierColor: string;
  title: string; // e.g. "التحيات اليومية والتعارف الأول"
  targetGrammar: string; // e.g. "ضمائر المتكلم وأفعال التحية"
  summary: string;
  isCheckpoint: boolean; // Stage 10, 20, 30, 40, 50, 60, 70, 80 are master exam checkpoints
  estimatedMinutes: number;
  xpReward: number;
  iconName: string;
}

export interface VocabularyItem {
  word: string;
  translation: string;
  pronunciation: string;
  partOfSpeech: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  audioNote?: string;
}

export interface GrammarRule {
  title: string;
  explanation: string;
  examples: Array<{
    source: string;
    target: string;
    tip?: string;
  }>;
}

export interface CulturalInsight {
  title: string;
  content: string;
  funFact?: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  translation: string;
}

export type ExerciseType =
  | "multiple_choice"
  | "arrange_words"
  | "translate"
  | "pair_match"
  | "listening"
  | "fill_blank"
  | "speaking";

export interface Exercise {
  id: number | string;
  type: ExerciseType;
  question: string;
  targetPhrase?: string;
  spokenText?: string;
  options?: string[];
  correctAnswer?: string;
  words?: string[];
  correctSentence?: string;
  pairs?: Array<{ source: string; target: string }>;
  explanation?: string;
}

export interface LessonContent {
  summary: string;
  vocabulary: VocabularyItem[];
  grammarRules: GrammarRule[];
  culturalInsight: CulturalInsight;
  dialogue: DialogueLine[];
  exercises: Exercise[];
}

export interface StageProgress {
  stageId: number;
  stars: number; // 1, 2, or 3
  score: number; // 0 - 100
  completedAt: string;
  attemptsCount: number;
}

export interface UserLanguageProgress {
  languageId: string;
  currentStageId: number;
  completedStages: Record<number, StageProgress>;
  earnedXp: number;
  learnedWords: string[];
  totalTimeMinutes: number;
}

export interface UserGlobalProgress {
  selectedLanguageId: string;
  totalXp: number;
  streakDays: number;
  lastActiveDate: string;
  languages: Record<string, UserLanguageProgress>;
  badges: string[];
  bookmarkedWords: Array<{
    languageId: string;
    word: string;
    translation: string;
    pronunciation: string;
    addedAt: string;
  }>;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  conditionType: "stages" | "languages" | "xp" | "streak" | "exam";
  requiredValue: number;
}
