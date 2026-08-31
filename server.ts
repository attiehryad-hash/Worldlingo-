import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI if key exists
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", aiAvailable: !!process.env.GEMINI_API_KEY });
});

// AI Stage Content Generator Endpoint
app.post("/api/stage/generate", async (req, res) => {
  try {
    const { languageName, languageNative, stageNumber, stageTitle, tierTitle } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.status(200).json({
        fallback: true,
        message: "AI key not configured; using local curriculum engine.",
      });
    }

    const prompt = `
أنت خبير عالمي في تعليم اللغات واللسانيات.
المطلوب: توليد محتوى تعليمي تفاعلي دقيق وممتع للمرحلة رقم ${stageNumber} من أصل 80 مرحلة لتعلم لغة "${languageName}" (${languageNative}).
المستوى الحالي: ${tierTitle}.
عنوان المرحلة: ${stageTitle}.

قم بالرد بصيغة JSON فقط بالهيكل التالي:
{
  "summary": "ملخص مشوق للمرحلة في سطرين باللغة العربية",
  "vocabulary": [
    {
      "word": "الكلمة باللغة الهدف",
      "translation": "الترجمة بالعربية",
      "pronunciation": "النطق الصوتي أو الكتابة الصوتية بالحروف اللاتينية/العربية",
      "partOfSpeech": "اسم/فعل/صفة/حرف",
      "exampleSentence": "جملة نموذجية باللغة الهدف",
      "exampleTranslation": "ترجمة الجملة بالعربية"
    }
  ],
  "grammarRules": [
    {
      "title": "عنوان القاعدة النحوية أو التركيب اللغوي",
      "explanation": "شرح واضح ومبسط بالعربية",
      "examples": [
        {
          "source": "المثال باللغة الهدف",
          "target": "الترجمة بالعربية",
          "tip": "ملاحظة أو نصيحة ذكية"
        }
      ]
    }
  ],
  "culturalInsight": {
    "title": "عنوان المعلومة الثقافية",
    "content": "نص المعلومة الثقافية المرتبطة بالمرحلة ولغة المتحدثين بها",
    "funFact": "حقيقة ممتعة وسريعة"
  },
  "dialogue": [
    {
      "speaker": "اسم المتحدث (مثلاً: سارة)",
      "text": "النص باللغة الهدف",
      "translation": "الترجمة بالعربية"
    },
    {
      "speaker": "اسم المتحدث الثاني (مثلاً: أحمد)",
      "text": "النص باللغة الهدف",
      "translation": "الترجمة بالعربية"
    }
  ],
  "exercises": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "سؤال باللغة العربية",
      "targetPhrase": "العبارة المستهدفة إن وجدت",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      "correctAnswer": "الإجابة الصحيحة بالضبط من ضمن الخيارات",
      "explanation": "تفسير مختصر لسبب صحة الإجابة"
    },
    {
      "id": 2,
      "type": "arrange_words",
      "question": "رتب الكلمات لتكوين جملة صحيحة تعني: [المعنى بالعربية]",
      "words": ["كلمة 1", "كلمة 2", "كلمة 3", "كلمة 4"],
      "correctSentence": "الجملة الصحيحة باللغة الهدف مرتبة",
      "explanation": "شرح الترتيب الصحيح"
    },
    {
      "id": 3,
      "type": "translate",
      "question": "اختر الترجمة الصحيحة للعبارة التالية",
      "targetPhrase": "عبارة باللغة الهدف",
      "options": ["ترجمة 1", "ترجمة 2", "ترجمة 3", "ترجمة 4"],
      "correctAnswer": "الترجمة العربية الصحيحة",
      "explanation": "توضيح سياقي"
    },
    {
      "id": 4,
      "type": "pair_match",
      "question": "طابق الكلمات في لغة ${languageName} مع معانيها بالعربية",
      "pairs": [
        { "source": "كلمة أ", "target": "معنى أ" },
        { "source": "كلمة ب", "target": "معنى ب" },
        { "source": "كلمة ج", "target": "معنى ج" },
        { "source": "كلمة د", "target": "معنى د" }
      ]
    },
    {
      "id": 5,
      "type": "listening",
      "question": "استمع إلى العبارة واختر معناها الصحيح بالعربية",
      "spokenText": "العبارة باللغة الهدف لنطقها صوتياً",
      "options": ["خيار 1", "خيار 2", "خيار 3"],
      "correctAnswer": "الخيار الصحيح",
      "explanation": "شرح المعنى"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text || "{}";
    const parsed = JSON.parse(jsonText);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error generating stage content:", error);
    res.status(500).json({ error: error.message || "Failed to generate stage content" });
  }
});

// AI Tutor Interactive Chat
app.post("/api/tutor/chat", async (req, res) => {
  try {
    const { message, languageName, languageNative, stageNumber, stageTitle, history } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.status(200).json({
        reply: `مرحباً بك! أنا مرشدك الذكي لتعلم لغة ${languageName}. استمر في التدرب وحل تمارين المرحلة ${stageNumber}! (ملاحظة: يمكنك إرفاق مفتاح Gemini لتفعيل المحادثات المتقدمة).`,
      });
    }

    const systemInstruction = `
أنت "بوليغلوت AI" - معلم ومرشد ذكي ولطيف لتعليم لغات العالم للناطقين باللغة العربية.
المستخدم يتعلم حالياً لغة: "${languageName}" (${languageNative}).
المرحلة الحالية التي يدرسها: المرحلة ${stageNumber} بعنوان "${stageTitle}".
قواعدك الأساسية:
1. أجب بلباقة وتشجيع كبير وبأسلوب تربوي ممتع ومحفز.
2. قدم الشرح دائماً بالعربية مع أمثلة واضحة باللغة الهدف (${languageName}) مع كتابة النطق الصوتي التقريبي بين قوسين.
3. إذا طلب المستخدم ممارسة محادثة أو ترجمة، تفاعل معه فوراً مع تصحيح الأخطاء اللطيف إن وجدت.
4. حافظ على الإيجاز والوضوح والتنسيق الجميل بنقاط منسقة.
`;

    const chatHistory = Array.isArray(history)
      ? history.map((h: any) => `${h.sender === "user" ? "المتعلم" : "المعلم"}: ${h.text}`).join("\n")
      : "";

    const userPrompt = `${chatHistory}\nالمتعلم: ${message}\nالمعلم:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || "عفواً، يرجى إعادة المحاولة." });
  } catch (error: any) {
    console.error("AI Tutor error:", error);
    res.status(500).json({ error: error.message || "Tutor error" });
  }
});

