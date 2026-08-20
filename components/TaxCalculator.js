'use client';

import { useMemo, useState } from 'react';
import {
  PTKP,
  calculateAnnualPph21ByMethod,
  calculateMonthlyPph21ByMethod,
  calculateUmkmFinal,
  calculateVat,
  formatRupiah
} from '../lib/tax';

const taxTabs = [
  { id: 'pph21', label: 'PPh 21' },
  { id: 'ppn', label: 'PPN' },
  { id: 'umkm', label: 'PPh Final UMKM' },
  { id: 'unifikasi', label: 'PPh Unifikasi' }
];

const heroCards = {
  pph21: { kicker: 'PPh 21', title: 'TER & Gross Up', text: 'Hitung PPh 21 dengan metode Gross, Gross Up, atau Nett. Masa selain terakhir memakai TER, sedangkan masa pajak terakhir direkonsiliasi secara tahunan.' },
  ppn: { kicker: 'PPN', title: '11% / 12%', text: 'PPN transaksi umum dihitung efektif 11% melalui DPP nilai lain 11/12, sedangkan transaksi barang mewah tertentu menggunakan 12%.' },
  umkm: { kicker: 'PPh Final UMKM', title: 'Tarif 0,5%', text: 'Hitung PPh Final UMKM 0,5% dengan fasilitas bagian omzet sampai Rp500 juta setahun untuk Wajib Pajak Orang Pribadi sesuai syarat yang berlaku.' },
  unifikasi: { kicker: 'PPh Unifikasi', title: 'e-Bupot Unifikasi', text: 'Mencakup objek umum PPh 23, PPh Final 4(2), jasa konstruksi, PPh 26, serta tarif manual untuk PPh 15, PPh 22, atau objek khusus.' }
};

const unificationOptions = [
  { id: 'pph23-service', label: 'PPh 23 — Jasa / sewa harta selain tanah & bangunan', article: 'PPh Pasal 23', rate: 2, note: 'Tarif umum 2% dari jumlah bruto untuk jasa tertentu dan sewa/penggunaan harta selain tanah dan/atau bangunan.' },
  { id: 'pph23-passive', label: 'PPh 23 — Bunga, royalti, hadiah/penghargaan tertentu', article: 'PPh Pasal 23', rate: 15, note: 'Tarif umum 15% dari jumlah bruto. Pastikan objek tidak termasuk penghasilan yang dikecualikan atau dikenai ketentuan khusus.' },
  { id: 'rent-building', label: 'PPh Final 4(2) — Sewa tanah dan/atau bangunan', article: 'PPh Pasal 4 ayat (2)', rate: 10, note: 'Tarif 10% dari jumlah bruto nilai persewaan tanah dan/atau bangunan.' },
  { id: 'construction-small', label: 'PPh Final 4(2) — Konstruksi kecil tersertifikasi', article: 'PPh Pasal 4 ayat (2)', rate: 1.75, note: 'Pekerjaan konstruksi oleh penyedia dengan SBU kualifikasi kecil atau sertifikat kompetensi kerja usaha orang perseorangan.' },
  { id: 'construction-other', label: 'PPh Final 4(2) — Konstruksi tersertifikasi selain kecil', article: 'PPh Pasal 4 ayat (2)', rate: 2.65, note: 'Pekerjaan konstruksi tersertifikasi selain kategori kecil atau pekerjaan konstruksi terintegrasi tersertifikasi.' },
  { id: 'construction-no-cert', label: 'PPh Final 4(2) — Konstruksi tanpa sertifikat', article: 'PPh Pasal 4 ayat (2)', rate: 4, note: 'Pekerjaan konstruksi atau konstruksi terintegrasi oleh penyedia yang tidak memiliki sertifikat yang dipersyaratkan.' },
  { id: 'construction-consult-cert', label: 'PPh Final 4(2) — Konsultansi konstruksi tersertifikasi', article: 'PPh Pasal 4 ayat (2)', rate: 3.5, note: 'Jasa konsultansi konstruksi oleh penyedia yang memiliki sertifikat badan usaha atau sertifikat kompetensi kerja.' },
  { id: 'construction-consult-no-cert', label: 'PPh Final 4(2) — Konsultansi konstruksi tanpa sertifikat', article: 'PPh Pasal 4 ayat (2)', rate: 6, note: 'Jasa konsultansi konstruksi oleh penyedia yang tidak memiliki sertifikat yang dipersyaratkan.' },
  { id: 'pph26-default', label: 'PPh 26 — Wajib Pajak luar negeri (tarif domestik)', article: 'PPh Pasal 26', rate: 20, note: 'Tarif domestik umum 20%. Jika penerima memenuhi syarat P3B dan dokumen domisili valid, tarif dapat berbeda.' },
  { id: 'custom', label: 'PPh 15 / PPh 22 / PPh 26 treaty / objek khusus — tarif manual', article: 'PPh Unifikasi — tarif khusus', custom: true, note: 'Gunakan tarif manual setelah memastikan kode objek, dasar pengenaan, fasilitas, dan ketentuan transaksi.' }
];

