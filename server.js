import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json({ limit: "35mb" }));
app.use(express.static(__dirname));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    visionReady: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || "gpt-4.1"
  });
});

function extractOutputText(responseJson) {
  if (typeof responseJson.output_text === "string") return responseJson.output_text;

  const chunks = [];
  for (const item of responseJson.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) chunks.push(content.text);
    }
  }
  return chunks.join("\n");
}

app.post("/api/vision-generate", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: "OPENAI_API_KEY belum diset. Letak API key dalam fail .env, kemudian run npm start semula."
      });
    }

    const { title, institution, date, program, school, images, imageHints } = req.body || {};

    if (!program || !String(program).trim()) {
      return res.status(400).json({ error: "Sila isi kotak Program dahulu." });
    }

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "Sila upload sekurang-kurangnya satu gambar." });
    }

    const content = [
      {
        type: "input_text",
        text:
`Anda ialah sistem AI Vision untuk laporan rasmi pendidikan.

TUGAS UTAMA:
1. Lihat setiap gambar secara literal.
2. Tulis description gambar berdasarkan apa yang BENAR-BENAR KELIHATAN.
3. Jangan paksa gambar dikaitkan dengan program jika visual tidak menunjukkan program.
4. Selepas itu, jana isi laporan berdasarkan Program + maklumat borang + gambar yang relevan sahaja.

MAKLUMAT BORANG:
Tajuk: ${title || ""}
Institusi: ${institution || ""}
Tarikh: ${date || ""}
Program: ${program || ""}
Sekolah: ${school || ""}

PERATURAN KETAT DESCRIPTION GAMBAR:
- Visual first, context second.
- Tulis perkara literal yang jelas.
- Jika gambar menunjukkan orang minum air, tulis: "Gambar menunjukkan seorang individu sedang memegang minuman dan minum menggunakan straw."
- Jika gambar menunjukkan kapal terbang, tulis: "Gambar menunjukkan sebuah kapal terbang di udara."
- Jika gambar menunjukkan beberapa individu duduk di meja, tulis sesi perbincangan hanya jika memang kelihatan seperti mesyuarat/perbincangan.
- Jika gambar menunjukkan murid membuat aktiviti, tulis aktiviti murid.
- Jika gambar menunjukkan portrait atau suasana santai, tulis begitu.
- Jangan guna ayat generic seperti "aktiviti utama program", "menyokong fokus pelaksanaan program", "evidens sokongan program", atau "dokumentasi program" kecuali ada visual yang jelas menyokongnya.
- Jangan sebut nama fail gambar.
- Jangan teka identiti orang.
- Jika catatan pengguna ada, gunakan sebagai bantuan. Jika catatan tiada, bergantung kepada visual sahaja.
- Jika slot gambar tiada, kosongkan description slot tersebut.

PERATURAN ISI LAPORAN:
- Isi laporan boleh dikaitkan dengan Program.
- Padat supaya muat dalam satu page landscape.
- Bahasa Melayu formal.
- Sesuai untuk laporan IPG/sekolah.
- Jika Program ialah Karnival Matematik, tekankan usaha menarik minat murid terhadap Matematik melalui aktiviti yang menyeronokkan dan mencabar minda.
- Jangan masukkan perkara daripada gambar yang tidak relevan kepada program ke dalam isi utama laporan.

Output JSON sahaja dengan medan:
issue, intro, objective, target, status, outcome, desc1, desc2, desc3, desc4, caption.`
      }
    ];

    for (const img of images.slice(0, 4)) {
      if (img?.dataUrl) {
        content.push({
          type: "input_text",
          text: `Ini gambar untuk slot ${img.slot}. Tiada catatan tambahan..`
        });
        content.push({
          type: "input_image",
          image_url: img.dataUrl,
          detail: "high"
        });
      }
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1",
        input: [
          {
            role: "user",
            content
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "report_fields",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                issue: { type: "string" },
                intro: { type: "string" },
                objective: { type: "string" },
                target: { type: "string" },
                status: { type: "string" },
                outcome: { type: "string" },
                desc1: { type: "string" },
                desc2: { type: "string" },
                desc3: { type: "string" },
                desc4: { type: "string" },
                caption: { type: "string" }
              },
              required: ["issue","intro","objective","target","status","outcome","desc1","desc2","desc3","desc4","caption"]
            }
          }
        },
        temperature: 0.1,
        max_output_tokens: 1600
      })
    });

    const raw = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: raw?.error?.message || "Ralat OpenAI API."
      });
    }

    const text = extractOutputText(raw);
    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: "AI memberi output tidak sah. Cuba tekan AI Generate Laporan sekali lagi.",
        raw: text
      });
    }

    // Final safety: no image slot => empty desc.
    for (let i = 1; i <= 4; i++) {
      const hasImage = images.some(img => Number(img.slot) === i);
      if (!hasImage) parsed[`desc${i}`] = "";
    }

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message || "Ralat server." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Report Pro Vision V12 Clean running at http://localhost:${port}`);
});
