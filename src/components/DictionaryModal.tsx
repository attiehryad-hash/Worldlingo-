import React, { useState } from "react";
import { Language, UserGlobalProgress } from "../types";
import { speakText, playSound } from "../utils/audio";
import {
  BookMarked,
  Search,
  Volume2,
  X,
  Sparkles,
  Bookmark,
  Layers,
  Trash2,
} from "lucide-react";

interface DictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  progress: UserGlobalProgress;
  onRemoveBookmark?: (word: string) => void;
}

export const DictionaryModal: React.FC<DictionaryModalProps> = ({
  isOpen,
  onClose,
  language,
  progress,
  onRemoveBookmark,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const langProg = progress.languages[language.id] || {
    learnedWords: [],
  };

  const learnedWordsList = langProg.learnedWords || [];
  const bookmarkedWordsList = progress.bookmarkedWords || [];

  // Filter words
  const filteredLearned = learnedWordsList.filter((w) =>
    w.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0A0C10]/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookMarked className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                قاموس مفردات لغة {language.name}
              </h2>
              <p className="text-xs text-slate-400">
                مفرداتك المكتسبة والمحفوظة أثناء التقدم في الـ 80 مرحلة
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

        {/* Search */}
        <div className="p-4 sm:p-6 pb-3 border-b border-slate-800/60 bg-[#0A0C10]/40">
          <div className="relative">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الكلمات المكتسبة..."
              className="w-full bg-[#1E293B] border border-slate-700 rounded-2xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Words List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {filteredLearned.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#1E293B] border border-slate-700 flex items-center justify-center mx-auto text-slate-500">
                <BookMarked className="w-8 h-8" />
              </div>
              <p className="text-sm text-slate-400">
                لم يتم تسجيل كلمات بعد. ابدأ التعلم في المراحل لإثراء قاموسك الشخصي!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredLearned.map((word, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#1E293B]/70 border border-slate-700/60 flex items-center justify-between hover:border-indigo-500/40 transition-colors"
                >
                  <div className="text-right">
                    <div className="text-base font-black text-white">{word}</div>
                    <div className="text-xs text-slate-400">مفردة معتمدة للممارسة</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playSound("click");
                        speakText(word, language.bcp47);
                      }}
                      className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