function MoneyInput({ label, value, onChange, hint }) {
  return <label className="field"><span>{label}</span><div className="money-input"><span>Rp</span><input inputMode="numeric" type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" /></div>{hint && <small>{hint}</small>}</label>;
}

function ResultLine({ label, value, strong = false, note }) {
  return <div className={`result-line ${strong ? 'strong' : ''}`}><div><span>{label}</span>{note && <small>{note}</small>}</div><b>{value}</b></div>;
}

function MethodSelector({ method, setMethod }) {
  return <div className="method-segmented" aria-label="Metode PPh 21">
    <button className={method === 'gross' ? 'active' : ''} onClick={() => setMethod('gross')}>Gross</button>
    <button className={method === 'grossUp' ? 'active' : ''} onClick={() => setMethod('grossUp')}>Gross Up</button>
    <button className={method === 'nett' ? 'active' : ''} onClick={() => setMethod('nett')}>Nett</button>
  </div>;
}

function Pph21Calculator() {
  const [mode, setMode] = useState('monthly');
  const [method, setMethod] = useState('gross');
  const [grossMonthly, setGrossMonthly] = useState('10000000');
  const [status, setStatus] = useState('K/0');
  const [annualGross, setAnnualGross] = useState('120000000');
  const [pension, setPension] = useState('1200000');
  const [months, setMonths] = useState('12');
  const [priorWithheld, setPriorWithheld] = useState('2200000');

  const monthly = useMemo(() => calculateMonthlyPph21ByMethod({ amount: grossMonthly, ptkpStatus: status, method }), [grossMonthly, status, method]);
  const annual = useMemo(() => calculateAnnualPph21ByMethod({ annualGross, pensionContribution: pension, ptkpStatus: status, monthsWorked: months, priorWithheld, method }), [annualGross, pension, status, months, priorWithheld, method]);

  const amountLabel = method === 'gross' ? 'Penghasilan bruto' : method === 'grossUp' ? 'Penghasilan sebelum tunjangan pajak' : 'Target penghasilan nett';
  const methodNote = method === 'gross'
    ? 'Gross: PPh 21 dipotong dari penghasilan pegawai.'
    : method === 'grossUp'
      ? 'Gross Up: perusahaan memberi tunjangan pajak sebesar PPh 21 sehingga penghasilan setelah pajak tetap sebesar nilai dasar yang dimasukkan.'
      : 'Nett: PPh 21 ditanggung pemberi kerja. Untuk tujuan pajak, PPh yang ditanggung menjadi penambah penghasilan bruto sehingga gross-equivalent dihitung kembali.';

  return <div className="calculator-grid">
    <section className="panel form-panel">
      <MethodSelector method={method} setMethod={setMethod} />
      <div className="segmented"><button className={mode === 'monthly' ? 'active' : ''} onClick={() => setMode('monthly')}>Masa selain terakhir</button><button className={mode === 'annual' ? 'active' : ''} onClick={() => setMode('annual')}>Masa pajak terakhir</button></div>
      <label className="field"><span>Status PTKP</span><select value={status} onChange={(e) => setStatus(e.target.value)}>{Object.keys(PTKP).map((key) => <option key={key}>{key}</option>)}</select><small>PTKP ditentukan dari kondisi pada awal tahun pajak.</small></label>
      {mode === 'monthly' ? <MoneyInput label={`${amountLabel} bulan ini`} value={grossMonthly} onChange={setGrossMonthly} hint="Untuk pegawai tetap pada masa pajak selain masa pajak terakhir." /> : <>
        <MoneyInput label={`${amountLabel} setahun / bagian tahun`} value={annualGross} onChange={setAnnualGross} />
        <MoneyInput label="Iuran pensiun/JHT yang boleh dikurangkan" value={pension} onChange={setPension} />
        <label className="field"><span>Jumlah bulan bekerja</span><input type="number" min="1" max="12" value={months} onChange={(e) => setMonths(e.target.value)} /><small>Untuk batas biaya jabatan: 5% dari bruto, maksimum Rp500.000 per bulan.</small></label>
        <MoneyInput label="PPh 21 yang sudah dipotong sebelum masa terakhir" value={priorWithheld} onChange={setPriorWithheld} />
      </>}
      <div className="info-box">{methodNote}</div>
    </section>

    <section className="panel result-panel">
      <div className="eyebrow">Hasil PPh 21 — {method === 'grossUp' ? 'Gross Up' : method === 'nett' ? 'Nett' : 'Gross'}</div>
      {mode === 'monthly' ? <>
        <div className="hero-result"><span>PPh 21 masa ini</span><strong>{formatRupiah(monthly.tax)}</strong></div>
        <ResultLine label="Kategori TER" value={`Kategori ${monthly.category}`} />
        <ResultLine label="Tarif efektif" value={`${monthly.rate}%`} />
        <ResultLine label="Nilai dasar" value={formatRupiah(monthly.baseGross)} />
        {method !== 'gross' && <ResultLine label={method === 'grossUp' ? 'Tunjangan pajak' : 'PPh ditanggung perusahaan'} value={formatRupiah(method === 'grossUp' ? monthly.taxAllowance : monthly.employerBorneTax)} />}
        <ResultLine label="Penghasilan bruto untuk pajak" value={formatRupiah(monthly.gross)} />
        <ResultLine label="Take-home sebelum potongan lain" value={formatRupiah(monthly.takeHome)} strong />
        <ResultLine label="Biaya perusahaan" value={formatRupiah(monthly.companyCost)} />
      </> : <>
        <div className="hero-result"><span>{annual.lastPeriodTax >= 0 ? 'PPh 21 masa pajak terakhir' : 'Kelebihan pemotongan'}</span><strong>{formatRupiah(Math.abs(annual.lastPeriodTax))}</strong></div>
        <ResultLine label="Nilai dasar setahun" value={formatRupiah(annual.baseGross)} />
        {method !== 'gross' && <ResultLine label={method === 'grossUp' ? 'Tunjangan pajak setahun' : 'PPh ditanggung perusahaan'} value={formatRupiah(method === 'grossUp' ? annual.taxAllowance : annual.employerBorneTax)} />}
        <ResultLine label="Bruto untuk penghitungan pajak" value={formatRupiah(annual.gross)} />
        <ResultLine label="Biaya jabatan" value={formatRupiah(annual.positionExpense)} />
        <ResultLine label="Penghasilan neto" value={formatRupiah(annual.net)} />
        <ResultLine label="PTKP" value={formatRupiah(annual.ptkp)} />
        <ResultLine label="PKP" value={formatRupiah(annual.pkp)} />
        <ResultLine label="PPh 21 setahun" value={formatRupiah(annual.annualTax)} strong />
        <ResultLine label="Sudah dipotong" value={formatRupiah(annual.priorWithheld)} />
      </>}
    </section>
  </div>;
}

