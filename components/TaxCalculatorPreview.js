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

const regulationCards = {
  pph21: {
    kicker: 'Peraturan terbaru · PPh 21',
    title: 'PP 58/2023 & PMK 168/2023',
    text: 'PPh 21 pegawai tetap memakai Tarif Efektif Rata-rata pada masa selain masa pajak terakhir. Pada masa pajak terakhir dilakukan rekonsiliasi tahunan, dan Coretax menerbitkan Bukti Potong A1 (BPA1) untuk pegawai tetap/pensiunan.'
  },
  ppn: {
    kicker: 'Peraturan terbaru · PPN',
    title: 'PMK 131/2024',
    text: 'Sejak 1 Januari 2025, transaksi umum non-mewah memakai tarif formal 12% dengan DPP Nilai Lain 11/12 sehingga beban efektif PPN tetap 11%. Barang mewah tertentu menggunakan 12% penuh dari harga jual atau penggantian.'
  },
  umkm: {
    kicker: 'Peraturan terbaru · PPh Final UMKM',
    title: 'PP 20/2026',
    text: 'Berlaku sejak 22 April 2026 dan memperbarui skema PPh Final UMKM 0,5%, termasuk subjek, batas waktu penggunaan, agregasi omzet, serta ketentuan transisi. Fasilitas omzet Rp500 juta tetap khusus WP Orang Pribadi yang memenuhi syarat.'
  },
  unifikasi: {
    kicker: 'Peraturan terbaru · PPh Unifikasi',
    title: 'Coretax & PMK 81/2024',
    text: 'Administrasi pemotongan/pemungutan melalui Coretax mengikuti kerangka PMK 81/2024 beserta perubahan relevan, termasuk PMK 1/2026. Dalam e-Bupot Unifikasi, tarif tetap mengikuti objek pajaknya masing-masing: Pasal 4(2), 15, 22, 23, dan 26.'
  }
};

