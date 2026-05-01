REPORT PRO VISION V21 ONLINE READY

Tujuan:
- Frontend boleh host di GitHub Pages.
- AI backend boleh deploy di Vercel.
- GitHub Pages akan call Vercel backend melalui config.js.

LANGKAH DEPLOY AI ONLINE:

A. Deploy Backend ke Vercel
1. Buat akaun Vercel.
2. Upload folder project ini ke GitHub repo khas, contoh:
   report-pro-ai-backend
3. Di Vercel, Import Project daripada repo tersebut.
4. Dalam Vercel Project Settings > Environment Variables, tambah:
   OPENAI_API_KEY = sk-...
   OPENAI_MODEL = gpt-4.1
5. Deploy.
6. Salin domain Vercel, contoh:
   https://report-pro-ai.vercel.app

B. Sambung GitHub Pages Frontend
1. Buka file config.js.
2. Letak URL Vercel:
   window.REPORT_PRO_CONFIG = {
     API_BASE_URL: "https://report-pro-ai.vercel.app"
   };
3. Upload semua file frontend ke GitHub Pages repo.
4. Buka link GitHub Pages.
5. Status akan bertukar kepada AI Vision Ready jika backend aktif.

PENTING:
- Jangan letak OPENAI_API_KEY dalam config.js.
- API key mesti duduk di Vercel Environment Variables sahaja.
- GitHub Pages tidak boleh simpan API key dengan selamat kerana ia frontend statik.

Fail penting:
- index.html, style.css, script.js, config.js = frontend GitHub Pages
- api/vision-generate.js, api/health.js, vercel.json = backend Vercel