function VatCalculator() {
  const [kind, setKind] = useState('nonLuxury');
  const [inclusive, setInclusive] = useState(false);
  const [amount, setAmount] = useState('100000000');
  const result = useMemo(() => calculateVat({ amount, kind, inclusive }), [amount, kind, inclusive]);
  return <div className="calculator-grid"><section className="panel form-panel"><label className="field"><span>Jenis transaksi</span><select value={kind} onChange={(e) => setKind(e.target.value)}><option value="nonLuxury">BKP non-mewah / JKP umum</option><option value="luxury">BKP mewah yang dikenai PPnBM</option></select></label><label className="check-row"><input type="checkbox" checked={inclusive} onChange={(e) => setInclusive(e.target.checked)} /><span>Nilai yang saya masukkan sudah termasuk PPN</span></label><MoneyInput label={inclusive ? 'Nilai termasuk PPN' : 'Harga jual / penggantian sebelum PPN'} value={amount} onChange={setAmount} /><div className="info-box">{kind === 'nonLuxury' ? 'Untuk transaksi umum, PPN dihitung 12% × DPP nilai lain sebesar 11/12, sehingga beban efektifnya 11%.' : 'Untuk BKP mewah yang termasuk objek PPnBM, PPN menggunakan 12% dari harga jual/nilai impor. PPnBM tidak dihitung di modul ini karena tarifnya bergantung jenis barang.'}</div></section><section className="panel result-panel"><div className="eyebrow">Hasil PPN</div><div className="hero-result"><span>PPN terutang</span><strong>{formatRupiah(result.vat)}</strong></div><ResultLine label="Tarif efektif" value={`${Math.round(result.effectiveRate * 100)}%`} /><ResultLine label="Harga sebelum PPN" value={formatRupiah(result.preVat)} /><ResultLine label="DPP untuk penghitungan" value={formatRupiah(result.dpp)} note={kind === 'nonLuxury' ? '11/12 dari harga/penggantian' : 'Harga jual/nilai impor'} /><ResultLine label="Total setelah PPN" value={formatRupiah(result.total)} strong /></section></div>;
}