const unificationOptions = [
  { id: 'pph23-service', label: 'PPh 23 — Jasa teknik/manajemen/konsultan/jasa lain', article: 'PPh Pasal 23', rate: 2, note: 'Tarif umum 2% dari jumlah bruto atas jasa teknik, jasa manajemen, jasa konsultan, dan jasa lain selain yang dipotong PPh Pasal 21.' },
  { id: 'pph23-rent', label: 'PPh 23 — Sewa harta selain tanah & bangunan', article: 'PPh Pasal 23', rate: 2, note: 'Tarif 2% dari jumlah bruto atas sewa dan penghasilan lain sehubungan dengan penggunaan harta, selain sewa tanah dan/atau bangunan.' },
  { id: 'pph23-passive', label: 'PPh 23 — Bunga, royalti, hadiah/penghargaan tertentu', article: 'PPh Pasal 23', rate: 15, note: 'Tarif umum 15% dari jumlah bruto atas bunga, royalti, dan hadiah/penghargaan/bonus tertentu selain yang telah dipotong PPh Pasal 21.' },
  { id: 'rent-building', label: 'PPh Final 4(2) — Sewa tanah dan/atau bangunan', article: 'PPh Pasal 4 ayat (2)', rate: 10, note: 'Tarif final 10% dari jumlah bruto nilai persewaan tanah dan/atau bangunan.' },
  { id: 'construction-small', label: 'PPh Final 4(2) — Konstruksi kecil tersertifikasi', article: 'PPh Pasal 4 ayat (2)', rate: 1.75, note: 'Pekerjaan konstruksi oleh penyedia dengan SBU kualifikasi kecil atau sertifikat kompetensi kerja usaha orang perseorangan.' },
  { id: 'construction-other', label: 'PPh Final 4(2) — Konstruksi tersertifikasi selain kecil', article: 'PPh Pasal 4 ayat (2)', rate: 2.65, note: 'Pekerjaan konstruksi tersertifikasi selain kategori kecil atau pekerjaan konstruksi terintegrasi tersertifikasi.' },
  { id: 'construction-no-cert', label: 'PPh Final 4(2) — Konstruksi tanpa sertifikat', article: 'PPh Pasal 4 ayat (2)', rate: 4, note: 'Pekerjaan konstruksi atau konstruksi terintegrasi oleh penyedia yang tidak memiliki sertifikat yang dipersyaratkan.' },
  { id: 'construction-consult-cert', label: 'PPh Final 4(2) — Konsultansi konstruksi tersertifikasi', article: 'PPh Pasal 4 ayat (2)', rate: 3.5, note: 'Jasa konsultansi konstruksi oleh penyedia yang memiliki sertifikat badan usaha atau sertifikat kompetensi kerja.' },
  { id: 'construction-consult-no-cert', label: 'PPh Final 4(2) — Konsultansi konstruksi tanpa sertifikat', article: 'PPh Pasal 4 ayat (2)', rate: 6, note: 'Jasa konsultansi konstruksi oleh penyedia yang tidak memiliki sertifikat yang dipersyaratkan.' },
  { id: 'pph15-air-charter', label: 'PPh 15 — Charter penerbangan dalam negeri', article: 'PPh Pasal 15', rate: 1.8, note: 'Tarif efektif 1,8% dari peredaran bruto atas charter penerbangan dalam negeri.' },
  { id: 'pph15-shipping-domestic', label: 'PPh 15 — Pelayaran dalam negeri', article: 'PPh Pasal 15', rate: 1.2, note: 'Tarif efektif 1,2% dari peredaran bruto perusahaan pelayaran dalam negeri dan bersifat final.' },
  { id: 'pph22-import-api', label: 'PPh 22 — Impor menggunakan API', article: 'PPh Pasal 22', rate: 2.5, note: 'Tarif impor umum 2,5% dari nilai impor untuk importir yang menggunakan API.' },
  { id: 'pph22-import-nonapi', label: 'PPh 22 — Impor tanpa API / non-API', article: 'PPh Pasal 22', rate: 7.5, note: 'Tarif 7,5% dari nilai impor untuk impor non-API.' },
  { id: 'pph22-government-purchase', label: 'PPh 22 — Pembelian barang oleh bendahara/BUMN/BUMD', article: 'PPh Pasal 22', rate: 1.5, note: 'Tarif 1,5% dari harga pembelian, tidak termasuk PPN, atas pembelian barang oleh bendahara pemerintah atau BUMN/BUMD.' },
  { id: 'pph22-sip', label: 'PPh 22 — Transaksi melalui Sistem Informasi Pengadaan', article: 'PPh Pasal 22', rate: 0.5, note: 'Tarif 0,5% dari nilai pembayaran dalam dokumen tagihan, tidak termasuk PPN dan PPnBM, untuk transaksi melalui SIP/Marketplace Pengadaan.' },
  { id: 'pph22-gold', label: 'PPh 22 — Penjualan emas perhiasan / emas batangan', article: 'PPh Pasal 22', rate: 0.25, note: 'Tarif 0,25% dari harga jual emas perhiasan dan/atau emas batangan sesuai PMK 48/PMK.03/2023.' },
  { id: 'pph26-default', label: 'PPh 26 — Wajib Pajak luar negeri (tarif domestik)', article: 'PPh Pasal 26', rate: 20, note: 'Tarif domestik umum 20%. Jika penerima memenuhi syarat P3B dan dokumen domisili valid, tarif dapat berbeda.' },
  { id: 'custom', label: 'PPh 15 / PPh 22 / PPh 26 treaty / objek khusus — tarif manual', article: 'PPh Unifikasi — tarif khusus', custom: true, note: 'Gunakan tarif manual setelah memastikan kode objek, dasar pengenaan, fasilitas, dokumen treaty/SKD, dan ketentuan transaksi.' }
];

function MoneyInput({ label, value, onChange, hint }) {
  return <label className="field"><span>{label}</span><div className="money-input"><span>Rp</span><input inputMode="numeric" type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" /></div>{hint && <small>{hint}</small>}</label>;
}

function ResultLine({ label, value, strong = false, note }) {
  return <div className={`result-line ${strong ? 'strong' : ''}`}><div><span>{label}</span>{note && <small>{note}</small>}</div><b>{value}</b></div>;
}

