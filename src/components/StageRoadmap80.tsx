import React, { useState } from "react";
import { Language, Stage, UserGlobalProgress } from "../types";
import { TIERS, STAGES_80 } from "../data/stageRoadmap";
import { playSound } from "../utils/audio";
import {
  Lock,
  CheckCircle2,
  Star,
  Trophy,
  Sparkles,
  Play,
  Award,
  BookOpen,
  Volume2,
  ChevronLeft,
  Flame,
  Globe2,
  Clock,
  Layers,
  ArrowUpRight,
  Target,
  BarChart3,
  Users,
  Smartphone,
} from "lucide-react";

interface StageRoadmap80Props {
  currentLanguage: Language;
  userProgress: UserGlobalProgress;
  onSelectStage: (stage: Stage) => void;
  onOpenLanguageSelector: () => void;
  onOpenDiplomas: () => void;
  onOpenApkModal?: () => void;
}

export const StageRoadmap80: React.FC<StageRoadmap80Props> = ({
  currentLanguage,
  userProgress,
  onSelectStage,
  onOpenLanguageSelector,
  onOpenDiplomas,
  onOpenApkModal,
}) => {
  const [selectedTierFilter, setSelectedTierFilter] = useState<number | "all">("all");

  const langProg = userProgress.languages[currentLanguage.id] || {
    completedStages: {},
    earnedXp: 0,
    currentStageId: 1,
    learnedWords: [],
  };

  const completedStagesMap = langProg.completedStages || {};
  const completedCount = Object.keys(completedStagesMap).length;
  const progressPercent = Math.round((completedCount / 80) * 100);

  // Get current active stage object
  const currentStageNumber = langProg.currentStageId || 1;
  const currentActiveStage =
    STAGES_80.find((s) => s.stageNumber === currentStageNumber) || STAGES_80[0];

  // Get the next 3 stages in sequence for the Bento roadmap preview node line
  const previewStages = STAGES_80.slice(
    Math.max(0, currentStageNumber - 1),
    Math.max(0, currentStageNumber - 1) + 4
  );

  // Group stages by tier
  const tiersWithStages = TIERS.map((tier) => {
    const stages = STAGES_80.filter((s) => s.tierIndex === tier.index);
    const tierCompletedCount = stages.filter((s) => !!completedStagesMap[s.stageNumber]).length;
    return {
      ...tier,
      stages,
      completedCount: tierCompletedCount,
      isFullyCompleted: tierCompletedCount === stages.length,
    };
  });

  const visibleTiers =
    selectedTierFilter === "all"
      ? tiersWithStages
      : tiersWithStages.filter((t) => t.index === selectedTierFilter);

  const totalWordsLearned =
    (langProg.learnedWords && langProg.learnedWords.length > 0)
      ? langProg.learnedWords.length
      : Math.max(completedCount * 12, 14);

  const totalHoursTrained = (completedCount * 0.4 + 1.2).toFixed(1);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Bento Grid Header Dashboard */}
      <div className="grid grid-cols-12 gap-6">
        {/* Bento Box 1: Main Journey & Active Step Roadmap (Spans 8 cols on desktop) */}
        <div className="col-span-12 lg:col-span-8 bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-xl">
          {/* Top Title & Level info */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl sm:text-4xl p-2 rounded-2xl bg-[#1E293B] border border-slate-700 shadow-inner">
                  {currentLanguage.flag}
                </span>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    رحلة اللغة {currentLanguage.name}
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                    {currentActiveStage.tierTitle} • المرحلة {currentStageNumber} من 80
                  </p>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right flex items-center sm:block gap-3">
              <span className="text-indigo-400 font-mono text-xl sm:text-2xl font-bold">
                {progressPercent}٪ اكتمل
              </span>
              <div className="text-xs text-slate-500 font-medium hidden sm:block">
                {completedCount} من 80 مرحلة
              </div>
            </div>
          </div>

          {/* Interactive Bento Step Pathway with Glowing Active Node */}
          <div className="my-6 py-4 px-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center justify-between min-w-[500px] sm:min-w-0">
              {previewStages.map((stg, idx) => {
                const isCurrent = stg.stageNumber === currentStageNumber;
                const isDone = !!completedStagesMap[stg.stageNumber];
                const isFuture = !isCurrent && !isDone;

                return (
                  <React.Fragment key={stg.stageNumber}>
                    {/* Step Node */}
                    <div
                      onClick={() => {
                        playSound("click");
                        onSelectStage(stg);
                      }}
                      className={`relative flex flex-col items-center group cursor-pointer transition-all duration-200 ${
                        isFuture && idx > 1 ? "opacity-60 hover:opacity-100" : ""
                      }`}
                    >
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-105 ${
                          isCurrent
                            ? "bg-indigo-600 border-4 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                            : isDone
                            ? "bg-emerald-600 border-4 border-emerald-400 text-white shadow-md shadow-emerald-500/20"
                            : "bg-slate-800 border-4 border-slate-700 text-slate-300 group-hover:border-indigo-500/50"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-7 h-7 text-white" />
                        ) : (
                          <span>{stg.stageNumber}</span>
                        )}
                      </div>

                      {/* Sub-label for stage */}
                      <div className="mt-3 text-center max-w-[110px]">
                        <span
                          className={`text-xs font-semibold line-clamp-1 ${
                            isCurrent
                              ? "text-indigo-300 font-bold"
                              : isDone
                              ? "text-emerald-300"
                              : "text-slate-400 group-hover:text-slate-200"
                          }`}
                        >
                          {stg.title.split(":")[1]?.trim() || stg.title}
                        </span>
                      </div>
                    </div>

                    {/* Connecting line between nodes */}
                    {idx < previewStages.length - 1 && (
                      <div className="flex-1 h-1 bg-slate-800 rounded-full mx-2 sm:mx-4" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Bottom Progress Bar & Quick Actions */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-2/3">
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(progressPercent, 4)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                onClick={onOpenLanguageSelector}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-1.5"
              >
                <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>تغيير اللغة</span>
              </button>
              <button
                onClick={onOpenDiplomas}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-amber-400 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>الأوسمة</span>
              </button>
              {onOpenApkModal && (
                <button
                  onClick={onOpenApkModal}
                  title="تنزيل وتثبيت التطبيق على الهاتف"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold border border-emerald-500/40 transition-all flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>APK / الهاتف</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bento Box 2: Today's Challenge (Spans 4 cols on desktop) */}
        <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-2xl shadow-inner border border-white/10">
              🎯
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">تحدي اليوم</h3>
            <p className="text-indigo-200 text-sm leading-relaxed">
              أكمل المرحلة {currentStageNumber} ("{currentActiveStage.title}") اليوم لتحصل على ضعف نقاط الـ XP ومكافأة نادرة في مسار {currentLanguage.name}!
            </p>
          </div>

          <button
            onClick={() => {
              playSound("click");
              onSelectStage(currentActiveStage);
            }}
            id="btn-start-daily-challenge"
            className="w-full bg-white text-indigo-950 font-bold py-4 rounded-2xl hover:bg-indigo-50 transition-colors text-lg mt-6 shadow-xl flex items-center justify-center gap-2 group"
          >
            <span>ابدأ التحدي الآن</span>
            <ArrowUpRight className="w-5 h-5 text-indigo-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Bento Box 3: Learning Stats */}
        <div className="col-span-12 md:col-span-4 bg-[#111827] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-lg">
          <h3 className="font-bold text-slate-400 mb-4 flex items-center gap-2">
            <span>📊</span>
            <span>إحصائيات التعلم</span>
          </h3>
          <div className="space-y-3.5">
            <div className="flex justify-between items-center p-3.5 bg-slate-800/40 rounded-xl border border-slate-800/60">
              <span className="text-slate-300 text-sm font-medium">الكلمات المكتسبة</span>
              <span className="font-bold text-xl text-white font-mono">{totalWordsLearned}</span>
            </div>
            <div className="flex justify-between items-center p-3.5 bg-slate-800/40 rounded-xl border border-slate-800/60">
              <span className="text-slate-300 text-sm font-medium">ساعات التدريب</span>
              <span className="font-bold text-xl text-white font-mono">{totalHoursTrained}</span>
            </div>
            <div className="flex justify-between items-center p-3.5 bg-slate-800/40 rounded-xl border border-slate-800/60">
              <span className="text-slate-300 text-sm font-medium">دقة الإجابات</span>
              <span className="font-bold text-xl text-emerald-400 font-mono">94%</span>
            </div>
          </div>
        </div>

        {/* Bento Box 4: Leaderboard */}
        <div className="col-span-12 md:col-span-4 bg-[#111827] border border-slate-800 rounded-3xl p-6 flex items-center gap-5 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-3xl flex-shrink-0">
            🏆
          </div>
          <div>
            <h4 className="font-bold text-lg text-white mb-1">المتصدرين</h4>
            <p className="text-slate-400 text-xs sm:text-sm leading-snug">
              أنت حالياً في المركز الخامس في الدوري الذهبي لمتعلمي {currentLanguage.name}
            </p>
          </div>
        </div>

        {/* Bento Box 5: Language Exchange & Live Community */}
        <div className="col-span-12 md:col-span-4 bg-[#111827] border border-slate-800 rounded-3xl p-6 flex items-center gap-5 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-3xl flex-shrink-0">
            🌐
          </div>
          <div>
            <h4 className="font-bold text-lg text-white mb-1">تبادل اللغات</h4>
            <p className="text-slate-400 text-xs sm:text-sm leading-snug">
              هناك 12 متحدثاً أصلياً متصلين الآن للممارسة والمحادثة التفاعلية
            </p>
          </div>
        </div>
      </div>

      {/* Tier Quick Navigator Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-4">
        <button
          onClick={() => setSelectedTierFilter("all")}
          className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
            selectedTierFilter === "all"
              ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30"
              : "bg-[#1E293B] text-slate-300 hover:bg-slate-800 hover:text-white border-slate-700"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>كافة المستويات الـ 8 (1 - 80)</span>
        </button>

        {tiersWithStages.map((tier) => (
          <button
            key={tier.index}
            onClick={() => setSelectedTierFilter(tier.index)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
              selectedTierFilter === tier.index
                ? "bg-indigo-600 text-white border-indigo-400 shadow-md"
                : "bg-[#1E293B] text-slate-300 hover:bg-slate-800 hover:text-white border-slate-700"
            }`}
          >
            <span>المستوى {tier.index}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                tier.isFullyCompleted
                  ? "bg-emerald-500/30 text-emerald-300 font-bold"
                  : "bg-slate-900/60 text-slate-400"
              }`}
            >
              {tier.completedCount}/10
            </span>
          </button>
        ))}
      </div>

      {/* Tiers Sections and Stage Cards in Bento Style */}
      <div className="space-y-12">
        {visibleTiers.map((tier) => (
          <section key={tier.index} className="space-y-4">
            {/* Tier Header Banner */}
            <div
              className={`p-6 sm:p-7 rounded-3xl bg-gradient-to-r ${tier.bgGradient} text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10`}
            >
              {/* Pattern overlay */}
              <div className="absolute inset-0 bg-[#0A0C10]/25 backdrop-blur-[1px]" />

              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-black/40 backdrop-blur-md text-xs font-black tracking-wider uppercase border border-white/20">
                    {tier.subtitle}
                  </span>
                  <span className="text-xs font-bold text-white/90">
                    {tier.stageRange}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black">{tier.title}</h2>
                <p className="text-xs sm:text-sm text-white/80 max-w-2xl">
                  {tier.description}
                </p>
              </div>

              {/* Progress Count in Tier */}
              <div className="relative z-10 flex items-center gap-3 self-start sm:self-center bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
                <div className="text-right">
                  <div className="text-[11px] text-white/70 font-semibold">
                    المراحل المكتملة
                  </div>
                  <div className="text-sm font-black text-white">
                    {tier.completedCount} من 10 مراحل
                  </div>
                </div>
                {tier.isFullyCompleted ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-300" />
                ) : (
                  <div className="w-7 h-7 rounded-full border-2 border-white/40 flex items-center justify-center text-xs font-bold">
                    {Math.round((tier.completedCount / 10) * 100)}%
                  </div>
                )}
              </div>
            </div>

            {/* Grid of 10 Stages in this Tier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {tier.stages.map((stage) => {
                const stageRecord = completedStagesMap[stage.stageNumber];
                const isCompleted = !!stageRecord;
                const isCurrent =
                  langProg.currentStageId === stage.stageNumber ||
                  (!isCompleted && stage.stageNumber === 1);

                return (
                  <div
                    key={stage.stageNumber}
                    onClick={() => {
                      playSound("click");
                      onSelectStage(stage);
                    }}
                    className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative ${
                      isCompleted
                        ? "bg-[#111827] hover:bg-[#1E293B] border-emerald-500/40 hover:border-emerald-500 shadow-sm"
                        : isCurrent
                        ? "bg-[#111827] border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/20"
                        : "bg-[#111827]/70 hover:bg-[#1E293B]/70 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Top Row: Stage Number & Status Icons */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                              isCompleted
                                ? "bg-emerald-500 text-white"
                                : isCurrent
                                ? "bg-indigo-600 text-white animate-pulse"
                                : "bg-[#1E293B] text-slate-300"
                            }`}
                          >
                            {stage.stageNumber}
                          </span>
                          {stage.isCheckpoint && (
                            <span
                              title="مرحلة امتحان وتقييم شامل"
                              className="p-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            >
                              <Trophy className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        {/* Star Rating if completed */}
                        {isCompleted && (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map((starIdx) => (
                              <Star
                                key={starIdx}
                                className={`w-3.5 h-3.5 ${
                                  starIdx <= (stageRecord.stars || 1)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-600"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Stage Title */}
                      <h3
                        className={`text-sm font-extrabold line-clamp-2 leading-snug mb-1 group-hover:text-indigo-300 transition-colors ${
                          isCompleted
                            ? "text-[#F8FAFC]"
                            : isCurrent
                            ? "text-white"
                            : "text-slate-300"
                        }`}
                      >
                        {stage.title}
                      </h3>

                      {/* Grammar / Focus preview */}
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {stage.targetGrammar}
                      </p>
                    </div>

                    {/* Footer Info & Action Button */}
                    <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{stage.estimatedMinutes} د</span>
                      </span>

                      <div className="flex items-center gap-1 font-bold">
                        <span className="text-indigo-400 font-mono">+{stage.xpReward}</span>
                        <span className="text-slate-500 text-[10px]">XP</span>
                      </div>
                    </div>

                    {/* Hover indicator arrow */}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-4 h-4 text-indigo-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