function UmkmCalculator() {
  const [taxpayerType, setTaxpayerType] = useState('individual');
  const [priorYtd, setPriorYtd] = useState('450000000');
  const [currentMonth, setCurrentMonth] = useState('100000000');
  const [priorYearTurnover, setPriorYearTurnover] = useState('1000000000');
  const result = useMemo(() => calculateUmkmFinal({ taxpayerType, priorYtd, currentMonth }), [taxpayerType, priorYtd, currentMonth]);
  const eligible = (Number(priorYearTurnover) || 0) <= 4_800_000_000;
  return <div className="calculator-grid"><section className="panel form-panel"><label className="field"><span>Jenis Wajib Pajak</span><select value={taxpayerType} onChange={(e) => setTaxpayerType(e.target.value)}><option value="individual">Orang Pribadi</option><option value="soleCompany">Perseroan Perorangan (1 orang)</option><option value="cooperative">Koperasi</option><option value="transition">CV / Firma / PT biasa / BUMDes (transisi)</option></select></label><MoneyInput label="Peredaran bruto tahun pajak sebelumnya" value={priorYearTurnover} onChange={setPriorYearTurnover} /><MoneyInput label="Omzet kumulatif tahun berjalan sebelum bulan ini" value={priorYtd} onChange={setPriorYtd} /><MoneyInput label="Omzet bulan ini" value={currentMonth} onChange={setCurrentMonth} /><div className={eligible ? 'info-box' : 'warning-box'}>{eligible ? 'Batas omzet tahun sebelumnya tidak melewati Rp4,8 miliar.' : 'Omzet tahun sebelumnya melewati Rp4,8 miliar. Periksa kelayakan penggunaan skema 0,5%.'}</div></section><section className="panel result-panel"><div className="eyebrow">Hasil PPh Final UMKM</div><div className="hero-result"><span>PPh Final bulan ini</span><strong>{eligible ? formatRupiah(result.tax) : 'Periksa kelayakan'}</strong></div><ResultLine label="Omzet bulan ini" value={formatRupiah(result.month)} /><ResultLine label="Omzet kumulatif setelah bulan ini" value={formatRupiah(result.after)} /><ResultLine label="Bagian omzet yang dikenai 0,5%" value={formatRupiah(result.taxableTurnover)} />{eligible && <ResultLine label="Tarif" value="0,5%" strong />}</section></div>;
}

