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
import { PPH21_CODE_GROUPS, PPH21_CODES } from '../lib/pph21Codes';

const TAX_YEAR = 2026;

const tabs = [
  ['pph21', 'PPh 21'],
  ['ppn', 'PPN'],
  ['umkm', 'PPh Final UMKM'],
  ['unifikasi', 'PPh Unifikasi'],
  ['badan', 'PPh Badan']
];

const cards = {
  pph21: {
    kicker: 'Peraturan terbaru · PPh 21',
    title: 'PP 58/2023, PMK 168/2023 & PER-11/PJ/2025',
    text: 'TER berlaku untuk pegawai tetap pada masa selain masa pajak terakhir. Pada BPA1, kondisi bagian tahun pajak tertentu dapat menggunakan penghasilan neto yang disetahunkan.',
    links: [
      ['PP 58 Tahun 2023', 'https://jdih.kemenkeu.go.id/dok/pp-58-tahun-2023'],
      ['PMK 168 Tahun 2023', 'https://jdih.kemenkeu.go.id/dok/pmk-168-tahun-2023'],
      ['PER-11/PJ/2025', 'https://www.pajak.go.id/id/peraturan/ketentuan-pelaporan-pajak-penghasilan-pajak-pertambahan-nilai-pajak-penjualan-atas-0']
    ]
  },
  ppn: {
    kicker: 'Peraturan terbaru · PPN',
    title: 'PMK 131/2024',
    text: 'Transaksi umum non-mewah memakai tarif formal 12% dengan DPP Nilai Lain 11/12 sehingga beban efektif tetap 11%.',
    links: [['PMK 131 Tahun 2024', 'https://jdih.kemenkeu.go.id/dok/pmk-131-tahun-2024']]
  },
  umkm: {
    kicker: 'Peraturan terbaru · PPh Final UMKM',
    title: 'PP 20/2026',
    text: 'Skema PPh Final UMKM 0,5% diperbarui, termasuk subjek, batas waktu, agregasi omzet, dan ketentuan transisi.',
    links: [['PP 20 Tahun 2026', 'https://jdih.kemenkeu.go.id/dok/pp-20-tahun-2026']]
  },
  unifikasi: {
    kicker: 'Peraturan terbaru · PPh Unifikasi',
    title: 'Coretax & PMK 81/2024',
    text: 'Objek dikelompokkan berdasarkan jenis PPh utama. Daftar PPh Pasal 23 diperluas agar pemilihan objek lebih spesifik.',
    links: [
      ['PMK 81 Tahun 2024', 'https://jdih.kemenkeu.go.id/dok/pmk-81-tahun-2024'],
      ['PMK 1 Tahun 2026', 'https://jdih.kemenkeu.go.id/dok/pmk-1-tahun-2026']
    ]
  },
  badan: {
    kicker: 'Peraturan terbaru · PPh Badan',
    title: '22%, 19%, Pasal 31E & Final UMKM 0,5%',
    text: 'PPh Badan mendukung rekonsiliasi fiskal, penyusutan/amortisasi fiskal, kompensasi rugi, kredit pajak, dan beberapa skema tarif.',
    links: [
      ['UU 7 Tahun 2021 (HPP)', 'https://jdih.kemenkeu.go.id/dok/uu-7-tahun-2021/overview'],
      ['PP 55 Tahun 2022', 'https://jdih.kemenkeu.go.id/dok/pp-55-tahun-2022'],
      ['PP 20 Tahun 2026', 'https://jdih.kemenkeu.go.id/dok/pp-20-tahun-2026'],
      ['PMK 72 Tahun 2023', 'https://jdih.kemenkeu.go.id/dok/pmk-72-tahun-2023'],
      ['Mekanisme PPh Badan DJP', 'https://www.pajak.go.id/id/mekanisme-penghitungan-pajak-penghasilan-badan']
    ]
  }
};