function MethodSelector({ method, setMethod }) {
  return <div className="method-segmented" aria-label="Metode PPh 21"><button className={method === 'gross' ? 'active' : ''} onClick={() => setMethod('gross')}>Gross</button><button className={method === 'grossUp' ? 'active' : ''} onClick={() => setMethod('grossUp')}>Gross Up</button><button className={method === 'nett' ? 'active' : ''} onClick={() => setMethod('nett')}>Nett</button></div>;
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
  const annualMode = mode === 'annual' || mode === 'a1';

  return <div className="calculator-grid"><section className="panel form-panel"><MethodSelector method={method} setMethod={setMethod} /><div className="segmented pph21-mode"><button className={mode === 'monthly' ? 'active' : ''} onClick={() => setMode('monthly')}>Masa selain terakhir</button><button className={mode === 'annual' ? 'active' : ''} onClick={() => setMode('annual')}>Masa pajak terakhir</button><button className={mode === 'a1' ? 'active' : ''} onClick={() => setMode('a1')}>BP A1</button></div><label className="field"><span>Status PTKP</span><select value={status} onChange={(e) => setStatus(e.target.value)}>{Object.keys(PTKP).map((key) => <option key={key}>{key}</option>)}</select><small>PTKP ditentukan dari kondisi pada awal tahun pajak.</small></label>{!annualMode ? <MoneyInput label={`${amountLabel} bulan ini`} value={grossMonthly} onChange={setGrossMonthly} hint="Untuk pegawai tetap pada masa pajak selain masa pajak terakhir." /> : <>{mode === 'a1' && <div className="info-box"><b>BP A1 / BPA1</b><br />Bukti potong pegawai tetap/pensiunan pada Masa Pajak Terakhir. Mode ini menyajikan rekonsiliasi tahunan dalam urutan pengecekan A1.</div>}<MoneyInput label={`${amountLabel} setahun / bagian tahun`} value={annualGross} onChange={setAnnualGross} /><MoneyInput label="Iuran pensiun/JHT yang boleh dikurangkan" value={pension} onChange={setPension} /><label className="field"><span>Jumlah bulan bekerja</span><input type="number" min="1" max="12" value={months} onChange={(e) => setMonths(e.target.value)} /><small>Untuk batas biaya jabatan: 5% dari bruto, maksimum Rp500.000 per bulan.</small></label><MoneyInput label="PPh 21 yang sudah dipotong sebelum masa terakhir" value={priorWithheld} onChange={setPriorWithheld} /></>}</section><section className="panel result-panel"><div className="eyebrow">{mode === 'a1' ? 'Rekonsiliasi BP A1' : 'Hasil PPh 21'}</div>{!annualMode ? <><div className="hero-result"><span>PPh 21 masa ini</span><strong>{formatRupiah(monthly.tax)}</strong></div><ResultLine label="Kategori TER" value={`Kategori ${monthly.category}`} /><ResultLine label="Tarif efektif" value={`${monthly.rate}%`} /><ResultLine label="Nilai dasar" value={formatRupiah(monthly.baseGross)} />{method !== 'gross' && <ResultLine label={method === 'grossUp' ? 'Tunjangan pajak' : 'PPh ditanggung perusahaan'} value={formatRupiah(method === 'grossUp' ? monthly.taxAllowance : monthly.employerBorneTax)} />}<ResultLine label="Penghasilan bruto untuk pajak" value={formatRupiah(monthly.gross)} /><ResultLine label="Take-home sebelum potongan lain" value={formatRupiah(monthly.takeHome)} strong /><ResultLine label="Biaya perusahaan" value={formatRupiah(monthly.companyCost)} /></> : <><div className="hero-result"><span>{annual.lastPeriodTax >= 0 ? (mode === 'a1' ? 'PPh 21 kurang dipotong pada A1' : 'PPh 21 masa pajak terakhir') : 'Kelebihan pemotongan'}</span><strong>{formatRupiah(Math.abs(annual.lastPeriodTax))}</strong></div>{mode === 'a1' && <ResultLine label="1. Penghasilan bruto A1" value={formatRupiah(annual.gross)} strong />}<ResultLine label={mode === 'a1' ? '2. Biaya jabatan' : 'Biaya jabatan'} value={formatRupiah(annual.positionExpense)} /><ResultLine label={mode === 'a1' ? '3. Iuran pensiun/JHT' : 'Iuran pensiun/JHT'} value={formatRupiah(annual.pension)} /><ResultLine label={mode === 'a1' ? '4. Penghasilan neto' : 'Penghasilan neto'} value={formatRupiah(annual.net)} /><ResultLine label={mode === 'a1' ? '5. PTKP' : 'PTKP'} value={formatRupiah(annual.ptkp)} /><ResultLine label={mode === 'a1' ? '6. PKP' : 'PKP'} value={formatRupiah(annual.pkp)} /><ResultLine label={mode === 'a1' ? '7. PPh 21 setahun (Pasal 17)' : 'PPh 21 setahun'} value={formatRupiah(annual.annualTax)} strong /><ResultLine label={mode === 'a1' ? '8. PPh 21 telah dipotong' : 'Sudah dipotong'} value={formatRupiah(annual.priorWithheld)} />{mode === 'a1' && <ResultLine label="9. PPh masa terakhir / selisih" value={formatRupiah(annual.lastPeriodTax)} strong />}</>}</section></div>;
}

