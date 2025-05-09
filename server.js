const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
const port = 3000;

// OpenAI API key burada .env dosyanda olmalı
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // index.html, css, js vs sunabilsin

// Dil kodu -> dil adı eşlemesi (çeviri için)
function getLanguageName(code) {
  const map = {
    en: "İngilizce",
    de: "Almanca",
    fr: "Fransızca",
    es: "İspanyolca",
    it: "İtalyanca",
    ru: "Rusça",
    zh: "Çince",
    ar: "Arapça"
  };
  return map[code] || code;
}

app.post("/fix", async (req, res) => {
  const { text, lang } = req.body;

  let prompt;
  if (lang === "tr") {
    prompt = "Aşağıdaki Türkçe metni yalnızca yazım ve dil bilgisi açısından düzelt. Anlamı değiştirme, yeni cümle ekleme veya çıkarma. Sadece düzeltilmiş metni ver.";
  } else if (lang === "en") {
    prompt = "Correct the following English text only for grammar and spelling mistakes. Do not change the meaning or add/remove sentences. Only return the corrected text.";
  } else {
    prompt = `Lütfen aşağıdaki metni ${getLanguageName(lang)} diline çevir. Yalnızca çeviri çıktısı ver, başka açıklama yazma.`;
  }

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4o", // dilersen gpt-3.5-turbo da kullanabilirsin
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: text }
      ]
    });

    res.json({ result: chat.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI API hatası:", err);
    res.status(500).json({ error: "OpenAI API isteği başarısız oldu." });
  }
});

app.listen(port, () => {
  console.log(`✅ Sunucu çalışıyor: http://localhost:${port}`);
});