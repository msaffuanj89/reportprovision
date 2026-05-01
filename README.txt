REPORT PRO VISION V15 STABLE

Update V15:
1. Option A Smart Fallback ditambah.
2. Kalau AI Vision berjaya, description guna hasil AI.
3. Kalau AI Vision gagal / server tiada / API key tiada / buka index.html terus, description tidak kosong.
4. Fallback description ringkas:
   "Gambar menunjukkan satu situasi yang dirakam sebagai dokumentasi berkaitan [Program]."
5. Jika gambar tidak dimasukkan, description tetap kosong.
6. Tiada popup mengganggu.

Mode:
- AI Vision Ready: AI baca gambar sebenar.
- Offline Mode: guna template + smart fallback description.

Cara guna terbaik:
1. npm install
2. rename .env.example kepada .env
3. letak OPENAI_API_KEY
4. npm start
5. buka http://localhost:3000

Cara guna biasa:
- Buka index.html.
- Upload gambar.
- Tekan AI Generate Laporan.
- Description akan keluar menggunakan smart fallback.


UPDATE V16 WELCOME PAGE:
1. Welcoming page ditambah.
2. Logo menggunakan gambar yang dimuat naik tanpa diedit.
3. Teks kredit ditambah:
   "oleh Muhammad Saffuan bin Jaffar, IPG Kampus Pulau Pinang"
4. Teks kredit ada animasi halus dan saiz responsif.
5. Ada butang "Masuk ke Apps".
6. Auto masuk selepas 4.5 saat.
7. Sesuai upload ke GitHub kerana semua fail berada dalam folder yang sama.


UPDATE V17 ANIMATED CREDIT:
1. Teks credit disusun kepada 3 baris:
   oleh
   Muhammad Saffuan bin Jaffar
   IPG Kampus Pulau Pinang
2. Semua teks align center.
3. Setiap baris muncul satu demi satu dengan animasi fade-up.
4. Gambar/logo tidak diedit, hanya code diubah.
