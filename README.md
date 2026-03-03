# 💰 Dana Kita - Solusi Finansial Bersama

**Dana Kita** adalah aplikasi manajemen keuangan dan tabungan yang dirancang khusus untuk mengelola target finansial secara mandiri maupun bersama pasangan (Household sharing). Aplikasi ini membantu Anda memantau setiap rupiah yang ditabung untuk mencapai impian jangka panjang.

## ✨ Fitur Utama

- **🎯 Manajemen Target**: Buat target tabungan spesifik (misal: Menikah, Rumah, Dana Darurat) lengkap dengan nominal, kategori, dan tenggat waktu.
- **💸 Pencatatan Transaksi**: Catat uang masuk (menabung) dan keluar (penarikan) dengan riwayat yang rapi.
- **🤝 Partner Sharing (Household)**: Hubungkan profil dengan pasangan untuk memantau progress tabungan secara real-time di satu dashboard yang sama.
- **⏳ Simulasi Tercapai**: Kalkulator otomatis untuk menghitung berapa bulan lagi target Anda tercapai berdasarkan kemampuan menabung per bulan.
- **📊 Export Data**: Unduh laporan transaksi dalam format Excel atau PDF untuk pencatatan offline.
- **🔔 Notifikasi Pengingat**: Pengingat harian agar Anda tidak lupa menyisihkan tabungan.
- **🌐 Offline & Sync**: Data tersimpan secara lokal saat belum login dan otomatis sinkron ke cloud setelah login dengan Firebase.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore & Auth)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utility**: `date-fns`, `zod`, `exceljs`, `jspdf`

## 📦 Instalasi

1. Clone repositori:
   ```bash
   git clone https://github.com/derryl06/danakita.git
   cd danakita
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

3. Konfigurasi Environment Variables (`.env.local`):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```

## 🛠️ Pengembangan
Untuk menjalankan linting dan memeriksa kualitas kode:
```bash
npm run lint
```

---
Dibuat dengan ❤️ untuk membantu rencana masa depan Anda.
