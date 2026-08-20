'use client';

import { useMemo, useState } from 'react';
import {
  PTKP,
  calculateAnnualPph21,
  calculateMonthlyPph21,
  calculateUmkmFinal,
  calculateVat,
  formatRupiah
} from '../lib/tax';

const taxTabs = [
  { id: 'pph21', label: 'PPh 21' },
  { id: 'ppn', label: 'PPN' },
  { id: 'umkm', label: 'PPh Final UMKM' }
];

function MoneyInput({ label, value, onChange, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="money-input">
        <span>Rp</span>
        <input
          inputMode="numeric"
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
        />
      </div>
      {hint && <small>{hint}</small>}
    </label>
  );
}

function ResultLine({ label, value, strong = false, note }) {
  return (
    <div className={`result-line ${strong ? 'strong' : ''}`}>
      <div>
        <span>{label}</span>
        {note && <small>{note}</small>}
      </div>
      <b>{value}</b>
    </div>
  );
}

function Pph21Calculator() {
  const [mode, setMode] = useState('monthly');
  const [grossMonthly, setGrossMonthly] = useState('10000000');
  const [status, setStatus] = useState('K/0');
  const [annualGross, setAnnualGross] = useState('120000000');
  const [pension, setPension] = useState('1200000');
  const [months, setMonths] = useState('12');
  const [priorWithheld, setPriorWithheld] = useState('2200000');

  const monthly = useMemo(() => calculateMonthlyPph21(grossMonthly, status), [grossMonthly, status]);
  const annual = useMemo(() => calculateAnnualPph21({
    annualGross,
    pensionContribution: pension,
    ptkpStatus: status,
    monthsWorked: months,
    priorWithheld
  }), [annualGross, pension, status, months, priorWithheld]);

  return (
    <div className="calculator-grid">
      <section className="panel form-panel">
        <div className="segmented">
          <button className={mode === 'monthly' ? 'active' : ''} onClick={() => setMode('monthly')}>Masa selain terakhir</button>
          <button className={mode === 'annual' ? 'active' : ''} onClick={() => setMode('annual')}>Masa pajak terakhir</button>
        </div>

        <label className="field">
          <span>Status PTKP</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.keys(PTKP).map((key) => <option key={key}>{key}</option>)}
          </select>
          <small>PTKP ditentukan dari kondisi pada awal tahun pajak.</small>
        </label>

        {mode === 'monthly' ? (
          <>
            <MoneyInput label="Penghasilan bruto bulan ini" value={grossMonthly} onChange={setGrossMonthly} hint="Untuk pegawai tetap pada masa pajak selain masa pajak terakhir." />
            <div className="info-box">
              TER bulanan langsung dikalikan dengan penghasilan bruto. Biaya jabatan, iuran pensiun, dan PTKP sudah diperhitungkan dalam desain TER.
            </div>
          </>
        ) : (
          <>
            <MoneyInput label="Penghasilan bruto setahun / bagian tahun" value={annualGross} onChange={setAnnualGross} />
            <MoneyInput label="Iuran pensiun/JHT yang boleh dikurangkan" value={pension} onChange={setPension} />
            <label className="field">
              <span>Jumlah bulan bekerja</span>
              <input type="number" min="1" max="12" value={months} onChange={(e) => setMonths(e.target.value)} />
              <small>Untuk batas biaya jabatan: 5% dari bruto, maksimum Rp500.000 per bulan.</small>
            </label>
            <MoneyInput label="PPh 21 yang sudah dipotong sebelum masa terakhir" value={priorWithheld} onChange={setPriorWithheld} />
          </>
        )}
      </section>

      <section className="panel result-panel">
        <div className="eyebrow">Hasil PPh 21</div>
        {mode === 'monthly' ? (
          <>
            <div className="hero-result">
              <span>PPh 21 masa ini</span>
              <strong>{formatRupiah(monthly.tax)}</strong>
            </div>
            <ResultLine label="Kategori TER" value={`Kategori ${monthly.category}`} />
            <ResultLine label="Tarif efektif" value={`${monthly.rate}%`} />
            <ResultLine label="Penghasilan bruto" value={formatRupiah(monthly.gross)} />
            <div className="formula">{formatRupiah(monthly.gross)} × {monthly.rate}% = {formatRupiah(monthly.tax)}</div>
          </>
        ) : (
          <>
            <div className="hero-result">
              <span>{annual.lastPeriodTax >= 0 ? 'PPh 21 masa pajak terakhir' : 'Kelebihan pemotongan'}</span>
              <strong>{formatRupiah(Math.abs(annual.lastPeriodTax))}</strong>
            </div>
            <ResultLine label="Biaya jabatan" value={formatRupiah(annual.positionExpense)} />
            <ResultLine label="Penghasilan neto" value={formatRupiah(annual.net)} />
            <ResultLine label="PTKP" value={formatRupiah(annual.ptkp)} />
            <ResultLine label="PKP dibulatkan ke bawah ribuan" value={formatRupiah(annual.pkp)} />
            <ResultLine label="PPh 21 setahun" value={formatRupiah(annual.annualTax)} strong />
            <ResultLine label="Sudah dipotong" value={formatRupiah(annual.priorWithheld)} />
            {annual.lastPeriodTax < 0 && <div className="warning-box">Nilai negatif berarti terjadi kelebihan pemotongan yang perlu ditindaklanjuti oleh pemotong pajak sesuai ketentuan.</div>}
          </>
        )}
      </section>
    </div>
  );
}

