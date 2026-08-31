import React, { useState } from "react";
import { Language, UserGlobalProgress } from "../types";
import { GLOBAL_BADGES } from "../data/badges";
import {
  Award,
  Trophy,
  X,
  Sparkles,
  Star,
  CheckCircle2,
  Lock,
  Download,
  Share2,
  Crown,
  Printer,
  Footprints,
  MessageSquare,
  Compass,
  Plane,
  Flame,
  GraduationCap,
  Zap,
} from "lucide-react";

interface PolyglotDiplomaModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  progress: UserGlobalProgress;
}

export const PolyglotDiplomaModal: React.FC<PolyglotDiplomaModalProps> = ({
  isOpen,
  onClose,
  language,
  progress,
}) => {
  const [activeTab, setActiveTab] = useState<"diploma" | "badges">("diploma");
  const [userName, setUserName] = useState("المتعلم المتميز");

  if (!isOpen) return null;

  const langProg = progress.languages[language.id] || {
    completedStages: {},
    earnedXp: 0,
    currentStageId: 1,
  };
  const completedCount = Object.keys(langProg.completedStages).length;
  const progressPercent = Math.round((completedCount / 80) * 100);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "Footprints":
        return <Footprints className="w-5 h-5" />;
      case "Award":
        return <Award className="w-5 h-5" />;
      case "MessageSquare":
        return <MessageSquare className="w-5 h-5" />;
      case "Compass":
        return <Compass className="w-5 h-5" />;
      case "Plane":
        return <Plane className="w-5 h-5" />;
      case "Flame":
        return <Flame className="w-5 h-5" />;
      case "Sparkles":
        return <Sparkles className="w-5 h-5" />;
      case "GraduationCap":
        return <GraduationCap className="w-5 h-5" />;
      case "Crown":
        return <Crown className="w-5 h-5" />;
      case "Zap":
        return <Zap className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const handlePrintDiploma = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0A0C10]/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                لوحة الأوسمة وشهادة إتقان الـ 80 مرحلة
              </h2>
              <p className="text-xs text-slate-400">
                شهادات معتمدة وميداليات الإنجاز في لغة {language.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-[#1E293B] text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800/60 bg-[#0A0C10]/40 flex items-center gap-2">
          <button
            onClick={() => setActiveTab("diploma")}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border ${
              activeTab === "diploma"
                ? "bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md shadow-amber-500/20"
                : "bg-[#1E293B] text-slate-300 hover:bg-slate-800 border-slate-700"
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>شهادة الإتقان الأكاديمي</span>
          </button>

          <button
            onClick={() => setActiveTab("badges")}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border ${
              activeTab === "badges"
                ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30"
                : "bg-[#1E293B] text-slate-300 hover:bg-slate-800 border-slate-700"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>الأوسمة والميداليات ({progress.badges.length}/{GLOBAL_BADGES.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "diploma" && (
            <div className="space-y-6">
              {/* Name Editor */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-300 font-semibold">
                  اكتب اسمك ليظهر على الشهادة الرسمية:
                </div>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="اسم المتعلم..."
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* The Certificate Canvas Design */}
              <div
                id="certificate-print-area"
                className="relative rounded-3xl bg-gradient-to-br from-amber-50 via-amber-100/80 to-amber-50 border-8 border-double border-amber-600 p-8 sm:p-12 text-slate-900 shadow-2xl text-center space-y-6 overflow-hidden"
              >
                {/* Decorative border corners */}
                <div className="absolute top-3 right-3 text-2xl text-amber-600 opacity-60">⚜️</div>
                <div className="absolute top-3 left-3 text-2xl text-amber-600 opacity-60">⚜️</div>
                <div className="absolute bottom-3 right-3 text-2xl text-amber-600 opacity-60">⚜️</div>
                <div className="absolute bottom-3 left-3 text-2xl text-amber-600 opacity-60">⚜️</div>

                {/* Header */}
                <div className="space-y-1">
                  <div className="text-xs font-black tracking-widest uppercase text-amber-800">
                    GLOBALLINGO WORLD LANGUAGE DIPLOMA
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-black text-slate-900 font-['Cairo']">
                    شهادة إنجاز واجتياز مراحل اللغة
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700">
                    تُمنح هذه الشهادة الرسمية تقديراً للاجتهاد والتفوق اللغوي
                  </p>
                </div>

                {/* Recipient Name */}
                <div className="py-2 border-b-2 border-amber-500/60 max-w-md mx-auto">
                  <span className="text-2xl sm:text-3xl font-black text-indigo-950">
                    {userName}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed max-w-xl mx-auto font-medium">
                  قد أكمل بنجاح واقتدار مراحل التعلم المقررة في منهاج الـ 80 مرحلة للغة{" "}
                  <strong className="text-indigo-900 text-base">
                    "{language.name}" ({language.nativeName})
                  </strong>
                  ، وأظهر تميزاً ملحوظاً في التحدث، والاستماع، والتراكيب النحوية، والمفردات اللغوية، واجتياز التقييمات الشاملة.
                </p>

                {/* Stats in Certificate */}
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
                  <div className="p-2.5 rounded-xl bg-amber-200/50 border border-amber-300">
                    <div className="text-[11px] text-slate-600">المراحل المنجزة</div>
                    <div className="text-base font-black text-slate-900">
                      {completedCount} / 80
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-200/50 border border-amber-300">
                    <div className="text-[11px] text-slate-600">النقاط الكلية</div>
                    <div className="text-base font-black text-indigo-900">
                      {langProg.earnedXp} XP
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-200/50 border border-amber-300">
                    <div className="text-[11px] text-slate-600">نسبة التقدم</div>
                    <div className="text-base font-black text-emerald-800">
                      {progressPercent}%
                    </div>
                  </div>
                </div>

                {/* Signatures & Seal */}
                <div className="pt-4 flex items-center justify-between border-t border-amber-300 max-w-lg mx-auto text-xs text-slate-700">
                  <div>
                    <div className="font-bold">تاريخ الإصدار</div>
                    <div>{new Date().toLocaleDateString("ar-EG")}</div>
                  </div>

                  <div className="w-16 h-16 rounded-full bg-amber-500/20 border-4 border-amber-600 flex items-center justify-center text-amber-800 font-black text-xs shadow-inner">
                    ختم الاعتماد
                  </div>

                  <div>
                    <div className="font-bold">أكاديمية اللغات</div>
                    <div>GlobalLingo AI</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handlePrintDiploma}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة أو حفظ كملف PDF</span>
                </button>
              </div>
            </div>
          )}

          {/* Badges Tab */}
          {activeTab === "badges" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {GLOBAL_BADGES.map((badge) => {
                const isUnlocked = progress.badges.includes(badge.id);

                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isUnlocked
                        ? "bg-slate-800/90 border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/20"
                        : "bg-slate-900/40 border-slate-800 opacity-60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                            isUnlocked
                              ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                              : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          {getBadgeIcon(badge.icon)}
                        </div>

                        {isUnlocked ? (
                          <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="p-1 rounded-full bg-slate-800 text-slate-600">
                            <Lock className="w-4 h-4" />
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-sm text-white mb-1">
                        {badge.title}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-700/40 text-[11px] font-semibold text-slate-400">
                      {isUnlocked ? (
                        <span className="text-amber-400 font-bold">مكتمل ومُفعّل ✨</span>
                      ) : (
                        <span>يتطلب: {badge.requiredValue} في المقياس</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
