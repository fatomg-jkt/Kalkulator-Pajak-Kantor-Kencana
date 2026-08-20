# Kalkulator Pajak Indonesia

Website kalkulator pajak berbasis Next.js dengan fokus aturan Indonesia yang diverifikasi per 19 Agustus 2026.

## Modul

- PPh 21 pegawai tetap: TER bulanan kategori A/B/C dan rekonsiliasi Masa Pajak Terakhir.
- PPN: efektif 11% untuk BKP non-mewah/JKP umum melalui DPP nilai lain 11/12, serta 12% untuk BKP mewah yang dikenai PPnBM.
- PPh Final UMKM: tarif 0,5%, fasilitas omzet Rp500 juta untuk WP Orang Pribadi, dan catatan perubahan PP 20/2026.

## Menjalankan

```bash
npm install
npm run dev
```

Kemudian buka `http://localhost:3000`.

## Pengujian logika

```bash
npm test
```

## Dasar hukum utama

- PP 58 Tahun 2023 — Tarif PPh 21 / TER.
- PMK 168 Tahun 2023 — Pelaksanaan pemotongan PPh 21/26.
- PMK 131 Tahun 2024 — Perlakuan PPN 12% dan DPP nilai lain 11/12.
- PP 20 Tahun 2026 — Perubahan PP 55/2022 terkait PPh Final UMKM.

Kalkulator ini adalah alat bantu estimasi, bukan pengganti aplikasi resmi DJP atau penelaahan pajak profesional untuk kasus kompleks.
