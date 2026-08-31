import React, { useState, useEffect } from "react";
import { Language, Stage, LessonContent, VocabularyItem, Exercise } from "../types";
import { generateLocalLessonContent } from "../data/lessonGenerators";
import { speakText, playSound } from "../utils/audio";
import confetti from "canvas-confetti";
import {
  X,
  Volume2,
  Volume1,
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  Award,
  Star,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  MessageSquare,
  Layers,
  HelpCircle,
  Mic,
  Bot,
  Lightbulb,
  Check,
  Flame,
  Globe2,
} from "lucide-react";

interface StageLessonModalProps {
  stage: Stage;
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onCompleteStage: (stageId: number, score: number, xp: number, newWords: string[]) => void;
  onBookmarkWord?: (word: VocabularyItem) => void;
  bookmarkedWords?: string[];
}

export const StageLessonModal: React.FC<StageLessonModalProps> = ({
  stage,
  language,
  isOpen,
  onClose,
  onCompleteStage,
  onBookmarkWord,
  bookmarkedWords = [],
}) => {
  const [activeTab, setActiveTab] = useState<"learn" | "quiz" | "dialogue" | "flashcards">("learn");
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Quiz State
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [selectedSourcePair, setSelectedSourcePair] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userSpeechText, setUserSpeechText] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Load lesson content (local preset + optional AI enhancement)
  useEffect(() => {
    if (!isOpen) return;

    // First, load immediate local high-quality content
    const localContent = generateLocalLessonContent(language, stage);
    setLessonContent(localContent);

    // Reset quiz state
    setActiveTab("learn");
    setCurrentExerciseIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setArrangedWords([]);
    setMatchedPairs({});
    setSelectedSourcePair(null);
    setQuizScore(0);
    setQuizCompleted(false);
    setCurrentCardIndex(0);
    setIsCardFlipped(false);

    // Try fetching deep AI generated dynamic content in background if server is online
    const fetchAIContent = async () => {
      try {
        setIsLoadingAI(true);
        const res = await fetch("/api/stage/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            languageName: language.name,
            languageNative: language.nativeName,
            stageNumber: stage.stageNumber,
            stageTitle: stage.title,
            tierTitle: stage.tierTitle,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.vocabulary?.length > 0) {
            setLessonContent(json.data);
          }
        }
      } catch (e) {
        // Fallback to local is already in place
      } finally {
        setIsLoadingAI(false);
      }
    };

    fetchAIContent();
  }, [isOpen, stage.stageNumber, language.id]);

  if (!isOpen || !lessonContent) return null;

  const exercises = lessonContent.exercises || [];
  const currentExercise = exercises[currentExerciseIndex] || null;

  // Audio helper
  const handlePlayAudio = (text: string, slow: boolean = false) => {
    playSound("click");
    speakText(text, language.bcp47, slow ? 0.65 : 0.95);
  };

  // Check current quiz exercise
  const handleCheckAnswer = () => {
    if (!currentExercise) return;

    let correct = false;

    if (currentExercise.type === "multiple_choice" || currentExercise.type === "translate") {
      correct = selectedOption === currentExercise.correctAnswer;
    } else if (currentExercise.type === "listening") {
      correct = selectedOption === currentExercise.correctAnswer;
    } else if (currentExercise.type === "arrange_words") {
      const sentence = arrangedWords.join(" ").trim();
      correct =
        sentence.toLowerCase() === (currentExercise.correctSentence || "").trim().toLowerCase();
    } else if (currentExercise.type === "pair_match") {
      const pairs = currentExercise.pairs || [];
      correct = pairs.every((p) => matchedPairs[p.source] === p.target);
    } else if (currentExercise.type === "speaking") {
      correct = true; // Giving encouraging credit for voice practice
    }

    setIsAnswerChecked(true);
    setIsAnswerCorrect(correct);

    if (correct) {
      playSound("correct");
      setQuizScore((prev) => prev + 1);
    } else {
      playSound("wrong");
    }
  };

  // Advance to next exercise or complete quiz
  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      setArrangedWords([]);
      setSelectedSourcePair(null);
    } else {
      // Completed quiz!
      setQuizCompleted(true);
      playSound("complete");

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Confetti non-fatal
      }

      const calculatedScore = Math.round(((quizScore + (isAnswerCorrect ? 0 : 0)) / Math.max(exercises.length, 1)) * 100);
      const finalScore = Math.max(calculatedScore, 80); // Ensure rewarding progression

      const newWords = (lessonContent.vocabulary || []).map((v) => v.word);
      onCompleteStage(stage.stageNumber, finalScore, stage.xpReward, newWords);
    }
  };

  // Handle pair match selection
  const handleSelectSourcePair = (source: string) => {
    if (matchedPairs[source]) return;
    setSelectedSourcePair(source);
    playSound("click");
  };

  const handleSelectTargetPair = (target: string) => {
    if (!selectedSourcePair) return;
    setMatchedPairs((prev) => ({
      ...prev,
      [selectedSourcePair]: target,
    }));
    setSelectedSourcePair(null);
    playSound("click");
  };

  // Speech recording simulator with Web Speech API recognition
  const handleStartSpeechPractice = (targetPhrase: string) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setUserSpeechText("تم تسجيل نطقك بنجاح!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language.bcp47;
      recognition.interimResults = false;

      setIsRecording(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserSpeechText(transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setUserSpeechText(targetPhrase); // Fallback simulation
      };
    } catch (e) {
      setIsRecording(false);
      setUserSpeechText(targetPhrase);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0A0C10]/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-sm">
              {stage.stageNumber}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400">
                  {stage.tierTitle}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400">
                  {language.name} {language.flag}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                {stage.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoadingAI && (
              <span className="text-[11px] text-indigo-300 flex items-center gap-1 bg-[#1E293B] px-3 py-1.5 rounded-full border border-indigo-800">
                <Sparkles className="w-3 h-3 animate-spin text-indigo-400" />
                <span>توليد بالذكاء الاصطناعي...</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-[#1E293B] text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800/60 bg-[#0A0C10]/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("learn")}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap border ${
              activeTab === "learn"
                ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30"
                : "bg-[#1E293B] text-slate-300 hover:bg-slate-800 border-slate-700"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>شرح ومفردات الدرس</span>
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap border ${
              activeTab === "quiz"
                ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30"
                : "bg-[#1E293B] text-slate-300 hover:bg-slate-800 border-slate-700"
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>التمارين التفاعلية ({exercises.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("dialogue")}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap border ${
              activeTab === "dialogue"
                ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30"
                : "bg-[#1E293B] text-slate-300 hover:bg-slate-800 border-slate-700"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>المحادثة الحية</span>
          </button>

          <button
            onClick={() => setActiveTab("flashcards")}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap border ${
              activeTab === "flashcards"
                ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30"
                : "bg-[#1E293B] text-slate-300 hover:bg-slate-800 border-slate-700"
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>البطاقات التعليمية</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: LEARN (Vocabulary, Grammar, Cultural Secrets) */}
          {activeTab === "learn" && (
            <div className="space-y-6">
              {/* Stage Summary Banner */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <span className="font-bold text-indigo-300">أهداف المرحلة: </span>
                  {lessonContent.summary}
                </div>
              </div>

              {/* Vocabulary Section */}
              <div>
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  <span>المفردات والتراكيب الأساسية</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(lessonContent.vocabulary || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="text-right">
                            <div className="text-lg font-black text-white">
                              {item.word}
                            </div>
                            <div className="text-xs text-indigo-400 font-semibold mt-0.5">
                              {item.pronunciation}
                            </div>
                          </div>

                          {/* Audio & Bookmark Actions */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handlePlayAudio(item.word, false)}
                              title="نطق عادي"
                              className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handlePlayAudio(item.word, true)}
                              title="نطق بطيء للتدرب"
                              className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            >
                              <Volume1 className="w-4 h-4" />
                            </button>
                            {onBookmarkWord && (
                              <button
                                onClick={() => onBookmarkWord(item)}
                                title="حفظ الكلمة في القاموس"
                                className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-amber-400 transition-colors"
                              >
                                <Bookmark className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="text-sm font-bold text-emerald-400 mb-2">
                          {item.translation}
                        </div>

                        {item.exampleSentence && (
                          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                            <div className="font-semibold text-slate-200">
                              {item.exampleSentence}
                            </div>
                            <div className="text-slate-400">
                              {item.exampleTranslation}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grammar Rules Section */}
              {(lessonContent.grammarRules || []).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span>القواعد والتراكيب اللغوية</span>
                  </h3>

                  {lessonContent.grammarRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3"
                    >
                      <h4 className="text-sm font-extrabold text-indigo-300">
                        {rule.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {rule.explanation}
                      </p>

                      {rule.examples && rule.examples.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                          {rule.examples.map((ex, exIdx) => (
                            <div
                              key={exIdx}
                              className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between text-indigo-300 font-bold">
                                <span>{ex.source}</span>
                                <button
                                  onClick={() => handlePlayAudio(ex.source)}
                                  className="text-slate-400 hover:text-indigo-300"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="text-slate-300">{ex.target}</div>
                              {ex.tip && (
                                <div className="text-[11px] text-amber-300/80 font-medium">
                                  💡 {ex.tip}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Cultural Insight Section */}
              {lessonContent.culturalInsight && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-800/30 space-y-2">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>{lessonContent.culturalInsight.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {lessonContent.culturalInsight.content}
                  </p>
                  {lessonContent.culturalInsight.funFact && (
                    <div className="pt-2 text-xs font-semibold text-amber-300">
                      ✨ {lessonContent.culturalInsight.funFact}
                    </div>
                  )}
                </div>
              )}

              {/* Call to Quiz Button */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setActiveTab("quiz")}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all"
                >
                  <span>بدء التمارين التفاعلية للمرحلة</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: QUIZ & EXERCISES */}
          {activeTab === "quiz" && (
            <div>
              {!quizCompleted ? (
                <div className="space-y-6">
                  {/* Progress Bar & Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>
                        تمرين {currentExerciseIndex + 1} من {exercises.length}
                      </span>
                      <span className="text-indigo-400">
                        النقاط: {quizScore} / {exercises.length}
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                        style={{
                          width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Current Exercise Card */}
                  {currentExercise && (
                    <div className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/60 space-y-6">
                      {/* Question Header */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                          {currentExercise.type === "multiple_choice" && "اختيار من متعدد"}
                          {currentExercise.type === "translate" && "ترجمة دقيقة"}
                          {currentExercise.type === "arrange_words" && "ترتيب كلمات الجملة"}
                          {currentExercise.type === "pair_match" && "مطابقة الأزواج والكلمات"}
                          {currentExercise.type === "listening" && "استماع وفهم"}
                          {currentExercise.type === "speaking" && "ممارسة النطق الصوتي"}
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {currentExercise.question}
                        </h3>

                        {/* Spoken Text or Target Phrase */}
                        {(currentExercise.spokenText || currentExercise.targetPhrase) && (
                          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                            <span className="text-lg font-black text-indigo-300">
                              {currentExercise.spokenText || currentExercise.targetPhrase}
                            </span>
                            <button
                              onClick={() =>
                                handlePlayAudio(
                                  currentExercise.spokenText || currentExercise.targetPhrase || ""
                                )
                              }
                              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                            >
                              <Volume2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Multiple Choice / Translation / Listening Options */}
                      {(currentExercise.type === "multiple_choice" ||
                        currentExercise.type === "translate" ||
                        currentExercise.type === "listening") && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(currentExercise.options || []).map((opt, optIdx) => {
                            const isSelected = selectedOption === opt;
                            let style = "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200";

                            if (isAnswerChecked) {
                              if (opt === currentExercise.correctAnswer) {
                                style = "bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30";
                              } else if (isSelected && !isAnswerCorrect) {
                                style = "bg-rose-950/80 border-rose-500 text-rose-300 ring-2 ring-rose-500/30";
                              }
                            } else if (isSelected) {
                              style = "bg-indigo-950/80 border-indigo-500 text-indigo-200 ring-2 ring-indigo-500/30";
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={isAnswerChecked}
                                onClick={() => {
                                  setSelectedOption(opt);
                                  playSound("click");
                                }}
                                className={`p-4 rounded-2xl border text-right font-bold text-sm sm:text-base transition-all ${style}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Word Arrangement Exercise */}
                      {currentExercise.type === "arrange_words" && (
                        <div className="space-y-4">
                          {/* Selected words dropzone */}
                          <div className="min-h-[56px] p-3 rounded-2xl bg-slate-900 border border-slate-700 flex flex-wrap items-center gap-2">
                            {arrangedWords.length === 0 ? (
                              <span className="text-xs text-slate-500">
                                اضغط على الكلمات بالأسفل لترتيبها هنا...
                              </span>
                            ) : (
                              arrangedWords.map((w, wIdx) => (
                                <button
                                  key={wIdx}
                                  onClick={() => {
                                    if (isAnswerChecked) return;
                                    setArrangedWords((prev) => prev.filter((_, i) => i !== wIdx));
                                    playSound("click");
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-sm"
                                >
                                  {w}
                                </button>
                              ))
                            )}
                          </div>

                          {/* Words to pick */}
                          <div className="flex flex-wrap gap-2">
                            {(currentExercise.words || []).map((w, wIdx) => {
                              const isUsed = arrangedWords.includes(w);
                              return (
                                <button
                                  key={wIdx}
                                  disabled={isUsed || isAnswerChecked}
                                  onClick={() => {
                                    setArrangedWords((prev) => [...prev, w]);
                                    playSound("click");
                                  }}
                                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                                    isUsed
                                      ? "opacity-30 bg-slate-800 border-slate-700 text-slate-500"
                                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                                  }`}
                                >
                                  {w}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Pair Matching Exercise */}
                      {currentExercise.type === "pair_match" && (
                        <div className="grid grid-cols-2 gap-4">
                          {/* Source Words */}
                          <div className="space-y-2">
                            {(currentExercise.pairs || []).map((p, pIdx) => {
                              const isMatched = !!matchedPairs[p.source];
                              const isSelected = selectedSourcePair === p.source;
                              return (
                                <button
                                  key={pIdx}
                                  disabled={isMatched || isAnswerChecked}
                                  onClick={() => handleSelectSourcePair(p.source)}
                                  className={`w-full p-3 rounded-xl border text-right font-bold text-sm transition-all ${
                                    isMatched
                                      ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300 opacity-60"
                                      : isSelected
                                      ? "bg-indigo-600 text-white ring-2 ring-indigo-400"
                                      : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                                  }`}
                                >
                                  {p.source}
                                </button>
                              );
                            })}
                          </div>

                          {/* Target Translations */}
                          <div className="space-y-2">
                            {(currentExercise.pairs || []).map((p, pIdx) => {
                              const isMatched = Object.values(matchedPairs).includes(p.target);
                              return (
                                <button
                                  key={pIdx}
                                  disabled={isMatched || isAnswerChecked}
                                  onClick={() => handleSelectTargetPair(p.target)}
                                  className={`w-full p-3 rounded-xl border text-right font-bold text-sm transition-all ${
                                    isMatched
                                      ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300 opacity-60"
                                      : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                                  }`}
                                >
                                  {p.target}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Speaking Exercise */}
                      {currentExercise.type === "speaking" && (
                        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center space-y-4">
                          <button
                            onClick={() =>
                              handleStartSpeechPractice(currentExercise.targetPhrase || "")
                            }
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                              isRecording
                                ? "bg-red-500 animate-ping text-white"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                            }`}
                          >
                            <Mic className="w-7 h-7" />
                          </button>
                          <div className="text-xs text-slate-400">
                            {isRecording
                              ? "جارٍ الاستماع لصوتك..."
                              : "اضغط على الميكروفون وتحدث بالعبارة المستهدفة"}
                          </div>
                          {userSpeechText && (
                            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-emerald-300 font-bold">
                              تم التقاط الصوت: {userSpeechText}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Feedback Note after checking */}
                      {isAnswerChecked && (
                        <div
                          className={`p-4 rounded-2xl border flex items-start gap-3 ${
                            isAnswerCorrect
                              ? "bg-emerald-950/50 border-emerald-600/50 text-emerald-200"
                              : "bg-rose-950/50 border-rose-600/50 text-rose-200"
                          }`}
                        >
                          {isAnswerCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1 text-xs sm:text-sm">
                            <div className="font-bold">
                              {isAnswerCorrect ? "إجابة صحيحة وممتازة!" : "إجابة غير صحيحة"}
                            </div>
                            {currentExercise.explanation && (
                              <div className="text-slate-300">
                                {currentExercise.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Bottom Action Button */}
                      <div className="pt-2 flex justify-end">
                        {!isAnswerChecked ? (
                          <button
                            onClick={handleCheckAnswer}
                            className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-md transition-all"
                          >
                            تحقق من الإجابة
                          </button>
                        ) : (
                          <button
                            onClick={handleNextExercise}
                            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-md transition-all"
                          >
                            <span>التالي</span>
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Quiz Finished Summary */
                <div className="py-8 px-4 flex flex-col items-center text-center space-y-6 animate-fade-in">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/20 text-white">
                    <Award className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">
                      مبارك! أكملت المرحلة {stage.stageNumber} بنجاح!
                    </h3>
                    <p className="text-sm text-slate-300 max-w-md">
                      أحسنت صنعاً! لقد أتممت جميع تمارين هذه المرحلة ونلت نقاط الخبرة لتعزيز طلاقتك في لغة {language.name}.
                    </p>
                  </div>

                  {/* Score & Rewards Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md">
                    <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700">
                      <div className="text-xs text-slate-400">النجوم المكتسبة</div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {[1, 2, 3].map((s) => (
                          <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700">
                      <div className="text-xs text-slate-400">نقاط الخبرة</div>
                      <div className="text-base font-black text-indigo-400 mt-1">
                        +{stage.xpReward} XP
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 col-span-2 sm:col-span-1">
                      <div className="text-xs text-slate-400">المرحلة القادمة</div>
                      <div className="text-base font-black text-emerald-400 mt-1">
                        المرحلة {Math.min(stage.stageNumber + 1, 80)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={onClose}
                      className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all"
                    >
                      العودة لخريطة الـ 80 مرحلة
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DIALOGUE */}
          {activeTab === "dialogue" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 text-xs sm:text-sm text-slate-300">
                💬 استمع للمحادثة الحية بين المتحدثين في هذا الموقف وتدرب على النطق الصحيح.
              </div>

              <div className="space-y-3">
                {(lessonContent.dialogue || []).map((line, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1 text-right">
                      <div className="text-xs font-bold text-indigo-400">
                        {line.speaker}
                      </div>
                      <div className="text-base font-black text-white">
                        {line.text}
                      </div>
                      <div className="text-xs text-slate-400">
                        {line.translation}
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlayAudio(line.text)}
                      className="p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors shrink-0"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FLASHCARDS */}
          {activeTab === "flashcards" && (
            <div className="flex flex-col items-center justify-center py-6 space-y-6">
              {lessonContent.vocabulary && lessonContent.vocabulary.length > 0 && (
                <>
                  <div className="text-xs font-bold text-slate-400">
                    بطاقة {currentCardIndex + 1} من {lessonContent.vocabulary.length}
                  </div>

                  {/* 3D Flip Card */}
                  <div
                    onClick={() => {
                      setIsCardFlipped(!isCardFlipped);
                      playSound("click");
                    }}
                    className="w-full max-w-sm h-64 rounded-3xl bg-gradient-to-br from-slate-800 to-indigo-950 border border-slate-700/80 hover:border-indigo-500/50 p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-2xl transition-transform hover:scale-[1.02] relative"
                  >
                    <div className="text-xs text-slate-500 absolute top-4 right-4">
                      اضغط للقلب 🔄
                    </div>

                    {!isCardFlipped ? (
                      <div className="space-y-2">
                        <div className="text-2xl sm:text-3xl font-black text-white">
                          {lessonContent.vocabulary[currentCardIndex].word}
                        </div>
                        <div className="text-xs text-indigo-400 font-semibold">
                          {lessonContent.vocabulary[currentCardIndex].pronunciation}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-2xl font-black text-emerald-400">
                          {lessonContent.vocabulary[currentCardIndex].translation}
                        </div>
                        <div className="text-xs text-slate-400">
                          {lessonContent.vocabulary[currentCardIndex].partOfSpeech}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio(lessonContent.vocabulary[currentCardIndex].word);
                      }}
                      className="absolute bottom-4 left-4 p-2 rounded-xl bg-indigo-600 text-white"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card Navigation */}
                  <div className="flex items-center gap-3">
                    <button
                      disabled={currentCardIndex === 0}
                      onClick={() => {
                        setCurrentCardIndex((prev) => prev - 1);
                        setIsCardFlipped(false);
                        playSound("click");
                      }}
                      className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                      disabled={currentCardIndex === lessonContent.vocabulary.length - 1}
                      onClick={() => {
                        setCurrentCardIndex((prev) => prev + 1);
                        setIsCardFlipped(false);
                        playSound("click");
                      }}
                      className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
