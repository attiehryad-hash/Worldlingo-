import React, { useState, useEffect } from "react";
import { Language, Stage, UserGlobalProgress, VocabularyItem } from "./types";
import { WORLD_LANGUAGES, DEFAULT_LANGUAGE } from "./data/languages";
import { STAGES_80 } from "./data/stageRoadmap";
import { loadUserProgress, saveUserProgress, recordStageCompletion } from "./utils/storage";
import { playSound } from "./utils/audio";

import { Navbar } from "./components/Navbar";
import { StageRoadmap80 } from "./components/StageRoadmap80";
import { LanguageSelectorModal } from "./components/LanguageSelectorModal";
import { StageLessonModal } from "./components/StageLessonModal";
import { AITutorDrawer } from "./components/AITutorDrawer";
import { PolyglotDiplomaModal } from "./components/PolyglotDiplomaModal";
import { DictionaryModal } from "./components/DictionaryModal";
import { ApkExportModal } from "./components/ApkExportModal";

export default function App() {
  const [progress, setProgress] = useState<UserGlobalProgress>(() => loadUserProgress());
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const savedId = progress.selectedLanguageId;
    return WORLD_LANGUAGES.find((l) => l.id === savedId) || DEFAULT_LANGUAGE;
  });

  // Modals state
  const [isLangSelectorOpen, setIsLangSelectorOpen] = useState(false);
  const [isDiplomaOpen, setIsDiplomaOpen] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [activeStage, setActiveStage] = useState<Stage | null>(null);

  // Sync current stage object for AI tutor
  const currentLangProg = progress.languages[currentLanguage.id] || {
    currentStageId: 1,
  };
  const tutorStage =
    STAGES_80.find((s) => s.stageNumber === currentLangProg.currentStageId) || STAGES_80[0];

  // Save progress changes
  useEffect(() => {
    saveUserProgress(progress);
  }, [progress]);

  // Handle language switch
  const handleSelectLanguage = (language: Language) => {
    setCurrentLanguage(language);
    setProgress((prev) => ({
      ...prev,
      selectedLanguageId: language.id,
      languages: {
        ...prev.languages,
        [language.id]: prev.languages[language.id] || {
          languageId: language.id,
          currentStageId: 1,
          completedStages: {},
          earnedXp: 0,
          learnedWords: [],
          totalTimeMinutes: 0,
        },
      },
    }));
  };

  // Handle stage completion
  const handleCompleteStage = (
    stageId: number,
    score: number,
    xpReward: number,
    newWords: string[]
  ) => {
    const { updatedProgress, newlyUnlockedBadges } = recordStageCompletion(
      progress,
      currentLanguage.id,
      stageId,
      score,
      xpReward,
      newWords
    );

    setProgress(updatedProgress);

    if (newlyUnlockedBadges.length > 0) {
      playSound("level_up");
    }
  };

  // Handle bookmark word
  const handleBookmarkWord = (item: VocabularyItem) => {
    setProgress((prev) => {
      const exists = prev.bookmarkedWords.includes(item.word);
      const updatedList = exists
        ? prev.bookmarkedWords.filter((w) => w !== item.word)
        : [...prev.bookmarkedWords, item.word];

      playSound("click");
      return {
        ...prev,
        bookmarkedWords: updatedList,
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#F8FAFC] font-['Cairo'] flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        currentLanguage={currentLanguage}
        progress={progress}
        onOpenLanguageSelector={() => setIsLangSelectorOpen(true)}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onOpenBadges={() => setIsDiplomaOpen(true)}
        onToggleAITutor={() => setIsAITutorOpen(!isAITutorOpen)}
        isAITutorOpen={isAITutorOpen}
        onOpenApkModal={() => setIsApkModalOpen(true)}
      />

      {/* Main Roadmap Area */}
      <main className="flex-1 pb-16">
        <StageRoadmap80
          currentLanguage={currentLanguage}
          userProgress={progress}
          onSelectStage={(stage) => setActiveStage(stage)}
          onOpenLanguageSelector={() => setIsLangSelectorOpen(true)}
          onOpenDiplomas={() => setIsDiplomaOpen(true)}
          onOpenApkModal={() => setIsApkModalOpen(true)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0A0C10]/95 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-400">
            بولي-ليرن | PolyLearn — منصة تعلم جميع لغات العالم عبر 80 مرحلة منهجية ذكية
          </p>
          <p>
            تغطي جميع القواعد، المحادثات الواقعية، المفردات، والمستويات من A1 حتى C2 مع المساعد الذكي والصوت التفاعلي.
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <LanguageSelectorModal
        isOpen={isLangSelectorOpen}
        onClose={() => setIsLangSelectorOpen(false)}
        currentLanguageId={currentLanguage.id}
        onSelectLanguage={handleSelectLanguage}
        userProgress={progress}
      />

      {activeStage && (
        <StageLessonModal
          isOpen={!!activeStage}
          stage={activeStage}
          language={currentLanguage}
          onClose={() => setActiveStage(null)}
          onCompleteStage={handleCompleteStage}
          onBookmarkWord={handleBookmarkWord}
          bookmarkedWords={progress.bookmarkedWords}
        />
      )}

      <PolyglotDiplomaModal
        isOpen={isDiplomaOpen}
        onClose={() => setIsDiplomaOpen(false)}
        language={currentLanguage}
        progress={progress}
      />

      <DictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        language={currentLanguage}
        progress={progress}
      />

      <AITutorDrawer
        isOpen={isAITutorOpen}
        onClose={() => setIsAITutorOpen(false)}
        language={currentLanguage}
        currentStage={tutorStage}
      />

      <ApkExportModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        appUrl={window.location.href}
      />
    </div>
  );
}
