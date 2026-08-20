import './globals.css';

export const metadata = {
  title: 'Kalkulator Pajak Kantor Kencana',
  description: 'Kalkulator PPh 21, PPN, PPh Final UMKM, dan PPh Unifikasi untuk membantu perhitungan pajak Kantor Kencana.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