function VatCalculator() {
  const [kind, setKind] = useState('nonLuxury');
  const [inclusive, setInclusive] = useState(false);
  const [amount, setAmount] = useState('100000000');
  const result = useMemo(() => calculateVat({ amount, kind, inclusive }), [amount, kind, inclusive]);
  const formulaText = kind === 'nonLuxury' ? [`DPP Nilai Lain = 11/12 × ${formatRupiah(result.preVat)} = ${formatRupiah(result.dpp)}`, `PPN = 12% × ${formatRupiah(result.dpp)} = ${formatRupiah(result.vat)}`, `Total = ${formatRupiah(result.preVat)} + ${formatRupiah(result.vat)} = ${formatRupiah(result.total)}`].join(' · ') : [`DPP = ${formatRupiah(result.dpp)}`, `PPN = 12% × ${formatRupiah(result.dpp)} = ${formatRupiah(result.vat)}`, `Total = ${formatRupiah(result.total)}`].join(' · ');

  return <div className="calculator-grid"><section className="panel form-panel"><label className="field"><span>Jenis transaksi</span><select value={kind} onChange={(e) => setKind(e.target.value)}><option value="nonLuxury">BKP non-mewah / JKP umum</option><option value="luxury">BKP mewah yang dikenai PPnBM</option></select></label><label className="check-row"><input type="checkbox" checked={inclusive} onChange={(e) => setInclusive(e.target.checked)} /><span>Nilai yang saya masukkan sudah termasuk PPN</span></label><MoneyInput label={inclusive ? 'Nilai termasuk PPN' : 'Harga jual / penggantian sebelum PPN'} value={amount} onChange={setAmount} /><div className="info-box">{kind === 'nonLuxury' ? 'Untuk transaksi umum, hasil PPN ditampilkan dengan tarif formal 12% atas DPP Nilai Lain 11/12 sehingga beban efektifnya 11%.' : 'Untuk BKP mewah tertentu, PPN dihitung 12% langsung dari harga jual/penggantian. PPnBM tidak dihitung di modul ini.'}</div></section><section className="panel result-panel"><div className="eyebrow">Hasil PPN</div><div className="hero-result"><span>PPN terutang</span><strong>{formatRupiah(result.vat)}</strong></div><ResultLine label="Tarif formal" value="12%" note="Tarif PPN yang berlaku" /><ResultLine label="Tarif efektif" value={`${Math.round(result.effectiveRate * 100)}%`} note={kind === 'nonLuxury' ? 'Efektif karena DPP Nilai Lain 11/12' : 'Sama dengan tarif formal'} /><ResultLine label="Harga sebelum PPN" value={formatRupiah(result.preVat)} /><ResultLine label="DPP untuk penghitungan" value={formatRupiah(result.dpp)} note={kind === 'nonLuxury' ? '11/12 dari harga/penggantian' : 'Harga jual/penggantian'} /><ResultLine label="Total setelah PPN" value={formatRupiah(result.total)} strong /><div className="formula">{formulaText}</div></section></div>;
}

function UmkmCalculator() {
  const [taxpayerType, setTaxpayerType] = useState('individual');
  const [priorYtd, setPriorYtd] = useState('450000000');
  const [currentMonth, setCurrentMonth] = useState('100000000');
  const [priorYearTurnover, setPriorYearTurnover] = useState('1000000000');
  const result = useMemo(() => calculateUmkmFinal({ taxpayerType, priorYtd, currentMonth }), [taxpayerType, priorYtd, currentMonth]);
  const eligible = (Number(priorYearTurnover) || 0) <= 4_800_000_000;

  return <div className="calculator-grid"><section className="panel form-panel"><label className="field"><span>Jenis Wajib Pajak</span><select value={taxpayerType} onChange={(e) => setTaxpayerType(e.target.value)}><option value="individual">Orang Pribadi</option><option value="soleCompany">Perseroan Perorangan (1 orang)</option><option value="cooperative">Koperasi</option><option value="transition">CV / Firma / PT biasa / BUMDes (transisi)</option></select></label><MoneyInput label="Peredaran bruto tahun pajak sebelumnya" value={priorYearTurnover} onChange={setPriorYearTurnover} /><MoneyInput label="Omzet kumulatif tahun berjalan sebelum bulan ini" value={priorYtd} onChange={setPriorYtd} /><MoneyInput label="Omzet bulan ini" value={currentMonth} onChange={setCurrentMonth} /><div className={eligible ? 'info-box' : 'warning-box'}>{eligible ? 'Batas omzet tahun sebelumnya tidak melewati Rp4,8 miliar.' : 'Omzet tahun sebelumnya melewati Rp4,8 miliar. Periksa kembali kelayakan penggunaan skema 0,5%.'}</div></section><section className="panel result-panel"><div className="eyebrow">Hasil PPh Final UMKM</div><div className="hero-result"><span>PPh Final bulan ini</span><strong>{eligible ? formatRupiah(result.tax) : 'Periksa kelayakan'}</strong></div><ResultLine label="Omzet sebelum bulan ini" value={formatRupiah(result.before)} /><ResultLine label="Omzet bulan ini" value={formatRupiah(result.month)} /><ResultLine label="Omzet kumulatif setelah bulan ini" value={formatRupiah(result.after)} /><ResultLine label="Bagian omzet yang dikenai 0,5%" value={formatRupiah(result.taxableTurnover)} /><ResultLine label="Tarif" value="0,5%" strong /><div className="formula">{`${formatRupiah(result.taxableTurnover)} × 0,5% = ${formatRupiah(result.tax)}`}</div></section></div>;
}

