export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  return res.status(200).json({
    issue: "TEST AI ROUTE OK",
    intro: "Backend berjaya menerima request.",
    objective: "1. Uji sambungan backend.",
    target: "Testing.",
    status: "API vision-generate berjalan.",
    outcome: "Tiada error 500.",
    desc1: "Test description gambar 1 berjaya.",
    desc2: "",
    desc3: "",
    desc4: "",
    caption: ""
  });
}
