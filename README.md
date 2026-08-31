# PolyLearn — بولي-ليرن (80 Stages Language Learning Platform)

منصة تعليمية ذكية وتفاعلية لتعلم جميع لغات العالم عبر 80 مرحلة منهجية لكل لغة، مع دعم كامل للويب وتطبيق أندرويد الأصلي (Android / Capacitor).

---

## 📱 محتويات المشروع (Project Structure)

- **`/src`**: الواجهات التفاعلية (React 19 + TypeScript + Tailwind CSS + Lucide Icons + Motion).
- **`/android`**: مشروع أندرويد الأصلي المتكامل (Android Studio Native Project with Gradle).
- **`capacitor.config.ts`**: إعدادات الربط مع نظام أندرويد وCapacitor.
- **`server.ts`**: خادم Express مع وكيل الذكاء الاصطناعي وواجهة البرمجة (API).
- **`public/manifest.json`**: إعدادات تطبيق الويب التقدمي (PWA).

---

## 🚀 التشغيل والتطوير (Local Development)

```bash
# تثبيت الاعتماديات
npm install

# تشغيل خادم التطوير
npm run dev
```

---

## 📦 بناء واستخراج تطبيق Android (APK)

```bash
# 1. بناء ملفات الويب ومزامنتها مع أندرويد
npm run cap:build:android

# 2. فتح المشروع داخل Android Studio
npm run cap:open:android
```

داخل **Android Studio**:
1. اختر من القائمة العلوية: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2. ستجد ملف الـ `app-debug.apk` أو `app-release.apk` جاهزاً للتثبيت الفوري على أي هاتف أندرويد.

---

## 🌐 التصدير إلى GitHub من Google AI Studio

1. اضغط على أيقونة **الإعدادات / القائمة (⚙️ Menu)** في الزاوية العلوية لمنصة Google AI Studio.
2. اختر **Export to GitHub** أو **Download ZIP**.
3. قم بربط حسابك على GitHub، وسيتم رفع كامل المشروع متضمناً مجلد `android/` وجميع الملفات التكوينية.
