export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "OPENAI_API_KEY belum diset di Vercel Environment Variables." });
    }

    const { title, institution, date, program, school, images } = req.body || {};

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

TUGAS:
1. Lihat setiap gambar secara literal.
2. Tulis description berdasarkan perkara yang benar-benar kelihatan.
3. Jangan paksa gambar dikaitkan dengan program jika visual tidak menunjukkan program.
4. Jana isi laporan berdasarkan Program + maklumat borang + gambar yang relevan sahaja.

MAKLUMAT:
Tajuk: ${title || ""}
Institusi: ${institution || ""}
Tarikh: ${date || ""}
Program: ${program || ""}
Sekolah: ${school || ""}

PERATURAN DESCRIPTION:
- Visual first, context second.
- Jika orang minum air, tulis orang sedang minum air.
- Jika kapal terbang, tulis kapal terbang di udara.
- Jika kelas, tulis suasana kelas.
- Jika murid angkat tangan, tulis murid mengangkat tangan.
- Jangan guna ayat generic seperti "evidens sokongan program" jika tidak jelas.
- Jangan sebut nama fail.
- Jangan teka identiti orang.
- Jika slot gambar tiada, kosongkan description.

ISI LAPORAN:
- Bahasa Melayu formal.
- Padat untuk satu page landscape.
- Sesuai untuk laporan IPG/sekolah.

Output JSON sahaja:
issue, intro, objective, target, status, outcome, desc1, desc2, desc3, desc4, caption.`
      }
    ];

    for (const img of images.slice(0, 4)) {
      if (img?.dataUrl) {
        content.push({ type: "input_text", text: `Ini gambar untuk slot ${img.slot}.` });
        content.push({ type: "input_image", image_url: img.dataUrl, detail: "high" });
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
        input: [{ role: "user", content }],
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
      return res.status(response.status).json({ error: raw?.error?.message || "Ralat OpenAI API." });
    }

    const text = raw.output_text || raw.output?.flatMap(o => o.content || []).filter(c => c.type === "output_text").map(c => c.text).join("\n") || "";
    const parsed = JSON.parse(text);

    for (let i = 1; i <= 4; i++) {
      const hasImage = images.some(img => Number(img.slot) === i);
      if (!hasImage) parsed[`desc${i}`] = "";
    }

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Ralat server." });
  }
}