const unifikasiGroups = {
  p23: {
    label: 'PPh Pasal 23',
    items: [
      ['p23-dividen', 'Dividen yang merupakan objek PPh Pasal 23', 15],
      ['p23-bunga', 'Bunga termasuk premium, diskonto, dan imbalan sehubungan jaminan pengembalian utang', 15],
      ['p23-royalti', 'Royalti', 15],
      ['p23-hadiah', 'Hadiah, penghargaan, bonus, dan sejenisnya selain yang telah dipotong PPh Pasal 21', 15],
      ['p23-sewa', 'Sewa dan penghasilan lain sehubungan penggunaan harta selain tanah dan/atau bangunan', 2],
      ['p23-teknik', 'Jasa teknik', 2],
      ['p23-manajemen', 'Jasa manajemen', 2],
      ['p23-konsultan', 'Jasa konsultan', 2],
      ['p23-penilai', 'Jasa penilai (appraisal)', 2],
      ['p23-aktuaris', 'Jasa aktuaris', 2],
      ['p23-akuntansi', 'Jasa akuntansi, pembukuan, dan atestasi laporan keuangan', 2],
      ['p23-hukum', 'Jasa hukum', 2],
      ['p23-arsitektur', 'Jasa arsitektur', 2],
      ['p23-perencanaan', 'Jasa perencanaan kota dan arsitektur lanskap', 2],
      ['p23-desain', 'Jasa perancang/desain', 2],
      ['p23-pengeboran', 'Jasa pengeboran di bidang pertambangan selain yang dilakukan BUT', 2],
      ['p23-penunjang-migas', 'Jasa penunjang di bidang usaha panas bumi dan pertambangan minyak dan gas bumi', 2],
      ['p23-penambangan', 'Jasa penambangan dan jasa penunjang selain usaha panas bumi, minyak, dan gas bumi', 2],
      ['p23-penerbangan', 'Jasa penunjang di bidang penerbangan dan bandar udara', 2],
      ['p23-penebangan', 'Jasa penebangan hutan', 2],
      ['p23-pengolahan-limbah', 'Jasa pengolahan limbah', 2],
      ['p23-penyedia-tenaga', 'Jasa penyedia tenaga kerja / outsourcing services', 2],
      ['p23-perantara', 'Jasa perantara dan/atau keagenan', 2],
      ['p23-sekuritas', 'Jasa bidang perdagangan surat berharga, kecuali yang dilakukan bursa efek/KSEI/KPEI', 2],
      ['p23-kustodian', 'Jasa kustodian/penyimpanan/penitipan selain yang dilakukan KSEI', 2],
      ['p23-dubbing', 'Jasa pengisian suara (dubbing) dan/atau sulih suara', 2],
      ['p23-mixing', 'Jasa mixing film', 2],
      ['p23-media', 'Jasa penyediaan tempat dan/atau waktu dalam media massa, media luar ruang, atau media lain untuk penyampaian informasi', 2],
      ['p23-komputer', 'Jasa sehubungan perangkat lunak, perangkat keras, atau sistem komputer, termasuk perawatan/pemeliharaan/perbaikan', 2],
      ['p23-internet', 'Jasa pembuatan dan/atau pengelolaan website', 2],
      ['p23-data', 'Jasa penyimpanan, pengolahan, dan/atau penyaluran data/informasi', 2],
      ['p23-instalasi', 'Jasa instalasi/pemasangan mesin, peralatan, listrik, telepon, air, gas, AC, TV kabel, selain jasa konstruksi', 2],
      ['p23-maintenance', 'Jasa perawatan/perbaikan/pemeliharaan mesin, peralatan, listrik, telepon, air, gas, AC, TV kabel, kendaraan, dan/atau bangunan selain jasa konstruksi', 2],
      ['p23-maklon', 'Jasa maklon', 2],
      ['p23-keamanan', 'Jasa penyelidikan dan keamanan', 2],
      ['p23-event', 'Jasa penyelenggara kegiatan atau event organizer', 2],
      ['p23-katering', 'Jasa katering atau tata boga', 2],
      ['p23-cleaning', 'Jasa kebersihan atau cleaning service', 2],
      ['p23-hama', 'Jasa pembasmian hama', 2],
      ['p23-septic', 'Jasa sedot septic tank', 2],
      ['p23-kolam', 'Jasa pemeliharaan kolam', 2],
      ['p23-freight', 'Jasa freight forwarding', 2],
      ['p23-logistik', 'Jasa logistik', 2],
      ['p23-dokumen', 'Jasa pengurusan dokumen', 2],
      ['p23-packing', 'Jasa pengepakan', 2],
      ['p23-loading', 'Jasa loading dan unloading', 2],
      ['p23-lab', 'Jasa laboratorium dan/atau pengujian, kecuali untuk keperluan medis', 2],
      ['p23-parkir', 'Jasa pengelolaan parkir', 2],
      ['p23-training', 'Jasa pelatihan dan/atau kursus', 2],
      ['p23-sertifikasi', 'Jasa sertifikasi', 2],
      ['p23-survei', 'Jasa survei', 2],
      ['p23-testing', 'Jasa testing/pengujian selain yang telah disebutkan', 2],
      ['p23-lain', 'Jasa lain yang merupakan objek PPh Pasal 23 sesuai ketentuan', 2]
    ]
  },
  p42: {
    label: 'PPh Final Pasal 4 ayat (2)',
    items: [
      ['sTB', 'Sewa tanah dan/atau bangunan', 10],
      ['k1', 'Jasa konstruksi kecil tersertifikasi', 1.75],
      ['k2', 'Jasa konstruksi tersertifikasi selain kecil', 2.65],
      ['k3', 'Jasa konstruksi tanpa sertifikat', 4]
    ]
  },
  p15: {
    label: 'PPh Pasal 15',
    items: [
      ['p15a', 'Charter penerbangan dalam negeri', 1.8],
      ['p15p', 'Pelayaran dalam negeri', 1.2]
    ]
  },
  p22: {
    label: 'PPh Pasal 22',
    items: [
      ['p22a', 'Impor dengan API', 2.5],
      ['p22n', 'Impor tanpa API', 7.5],
      ['p22b', 'Pembelian barang bendahara/BUMN/BUMD', 1.5],
      ['p22s', 'Sistem Informasi Pengadaan', 0.5],
      ['p22e', 'Emas perhiasan/batangan', 0.25]
    ]
  },
  p26: {
    label: 'PPh Pasal 26',
    items: [['p26', 'Wajib Pajak Luar Negeri — tarif domestik', 20]]
  },
  custom: {
    label: 'Tarif khusus / objek lain',
    items: [['custom', 'Tarif khusus, tax treaty, atau objek lain', null]]
  }
};

const bpa1AnnualizationCriteria = [
  ['none', 'Tidak disetahunkan / kondisi normal'],
  ['subjective-start', 'Kewajiban pajak subjektif baru dimulai setelah Januari'],
  ['permanent-leave', 'Berhenti bekerja dan meninggalkan Indonesia untuk selama-lamanya'],
  ['death', 'Berhenti bekerja karena meninggal dunia'],
  ['other-part-year', 'Kondisi lain: kewajiban pajak subjektif hanya meliputi bagian tahun pajak (verifikasi)']
];

