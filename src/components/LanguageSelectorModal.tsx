import React, { useState } from "react";
import { Language, UserGlobalProgress } from "../types";
import { WORLD_LANGUAGES } from "../data/languages";
import { speakText } from "../utils/audio";
import {
  Search,
  Volume2,
  X,
  Sparkles,
  Check,
  Compass,
  Users,
  Layers,
  PlusCircle,
  ArrowLeft,
} from "lucide-react";

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguageId: string;
  onSelectLanguage: (language: Language) => void;
  userProgress: UserGlobalProgress;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLanguageId,
  onSelectLanguage,
  userProgress,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [customLangName, setCustomLangName] = useState("");
  const [customLangNative, setCustomLangNative] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);

  if (!isOpen) return null;

  const regions = [
    { id: "all", name: "جميع لغات العالم" },
    { id: "asia", name: "🌏 آسيا والمحيط الهادئ" },
    { id: "europe", name: "🇪🇺 أوروبا" },
    { id: "africa_me", name: "🌍 الشرق الأوسط وإفريقيا" },
    { id: "americas", name: "🌎 الأمريكتين والشعوب الأصلية" },
    { id: "classical", name: "🏛️ لغات كلاسيكية وتاريخية" },
  ];

  const filteredLanguages = WORLD_LANGUAGES.filter((lang) => {
    const matchesSearch =
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.family.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = selectedRegion === "all" || lang.region === selectedRegion;

    return matchesSearch && matchesRegion;
  });

  const handleAddCustomLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLangName.trim()) return;

    const newLang: Language = {
      id: `custom_${Date.now()}`,
      name: customLangName.trim(),
      nativeName: customLangNative.trim() || customLangName.trim(),
      englishName: customLangName.trim(),
      flag: "🌐",
      script: "حسب النظام المعتمد",
      bcp47: "en-US",
      region: "classical",
      regionName: "لغة مخصصة",
      family: "عالمية مخصصة",
      difficultyLevel: 3,
      speakersCount: "متحدثون حول العالم",
      description: `لغة تم تخصيصها لمسار الـ 80 مرحلة مع توليد الدروس الفورية بالذكاء الاصطناعي.`,
      totalStages: 80,
      sampleGreeting: {
        phrase: `مرحباً بك في لغة ${customLangName}!`,
        translation: "تحية البداية للمرحلة 1",
        pronunciation: "Salute",
      },
      accentColor: "from-indigo-600 to-purple-800",
      badgeIcon: "Sparkles",
    };

    onSelectLanguage(newLang);
    setShowCustomModal(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0C10]/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-[#111827]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                اختر لغة من لغات العالم (80 مرحلة)
              </h2>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                {WORLD_LANGUAGES.length}+ لغة متوفرة
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              اختر لغتك المفضلة لبدء رحلة التعلم الشاملة عبر 80 مرحلة ممتعة وتفاعلية
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-[#1E293B] text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Region Filter Bars */}
        <div className="p-4 sm:p-6 pb-2 space-y-3 bg-[#0A0C10]/40 border-b border-slate-800/60">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم العربي، الإنجليزي، أو الرموز الأصلية (مثل: اليابانية، Spanish، Français...)"
              className="w-full bg-[#1E293B] border border-slate-700 rounded-2xl pr-12 pl-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            {regions.map((reg) => (
              <button
                key={reg.id}
                onClick={() => setSelectedRegion(reg.id)}
                className={`px-3.5 py-2 rounded-full font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  selectedRegion === reg.id
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30"
                    : "bg-[#1E293B] text-slate-300 hover:bg-slate-800 hover:text-white border-slate-700"
                }`}
              >
                {reg.name}
              </button>
            ))}
          </div>
        </div>

        {/* Languages Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLanguages.map((lang) => {
            const isSelected = lang.id === currentLanguageId;
            const langProg = userProgress.languages[lang.id];
            const completedCount = langProg ? Object.keys(langProg.completedStages).length : 0;

            return (
              <div
                key={lang.id}
                onClick={() => {
                  onSelectLanguage(lang);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#1E293B] border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10"
                    : "bg-[#111827] hover:bg-[#1E293B]/80 border-slate-800 hover:border-slate-700 shadow-sm"
                }`}
              >
                <div>
                  {/* Top Row: Flag, Name, Active Badge */}
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-1 bg-[#0A0C10]/60 rounded-xl border border-slate-800">
                        {lang.flag}
                      </span>
                      <div>
                        <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                          <span>{lang.name}</span>
                          {isSelected && (
                            <span className="p-1 rounded-full bg-indigo-500 text-white">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">
                          {lang.nativeName}
                        </p>
                      </div>
                    </div>

                    {/* Difficulty Dots */}
                    <div className="flex items-center gap-0.5" title={`مستوى الصعوبة: ${lang.difficultyLevel} من 5`}>
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`w-1.5 h-3 rounded-full ${
                            lvl <= lang.difficultyLevel
                              ? "bg-amber-400"
                              : "bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Description & Speakers */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                    {lang.description}
                  </p>

                  {/* Sample Greeting & Audio Button */}
                  <div className="p-2.5 rounded-xl bg-[#0A0C10]/60 border border-slate-800 flex items-center justify-between mb-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-indigo-300">
                        {lang.sampleGreeting.phrase}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {lang.sampleGreeting.translation}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(lang.sampleGreeting.phrase, lang.bcp47);
                      }}
                      title="استمع للنطق الصوتي"
                      className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>80 مرحلة</span>
                  </span>
                  <span className="font-semibold text-slate-300">
                    {completedCount > 0 ? (
                      <span className="text-emerald-400 font-bold">
                        أكملت {completedCount} مرحلة
                      </span>
                    ) : (
                      <span>لم تبدأ بعد</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: Custom Language Generator Option */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              هل تبحث عن لغة نادرة أو لهجة محددة غير موجودة بالقائمة؟
            </span>
          </div>

          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs sm:text-sm hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة أي لغة مخصصة بـ 80 مرحلة</span>
          </button>
        </div>
      </div>

      {/* Custom Language Sub-Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>إضافة مسار 80 مرحلة للغة جديدة</span>
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomLanguage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسم اللغة بالعربية *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الإيسلندية، الفنلندية، الماورية..."
                  value={customLangName}
                  onChange={(e) => setCustomLangName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسم اللغة بحروفها الأصلية (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: Íslenska / Te Reo Māori"
                  value={customLangNative}
                  onChange={(e) => setCustomLangNative(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-800/40 text-xs text-indigo-200">
                ⚡ سيقوم المحرك الذكي بتوليد منهج متكامل من 80 مرحلة فوراً مع تمارين تفاعلية وقواعد مخصصة.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-md"
                >
                  بدء مسار الـ 80 مرحلة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
