import React from "react";
import { Language, UserGlobalProgress } from "../types";
import {
  Globe2,
  Flame,
  Star,
  BookMarked,
  Award,
  Bot,
  ChevronDown,
  Sparkles,
  Smartphone,
} from "lucide-react";

interface NavbarProps {
  currentLanguage: Language;
  progress: UserGlobalProgress;
  onOpenLanguageSelector: () => void;
  onOpenDictionary: () => void;
  onOpenBadges: () => void;
  onToggleAITutor: () => void;
  isAITutorOpen: boolean;
  onOpenApkModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  progress,
  onOpenLanguageSelector,
  onOpenDictionary,
  onOpenBadges,
  onToggleAITutor,
  isAITutorOpen,
  onOpenApkModal,
}) => {
  const langProg = progress.languages[currentLanguage.id] || {
    completedStages: {},
    earnedXp: 0,
    currentStageId: 1,
  };
  const completedCount = Object.keys(langProg.completedStages).length;
  const progressPercent = Math.round((completedCount / 80) * 100);

  return (
    <header className="sticky top-0 z-30 bg-[#0A0C10]/95 backdrop-blur-md border-b border-slate-800 text-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/25">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-['Cairo'] text-white">
                بولي-ليرن <span className="text-indigo-400 font-sans font-semibold text-base sm:text-lg">| PolyLearn</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              مسار احتراف 80 مرحلة ذكية لجميع اللغات
            </p>
          </div>
        </div>

        {/* Language Switcher Trigger */}
        <button
          onClick={onOpenLanguageSelector}
          id="btn-language-selector"
          className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#1E293B] hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 transition-all text-sm font-semibold shadow-sm group"
        >
          <span className="text-2xl">{currentLanguage.flag}</span>
          <div className="text-right">
            <div className="text-[11px] text-slate-400 group-hover:text-indigo-300 transition-colors">
              اللغة الحالية
            </div>
            <div className="text-sm font-bold text-[#F8FAFC] flex items-center gap-1.5">
              <span>{currentLanguage.name}</span>
              <span className="text-xs font-normal text-slate-400">
                ({currentLanguage.nativeName.split(" ")[0]})
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-transform group-hover:translate-y-0.5" />
        </button>

        {/* User Stats & Navigation Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Total XP Pill */}
          <div
            title="نقاط الخبرة الإجمالية"
            className="bg-[#1E293B] px-3.5 sm:px-4 py-2 rounded-full border border-slate-700 flex items-center gap-2 text-xs sm:text-sm font-semibold"
          >
            <span className="text-yellow-400 text-base">⚡</span>
            <span className="font-bold text-[#F8FAFC]">
              {progress.totalXp.toLocaleString("ar-EG")} نقطة
            </span>
          </div>

          {/* Streak Counter Pill */}
          <div
            title="أيام الالتزام اليومي المتواصل"
            className="bg-[#1E293B] px-3.5 sm:px-4 py-2 rounded-full border border-slate-700 flex items-center gap-2 text-xs sm:text-sm font-semibold"
          >
            <span className="text-red-400 text-base">🔥</span>
            <span className="font-bold text-[#F8FAFC]">
              {progress.streakDays} يوم
            </span>
          </div>

          {/* Dictionary Trigger */}
          <button
            onClick={onOpenDictionary}
            id="btn-dictionary"
            title="قاموس الكلمات المحفوظة"
            className="p-2.5 rounded-2xl bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <BookMarked className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Badges & Diploma Trigger */}
          <button
            onClick={onOpenBadges}
            id="btn-badges-diploma"
            title="الأوسمة وشهادة البوليغلوت"
            className="p-2.5 rounded-2xl bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-amber-400 hover:text-amber-300 transition-colors"
          >
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* AI Tutor Floating Button */}
          <button
            onClick={onToggleAITutor}
            id="btn-ai-tutor"
            title="مرشد اللغات الذكي"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-md ${
              isAITutorOpen
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white ring-2 ring-indigo-400/50 shadow-indigo-500/30"
                : "bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200"
            }`}
          >
            <Bot className="w-4 h-4 text-cyan-300" />
            <span className="hidden sm:inline">معلم AI</span>
            <Sparkles className="w-3 h-3 text-amber-300" />
          </button>

          {/* APK / Mobile Install Trigger */}
          <button
            onClick={onOpenApkModal}
            id="btn-apk-download"
            title="تثبيت التطبيق على الهاتف / تحميل بصيغة APK"
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 text-xs font-bold transition-all shadow-sm group"
          >
            <Smartphone className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline font-mono font-bold">APK / تثبيت</span>
          </button>

          {/* User Profile Gradient Avatar */}
          <div
            title="الملف الشخصي"
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-slate-600 flex items-center justify-center font-bold text-xs text-white shadow-sm cursor-pointer hover:border-indigo-400 transition-colors"
          >
            GL
          </div>
        </div>
      </div>
    </header>
  );
};
