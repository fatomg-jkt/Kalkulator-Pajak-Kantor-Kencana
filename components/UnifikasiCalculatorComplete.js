'use client';

import { useMemo, useState } from 'react';
import { formatRupiah } from '../lib/tax';

const GROUPS = {
  p23: {
    label: 'PPh Pasal 23',
    help: 'Dividen, bunga, royalti, hadiah tertentu, sewa harta selain tanah/bangunan, serta jasa teknik/manajemen/konsultan dan jasa lain.',
    items: [
      { id:'p23-dividen', category:'Penghasilan modal', label:'Dividen yang merupakan objek PPh Pasal 23', rate:15 },
      { id:'p23-bunga', category:'Penghasilan modal', label:'Bunga termasuk premium, diskonto, dan imbalan sehubungan jaminan pengembalian utang', rate:15 },
      { id:'p23-royalti', category:'Penghasilan modal', label:'Royalti', rate:15 },
      { id:'p23-hadiah', category:'Penghasilan modal', label:'Hadiah, penghargaan, bonus, dan sejenisnya selain yang telah dipotong PPh Pasal 21', rate:15 },
      { id:'p23-sewa', category:'Sewa', label:'Sewa dan penghasilan lain sehubungan penggunaan harta selain tanah dan/atau bangunan', rate:2 },
      { id:'p23-teknik', category:'Jasa profesional', label:'Jasa teknik', rate:2 },
      { id:'p23-manajemen', category:'Jasa profesional', label:'Jasa manajemen', rate:2 },
      { id:'p23-konsultan', category:'Jasa profesional', label:'Jasa konsultan', rate:2 },
      { id:'p23-penilai', category:'Jasa profesional', label:'Jasa penilai (appraisal)', rate:2 },
      { id:'p23-aktuaris', category:'Jasa profesional', label:'Jasa aktuaris', rate:2 },
      { id:'p23-akuntansi', category:'Jasa profesional', label:'Jasa akuntansi, pembukuan, dan atestasi laporan keuangan', rate:2 },
      { id:'p23-hukum', category:'Jasa profesional', label:'Jasa hukum', rate:2 },
      { id:'p23-arsitektur', category:'Jasa profesional', label:'Jasa arsitektur', rate:2 },
      { id:'p23-perencanaan', category:'Jasa profesional', label:'Jasa perencanaan kota dan arsitektur lanskap', rate:2 },
      { id:'p23-desain', category:'Jasa profesional', label:'Jasa perancang/desain', rate:2 },
      { id:'p23-pengeboran', category:'Pertambangan & energi', label:'Jasa pengeboran di bidang pertambangan selain yang dilakukan BUT', rate:2 },
      { id:'p23-penunjang-migas', category:'Pertambangan & energi', label:'Jasa penunjang usaha panas bumi dan pertambangan minyak dan gas bumi', rate:2 },
      { id:'p23-penambangan', category:'Pertambangan & energi', label:'Jasa penambangan dan jasa penunjang selain panas bumi, minyak, dan gas bumi', rate:2 },
      { id:'p23-penerbangan', category:'Transportasi & logistik', label:'Jasa penunjang di bidang penerbangan dan bandar udara', rate:2 },
      { id:'p23-freight', category:'Transportasi & logistik', label:'Jasa freight forwarding', rate:2 },
      { id:'p23-logistik', category:'Transportasi & logistik', label:'Jasa logistik', rate:2 },
      { id:'p23-loading', category:'Transportasi & logistik', label:'Jasa loading dan unloading', rate:2 },
      { id:'p23-packing', category:'Transportasi & logistik', label:'Jasa pengepakan', rate:2 },
      { id:'p23-dokumen', category:'Transportasi & logistik', label:'Jasa pengurusan dokumen', rate:2 },
      { id:'p23-penebangan', category:'Lingkungan & sumber daya', label:'Jasa penebangan hutan', rate:2 },
      { id:'p23-pengolahan-limbah', category:'Lingkungan & sumber daya', label:'Jasa pengolahan limbah', rate:2 },
      { id:'p23-penyedia-tenaga', category:'Operasional', label:'Jasa penyedia tenaga kerja / outsourcing services', rate:2 },
      { id:'p23-perantara', category:'Operasional', label:'Jasa perantara dan/atau keagenan', rate:2 },
      { id:'p23-keamanan', category:'Operasional', label:'Jasa penyelidikan dan keamanan', rate:2 },
      { id:'p23-event', category:'Operasional', label:'Jasa penyelenggara kegiatan / event organizer', rate:2 },
      { id:'p23-katering', category:'Operasional', label:'Jasa katering atau tata boga', rate:2 },
      { id:'p23-cleaning', category:'Operasional', label:'Jasa kebersihan / cleaning service', rate:2 },
      { id:'p23-hama', category:'Operasional', label:'Jasa pembasmian hama', rate:2 },
      { id:'p23-septic', category:'Operasional', label:'Jasa sedot septic tank', rate:2 },
      { id:'p23-kolam', category:'Operasional', label:'Jasa pemeliharaan kolam', rate:2 },
      { id:'p23-parkir', category:'Operasional', label:'Jasa pengelolaan parkir', rate:2 },
      { id:'p23-sekuritas', category:'Keuangan & penyimpanan', label:'Jasa perdagangan surat berharga, kecuali yang dilakukan bursa efek/KSEI/KPEI', rate:2 },
      { id:'p23-kustodian', category:'Keuangan & penyimpanan', label:'Jasa kustodian/penyimpanan/penitipan selain yang dilakukan KSEI', rate:2 },
      { id:'p23-dubbing', category:'Media & kreatif', label:'Jasa pengisian suara (dubbing) dan/atau sulih suara', rate:2 },
      { id:'p23-mixing', category:'Media & kreatif', label:'Jasa mixing film', rate:2 },
      { id:'p23-media', category:'Media & kreatif', label:'Jasa penyediaan tempat/waktu dalam media massa, media luar ruang, atau media lain untuk penyampaian informasi', rate:2 },
      { id:'p23-komputer', category:'Teknologi', label:'Jasa sehubungan perangkat lunak, perangkat keras, atau sistem komputer termasuk pemeliharaan/perbaikan', rate:2 },
      { id:'p23-website', category:'Teknologi', label:'Jasa pembuatan dan/atau pengelolaan website', rate:2 },
      { id:'p23-data', category:'Teknologi', label:'Jasa penyimpanan, pengolahan, dan/atau penyaluran data/informasi', rate:2 },
      { id:'p23-instalasi', category:'Instalasi & pemeliharaan', label:'Jasa instalasi/pemasangan mesin, peralatan, listrik, telepon, air, gas, AC, TV kabel selain jasa konstruksi', rate:2 },
      { id:'p23-maintenance', category:'Instalasi & pemeliharaan', label:'Jasa perawatan/perbaikan/pemeliharaan mesin, peralatan, utilitas, kendaraan, dan/atau bangunan selain jasa konstruksi', rate:2 },
      { id:'p23-maklon', category:'Produksi', label:'Jasa maklon', rate:2 },
      { id:'p23-lab', category:'Pengujian & pendidikan', label:'Jasa laboratorium dan/atau pengujian, kecuali untuk keperluan medis', rate:2 },
      { id:'p23-training', category:'Pengujian & pendidikan', label:'Jasa pelatihan dan/atau kursus', rate:2 },
      { id:'p23-sertifikasi', category:'Pengujian & pendidikan', label:'Jasa sertifikasi', rate:2 },
      { id:'p23-survei', category:'Pengujian & pendidikan', label:'Jasa survei', rate:2 },
      { id:'p23-testing', category:'Pengujian & pendidikan', label:'Jasa testing/pengujian lainnya', rate:2 },
      { id:'p23-lain', category:'Lainnya', label:'Jasa lain yang merupakan objek PPh Pasal 23 sesuai ketentuan', rate:2, note:'Pastikan jenis jasa memang termasuk objek PPh 23 dan bukan objek PPh lain.' }
    ]
  },
  p42: {
    label: 'PPh Final Pasal 4 ayat (2)',
    help: 'Penghasilan final tertentu. Beberapa objek mempunyai syarat, pengecualian, atau mekanisme setor sendiri yang harus diperiksa.',
    items: [
      { id:'p42-rent', category:'Tanah & bangunan', label:'Persewaan tanah dan/atau bangunan', rate:10 },
      { id:'p42-transfer', category:'Tanah & bangunan', label:'Pengalihan hak atas tanah dan/atau bangunan — tarif umum', rate:2.5 },
      { id:'p42-transfer-simple', category:'Tanah & bangunan', label:'Pengalihan Rumah Sederhana/Rusun Sederhana oleh usaha real estat yang memenuhi syarat', rate:1, note:'Gunakan hanya jika transaksi memenuhi kriteria khusus.' },
      { id:'p42-construction-small', category:'Jasa konstruksi', label:'Pelaksanaan konstruksi — kualifikasi kecil / orang perseorangan bersertifikat', rate:1.75 },
      { id:'p42-construction-certified', category:'Jasa konstruksi', label:'Pelaksanaan konstruksi — selain kecil, memiliki sertifikat/kualifikasi', rate:2.65 },
      { id:'p42-construction-no-cert', category:'Jasa konstruksi', label:'Pelaksanaan konstruksi — tidak memiliki sertifikat/kualifikasi', rate:4 },
      { id:'p42-consult-certified', category:'Jasa konstruksi', label:'Konsultansi konstruksi — memiliki sertifikat/kualifikasi', rate:3.5 },
      { id:'p42-consult-no-cert', category:'Jasa konstruksi', label:'Konsultansi konstruksi — tidak memiliki sertifikat/kualifikasi', rate:6 },
      { id:'p42-deposit', category:'Bunga & investasi', label:'Bunga deposito, tabungan, dan Sertifikat Bank Indonesia — WPDN/BUT', rate:20 },
      { id:'p42-bond', category:'Bunga & investasi', label:'Bunga obligasi/surat utang tertentu — tarif umum WPDN/BUT', rate:10, note:'Periksa jenis obligasi dan status penerima; dapat terdapat ketentuan khusus.' },
      { id:'p42-coop-low', category:'Bunga & investasi', label:'Bunga simpanan koperasi kepada anggota OP — sampai batas yang dibebaskan', rate:0, note:'Gunakan hanya bila memenuhi batas nominal yang berlaku.' },
      { id:'p42-coop-high', category:'Bunga & investasi', label:'Bunga simpanan koperasi kepada anggota OP — di atas batas yang dibebaskan', rate:10 },
      { id:'p42-lottery', category:'Hadiah', label:'Hadiah undian', rate:25 },
      { id:'p42-stock', category:'Pasar modal', label:'Penjualan saham di bursa — tarif transaksi umum', rate:0.1, note:'Pendiri dan transaksi tertentu dapat memiliki tambahan/ketentuan khusus.' },
      { id:'p42-dividend-op', category:'Dividen', label:'Dividen kepada Orang Pribadi dalam negeri yang terutang PPh Final', rate:10, note:'Jangan gunakan jika dividen memenuhi ketentuan pengecualian dari objek pajak.' },
      { id:'p42-umkm', category:'Usaha tertentu', label:'PPh Final UMKM 0,5% — hanya jika subjek dan jangka waktu memenuhi ketentuan yang berlaku', rate:0.5, note:'Kelayakan harus diperiksa; tidak semua badan berhak menggunakan skema ini pada 2026.' },
      { id:'p42-pi', category:'Sektor khusus', label:'Participating Interest kegiatan usaha hulu migas', rate:null, note:'Tarif/dasar pengenaan bersifat khusus. Isi tarif setelah dasar hukum transaksi diverifikasi.' },
      { id:'p42-other', category:'Lainnya', label:'Penghasilan lain yang terutang PPh Pasal 4 ayat (2)', rate:null, note:'Gunakan tarif manual sesuai dasar hukum objek.' }
    ]
  },
  p15: {
    label: 'PPh Pasal 15',
    help: 'Norma penghitungan khusus untuk usaha tertentu seperti pelayaran/penerbangan dan kantor perwakilan dagang asing.',
    items: [
      { id:'p15-domestic-shipping', category:'Pelayaran', label:'Perusahaan pelayaran dalam negeri', rate:1.2, note:'Bersifat final.' },
      { id:'p15-domestic-air-charter', category:'Penerbangan', label:'Charter pesawat udara — perusahaan penerbangan dalam negeri', rate:1.8, note:'Bersifat tidak final/dapat dikreditkan sesuai ketentuan.' },
      { id:'p15-foreign-shipping-air', category:'Pelayaran/Penerbangan luar negeri', label:'Perusahaan pelayaran dan/atau penerbangan luar negeri melalui BUT', rate:2.64, note:'Bersifat final.' },
      { id:'p15-kpda', category:'Kantor perwakilan', label:'Kantor Perwakilan Dagang Asing (KPDA) — non-P3B', rate:0.44, note:'Umumnya melalui mekanisme setor sendiri; untuk negara mitra P3B perlu penyesuaian.' },
      { id:'p15-other', category:'Lainnya', label:'Penghasilan lain yang terutang PPh Pasal 15', rate:null, note:'Isi tarif manual setelah objek dan norma khusus diverifikasi.' }
    ]
  },
  p22: {
    label: 'PPh Pasal 22',
    help: 'Pemungutan atas impor, pembelian barang tertentu, penjualan hasil produksi tertentu, dan transaksi/sektor tertentu.',
    items: [
      { id:'p22-import-api', category:'Impor', label:'Impor menggunakan API', rate:2.5 },
      { id:'p22-import-nonapi', category:'Impor', label:'Impor tanpa API', rate:7.5 },
      { id:'p22-unclaimed', category:'Impor', label:'Barang impor yang tidak dikuasai — harga jual lelang', rate:7.5 },
      { id:'p22-government', category:'Pembelian pemerintah/BUMN', label:'Pembelian barang oleh bendahara pemerintah/DJPB/BUMN/BUMD tertentu', rate:1.5, note:'Dasar pengenaan tidak termasuk PPN; periksa pengecualian dan batas pembayaran.' },
      { id:'p22-sip', category:'Sistem pengadaan', label:'Penjualan barang/jasa/persewaan melalui Pihak Lain dalam Sistem Informasi Pengadaan', rate:0.5 },
      { id:'p22-paper', category:'Industri', label:'Penjualan hasil produksi industri kertas kepada distributor dalam negeri', rate:0.1 },
      { id:'p22-cement', category:'Industri', label:'Penjualan hasil produksi industri semen kepada distributor dalam negeri', rate:0.25 },
      { id:'p22-steel', category:'Industri', label:'Penjualan hasil produksi industri baja kepada distributor dalam negeri', rate:0.3 },
      { id:'p22-automotive', category:'Industri', label:'Penjualan hasil produksi industri otomotif/kendaraan bermotor tertentu', rate:0.45 },
      { id:'p22-pharma', category:'Industri', label:'Penjualan hasil produksi industri farmasi/obat kepada distributor dalam negeri', rate:0.3 },
      { id:'p22-bbm-pertamina', category:'BBM/BBG/Pelumas', label:'BBM kepada SPBU yang membeli dari Pertamina/anak usaha Pertamina', rate:0.25 },
      { id:'p22-bbm-other', category:'BBM/BBG/Pelumas', label:'BBM kepada SPBU non-Pertamina atau pihak lainnya', rate:0.3 },
      { id:'p22-bbg', category:'BBM/BBG/Pelumas', label:'Bahan bakar gas (BBG)', rate:0.3 },
      { id:'p22-lubricant', category:'BBM/BBG/Pelumas', label:'Pelumas', rate:0.3 },
      { id:'p22-natural-products', category:'Hasil alam', label:'Pembelian hasil kehutanan, perkebunan, pertanian, peternakan, dan perikanan yang belum melalui industri manufaktur oleh industri/eksportir', rate:0.25 },
      { id:'p22-gold', category:'Emas', label:'Penjualan emas perhiasan dan/atau emas batangan oleh pemungut yang ditunjuk', rate:0.25 },
      { id:'p22-luxury', category:'Barang sangat mewah', label:'Penjualan barang yang tergolong sangat mewah', rate:null, note:'Tarif dan ambang batas pernah berubah. Isi tarif manual sesuai ketentuan yang berlaku untuk transaksi/tahun pajak.' },
      { id:'p22-other', category:'Lainnya', label:'Pemungutan PPh Pasal 22 lainnya', rate:null, note:'Isi tarif manual setelah objek dan dasar pengenaan diverifikasi.' }
    ]
  },
  p26: {
    label: 'PPh Pasal 26',
    help: 'Penghasilan dari Indonesia yang dibayarkan kepada Wajib Pajak luar negeri. Tarif domestik umumnya 20% dari bruto, namun P3B dapat mengubah tarif.',
    items: [
      { id:'p26-dividend', category:'Modal', label:'Dividen kepada Wajib Pajak luar negeri', rate:20 },
      { id:'p26-interest', category:'Modal', label:'Bunga termasuk premium, diskonto, dan imbalan sehubungan jaminan pengembalian utang', rate:20 },
      { id:'p26-royalty', category:'Modal', label:'Royalti', rate:20 },
      { id:'p26-rent', category:'Modal', label:'Sewa dan penghasilan lain sehubungan penggunaan harta', rate:20 },
      { id:'p26-service', category:'Jasa/kegiatan', label:'Imbalan sehubungan jasa, pekerjaan, atau kegiatan kepada WPLN selain objek PPh 21', rate:20 },
      { id:'p26-prize', category:'Hadiah', label:'Hadiah dan penghargaan', rate:20 },
      { id:'p26-pension', category:'Pembayaran berkala', label:'Pensiun dan pembayaran berkala lainnya', rate:20 },
      { id:'p26-swap', category:'Keuangan', label:'Premi swap dan transaksi lindung nilai lainnya', rate:20 },
      { id:'p26-debt', category:'Lainnya', label:'Keuntungan karena pembebasan utang', rate:20 },
      { id:'p26-asset-transfer', category:'Pengalihan harta', label:'Pengalihan harta tertentu oleh Wajib Pajak luar negeri', rate:null, note:'Dapat menggunakan persentase penghasilan neto tertentu; isi tarif efektif setelah transaksi diverifikasi.' },
      { id:'p26-branch-profit', category:'BUT', label:'Branch Profit Tax / penghasilan kena pajak sesudah pajak suatu BUT', rate:20, note:'Dapat berbeda berdasarkan P3B dan ketentuan penanaman kembali.' },
      { id:'p26-treaty', category:'P3B / Tax Treaty', label:'Objek PPh 26 dengan tarif P3B (tax treaty)', rate:null, note:'Isi tarif treaty hanya jika dokumen domisili dan persyaratan penerapan P3B terpenuhi.' },
      { id:'p26-other', category:'Lainnya', label:'Penghasilan lain yang terutang PPh Pasal 26', rate:null, note:'Gunakan tarif manual sesuai dasar hukum/P3B.' }
    ]
  }
};