function UnificationCalculator() {
  const [objectId, setObjectId] = useState('pph23-service');
  const [amount, setAmount] = useState('100000000');
  const [customRate, setCustomRate] = useState('1.5');
  const selected = unificationOptions.find((item) => item.id === objectId) || unificationOptions[0];
  const rate = selected.custom ? Math.max(0, Number(customRate) || 0) : selected.rate;
  const gross = Math.max(0, Number(amount) || 0);
  const tax = Math.round(gross * rate / 100);
  return <div className="calculator-grid"><section className="panel form-panel"><label className="field"><span>Jenis objek PPh Unifikasi</span><select value={objectId} onChange={(e) => setObjectId(e.target.value)}>{unificationOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><small>PPh Unifikasi bukan satu tarif tunggal; tarif mengikuti objek pajak masing-masing.</small></label><MoneyInput label="Jumlah bruto / dasar pemotongan" value={amount} onChange={setAmount} />{selected.custom && <label className="field"><span>Tarif yang berlaku (%)</span><input type="number" min="0" step="0.01" value={customRate} onChange={(e) => setCustomRate(e.target.value)} /></label>}<div className="info-box">{selected.note}</div><div className="warning-box">Pastikan kode objek, status penerima, fasilitas, sertifikasi konstruksi, dokumen treaty/SKD, dan dasar pemotongan sebelum membuat bukti potong.</div></section><section className="panel result-panel"><div className="eyebrow">Hasil PPh Unifikasi</div><div className="hero-result"><span>PPh dipotong / dipungut</span><strong>{formatRupiah(tax)}</strong></div><ResultLine label="Jenis PPh" value={selected.article} /><ResultLine label="Tarif" value={`${rate}%`} /><ResultLine label="Dasar pemotongan" value={formatRupiah(gross)} /><div className="formula">{formatRupiah(gross)} × {rate}% = {formatRupiah(tax)}</div></section></div>;
}

export default function TaxCalculator() {
  const [active, setActive] = useState('pph21');
  const card = heroCards[active];
  return <main>
    <header className="topbar"><div className="brand-mark">KP</div><div className="brand-copy"><b>Kalkulator Pajak Kantor Kencana</b><span>Indonesia</span></div><div className="verified-pill">Aturan diverifikasi 20 Agustus 2026</div></header>
    <section className="hero"><div className="hero-copy"><div className="eyebrow">Kalkulator pajak Kantor Kencana</div><h1>Hitung Pajak dengan lebih <em>praktis</em>.</h1><p>PPh 21, PPN, PPh Final UMKM, dan PPh Unifikasi dalam satu kalkulator untuk membantu pekerjaan pajak rutin secara lebih cepat.</p></div><div className="law-card" key={active}><span>{card.kicker}</span><strong>{card.title}</strong><p>{card.text}</p></div></section>
    <nav className="tabs" aria-label="Jenis kalkulator pajak">{taxTabs.map((tab) => <button key={tab.id} className={active === tab.id ? 'active' : ''} onClick={() => setActive(tab.id)}>{tab.label}</button>)}</nav>
    {active === 'pph21' && <Pph21Calculator />}{active === 'ppn' && <VatCalculator />}{active === 'umkm' && <UmkmCalculator />}{active === 'unifikasi' && <UnificationCalculator />}
    <section className="sources panel"><div><div className="eyebrow">Dasar aturan</div><h2>Sumber resmi yang dipakai</h2></div><div className="source-list"><a href="https://jdih.kemenkeu.go.id/dok/pp-58-tahun-2023" target="_blank" rel="noreferrer"><b>PP 58 Tahun 2023</b><span>Tarif Efektif PPh 21 kategori A/B/C</span></a><a href="https://jdih.kemenkeu.go.id/dok/pmk-168-tahun-2023" target="_blank" rel="noreferrer"><b>PMK 168 Tahun 2023</b><span>Pelaksanaan pemotongan PPh 21/26</span></a><a href="https://www.pajak.go.id/id/artikel/e-bupot-unifikasi" target="_blank" rel="noreferrer"><b>e-Bupot Unifikasi DJP</b><span>PPh 4(2), 15, 22, 23 dan nonresiden</span></a><a href="https://pajak.go.id/id/pph-pasal-2326" target="_blank" rel="noreferrer"><b>PPh Pasal 23/26</b><span>Objek dan tarif umum PPh 23/26</span></a></div></section>
    <footer><p><b>Catatan:</b> Kalkulator ini membantu estimasi dan bukan pengganti bukti potong, Coretax/DJP, atau penelaahan profesional. Metode Nett dihitung dengan memperlakukan PPh yang ditanggung pemberi kerja sebagai penambah penghasilan bruto untuk memperoleh gross-equivalent.</p></footer>
  </main>;
}
