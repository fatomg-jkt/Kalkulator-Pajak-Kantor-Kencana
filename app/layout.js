import './globals.css';

export const metadata = {
  title: 'Kalkulator Pajak Indonesia',
  description: 'Kalkulator PPh 21, PPN, dan PPh Final UMKM berdasarkan ketentuan pajak Indonesia yang diverifikasi per 19 Agustus 2026.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