function VatCalculator() {
  const [kind, setKind] = useState('nonLuxury');
  const [inclusive, setInclusive] = useState(false);
  const [amount, setAmount] = useState('100000000');
  const result = useMemo(() => calculateVat({ amount, kind, inclusive }), [amount, kind, inclusive]);

  return (
    <div className="calculator-grid">
      <section className="panel form-panel">
        <label className="field">
          <span>Jenis transaksi</span>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="nonLuxury">BKP non-mewah / JKP umum</option>
            <option value="luxury">BKP mewah yang dikenai PPnBM</option>
          </select>
        </label>
        <label className="check-row">
          <input type="checkbox" checked={inclusive} onChange={(e) => setInclusive(e.target.checked)} />
          <span>Nilai yang saya masukkan sudah termasuk PPN</span>
        </label>
        <MoneyInput label={inclusive ? 'Nilai termasuk PPN' : 'Harga jual / penggantian sebelum PPN'} value={amount} onChange={setAmount} />
        <div className="info-box">
          {kind === 'nonLuxury'
            ? 'Untuk transaksi umum, PPN dihitung 12% × DPP nilai lain sebesar 11/12, sehingga beban efektifnya 11%.'
            : 'Untuk BKP mewah yang termasuk objek PPnBM, PPN menggunakan 12% dari harga jual/nilai impor. PPnBM tidak dihitung di modul ini karena tarifnya bergantung jenis barang.'}
        </div>
      </section>
      <section className="panel result-panel">
        <div className="eyebrow">Hasil PPN</div>
        <div className="hero-result">
          <span>PPN terutang</span>
          <strong>{formatRupiah(result.vat)}</strong>
        </div>
        <ResultLine label="Tarif efektif" value={`${Math.round(result.effectiveRate * 100)}%`} />
        <ResultLine label="Harga sebelum PPN" value={formatRupiah(result.preVat)} />
        <ResultLine label="DPP untuk penghitungan" value={formatRupiah(result.dpp)} note={kind === 'nonLuxury' ? '11/12 dari harga/penggantian' : 'Harga jual/nilai impor'} />
        <ResultLine label="Total setelah PPN" value={formatRupiah(result.total)} strong />
      </section>
    </div>
  );
}

function UmkmCalculator() {
  const [taxpayerType, setTaxpayerType] = useState('individual');
  const [priorYtd, setPriorYtd] = useState('450000000');
  const [currentMonth, setCurrentMonth] = useState('100000000');
  const [priorYearTurnover, setPriorYearTurnover] = useState('1000000000');
  const result = useMemo(() => calculateUmkmFinal({ taxpayerType, priorYtd, currentMonth }), [taxpayerType, priorYtd, currentMonth]);
  const eligibleByTurnover = (Number(priorYearTurnover) || 0) <= 4_800_000_000;

  const notes = {
    individual: 'WP orang pribadi: tarif final 0,5% dapat digunakan tanpa batas waktu sepanjang memenuhi kriteria PP 20/2026. Bagian omzet usaha sampai Rp500 juta setahun tidak dikenai PPh Final.',
    soleCompany: 'Perseroan perorangan 1 orang termasuk subjek yang dapat menggunakan tarif final 0,5% sepanjang memenuhi kriteria. Fasilitas omzet Rp500 juta tidak berlaku untuk badan.',
    cooperative: 'Koperasi tetap memiliki batas waktu dan ketentuan transisi. Pastikan tahun pendaftaran dan Surat Keterangan sebelum memakai hasil ini.',
    transition: 'CV, firma, PT non-perseroan perorangan, dan BUMDes/BUMDesma hanya dapat melanjutkan skema 0,5% bila masih berada dalam masa transisi PP 20/2026; entitas baru tidak termasuk subjek umum skema ini.'
  };

  return (
    <div className="calculator-grid">
      <section className="panel form-panel">
        <label className="field">
          <span>Jenis Wajib Pajak</span>
          <select value={taxpayerType} onChange={(e) => setTaxpayerType(e.target.value)}>
            <option value="individual">Orang Pribadi</option>
            <option value="soleCompany">Perseroan Perorangan (1 orang)</option>
            <option value="cooperative">Koperasi</option>
            <option value="transition">CV / Firma / PT biasa / BUMDes (transisi)</option>
          </select>
        </label>
        <MoneyInput label="Peredaran bruto tahun pajak sebelumnya" value={priorYearTurnover} onChange={setPriorYearTurnover} hint="Untuk uji batas agregat Rp4,8 miliar. Kasus suami-istri/perseroan perorangan dapat memerlukan penggabungan omzet." />
        <MoneyInput label="Omzet kumulatif tahun berjalan sebelum bulan ini" value={priorYtd} onChange={setPriorYtd} />
        <MoneyInput label="Omzet bulan ini" value={currentMonth} onChange={setCurrentMonth} />
        <div className={eligibleByTurnover ? 'info-box' : 'warning-box'}>
          {eligibleByTurnover ? 'Batas omzet tahun sebelumnya tidak melewati Rp4,8 miliar.' : 'Omzet tahun sebelumnya melewati Rp4,8 miliar. Skema PPh Final 0,5% pada umumnya tidak dapat digunakan untuk tahun ini.'}
        </div>
        <div className="mini-note">{notes[taxpayerType]}</div>
      </section>
      <section className="panel result-panel">
        <div className="eyebrow">Hasil PPh Final UMKM</div>
        <div className="hero-result">
          <span>PPh Final bulan ini</span>
          <strong>{eligibleByTurnover ? formatRupiah(result.tax) : 'Periksa kelayakan'}</strong>
        </div>
        <ResultLine label="Omzet bulan ini" value={formatRupiah(result.month)} />
        <ResultLine label="Omzet kumulatif setelah bulan ini" value={formatRupiah(result.after)} />
        <ResultLine label="Bagian omzet yang dikenai 0,5%" value={formatRupiah(result.taxableTurnover)} note={taxpayerType === 'individual' ? 'Setelah fasilitas Rp500 juta pertama' : 'Fasilitas Rp500 juta hanya untuk WP Orang Pribadi'} />
        {eligibleByTurnover && <ResultLine label="Tarif" value="0,5%" strong />}
      </section>
    </div>
  );
}

