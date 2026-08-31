import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Download,
  X,
  ExternalLink,
  CheckCircle2,
  Copy,
  Layers,
  Sparkles,
  Terminal,
  ShieldCheck,
  Globe,
} from "lucide-react";

interface ApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const ApkExportModal: React.FC<ApkExportModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  if (!isOpen) return null;

  const currentUrl = appUrl || window.location.href;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        "لتثبيت التطبيق على هاتفك الآن:\n1. افتح الرابط في متصفح Chrome على هاتفك.\n2. اضغط على قائمة الخيارات (⋮) أعلى المتصفح.\n3. اختر 'تثبيت التطبيق' (Install App) أو 'إضافة إلى الشاشة الرئيسية'."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0A0C10]/85 backdrop-blur-md animate-fade-in font-['Cairo']">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  تحميل وتشغيل التطبيق على أندرويد (APK / App)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  Android & Web
                </span>
              </div>
              <p className="text-xs text-slate-400">
                طرق الحصول على التطبيق بصيغة APK أو تثبيته مباشرة على هاتفك
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-right">
          {/* Method 1: Instant Direct Installation (PWA) */}
          <div className="bg-[#1E293B]/70 border border-slate-700 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30">
                الطريقة الأسرع (بدون برامج)
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>1. التثبيت المباشر على الهاتف (تطبيق مستقل)</span>
                <span className="text-xl">⚡</span>
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              التطبيق مُجهّز كـ <strong>PWA (تطبيق ويب تقدمي)</strong> كامل الميزات. يمكنك تثبيته مباشرة على أي هاتف أندرويد ليعمل كأي تطبيق عادي بدون شريط المتصفح وبأيقونة مخصصة وسرعة فائقة.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handlePwaInstall}
                className="w-full sm:w-auto flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>تثبيت التطبيق على جهازي الآن</span>
              </button>

              <button
                onClick={handleCopyUrl}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2 text-xs"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">تم نسخ رابط التطبيق!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>نسخ رابط التطبيق لفتحه بالهاتف</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Method 2: Convert to APK via PWABuilder (1-Click) */}
          <div className="bg-[#1E293B]/70 border border-slate-700 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                توليد ملف APK جاهز
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>2. استخراج ملف APK عبر PWABuilder (مجاناً)</span>
                <span className="text-xl">📦</span>
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              أداة <strong>PWABuilder</strong> الرسمية من Microsoft تتيح لك تحويل رابط هذا التطبيق مباشرة إلى حزمة <strong>APK أو AAB</strong> جاهزة للتثبيت المباشر على أندرويد أو الرفع على متجر Google Play:
            </p>

            <ol className="text-xs sm:text-sm text-slate-300 space-y-2 list-decimal list-inside pr-2 leading-relaxed bg-[#0A0C10]/40 p-4 rounded-xl border border-slate-800">
              <li>انسخ رابط التطبيق من الأعلى.</li>
              <li>توجه إلى موقع <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-bold">PWABuilder.com</a>.</li>
              <li>الصق الرابط واضغط <strong>Start</strong>.</li>
              <li>اختر منصة <strong>Android</strong> واضغط <strong>Generate Package</strong> لتحميل ملف الـ APK فوراً.</li>
            </ol>

            <div className="pt-1">
              <a
                href="https://www.pwabuilder.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md"
              >
                <span>فتح موقع PWABuilder لإنشاء الـ APK</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Method 3: Local Build via Capacitor */}
          <div className="bg-[#1E293B]/70 border border-slate-700 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 font-bold text-xs border border-slate-700">
                للمطورين
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>3. بناء APK محلياً عبر Capacitor & Android Studio</span>
                <span className="text-xl">🛠️</span>
              </h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              يمكنك تصدير الكود المصدري عبر قائمة الإعدادات (Export to ZIP / GitHub) ثم تنفيذ الأوامر التالية لإنشاء تطبيق Android أصلي بالكامل:
            </p>

            <div className="bg-[#0A0C10] p-3.5 rounded-xl border border-slate-800 text-left font-mono text-xs text-indigo-300 space-y-1.5 overflow-x-auto" dir="ltr">
              <div className="text-slate-500"># 1. Install Capacitor</div>
              <div>npm install @capacitor/core @capacitor/cli @capacitor/android</div>
              <div className="text-slate-500 mt-2"># 2. Initialize and build project</div>
              <div>npx cap init PolyLearn com.polylearn.app</div>
              <div>npm run build</div>
              <div>npx cap add android</div>
              <div className="text-slate-500 mt-2"># 3. Open in Android Studio & Build APK</div>
              <div>npx cap open android</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#111827] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>متوافق مع جميع أجهزة أندرويد و iOS والمتصفحات الحديثة</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