function UnificationCalculator() {
  const [objectId, setObjectId] = useState('pph23-service');
  const [amount, setAmount] = useState('100000000');
  const [customRate, setCustomRate] = useState('1.5');
  const selected = unificationOptions.find((item) => item.id === objectId) || unificationOptions[0];
  const rate = selected.custom ? Math.max(0, Number(customRate) || 0) : selected.rate;
  const gross = Math.max(0, Number(amount) || 0);
  const tax = Math.round(gross * rate / 100);

  return <div className="calculator-grid"><section className="panel form-panel"><label className="field"><span>Jenis objek PPh Unifikasi</span><select value={objectId} onChange={(e) => setObjectId(e.target.value)}>{unificationOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><small>PPh Unifikasi bukan satu tarif tunggal; tarif mengikuti jenis objek pajak yang dipotong atau dipungut.</small></label><MoneyInput label="Jumlah bruto / dasar pemotongan" value={amount} onChange={setAmount} />{selected.custom && <label className="field"><span>Tarif yang berlaku (%)</span><input type="number" min="0" step="0.01" value={customRate} onChange={(e) => setCustomRate(e.target.value)} /></label>}<div className="info-box">{selected.note}</div><div className="warning-box">Pastikan kode objek, status penerima, fasilitas, sertifikasi konstruksi, dokumen treaty/SKD, dan dasar pemotongan sebelum membuat bukti potong.</div></section><section className="panel result-panel"><div className="eyebrow">Hasil PPh Unifikasi</div><div className="hero-result"><span>PPh dipotong / dipungut</span><strong>{formatRupiah(tax)}</strong></div><ResultLine label="Jenis PPh" value={selected.article} /><ResultLine label="Tarif" value={`${rate}%`} /><ResultLine label="Dasar pemotongan" value={formatRupiah(gross)} /><div className="formula">{`${formatRupiah(gross)} × ${rate}% = ${formatRupiah(tax)}`}</div></section></div>;
}

export default function TaxCalculator() {
  const [active, setActive] = useState('pph21');
  const card = regulationCards[active];
  return <main><header className="topbar"><div className="brand-mark">KP</div><div className="brand-copy"><b>Kalkulator Pajak Kantor Kencana</b><span>Indonesia</span></div><div className="verified-pill">Aturan diverifikasi 20 Agustus 2026</div></header><section className="hero"><div className="hero-copy"><div className="eyebrow">Kalkulator pajak Kantor Kencana</div><h1>Hitung Pajak dengan lebih <em>praktis</em>.</h1><p>PPh 21, PPN, PPh Final UMKM, dan PPh Unifikasi dalam satu kalkulator untuk membantu pekerjaan pajak rutin secara lebih cepat.</p></div><div className="law-card" key={active}><span>{card.kicker}</span><strong>{card.title}</strong><p>{card.text}</p></div></section><nav className="tabs" aria-label="Jenis kalkulator pajak">{taxTabs.map((tab) => <button key={tab.id} className={active === tab.id ? 'active' : ''} onClick={() => setActive(tab.id)}>{tab.label}</button>)}</nav>{active === 'pph21' && <Pph21Calculator />}{active === 'ppn' && <VatCalculator />}{active === 'umkm' && <UmkmCalculator />}{active === 'unifikasi' && <UnificationCalculator />}<footer><p><b>Catatan:</b> Kalkulator ini membantu estimasi dan bukan pengganti bukti potong, Coretax/DJP, atau penelaahan profesional.</p></footer></main>;
}
