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


UPDATE V22 ENTER FIX:
1. Masalah tidak boleh masuk ke page report diperbaiki.
2. Butang “Masuk ke Apps” kini ada fallback inline.
3. Welcoming page akan auto tutup selepas 6 saat.
4. Jika config.js atau AI backend ada error, user masih boleh masuk apps.


UPDATE V23 BUTTON FIX:
1. “Checking AI mode...” tidak akan stuck lama.
2. Jika backend lambat/offline, status akan tukar kepada Offline Mode.
3. Button AI Generate Laporan tetap boleh ditekan.
4. App tidak lagi menunggu AI health check untuk berfungsi.
5. Semasa generate, hanya button AI Generate ditukar kepada “Generating...”, bukan semua button dikunci.


UPDATE V24 HARD PDF FIX:
1. Generate PDF kini guna salinan khas PDF yang fixed size 1123x794.
2. Responsive screen scaling tidak lagi rosakkan PDF.
3. Page kosong/cover jatuh ke page lain diperbaiki.
4. Slider, input, button dan teks drag/zoom dibuang daripada PDF.
5. Gambar kosong dibuang daripada PDF.
6. Gambar kekal ratio, tidak stretch.


UPDATE V25 PHONE UI:
1. Paparan phone dikemaskan.
2. Form full-width, input dan textarea lebih selesa untuk taip.
3. Button utama sticky dan lebih mudah ditekan.
4. Preview page auto-scale ikut lebar phone dengan margin lebih kemas.
5. PhoneTabs lebih clean.
6. PDF export tidak terkesan dengan scaling phone.
