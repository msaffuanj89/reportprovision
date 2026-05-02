export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  return res.status(200).json({
    issue: "AI backend is working.",
    intro: "Connection successful.",
    objective: "1. Test backend connection.",
    target: "Testing only.",
    status: "Function is running.",
    outcome: "Backend is ready.",
    desc1: "",
    desc2: "",
    desc3: "",
    desc4: "",
    caption: ""
  });
}