// Speech / Pronunciation Evaluation
app.post("/api/evaluate-speech", async (req, res) => {
  try {
    const { targetPhrase, userTranscribedText, languageName } = req.body;
    const ai = getGenAI();

    if (!ai) {
      const match =
        (userTranscribedText || "").trim().toLowerCase() ===
        (targetPhrase || "").trim().toLowerCase();
      return res.json({
        score: match ? 95 : 75,
        feedback: match
          ? "نطق ممتاز ومطابق تماماً للعبارة!"
          : "محاولة جيدة، استمر في الاستماع وتكرار مخارج الحروف.",
        accuracy: match ? "ممتاز" : "جيد",
      });
    }

    const prompt = `
قم بتقييم نطق الطالب في لغة ${languageName}.
العبارة المستهدفة: "${targetPhrase}"
ما قاله الطالب / النص المسجل: "${userTranscribedText}"

أعط تقييماً دقيقاً ومشجعاً بصيغة JSON:
{
  "score": رقم من 0 إلى 100,
  "accuracy": "ممتاز / جيد جداً / يحتاج تدريب",
  "feedback": "ملاحظة تشجيعية بالعربية مع نصيحة لمخارج الحروف",
  "phoneticTips": "نصائح صوتية لنطق الحروف الصعبة في هذه العبارة"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Speech eval error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GlobalLingo Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
