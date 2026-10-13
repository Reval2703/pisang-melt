# Pisang Melt — Static Vercel

Versi statis berbasis Vite + React. Tampilan dan struktur komponen frontend dipertahankan; server Express dan file konfigurasi rahasia tidak disertakan.

## Jalankan lokal
1. Install Node.js versi yang sesuai.
2. Jalankan `npm install`
3. Jalankan `npm run dev`
4. Untuk build produksi: `npm run build`

## Deploy ke Vercel
1. Ekstrak ZIP ini, lalu unggah folder project ke repository GitHub.
2. Import repository tersebut di Vercel.
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Deploy.

Catatan: versi statis tidak menjalankan backend/database. Fitur frontend yang menggunakan localStorage hanya tersimpan di browser/perangkat yang sama; panel admin tidak tersinkronisasi lintas pengguna/perangkat. Integrasi pembayaran online atau fitur yang memerlukan server perlu backend terpisah.