export default function TaxCalculator() {
  const [active, setActive] = useState('pph21');

  return (
    <main>
      <header className="topbar">
        <div className="brand-mark">KP</div>
        <div className="brand-copy">
          <b>Kalkulator Pajak</b>
          <span>Indonesia</span>
        </div>
        <div className="verified-pill">Aturan diverifikasi 19 Agustus 2026</div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Kalkulator pajak Indonesia</div>
          <h1>Hitung pajak dengan aturan yang lebih <em>terkini</em>.</h1>
          <p>PPh 21 berbasis TER, PPN 11% efektif untuk transaksi umum dan 12% untuk barang mewah, serta PPh Final UMKM dengan perubahan PP 20 Tahun 2026.</p>
        </div>
        <div className="law-card">
          <span>Update penting 2026</span>
          <strong>PP 20/2026</strong>
          <p>Skema PPh Final UMKM 0,5% diperbarui, termasuk perubahan subjek, batas waktu, agregasi omzet, dan ketentuan transisi.</p>
        </div>
      </section>

      <nav className="tabs" aria-label="Jenis kalkulator pajak">
        {taxTabs.map((tab) => (
          <button key={tab.id} className={active === tab.id ? 'active' : ''} onClick={() => setActive(tab.id)}>{tab.label}</button>
        ))}
      </nav>

      {active === 'pph21' && <Pph21Calculator />}
      {active === 'ppn' && <VatCalculator />}
      {active === 'umkm' && <UmkmCalculator />}

      <section className="sources panel">
        <div>
          <div className="eyebrow">Dasar aturan</div>
          <h2>Sumber resmi yang dipakai</h2>
        </div>
        <div className="source-list">
          <a href="https://jdih.kemenkeu.go.id/dok/pp-58-tahun-2023" target="_blank" rel="noreferrer"><b>PP 58 Tahun 2023</b><span>Tarif Efektif PPh 21 kategori A/B/C</span></a>
          <a href="https://jdih.kemenkeu.go.id/dok/pmk-168-tahun-2023" target="_blank" rel="noreferrer"><b>PMK 168 Tahun 2023</b><span>Pelaksanaan pemotongan PPh 21/26</span></a>
          <a href="https://jdih.kemenkeu.go.id/dok/pmk-131-tahun-2024" target="_blank" rel="noreferrer"><b>PMK 131 Tahun 2024</b><span>Perlakuan PPN 12% dan DPP nilai lain 11/12</span></a>
          <a href="https://jdih.kemenkeu.go.id/dok/pp-20-tahun-2026" target="_blank" rel="noreferrer"><b>PP 20 Tahun 2026</b><span>Perubahan aturan PPh Final UMKM</span></a>
        </div>
      </section>

      <footer>
        <p><b>Catatan:</b> Kalkulator ini membantu estimasi dan bukan pengganti bukti potong, aplikasi resmi DJP, atau penelaahan konsultan pajak. Kasus natura, penghasilan dari beberapa pemberi kerja, pekerjaan bebas, PPnBM, fasilitas khusus, transaksi lintas negara, dan ketentuan transisi tertentu dapat memerlukan analisis tambahan.</p>
      </footer>
    </main>
  );
}