function formatNumber(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(number);
}

function parseNumber(text) {
  const clean = String(text ?? '').replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  const number = Number(clean);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function MoneyInput({ value, onChange }) {
  return <div className="money-input"><span>Rp</span><input type="text" inputMode="numeric" value={new Intl.NumberFormat('id-ID').format(Number(value) || 0)} onChange={(e) => onChange(String(parseNumber(e.target.value)))} /></div>;
}

function groupedOptions(items) {
  const map = new Map();
  items.forEach((item) => {
    if (!map.has(item.category)) map.set(item.category, []);
    map.get(item.category).push(item);
  });
  return [...map.entries()];
}

export default function UnifikasiCalculatorComplete() {
  const [groupId, setGroupId] = useState('p23');
  const [objectId, setObjectId] = useState(GROUPS.p23.items[0].id);
  const [amount, setAmount] = useState('0');
  const [manualRate, setManualRate] = useState('0');

  const group = GROUPS[groupId];
  const selected = group.items.find((item) => item.id === objectId) || group.items[0];
  const effectiveRate = selected.rate === null ? Math.max(0, Number(manualRate) || 0) : selected.rate;
  const gross = Math.max(0, Number(amount) || 0);
  const tax = useMemo(() => Math.round(gross * effectiveRate / 100), [gross, effectiveRate]);

  const changeGroup = (id) => {
    setGroupId(id);
    setObjectId(GROUPS[id].items[0].id);
    setManualRate('0');
  };

  return <div className="calculator-grid"><section className="panel form-panel">
    <label className="field"><span>Jenis PPh Utama</span><select value={groupId} onChange={(e) => changeGroup(e.target.value)}>{Object.entries(GROUPS).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select><small>{group.help}</small></label>
    <label className="field"><span>Objek PPh Unifikasi</span><select value={objectId} onChange={(e) => { setObjectId(e.target.value); setManualRate('0'); }}>{groupedOptions(group.items).map(([category, items]) => <optgroup key={category} label={category}>{items.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</optgroup>)}</select><small>{group.items.length} objek/varian tersedia untuk {group.label}.</small></label>
    <label className="field"><span>Jumlah bruto / dasar pemotongan</span><MoneyInput value={amount} onChange={setAmount} /></label>
    {selected.rate === null && <label className="field"><span>Tarif yang berlaku (%)</span><input type="text" inputMode="decimal" value={formatNumber(manualRate)} onChange={(e) => setManualRate(String(parseNumber(e.target.value)))} /><small>Tarif tidak diisi otomatis karena objek ini memiliki ketentuan khusus/bersyarat.</small></label>}
    {selected.note && <div className="warning-box">{selected.note}</div>}
  </section><section className="panel result-panel">
    <div className="eyebrow">Hasil PPh Unifikasi</div>
    <div className="hero-result"><span>PPh dipotong / dipungut</span><strong>{formatRupiah(tax)}</strong></div>
    <div className="result-line strong"><div><span>Jenis PPh</span></div><b>{group.label}</b></div>
    <div className="result-line"><div><span>Objek</span></div><b style={{whiteSpace:'normal',textAlign:'right',maxWidth:'62%'}}>{selected.label}</b></div>
    <div className="result-line"><div><span>Tarif</span></div><b>{formatNumber(effectiveRate)}%</b></div>
    <div className="result-line"><div><span>Dasar pemotongan</span></div><b>{formatRupiah(gross)}</b></div>
    <div className="formula">PPh = {formatNumber(effectiveRate)}% × {formatRupiah(gross)} = {formatRupiah(tax)}</div>
    <div className="info-box" style={{marginTop:14}}>Daftar ini membantu estimasi. Pengecualian, Surat Keterangan Bebas, status NPWP/NIK, P3B, mekanisme setor sendiri, dan ketentuan sektoral tetap perlu diperiksa sebelum membuat bukti potong/pungut.</div>
  </section></div>;
}
