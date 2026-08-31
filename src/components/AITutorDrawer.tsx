import React, { useState, useRef, useEffect } from "react";
import { Language, Stage } from "../types";
import { speakText, playSound } from "../utils/audio";
import {
  Bot,
  Send,
  X,
  Volume2,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Flame,
  Check,
  RefreshCw,
} from "lucide-react";

interface AITutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentStage: Stage;
}

interface Message {
  id: string;
  sender: "user" | "tutor";
  text: string;
  timestamp: string;
}

export const AITutorDrawer: React.FC<AITutorDrawerProps> = ({
  isOpen,
  onClose,
  language,
  currentStage,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "tutor",
      text: `مرحباً بك! أنا معلمك الذكي لتعلم لغة "${language.name}". أنا هنا لمساعدتك في شرح أي قاعدة، أو ترجمة أي جملة، أو ممارسة محادثة تفاعلية معك في المرحلة ${currentStage.stageNumber} ("${currentStage.title}"). كيف يمكنني مساعدتك اليوم؟`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    `اشرح لي أهم كلمات المرحلة ${currentStage.stageNumber}`,
    `أعطني محادثة نموذجية في لغة ${language.name}`,
    `كيف أنطق الحروف الصعبة في ${language.name}؟`,
    `اختبرني بسؤال سريع في هذه المرحلة`,
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);
    playSound("click");

    try {
      const res拼 = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          languageName: language.name,
          languageNative: language.nativeName,
          stageNumber: currentStage.stageNumber,
          stageTitle: currentStage.title,
          history: messages.slice(-6),
        }),
      });

      if (res拼.ok) {
        const json = await res拼.json();
        const tutorMsg: Message = {
          id: `tutor_${Date.now()}`,
          sender: "tutor",
          text: json.reply || `أحسنت! استمر في التمرن على لغة ${language.name}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, tutorMsg]);
      } else {
        throw new Error("Server error");
      }
    } catch (e) {
      const fallbackMsg: Message = {
        id: `tutor_${Date.now()}`,
        sender: "tutor",
        text: `في لغة ${language.name} (${language.nativeName})، العبارة الأساسية للترحيب هي: "${language.sampleGreeting.phrase}" وتعني "${language.sampleGreeting.translation}". تدرب عليها جيداً في المرحلة ${currentStage.stageNumber}!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-full sm:w-96 md:w-[440px] bg-[#111827] border-r border-slate-800 shadow-2xl flex flex-col animate-slide-in">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 bg-[#111827] backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Bot className="w-6 h-6 text-cyan-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white">معلم اللغات AI</h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                متصل
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              مرشدك لتعلم {language.name} ({language.flag})
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

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm relative group ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-[#1E293B] border border-slate-700/80 text-[#F8FAFC] rounded-bl-none"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Audio Playback for Tutor messages */}
              {msg.sender === "tutor" && (
                <button
                  onClick={() => speakText(msg.text, "ar-SA")}
                  title="استمع للإجابة"
                  className="mt-2 text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1 text-[11px]"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>استماع</span>
                </button>
              )}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 bg-[#1E293B] p-3 rounded-2xl w-fit border border-slate-700">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>المعلم يفكر ويكتب الإجابة...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0A0C10]/40 overflow-x-auto scrollbar-none flex gap-2">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-3.5 py-1.5 rounded-full bg-[#1E293B] hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-3 bg-[#111827] border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder={`اسأل أي شيء حول لغة ${language.name}...`}
          className="flex-1 bg-[#1E293B] border border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isTyping}
          className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
