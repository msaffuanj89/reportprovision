export default function handler(req, res) {
  return res.status(200).json({
    ok: true,
    visionReady: Boolean(process.env.OPENAI_API_KEY)
  });
}