function formatThousands(raw, allowDecimal = false) {
  if (raw === '' || raw === null || raw === undefined) return '0';
  let value = String(raw).replace(/\s/g, '');
  let negative = value.startsWith('-');
  value = value.replace(/-/g, '');
  let integer = value;
  let decimal = '';
  if (allowDecimal && value.includes('.')) {
    const parts = value.split('.');
    integer = parts.shift() || '0';
    decimal = parts.join('').replace(/\D/g, '').slice(0, 4);
  }
  integer = integer.replace(/\D/g, '') || '0';
  integer = integer.replace(/^0+(?=\d)/, '');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${negative ? '-' : ''}${grouped}${allowDecimal && decimal ? `,${decimal}` : ''}`;
}

function parseThousands(text, allowDecimal = false) {
  let value = String(text ?? '').trim();
  if (!value) return '0';
  const negative = value.startsWith('-');
  value = value.replace(/-/g, '');

  if (!allowDecimal) {
    const digits = value.replace(/\D/g, '');
    return `${negative ? '-' : ''}${digits || '0'}`;
  }

  let integerPart = value;
  let decimalPart = '';
  if (value.includes(',')) {
    const parts = value.split(',');
    integerPart = parts.shift() || '0';
    decimalPart = parts.join('').replace(/\D/g, '').slice(0, 4);
  } else {
    const dotCount = (value.match(/\./g) || []).length;
    if (dotCount === 1) {
      const [left, right] = value.split('.');
      if (right.length > 0 && right.length <= 4 && left.replace(/\D/g, '').length <= 3) {
        integerPart = left;
        decimalPart = right.replace(/\D/g, '').slice(0, 4);
      } else {
        integerPart = value.replace(/\./g, '');
      }
    } else {
      integerPart = value.replace(/\./g, '');
    }
  }
  const integer = integerPart.replace(/\D/g, '') || '0';
  return `${negative ? '-' : ''}${integer}${decimalPart ? `.${decimalPart}` : ''}`;
}

function NumericInput({ value, setValue, allowDecimal = false, min, max, className }) {
  return <input
    type="text"
    inputMode={allowDecimal ? 'decimal' : 'numeric'}
    className={className}
    value={formatThousands(value, allowDecimal)}
    onFocus={(e) => e.target.select()}
    onChange={(e) => {
      const raw = parseThousands(e.target.value, allowDecimal);
      let numeric = Number(raw);
      if (!Number.isFinite(numeric)) numeric = 0;
      if (min !== undefined) numeric = Math.max(min, numeric);
      if (max !== undefined) numeric = Math.min(max, numeric);
      setValue(String(numeric));
    }}
  />;
}

function Money({ label, value, setValue, hint }) {
  return <label className="field"><span>{label}</span><div className="money-input"><span>Rp</span><NumericInput value={value} setValue={setValue} min={0} /></div>{hint && <small>{hint}</small>}</label>;
}

function Row({ label, value, strong = false, note }) {
  return <div className={`result-line ${strong ? 'strong' : ''}`}><div><span>{label}</span>{note && <small>{note}</small>}</div><b>{value}</b></div>;
}

function P21() {
  const [mode, setMode] = useState('monthly');
  const [method, setMethod] = useState('gross');
  const [grossMonthly, setGrossMonthly] = useState('0');
  const [status, setStatus] = useState('TK/0');
  const [code, setCode] = useState('21-100-01');
  const [annualGross, setAnnualGross] = useState('0');
  const [pension, setPension] = useState('0');
  const [months, setMonths] = useState('0');
  const [prior, setPrior] = useState('0');
  const [annualizationCriterion, setAnnualizationCriterion] = useState('none');

  const annualize = mode === 'a1' && annualizationCriterion !== 'none';
  const monthly = useMemo(() => calculateMonthlyPph21ByMethod({ amount: grossMonthly, ptkpStatus: status, method }), [grossMonthly, status, method]);
  const annual = useMemo(() => calculateAnnualPph21ByMethod({ annualGross, pensionContribution: pension, ptkpStatus: status, monthsWorked: months, priorWithheld: prior, method, annualize }), [annualGross, pension, status, months, prior, method, annualize]);
  const annualMode = mode !== 'monthly';
  const object = PPH21_CODES.find((item) => item.code === code);
  const compatible = code === '21-100-01';
  const criterionLabel = bpa1AnnualizationCriteria.find(([id]) => id === annualizationCriterion)?.[1] || '';

  return <div className="calculator-grid"><section className="panel form-panel">
    <div className="method-segmented" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>{[['gross', 'Gross'], ['grossUp', 'Gross Up']].map(([value, label]) => <button key={value} className={method === value ? 'active' : ''} onClick={() => setMethod(value)}>{label}</button>)}</div>
    <div className="segmented pph21-mode">{[['monthly', 'Masa selain terakhir'], ['annual', 'Masa pajak terakhir'], ['a1', 'BP A1']].map(([value, label]) => <button key={value} className={mode === value ? 'active' : ''} onClick={() => setMode(value)}>{label}</button>)}</div>
    <label className="field"><span>Status PTKP</span><select value={status} onChange={(e) => setStatus(e.target.value)}>{Object.entries(PTKP).map(([key, value]) => <option key={key} value={key}>{key} - {formatRupiah(value)}</option>)}</select><small>Batas PTKP sesuai status keluarga pada awal tahun pajak.</small></label>
    <label className="field"><span>Kode objek PPh 21</span><select value={code} onChange={(e) => setCode(e.target.value)}>{PPH21_CODE_GROUPS.map((group) => <optgroup key={group.label} label={group.label}>{group.options.map(([itemCode, label]) => <option key={itemCode} value={itemCode}>{itemCode} — {label}</option>)}</optgroup>)}</select><small>Daftar lengkap mengikuti Lampiran PER-11/PJ/2025.</small></label>
    {!compatible && <div className="warning-box">Kode ini tersedia untuk administrasi, tetapi formula otomatis modul ini masih difokuskan pada pegawai tetap 21-100-01.</div>}
    {!annualMode ? <Money label={method === 'grossUp' ? 'Penghasilan sebelum tunjangan pajak bulan ini' : 'Penghasilan bruto bulan ini'} value={grossMonthly} setValue={setGrossMonthly} /> : <>
      {mode === 'a1' && <><div className="info-box"><b>BP A1 / BPA1</b><br />Pilih kondisi apabila penghasilan neto perlu disetahunkan karena kewajiban pajak subjektif hanya meliputi bagian tahun pajak.</div><label className="field"><span>Kriteria PPh 21 Setahun / Disetahunkan</span><select value={annualizationCriterion} onChange={(e) => setAnnualizationCriterion(e.target.value)}>{bpa1AnnualizationCriteria.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select><small>Empat kondisi disetahunkan tersedia di bawah opsi kondisi normal. Gunakan opsi “kondisi lain” hanya setelah fakta kewajiban pajak subjektif diverifikasi.</small></label></>}
      <Money label="Penghasilan selama masa perolehan" value={annualGross} setValue={setAnnualGross} />
      <Money label="Iuran pensiun/JHT" value={pension} setValue={setPension} />
      <label className="field"><span>Jumlah bulan dalam masa perolehan</span><NumericInput value={months} setValue={setMonths} min={0} max={12} /><small>Isi 1–12. Nilai awal 0 agar pengguna memasukkan periode yang benar.</small></label>
      <Money label="PPh 21 sudah dipotong" value={prior} setValue={setPrior} />
    </>}
  </section><section className="panel result-panel">
    <div className="eyebrow">{mode === 'a1' ? 'Rekonsiliasi BP A1' : 'Hasil PPh 21'}</div>
    {!annualMode ? <><div className="hero-result"><span>PPh 21 masa ini</span><strong>{formatRupiah(monthly.tax)}</strong></div><Row label="Kode objek" value={`${code} — ${object?.label || ''}`} /><Row label="Status PTKP" value={`${status} — ${formatRupiah(PTKP[status])}`} /><Row label="Kategori TER" value={`Kategori ${monthly.category}`} /><Row label="Tarif efektif" value={`${monthly.rate}%`} /><Row label="Nilai dasar" value={formatRupiah(monthly.baseGross)} />{method === 'grossUp' && <Row label="Tunjangan pajak" value={formatRupiah(monthly.taxAllowance)} />}<Row label="Bruto untuk pajak" value={formatRupiah(monthly.gross)} /><Row label="Take-home sebelum potongan lain" value={formatRupiah(monthly.takeHome)} strong /></> : <><div className="hero-result"><span>{annual.lastPeriodTax >= 0 ? 'PPh 21 masa pajak terakhir' : 'Kelebihan pemotongan'}</span><strong>{formatRupiah(Math.abs(annual.lastPeriodTax))}</strong></div><Row label="Kode objek" value={`${code} — ${object?.label || ''}`} /><Row label="Status PTKP" value={`${status} — ${formatRupiah(PTKP[status])}`} />{mode === 'a1' && <Row label="Kriteria" value={criterionLabel} strong />}<Row label="Penghasilan bruto" value={formatRupiah(annual.gross)} /><Row label="Biaya jabatan" value={formatRupiah(annual.positionExpense)} /><Row label="Iuran pensiun/JHT" value={formatRupiah(annual.pension)} />{annual.annualized ? <><Row label="Penghasilan neto aktual" value={formatRupiah(annual.netActual)} /><Row label="Penghasilan neto disetahunkan" value={formatRupiah(annual.netAnnualized)} strong /><Row label="PTKP setahun" value={formatRupiah(annual.ptkp)} /><Row label="PKP disetahunkan" value={formatRupiah(annual.pkp)} /><Row label="PPh 21 atas PKP disetahunkan" value={formatRupiah(annual.taxOnAnnualizedPkp)} /><Row label="PPh 21 terutang proporsional" value={formatRupiah(annual.annualTax)} strong /></> : <><Row label="Penghasilan neto" value={formatRupiah(annual.net)} /><Row label="PTKP" value={formatRupiah(annual.ptkp)} /><Row label="PKP" value={formatRupiah(annual.pkp)} /><Row label="PPh 21 setahun" value={formatRupiah(annual.annualTax)} strong /></>}<Row label="PPh 21 telah dipotong" value={formatRupiah(annual.priorWithheld)} />{mode === 'a1' && <Row label="Selisih masa terakhir" value={formatRupiah(annual.lastPeriodTax)} strong />}</>}
  </section></div>;
}

function PPN() {
  const [kind, setKind] = useState('nonLuxury');
  const [inclusive, setInclusive] = useState(false);
  const [amount, setAmount] = useState('0');
  const result = useMemo(() => calculateVat({ amount, kind, inclusive }), [amount, kind, inclusive]);
  const formula = kind === 'nonLuxury' ? `DPP Nilai Lain = 11/12 × ${formatRupiah(result.preVat)} = ${formatRupiah(result.dpp)} · PPN = 12% × ${formatRupiah(result.dpp)} = ${formatRupiah(result.vat)}` : `PPN = 12% × ${formatRupiah(result.dpp)} = ${formatRupiah(result.vat)}`;
  return <div className="calculator-grid"><section className="panel form-panel"><label className="field"><span>Jenis transaksi</span><select value={kind} onChange={(e) => setKind(e.target.value)}><option value="nonLuxury">BKP non-mewah / JKP umum</option><option value="luxury">BKP mewah tertentu</option></select></label><label className="check-row"><input type="checkbox" checked={inclusive} onChange={(e) => setInclusive(e.target.checked)} /><span>Nilai sudah termasuk PPN</span></label><Money label={inclusive ? 'Nilai termasuk PPN' : 'Harga jual / penggantian sebelum PPN'} value={amount} setValue={setAmount} /></section><section className="panel result-panel"><div className="eyebrow">Hasil PPN</div><div className="hero-result"><span>PPN terutang</span><strong>{formatRupiah(result.vat)}</strong></div><Row label="Tarif formal" value="12%" /><Row label="Tarif efektif" value={`${Math.round(result.effectiveRate * 100)}%`} /><Row label="Harga sebelum PPN" value={formatRupiah(result.preVat)} /><Row label="DPP penghitungan" value={formatRupiah(result.dpp)} /><Row label="Total setelah PPN" value={formatRupiah(result.total)} strong /><div className="formula">{formula}</div></section></div>;
}

function UMKM() {
  const [type, setType] = useState('individual');
  const [before, setBefore] = useState('0');
  const [month, setMonth] = useState('0');
  const [previousYear, setPreviousYear] = useState('0');
  const result = useMemo(() => calculateUmkmFinal({ taxpayerType: type, priorYtd: before, currentMonth: month }), [type, before, month]);
  const eligible = (Number(previousYear) || 0) <= 4800000000;
  return <div className="calculator-grid"><section className="panel form-panel"><label className="field"><span>Jenis Wajib Pajak</span><select value={type} onChange={(e) => setType(e.target.value)}><option value="individual">Orang Pribadi</option><option value="soleCompany">Perseroan Perorangan</option><option value="cooperative">Koperasi</option><option value="transition">CV / Firma / PT biasa / BUMDes</option></select></label><Money label="Peredaran bruto tahun sebelumnya" value={previousYear} setValue={setPreviousYear} /><Money label="Omzet sebelum bulan ini" value={before} setValue={setBefore} /><Money label="Omzet bulan ini" value={month} setValue={setMonth} /></section><section className="panel result-panel"><div className="eyebrow">Hasil PPh Final UMKM</div><div className="hero-result"><span>PPh Final bulan ini</span><strong>{eligible ? formatRupiah(result.tax) : 'Periksa kelayakan'}</strong></div><Row label="Omzet sebelum bulan ini" value={formatRupiah(result.before)} /><Row label="Omzet bulan ini" value={formatRupiah(result.month)} /><Row label="Omzet kumulatif" value={formatRupiah(result.after)} /><Row label="Omzet dikenai 0,5%" value={formatRupiah(result.taxableTurnover)} /><Row label="Tarif" value="0,5%" strong /></section></div>;
}

function UNI() {
  const [groupId, setGroupId] = useState('p23');
  const [objectId, setObjectId] = useState('p23-dividen');
  const [amount, setAmount] = useState('0');
  const [customRate, setCustomRate] = useState('0');
  const group = unifikasiGroups[groupId];
  const selected = group.items.find((item) => item[0] === objectId) || group.items[0];
  const rate = selected[2] ?? Math.max(0, Number(customRate) || 0);
  const gross = Math.max(0, Number(amount) || 0);
  const tax = Math.round(gross * rate / 100);

  const changeGroup = (nextGroup) => {
    setGroupId(nextGroup);
    setObjectId(unifikasiGroups[nextGroup].items[0][0]);
  };

  return <div className="calculator-grid"><section className="panel form-panel">
    <label className="field"><span>Jenis PPh Utama</span><select value={groupId} onChange={(e) => changeGroup(e.target.value)}>{Object.entries(unifikasiGroups).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select><small>Pilih jenis PPh utama terlebih dahulu.</small></label>
    <label className="field"><span>Objek PPh Unifikasi</span><select value={objectId} onChange={(e) => setObjectId(e.target.value)}>{group.items.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select><small>{groupId === 'p23' ? 'Objek PPh Pasal 23 diperluas menjadi penghasilan 15%, sewa 2%, dan berbagai jasa 2%.' : 'Daftar objek otomatis mengikuti jenis PPh utama yang dipilih.'}</small></label>
    <Money label="Jumlah bruto / dasar pemotongan" value={amount} setValue={setAmount} />
    {groupId === 'custom' && <label className="field"><span>Tarif yang berlaku (%)</span><NumericInput value={customRate} setValue={setCustomRate} min={0} allowDecimal /></label>}
  </section><section className="panel result-panel"><div className="eyebrow">Hasil PPh Unifikasi</div><div className="hero-result"><span>PPh dipotong / dipungut</span><strong>{formatRupiah(tax)}</strong></div><Row label="Jenis PPh" value={group.label} /><Row label="Objek" value={selected[1]} /><Row label="Tarif" value={`${rate}%`} /><Row label="Dasar pemotongan" value={formatRupiah(gross)} /></section></div>;
}

const depreciationRates = {
  group1: { label: 'Kelompok 1 — 4 tahun', sl: 0.25, db: 0.50, life: 4 },
  group2: { label: 'Kelompok 2 — 8 tahun', sl: 0.125, db: 0.25, life: 8 },
  group3: { label: 'Kelompok 3 — 16 tahun', sl: 0.0625, db: 0.125, life: 16 },
  group4: { label: 'Kelompok 4 — 20 tahun', sl: 0.05, db: 0.10, life: 20 },
  buildingPermanent: { label: 'Bangunan permanen — 20 tahun', sl: 0.05, db: null, life: 20 },
  buildingTemporary: { label: 'Bangunan tidak permanen — 10 tahun', sl: 0.10, db: null, life: 10 }
};

function fiscalDepreciation(asset) {
  const cost = Math.max(0, Number(asset.cost) || 0);
  const month = Math.min(12, Math.max(1, Number(asset.month) || 1));
  const acquisitionYear = Math.min(TAX_YEAR, Math.max(1980, Number(asset.year) || TAX_YEAR));
  const group = depreciationRates[asset.group] || depreciationRates.group1;
  const method = group.db === null ? 'sl' : asset.method;
  if (TAX_YEAR < acquisitionYear || cost <= 0) return 0;

  if (method === 'sl') {
    const totalLifeMonths = group.life * 12;
    const firstYearMonths = 13 - month;
    const usedBeforeCurrentYear = TAX_YEAR === acquisitionYear ? 0 : firstYearMonths + Math.max(0, TAX_YEAR - acquisitionYear - 1) * 12;
    const remainingMonths = Math.max(0, totalLifeMonths - usedBeforeCurrentYear);
    const currentMonths = TAX_YEAR === acquisitionYear ? Math.min(firstYearMonths, remainingMonths) : Math.min(12, remainingMonths);
    return Math.round(cost * group.sl * currentMonths / 12);
  }

  let bookValue = cost;
  let currentDepreciation = 0;
  for (let year = acquisitionYear; year <= TAX_YEAR && bookValue > 0; year += 1) {
    const months = year === acquisitionYear ? 13 - month : 12;
    currentDepreciation = Math.min(bookValue, bookValue * group.db * months / 12);
    if (year === TAX_YEAR) return Math.round(currentDepreciation);
    bookValue -= currentDepreciation;
  }
  return 0;
}

const corporateSchemeInfo = {
  auto: { label: 'Otomatis — Pasal 31E / tarif umum', short: 'Otomatis 31E / 22%', help: 'Jika omzet sampai Rp50 miliar, kalkulator menerapkan fasilitas Pasal 31E. Jika di atas Rp50 miliar, seluruh PKP menggunakan tarif umum 22%.' },
  general22: { label: 'Tarif umum 22%', short: 'Tarif umum 22%', help: 'Menggunakan tarif umum PPh Badan 22% atas seluruh PKP tanpa fasilitas Pasal 31E.' },
  listed19: { label: 'Perseroan Terbuka 19%', short: 'Perseroan Terbuka 19%', help: 'Tarif 3% lebih rendah dari tarif umum untuk Perseroan Terbuka yang memenuhi seluruh persyaratan yang berlaku.' },
  final05: { label: 'PPh Final UMKM 0,5% — PT Perorangan/Koperasi', short: 'PPh Final UMKM 0,5%', help: 'Skema 0,5% dihitung dari omzet, bukan PKP, dan hanya digunakan jika seluruh syaratnya terpenuhi.' },
  manual: { label: 'Tarif khusus / manual', short: 'Tarif manual', help: 'Gunakan hanya untuk kasus khusus yang sudah diverifikasi. Tarif manual dikenakan atas PKP.' }
};

function CorpTax() {
  const [section, setSection] = useState('summary');
  const [scheme, setScheme] = useState('auto');
  const [entityType, setEntityType] = useState('regular');
  const [coopEligible, setCoopEligible] = useState(true);
  const [manualRate, setManualRate] = useState('0');
  const [revenue, setRevenue] = useState('0');
  const [commercialProfit, setCommercialProfit] = useState('0');
  const [corrections, setCorrections] = useState([
    { id: 1, name: 'Biaya yang tidak dapat dikurangkan', type: 'positive', amount: '0' },
    { id: 2, name: 'Penghasilan dikenai PPh Final', type: 'negative', amount: '0' },
    { id: 3, name: 'Penghasilan bukan objek pajak', type: 'negative', amount: '0' }
  ]);
  const [assets, setAssets] = useState([
    { id: 1, name: 'Aset 1', kind: 'tangible', cost: '0', month: '1', year: String(TAX_YEAR), group: 'group1', method: 'sl', commercial: '0' }
  ]);
  const [losses, setLosses] = useState(['0', '0', '0', '0', '0']);
  const [credits, setCredits] = useState({ p22: '0', p23: '0', p24: '0', p25: '0', other: '0' });

  const assetCalc = assets.map((asset) => {
    const fiscal = fiscalDepreciation(asset);
    const commercial = Math.max(0, Number(asset.commercial) || 0);
    const diff = commercial - fiscal;
    return { ...asset, fiscal, commercial, positive: Math.max(0, diff), negative: Math.max(0, -diff) };
  });

  const manualPositive = corrections.filter((x) => x.type === 'positive').reduce((sum, x) => sum + Math.max(0, Number(x.amount) || 0), 0);
  const manualNegative = corrections.filter((x) => x.type === 'negative').reduce((sum, x) => sum + Math.max(0, Number(x.amount) || 0), 0);
  const assetPositive = assetCalc.reduce((sum, x) => sum + x.positive, 0);
  const assetNegative = assetCalc.reduce((sum, x) => sum + x.negative, 0);
  const positive = manualPositive + assetPositive;
  const negative = manualNegative + assetNegative;
  const fiscalNet = (Number(commercialProfit) || 0) + positive - negative;
  const lossAvailable = losses.reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  const lossUsed = Math.min(Math.max(0, fiscalNet), lossAvailable);
  const pkp = Math.max(0, Math.floor((fiscalNet - lossUsed) / 1000) * 1000);
  const rev = Math.max(0, Number(revenue) || 0);

  const final05EntityEligible = entityType === 'soleCompany' || entityType === 'cooperative';
  const final05TurnoverEligible = rev <= 4800000000;
  const final05TimeEligible = entityType !== 'cooperative' || coopEligible;
  const final05Eligible = final05EntityEligible && final05TurnoverEligible && final05TimeEligible;

  let facilityPkp = 0;
  let normalPkp = pkp;
  let taxDue = 0;
  let calculationLabel = corporateSchemeInfo[scheme].short;
  let formulaText = '';

  if (scheme === 'auto') {
    if (rev > 0 && rev <= 50000000000) {
      facilityPkp = rev <= 4800000000 ? pkp : Math.min(pkp, pkp * 4800000000 / rev);
      normalPkp = pkp - facilityPkp;
    }
    taxDue = Math.round(facilityPkp * 0.11 + normalPkp * 0.22);
    calculationLabel = facilityPkp > 0 ? 'Pasal 31E + tarif umum' : 'Tarif umum 22%';
    formulaText = facilityPkp > 0 ? `PPh = 11% × ${formatRupiah(facilityPkp)} + 22% × ${formatRupiah(normalPkp)} = ${formatRupiah(taxDue)}` : `PPh = 22% × ${formatRupiah(normalPkp)} = ${formatRupiah(taxDue)}`;
  } else if (scheme === 'general22') {
    taxDue = Math.round(pkp * 0.22);
    formulaText = `PPh = 22% × ${formatRupiah(pkp)} = ${formatRupiah(taxDue)}`;
  } else if (scheme === 'listed19') {
    taxDue = Math.round(pkp * 0.19);
    formulaText = `PPh = 19% × ${formatRupiah(pkp)} = ${formatRupiah(taxDue)}`;
  } else if (scheme === 'final05') {
    taxDue = final05Eligible ? Math.round(rev * 0.005) : 0;
    normalPkp = 0;
    formulaText = final05Eligible ? `PPh Final = 0,5% × ${formatRupiah(rev)} = ${formatRupiah(taxDue)}` : 'Skema PPh Final 0,5% belum dapat dihitung karena syarat belum terpenuhi.';
  } else {
    const rate = Math.max(0, Number(manualRate) || 0) / 100;
    taxDue = Math.round(pkp * rate);
    formulaText = `PPh = ${Number(manualRate) || 0}% × ${formatRupiah(pkp)} = ${formatRupiah(taxDue)}`;
  }

  const totalCredits = scheme === 'final05' ? 0 : Object.values(credits).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  const balance = taxDue - totalCredits;
  const updateCorrection = (id, key, value) => setCorrections((items) => items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const updateAsset = (id, key, value) => setAssets((items) => items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const years = Array.from({ length: 47 }, (_, index) => TAX_YEAR - index);

  return <div className="corp-wrap"><nav className="corp-tabs">{[['summary', 'Ringkasan'], ['recon', 'Rekonsiliasi Fiskal'], ['assets', 'Penyusutan & Amortisasi'], ['credits', 'Kredit Pajak']].map(([value, label]) => <button key={value} className={section === value ? 'active' : ''} onClick={() => setSection(value)}>{label}</button>)}</nav><div className="calculator-grid"><section className="panel form-panel corp-form">
    {section === 'summary' && <><div className="eyebrow">Data utama PPh Badan</div><label className="field"><span>Skema / Tarif PPh Badan</span><select value={scheme} onChange={(e) => setScheme(e.target.value)}>{Object.entries(corporateSchemeInfo).map(([value, info]) => <option key={value} value={value}>{info.label}</option>)}</select><small>{corporateSchemeInfo[scheme].help}</small></label>{scheme === 'final05' && <><label className="field"><span>Jenis Wajib Pajak Badan</span><select value={entityType} onChange={(e) => setEntityType(e.target.value)}><option value="regular">PT biasa / CV / Firma / badan lain</option><option value="soleCompany">Perseroan Perorangan</option><option value="cooperative">Koperasi</option></select></label>{entityType === 'cooperative' && <label className="check-row"><input type="checkbox" checked={coopEligible} onChange={(e) => setCoopEligible(e.target.checked)} /><span>Koperasi masih dalam jangka waktu penggunaan tarif final yang diperbolehkan</span></label>}{!final05Eligible && <div className="warning-box">Skema 0,5% hanya digunakan bila seluruh syarat subjek, omzet, dan jangka waktunya terpenuhi.</div>}</>}{scheme === 'manual' && <label className="field"><span>Tarif manual (%)</span><NumericInput value={manualRate} setValue={setManualRate} min={0} allowDecimal /><small>Gunakan hanya setelah dasar hukum tarif khusus diverifikasi.</small></label>}<Money label="Peredaran bruto setahun" value={revenue} setValue={setRevenue} /><Money label="Laba / (rugi) komersial sebelum pajak" value={commercialProfit} setValue={setCommercialProfit} /><div className="rate-grid"><div><span>22%</span><small>Tarif umum</small></div><div><span>19%</span><small>Perseroan Terbuka*</small></div><div><span>11%</span><small>Efektif Pasal 31E*</small></div><div><span>0,5%</span><small>Final UMKM Badan*</small></div></div><small className="rate-note">*Hanya jika seluruh persyaratan masing-masing skema terpenuhi.</small><div className="corp-summary-box"><b>Skema aktif: {calculationLabel}</b><span>{scheme === 'final05' ? 'Omzet → tarif final 0,5% → PPh Final.' : 'Laba komersial → koreksi fiskal → neto fiskal → kompensasi rugi → PKP → tarif → kredit pajak → PPh 29/lebih bayar.'}</span></div></>}

    {section === 'recon' && <><div className="eyebrow">Rekonsiliasi Fiskal</div><p className="corp-help">Koreksi dari penyusutan/amortisasi otomatis ikut masuk dari tab aset.</p>{corrections.map((item) => <div className="recon-row" key={item.id}><input value={item.name} onChange={(e) => updateCorrection(item.id, 'name', e.target.value)} /><select value={item.type} onChange={(e) => updateCorrection(item.id, 'type', e.target.value)}><option value="positive">Koreksi Positif</option><option value="negative">Koreksi Negatif</option></select><NumericInput value={item.amount} setValue={(value) => updateCorrection(item.id, 'amount', value)} min={0} /><button className="icon-btn" onClick={() => setCorrections((items) => items.filter((x) => x.id !== item.id))}>×</button></div>)}<button className="secondary-btn" onClick={() => setCorrections((items) => [...items, { id: Date.now(), name: 'Koreksi lain', type: 'positive', amount: '0' }])}>+ Tambah koreksi</button><div className="mini-results"><span>Total koreksi positif <b>{formatRupiah(positive)}</b></span><span>Total koreksi negatif <b>{formatRupiah(negative)}</b></span></div><div className="eyebrow" style={{ marginTop: 8 }}>Kompensasi kerugian fiskal</div><div className="loss-grid">{losses.map((value, index) => <label key={index}><span>Tahun N-{index + 1}</span><NumericInput value={value} setValue={(next) => setLosses((items) => items.map((x, i) => i === index ? next : x))} min={0} /></label>)}</div></>}

    {section === 'assets' && <><div className="eyebrow">Penyusutan & Amortisasi Fiskal</div><p className="corp-help">Tahun pajak kalkulator: {TAX_YEAR}. Tahun dan bulan perolehan ikut menentukan penyusutan/amortisasi fiskal tahun berjalan.</p>{assets.map((asset) => { const calc = assetCalc.find((x) => x.id === asset.id); const group = depreciationRates[asset.group] || depreciationRates.group1; return <div className="asset-card" key={asset.id}><div className="asset-head"><input value={asset.name} onChange={(e) => updateAsset(asset.id, 'name', e.target.value)} /><button className="icon-btn" onClick={() => setAssets((items) => items.filter((x) => x.id !== asset.id))}>×</button></div><div className="asset-grid"><label><span>Jenis</span><select value={asset.kind} onChange={(e) => updateAsset(asset.id, 'kind', e.target.value)}><option value="tangible">Harta berwujud</option><option value="intangible">Harta tak berwujud</option></select></label><label><span>Nilai perolehan</span><NumericInput value={asset.cost} setValue={(value) => updateAsset(asset.id, 'cost', value)} min={0} /></label><label><span>Tahun perolehan</span><select value={asset.year} onChange={(e) => updateAsset(asset.id, 'year', e.target.value)}>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></label><label><span>Bulan perolehan</span><select value={asset.month} onChange={(e) => updateAsset(asset.id, 'month', e.target.value)}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select></label><label><span>Kelompok fiskal</span><select value={asset.group} onChange={(e) => updateAsset(asset.id, 'group', e.target.value)}>{Object.entries(depreciationRates).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></label><label><span>Metode</span><select value={group.db === null ? 'sl' : asset.method} disabled={group.db === null} onChange={(e) => updateAsset(asset.id, 'method', e.target.value)}><option value="sl">Garis lurus</option>{group.db !== null && <option value="db">Saldo menurun</option>}</select></label><label><span>Penyusutan/amortisasi komersial {TAX_YEAR}</span><NumericInput value={asset.commercial} setValue={(value) => updateAsset(asset.id, 'commercial', value)} min={0} /></label></div><div className="asset-result"><span>Perolehan: <b>{asset.month}/{asset.year}</b></span><span>Fiskal {TAX_YEAR}: <b>{formatRupiah(calc.fiscal)}</b></span><span>{calc.positive > 0 ? 'Koreksi +' : calc.negative > 0 ? 'Koreksi -' : 'Tidak ada koreksi'}: <b>{formatRupiah(calc.positive || calc.negative)}</b></span></div></div>; })}<button className="secondary-btn" onClick={() => setAssets((items) => [...items, { id: Date.now(), name: 'Aset baru', kind: 'tangible', cost: '0', month: '1', year: String(TAX_YEAR), group: 'group1', method: 'sl', commercial: '0' }])}>+ Tambah aset</button></>}

    {section === 'credits' && <><div className="eyebrow">Kredit Pajak</div>{scheme === 'final05' ? <div className="info-box">Pada skema PPh Final UMKM 0,5%, kredit PPh 22/23/24/25 tidak digunakan untuk menghitung PPh Final terutang dalam kalkulator ini.</div> : <><Money label="Kredit PPh Pasal 22" value={credits.p22} setValue={(value) => setCredits({ ...credits, p22: value })} /><Money label="Kredit PPh Pasal 23" value={credits.p23} setValue={(value) => setCredits({ ...credits, p23: value })} /><Money label="Kredit PPh Pasal 24" value={credits.p24} setValue={(value) => setCredits({ ...credits, p24: value })} /><Money label="Angsuran PPh Pasal 25" value={credits.p25} setValue={(value) => setCredits({ ...credits, p25: value })} /><Money label="Kredit pajak lain yang dapat diperhitungkan" value={credits.other} setValue={(value) => setCredits({ ...credits, other: value })} /></>}</>}
  </section><section className="panel result-panel corp-result"><div className="eyebrow">Hasil PPh Badan</div><div className="hero-result"><span>{scheme === 'final05' ? (final05Eligible ? 'PPh Final UMKM terutang' : 'Status skema') : (balance >= 0 ? 'PPh Pasal 29 kurang bayar' : 'PPh lebih bayar')}</span><strong>{scheme === 'final05' && !final05Eligible ? 'Periksa kelayakan' : formatRupiah(Math.abs(scheme === 'final05' ? taxDue : balance))}</strong></div><Row label="Skema tarif" value={calculationLabel} strong /><Row label="Peredaran bruto" value={formatRupiah(rev)} />{scheme !== 'final05' && <><Row label="Laba/(rugi) komersial sebelum pajak" value={formatRupiah(commercialProfit)} /><Row label="Koreksi fiskal positif" value={formatRupiah(positive)} /><Row label="Koreksi fiskal negatif" value={formatRupiah(negative)} /><Row label="Penghasilan neto fiskal" value={formatRupiah(fiscalNet)} strong /><Row label="Kompensasi kerugian digunakan" value={formatRupiah(lossUsed)} note={`Saldo tersedia ${formatRupiah(lossAvailable)}`} /><Row label="Penghasilan Kena Pajak (PKP)" value={formatRupiah(pkp)} strong />{scheme === 'auto' && facilityPkp > 0 && <Row label="PKP fasilitas Pasal 31E" value={formatRupiah(facilityPkp)} note="Tarif efektif 11%" />}<Row label={scheme === 'auto' ? 'PKP tarif umum' : 'Dasar PKP'} value={formatRupiah(normalPkp)} /><Row label="PPh Badan terutang" value={formatRupiah(taxDue)} strong /><Row label="Total kredit pajak" value={formatRupiah(totalCredits)} /></>}{scheme === 'final05' && <><Row label="Jenis WP Badan" value={entityType === 'soleCompany' ? 'Perseroan Perorangan' : entityType === 'cooperative' ? 'Koperasi' : 'Badan lain'} /><Row label="Tarif final" value="0,5% dari omzet" strong /><Row label="PPh Final terutang" value={final05Eligible ? formatRupiah(taxDue) : 'Tidak dapat dihitung'} /></>}<div className="formula">{formulaText}</div></section></div></div>;
}

export default function TaxCalculator() {
  const [active, setActive] = useState('pph21');
  const [dialog, setDialog] = useState(null);
  const card = cards[active];
  const openRegulation = () => {
    if (card.links.length === 1) window.open(card.links[0][1], '_blank', 'noopener,noreferrer');
    else setDialog(card);
  };

  return <main><header className="topbar"><div className="brand-mark">KP</div><div className="brand-copy"><b>Kalkulator Pajak Kantor Kencana</b><span>Indonesia</span></div><div className="verified-pill">Aturan diverifikasi 27 Agustus 2026</div></header><section className="hero"><div className="hero-copy"><div className="eyebrow">Kalkulator pajak Kantor Kencana</div><h1>Hitung Pajak dengan lebih <em>praktis</em>.</h1><p>PPh 21, PPN, PPh Final UMKM, PPh Unifikasi, dan PPh Badan dalam satu kalkulator.</p></div><button type="button" className="law-card law-card-button" onClick={openRegulation}><span>{card.kicker}</span><strong>{card.title}</strong><p>{card.text}</p><i>Buka peraturan resmi ↗</i></button></section><nav className="tabs">{tabs.map(([id, label]) => <button key={id} className={active === id ? 'active' : ''} onClick={() => setActive(id)}>{label}</button>)}</nav>{active === 'pph21' && <P21 />}{active === 'ppn' && <PPN />}{active === 'umkm' && <UMKM />}{active === 'unifikasi' && <UNI />}{active === 'badan' && <CorpTax />}<footer><p><b>Catatan:</b> Kalkulator ini membantu estimasi dan bukan pengganti bukti potong, Coretax/DJP, SPT Tahunan, atau penelaahan profesional.</p></footer><style>{`.law-card-button{border:0;text-align:left;width:100%;font:inherit;cursor:pointer}.law-card-button i{display:block;margin-top:16px;padding-top:11px;border-top:1px solid rgba(255,255,255,.18);font-size:10px;font-style:normal;font-weight:800}.law-card-button:hover{transform:translateY(-2px);box-shadow:0 28px 58px rgba(15,74,57,.22)}.reg-overlay{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(10,18,15,.62);backdrop-filter:blur(5px)}.reg-dialog{width:min(500px,100%);padding:24px;border-radius:20px;background:#fffdf8;color:#17201c}.reg-dialog h3{margin:6px 0 10px}.reg-links{display:grid;gap:9px;margin-top:18px}.reg-links a{display:flex;justify-content:space-between;padding:13px 14px;border:1px solid #d8d2c6;border-radius:12px;background:white;color:#0f4a39;text-decoration:none;font-size:12px;font-weight:800}.reg-close,.secondary-btn{border:0;border-radius:11px;padding:11px 14px;font-weight:800;cursor:pointer}.reg-close{width:100%;margin-top:14px;background:#17201c;color:#fff}.secondary-btn{background:#e8efe9;color:#0f4a39}.corp-tabs{display:flex;gap:6px;overflow-x:auto;margin-bottom:14px;padding:6px;border:1px solid #d8d2c6;border-radius:15px;background:rgba(255,255,255,.45)}.corp-tabs button{border:0;background:transparent;padding:10px 13px;border-radius:9px;font-size:11px;font-weight:800;white-space:nowrap}.corp-tabs button.active{background:#17614a;color:white}.corp-form,.corp-result{min-height:650px}.corp-help{margin:0;color:#68716c;font-size:11px;line-height:1.55}.corp-summary-box{display:flex;flex-direction:column;gap:7px;padding:15px;border-radius:13px;background:#f0ece3;font-size:11px;line-height:1.55}.rate-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.rate-grid div{display:flex;flex-direction:column;gap:4px;padding:12px 8px;border:1px solid #d8d2c6;border-radius:12px;background:#fff;text-align:center}.rate-grid span{font-size:22px;color:#0f4a39}.rate-grid small{font-size:9px;color:#68716c}.rate-note{margin-top:-10px;color:#68716c;font-size:9px}.recon-row{display:grid;grid-template-columns:1.5fr .8fr .9fr 36px;gap:8px}.recon-row input,.recon-row select{min-height:42px;padding:9px 10px}.icon-btn{border:0;border-radius:9px;background:#f1e6df;color:#7b3629;font-size:20px}.mini-results{display:grid;grid-template-columns:1fr 1fr;gap:8px}.mini-results span{display:flex;flex-direction:column;gap:5px;padding:12px;border-radius:11px;background:#f0ece3;font-size:10px}.loss-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.loss-grid label,.asset-grid label{display:flex;flex-direction:column;gap:6px;font-size:10px;font-weight:700}.loss-grid input,.asset-grid input,.asset-grid select{min-height:42px;padding:9px 10px}.asset-card{padding:14px;border:1px solid #d8d2c6;border-radius:14px;background:#fff}.asset-head{display:grid;grid-template-columns:1fr 36px;gap:8px;margin-bottom:10px}.asset-head input{min-height:42px}.asset-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.asset-result{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;margin-top:11px;padding-top:10px;border-top:1px solid #e5dfd5;font-size:10px}@media(max-width:700px){.rate-grid{grid-template-columns:repeat(2,1fr)}.recon-row{grid-template-columns:1fr}.recon-row .icon-btn{height:40px}.asset-grid,.loss-grid,.mini-results{grid-template-columns:1fr}.asset-result{flex-direction:column}}`}</style>{dialog && <div className="reg-overlay" onMouseDown={() => setDialog(null)}><section className="reg-dialog" onMouseDown={(e) => e.stopPropagation()}><div className="eyebrow">Sumber resmi</div><h3>{dialog.title}</h3><p className="corp-help">Pilih peraturan atau halaman resmi yang ingin dibuka.</p><div className="reg-links">{dialog.links.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noopener noreferrer"><span>{label}</span><span>↗</span></a>)}</div><button className="reg-close" onClick={() => setDialog(null)}>Tutup</button></section></div>}</main>;
}
