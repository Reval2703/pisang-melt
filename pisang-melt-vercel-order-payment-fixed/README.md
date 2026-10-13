# Pisang Melt — Static Vercel

Project frontend Pisang Melt berbasis Vite + React. Tampilan utama dipertahankan, jalur gambar produksi diperbaiki, dan checkout menggunakan WhatsApp agar pesanan dapat dikirim langsung ke admin tanpa memanggil endpoint `/api/orders` yang tidak tersedia pada hosting statis.

## Fitur pemesanan dan pembayaran

- Pelanggan memilih menu, jumlah, data kontak, alamat/pickup, dan metode pembayaran.
- Tombol **Kirim Pesanan ke WhatsApp** membuka chat admin dengan detail pesanan, subtotal, diskon, ongkir, total, kontak, alamat, dan metode pembayaran.
- Metode pembayaran yang ditampilkan: QRIS, transfer BCA, transfer Mandiri, dan COD.
- Untuk QRIS/transfer, pelanggan diminta meminta detail resmi dari admin melalui WhatsApp. Tidak ada nomor rekening atau QRIS palsu yang ditampilkan.
- Untuk COD, pelanggan mengonfirmasi pesanan dan membayar tunai saat pesanan diterima.
- Tombol konfirmasi pembayaran membuka WhatsApp. Website tidak otomatis menandai pembayaran sebagai lunas; admin harus memeriksa bukti pembayaran.
- Status pesanan di website bersifat lokal di browser. Status tidak tersinkron otomatis ke perangkat admin karena project ini tidak menyertakan backend/database.

## Penting sebelum digunakan pelanggan sungguhan

Nomor WhatsApp yang digunakan saat ini adalah `6281330608974`. Pastikan nomor ini benar-benar milik admin Pisang Melt. Jika berbeda, ganti nomor tersebut pada komponen yang menggunakan tautan WhatsApp, lalu build ulang.

Nomor rekening dan QRIS resmi belum dikonfigurasi. Admin harus mengirimkan detail pembayaran langsung lewat WhatsApp. Jangan menganggap pembayaran telah diterima hanya karena pelanggan membuka tautan WhatsApp.

## Jalankan lokal

1. Install Node.js versi LTS.
2. Buka terminal pada folder project.
3. Jalankan `npm install`.
4. Jalankan `npm run dev` untuk mencoba website.
5. Jalankan `npm run build` untuk membuat build produksi.

## Deploy ke Vercel

1. Ekstrak ZIP project.
2. Upload **isi folder project** ke repository GitHub, sehingga `package.json`, `src/`, `public/`, dan `vercel.json` berada di root repository.
3. Di Vercel, import repository GitHub tersebut.
4. Pada **Settings → Build and Deployment**, set **Root Directory** ke root repository (`./` atau kosong). Jangan isi `pisang-melt-static-vercel` kecuali memang ada folder bernama itu yang berisi `package.json`.
5. Gunakan pengaturan:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Deploy.

## Checklist pengujian setelah deploy

1. Buka website di HP dan desktop, lalu pastikan foto produk terlihat.
2. Tambahkan produk ke keranjang.
3. Isi nama, nomor WhatsApp, serta alamat jika memilih kurir.
4. Pilih QRIS, transfer, atau COD.
5. Tekan **Kirim Pesanan ke WhatsApp**. Pastikan chat terbuka dengan rincian pesanan yang benar.
6. Buka tab status pesanan, lalu coba **Minta Detail Pembayaran ke Admin** untuk QRIS/transfer atau **Konfirmasi Pesanan ke Admin** untuk COD.
7. Pastikan website tidak menampilkan status “lunas” otomatis.

## Batasan versi statis

Tidak ada API/backend/database pada build ini. Penyimpanan lokal seperti keranjang, poin, dan pesanan aktif hanya berlaku pada browser/perangkat yang sama. Untuk dashboard admin lintas perangkat, penyimpanan pesanan terpusat, atau verifikasi pembayaran otomatis, perlu backend dan database terpisah.
