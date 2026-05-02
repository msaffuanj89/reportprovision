export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST only" });

  try {
    const { program = "", school = "", images = [] } = req.body || {};

    const content = [
      {
        type: "input_text",
        text: `
Anda ialah AI Vision untuk menulis laporan program sekolah.

Tugas:
1. Lihat gambar sebenar.
2. Tulis description gambar yang literal dan tepat.
3. Jangan guna ayat generic.
4. Jana isi laporan ringkas berdasarkan Program.

Program: ${program}
Sekolah: ${school}

Output mesti JSON sahaja:
{
  "issue":"",
  "intro":"",
  "objective":"",
  "target":"",
  "status":"",
  "outcome":"",
  "desc1":"",
  "desc2":"",
  "desc3":"",
  "desc4":"",
  "caption":""
}
`
      }
    ];

    images.slice(0, 4).forEach(img => {
      content.push({ type: "input_text", text: `Gambar slot ${img.slot}` });
      content.push({ type: "input_image", image_url: img.dataUrl });
    });

    const aiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [{ role: "user", content }],
        temperature: 0.2
      })
    });

    const data = await aiRes.json();

    if (!aiRes.ok) {
      return res.status(500).json({ error: data.error?.message || "OpenAI error" });
    }

    const text = data.output_text || "{}";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
