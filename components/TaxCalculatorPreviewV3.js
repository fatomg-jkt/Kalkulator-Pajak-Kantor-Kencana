'use client';

import { useEffect, useMemo, useState } from 'react';
import TaxCalculatorPreviewV2 from './TaxCalculatorPreviewV2';

const regulationSources = {
  'PP 58/2023, PMK 168/2023 & PER-11/PJ/2025': [
    { label: 'PP 58 Tahun 2023', url: 'https://jdih.kemenkeu.go.id/dok/pp-58-tahun-2023' },
    { label: 'PMK 168 Tahun 2023', url: 'https://jdih.kemenkeu.go.id/dok/pmk-168-tahun-2023' },
    { label: 'PER-11/PJ/2025', url: 'https://www.pajak.go.id/id/peraturan/ketentuan-pelaporan-pajak-penghasilan-pajak-pertambahan-nilai-pajak-penjualan-atas-0' }
  ],
  'PMK 131/2024': [
    { label: 'PMK 131 Tahun 2024', url: 'https://jdih.kemenkeu.go.id/dok/pmk-131-tahun-2024' }
  ],
  'PP 20/2026': [
    { label: 'PP 20 Tahun 2026', url: 'https://jdih.kemenkeu.go.id/dok/pp-20-tahun-2026' }
  ],
  'Coretax & PMK 81/2024': [
    { label: 'PMK 81 Tahun 2024', url: 'https://jdih.kemenkeu.go.id/dok/pmk-81-tahun-2024' },
    { label: 'PMK 1 Tahun 2026', url: 'https://jdih.kemenkeu.go.id/dok/pmk-1-tahun-2026' }
  ]
};

export default function TaxCalculatorPreviewV3() {
  const [dialog, setDialog] = useState(null);

  const dialogTitle = useMemo(() => dialog?.title || 'Peraturan resmi', [dialog]);

  useEffect(() => {
    const onClick = (event) => {
      const card = event.target.closest?.('.law-card');
      if (!card) return;

      const title = card.querySelector('strong')?.textContent?.trim();
      const sources = regulationSources[title];
      if (!sources?.length) return;

      if (sources.length === 1) {
        window.open(sources[0].url, '_blank', 'noopener,noreferrer');
        return;
      }

      setDialog({ title, sources });
    };

    const onKeyDown = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const card = event.target.closest?.('.law-card');
      if (!card) return;
      event.preventDefault();
      card.click();
    };

    const prepareCards = () => {
      document.querySelectorAll('.law-card').forEach((card) => {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', 'Buka peraturan resmi terkait');
      });
    };

    prepareCards();
    const observer = new MutationObserver(prepareCards);
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <>
      <TaxCalculatorPreviewV2 />

      <style>{`
        .law-card {
          cursor: pointer;
          position: relative;
          transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
        }
        .law-card:hover,
        .law-card:focus-visible {
          transform: translateY(-2px);
          box-shadow: 0 28px 58px rgba(15, 74, 57, .24);
          outline: 2px solid rgba(255,255,255,.72);
          outline-offset: 3px;
        }
        .law-card::after {
          content: 'Buka peraturan resmi  ↗';
          display: inline-block;
          margin-top: 16px;
          padding-top: 11px;
          border-top: 1px solid rgba(255,255,255,.18);
          width: 100%;
          color: rgba(255,255,255,.92);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .04em;
        }
        .regulation-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(10, 18, 15, .62);
          backdrop-filter: blur(5px);
        }
        .regulation-dialog {
          width: min(470px, 100%);
          padding: 24px;
          border-radius: 20px;
          background: #fffdf8;
          color: #17201c;
          box-shadow: 0 30px 80px rgba(0,0,0,.24);
        }
        .regulation-dialog h3 {
          margin: 5px 0 8px;
          font: 500 27px/1.08 Georgia, serif;
        }
        .regulation-dialog p {
          margin: 0 0 18px;
          color: #68716c;
          font-size: 12px;
          line-height: 1.55;
        }
        .regulation-link-list {
          display: grid;
          gap: 9px;
        }
        .regulation-link-list a {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 13px 14px;
          border: 1px solid #d8d2c6;
          border-radius: 12px;
          background: white;
          color: #0f4a39;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
        }
        .regulation-link-list a:hover {
          border-color: #7fa795;
          background: #f2f7f4;
        }
        .regulation-close {
          width: 100%;
          margin-top: 14px;
          padding: 11px 14px;
          border: 0;
          border-radius: 11px;
          background: #17201c;
          color: white;
          font-weight: 800;
        }
      `}</style>

      {dialog && (
        <div className="regulation-overlay" role="presentation" onMouseDown={() => setDialog(null)}>
          <section
            className="regulation-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={dialogTitle}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="eyebrow">Sumber resmi</div>
            <h3>{dialogTitle}</h3>
            <p>Pilih peraturan yang ingin dibuka. Dokumen akan dibuka di tab baru dari situs resmi pemerintah.</p>
            <div className="regulation-link-list">
              {dialog.sources.map((source) => (
                <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">
                  <span>{source.label}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
            <button className="regulation-close" type="button" onClick={() => setDialog(null)}>
              Tutup
            </button>
          </section>
        </div>
      )}
    </>
  );
}
