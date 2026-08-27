'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import TaxCalculatorV7 from './TaxCalculatorPreviewV7';
import { formatRupiah } from '../lib/tax';

const groups = {
  p23: {
    label: 'PPh Pasal 23',
    items: [
      ['23-dividen', 'Dividen yang merupakan objek PPh Pasal 23', 15, 'Jumlah bruto'],
      ['23-bunga', 'Bunga, premium, diskonto, dan imbalan jaminan pengembalian utang', 15, 'Jumlah bruto'],
      ['23-royalti', 'Royalti', 15, 'Jumlah bruto'],
      ['23-hadiah', 'Hadiah, penghargaan, bonus, dan sejenisnya selain objek PPh 21', 15, 'Jumlah bruto'],
      ['23-sewa', 'Sewa dan penghasilan lain atas penggunaan harta selain tanah/bangunan', 2, 'Jumlah bruto'],
      ['23-teknik', 'Jasa teknik', 2, 'Jumlah bruto'],
      ['23-manajemen', 'Jasa manajemen', 2, 'Jumlah bruto'],
      ['23-konsultan', 'Jasa konsultan', 2, 'Jumlah bruto'],
      ['23-konstruksi-nonfinal', 'Jasa konstruksi yang tidak dikenai PPh Final Pasal 4 ayat (2)', 2, 'Jumlah bruto'],
      ['23-penilai', 'Jasa penilai (appraisal)', 2, 'Jumlah bruto'],
      ['23-aktuaris', 'Jasa aktuaris', 2, 'Jumlah bruto'],
      ['23-akuntansi', 'Jasa akuntansi, pembukuan, dan atestasi laporan keuangan', 2, 'Jumlah bruto'],
      ['23-hukum', 'Jasa hukum', 2, 'Jumlah bruto'],
      ['23-arsitektur', 'Jasa arsitektur', 2, 'Jumlah bruto'],
      ['23-perencanaan', 'Jasa perencanaan kota dan arsitektur lanskap', 2, 'Jumlah bruto'],
      ['23-desain', 'Jasa perancang/desain', 2, 'Jumlah bruto'],
      ['23-pengeboran', 'Jasa pengeboran pertambangan selain yang dilakukan BUT', 2, 'Jumlah bruto'],
      ['23-penunjang-migas', 'Jasa penunjang panas bumi serta pertambangan minyak dan gas bumi', 2, 'Jumlah bruto'],
      ['23-penambangan', 'Jasa penambangan dan jasa penunjang pertambangan lainnya', 2, 'Jumlah bruto'],
      ['23-penerbangan', 'Jasa penunjang penerbangan dan bandar udara', 2, 'Jumlah bruto'],
      ['23-penebangan', 'Jasa penebangan hutan', 2, 'Jumlah bruto'],
      ['23-limbah', 'Jasa pengolahan limbah', 2, 'Jumlah bruto'],
      ['23-tenaga', 'Jasa penyedia tenaga kerja / outsourcing', 2, 'Jumlah bruto'],
      ['23-perantara', 'Jasa perantara dan/atau keagenan', 2, 'Jumlah bruto'],
      ['23-sekuritas', 'Jasa perdagangan surat berharga selain oleh bursa efek/KSEI/KPEI', 2, 'Jumlah bruto'],
      ['23-kustodian', 'Jasa kustodian, penyimpanan, dan penitipan selain oleh KSEI', 2, 'Jumlah bruto'],
      ['23-dubbing', 'Jasa pengisian suara / sulih suara', 2, 'Jumlah bruto'],
      ['23-mixing', 'Jasa mixing film', 2, 'Jumlah bruto'],
      ['23-media', 'Jasa penyediaan tempat/waktu media untuk penyampaian informasi', 2, 'Jumlah bruto'],
      ['23-it', 'Jasa software, hardware, sistem komputer, termasuk pemeliharaan/perbaikan', 2, 'Jumlah bruto'],
      ['23-website', 'Jasa pembuatan dan/atau pengelolaan website', 2, 'Jumlah bruto'],
      ['23-data', 'Jasa penyimpanan, pengolahan, dan/atau penyaluran data/informasi', 2, 'Jumlah bruto'],
      ['23-instalasi', 'Jasa instalasi/pemasangan mesin, peralatan, listrik, telepon, air, gas, AC, TV kabel selain konstruksi', 2, 'Jumlah bruto'],
      ['23-maintenance', 'Jasa perawatan/perbaikan/pemeliharaan mesin, peralatan, kendaraan, bangunan, dan fasilitas selain konstruksi', 2, 'Jumlah bruto'],
      ['23-maklon', 'Jasa maklon', 2, 'Jumlah bruto'],
      ['23-keamanan', 'Jasa penyelidikan dan keamanan', 2, 'Jumlah bruto'],
      ['23-event', 'Jasa penyelenggara kegiatan / event organizer', 2, 'Jumlah bruto'],
      ['23-katering', 'Jasa katering / tata boga', 2, 'Jumlah bruto'],
      ['23-cleaning', 'Jasa kebersihan / cleaning service', 2, 'Jumlah bruto'],
      ['23-hama', 'Jasa pembasmian hama', 2, 'Jumlah bruto'],
      ['23-septic', 'Jasa sedot septic tank', 2, 'Jumlah bruto'],
      ['23-kolam', 'Jasa pemeliharaan kolam', 2, 'Jumlah bruto'],
      ['23-freight', 'Jasa freight forwarding', 2, 'Jumlah bruto'],
      ['23-logistik', 'Jasa logistik', 2, 'Jumlah bruto'],
      ['23-dokumen', 'Jasa pengurusan dokumen', 2, 'Jumlah bruto'],
      ['23-packing', 'Jasa pengepakan', 2, 'Jumlah bruto'],
      ['23-loading', 'Jasa loading dan unloading', 2, 'Jumlah bruto'],
      ['23-lab', 'Jasa laboratorium dan/atau pengujian selain untuk keperluan medis', 2, 'Jumlah bruto'],
      ['23-parkir', 'Jasa pengelolaan parkir', 2, 'Jumlah bruto'],
      ['23-training', 'Jasa pelatihan dan/atau kursus', 2, 'Jumlah bruto'],
      ['23-sertifikasi', 'Jasa sertifikasi', 2, 'Jumlah bruto'],
      ['23-survei', 'Jasa survei', 2, 'Jumlah bruto'],
      ['23-lain', 'Jasa lain yang merupakan objek PPh Pasal 23 sesuai ketentuan', 2, 'Jumlah bruto']
    ]
  },
  p42: {
    label: 'PPh Final Pasal 4 ayat (2)',
    items: [
      ['42-sewa', 'Sewa tanah dan/atau bangunan', 10, 'Jumlah bruto nilai persewaan'],
      ['42-tb-umum', 'Pengalihan hak atas tanah dan/atau bangunan — umum', 2.5, 'Jumlah bruto nilai pengalihan'],
      ['42-tb-rs', 'Pengalihan Rumah Sederhana/Rusun Sederhana oleh usaha pokok pengalihan tanah/bangunan', 1, 'Jumlah bruto nilai pengalihan'],
      ['42-konstruksi-kecil', 'Pekerjaan konstruksi — usaha kecil/perseorangan tersertifikasi', 1.75, 'Jumlah pembayaran tidak termasuk PPN'],
      ['42-konstruksi-tanpa', 'Pekerjaan konstruksi — tidak tersertifikasi', 4, 'Jumlah pembayaran tidak termasuk PPN'],
      ['42-konstruksi-lain', 'Pekerjaan konstruksi — selain kecil dan tidak tersertifikasi', 2.65, 'Jumlah pembayaran tidak termasuk PPN'],
      ['42-integrasi-sert', 'Pekerjaan konstruksi terintegrasi — tersertifikasi', 2.65, 'Jumlah pembayaran tidak termasuk PPN'],
      ['42-integrasi-non', 'Pekerjaan konstruksi terintegrasi — tidak tersertifikasi', 4, 'Jumlah pembayaran tidak termasuk PPN'],
      ['42-konsultan-sert', 'Jasa konsultansi konstruksi — tersertifikasi', 3.5, 'Jumlah pembayaran tidak termasuk PPN'],
      ['42-konsultan-non', 'Jasa konsultansi konstruksi — tidak tersertifikasi', 6, 'Jumlah pembayaran tidak termasuk PPN'],
      ['42-deposito', 'Bunga deposito/tabungan dan diskonto SBI — WPDN/BUT', 20, 'Jumlah bruto bunga/diskonto'],
      ['42-obligasi', 'Bunga dan/atau diskonto obligasi — tarif umum yang berlaku sejak 2021', 10, 'Dasar pengenaan sesuai jenis bunga/diskonto obligasi'],
      ['42-spn', 'Diskonto Surat Perbendaharaan Negara (SPN) — WPDN/BUT', 20, 'Diskonto SPN'],
      ['42-koperasi-0', 'Bunga simpanan koperasi kepada anggota OP — sampai Rp240.000/bulan', 0, 'Jumlah bruto bunga'],
      ['42-koperasi-10', 'Bunga simpanan koperasi kepada anggota OP — lebih dari Rp240.000/bulan', 10, 'Jumlah bruto bunga'],
      ['42-undian', 'Hadiah undian', 25, 'Jumlah bruto hadiah'],
      ['42-saham', 'Penjualan saham di bursa efek', 0.1, 'Jumlah bruto nilai transaksi penjualan'],
      ['42-saham-pendiri', 'Tambahan PPh saham pendiri', 0.5, 'Nilai saham sesuai ketentuan saham pendiri'],
      ['42-modal-ventura', 'Penjualan saham/pengalihan penyertaan modal oleh perusahaan modal ventura pada perusahaan pasangan usaha', 0.1, 'Jumlah bruto nilai transaksi'],
      ['42-dividen-op', 'Dividen kepada Orang Pribadi dalam negeri yang tetap terutang PPh Final', 10, 'Jumlah bruto dividen'],
      ['42-umkm', 'PPh Final usaha dengan peredaran bruto tertentu — apabila memenuhi ketentuan yang berlaku', 0.5, 'Peredaran bruto']
    ]
  },
  p15: {
    label: 'PPh Pasal 15',
    items: [
      ['15-flight-dom', 'Charter/penerbangan dalam negeri', 1.8, 'Peredaran bruto'],
      ['15-shipping-dom', 'Pelayaran dalam negeri', 1.2, 'Peredaran bruto'],
      ['15-foreign', 'Pelayaran dan/atau penerbangan luar negeri melalui BUT di Indonesia', 2.64, 'Peredaran bruto tertentu'],
      ['15-rep-office', 'Kantor Perwakilan Dagang Asing — negara non-P3B', 0.44, 'Nilai ekspor bruto']
    ]
  },
  p22: {
    label: 'PPh Pasal 22',
    items: [
      ['22-import-api', 'Impor menggunakan API — tarif umum', 2.5, 'Nilai impor'],
      ['22-import-nonapi', 'Impor tanpa API — tarif umum', 7.5, 'Nilai impor'],
      ['22-import-tertentu10', 'Impor barang tertentu yang ditetapkan — kelompok tarif 10%', 10, 'Nilai impor sesuai klasifikasi barang'],
      ['22-import-tertentu75', 'Impor barang tertentu yang ditetapkan — kelompok tarif 7,5%', 7.5, 'Nilai impor sesuai klasifikasi barang'],
      ['22-import-unclaimed', 'Barang impor yang tidak dikuasai', 7.5, 'Harga jual lelang'],
      ['22-bendahara', 'Pembelian barang oleh Instansi Pemerintah/Bendahara', 1.5, 'Harga pembelian tidak termasuk PPN'],
      ['22-bumn', 'Pembelian barang oleh BUMN/badan usaha tertentu', 1.5, 'Harga pembelian tidak termasuk PPN'],
      ['22-sip', 'Transaksi melalui Sistem Informasi Pengadaan', 0.5, 'Nilai pembayaran tidak termasuk PPN/PPnBM'],
      ['22-agri', 'Pembelian hasil kehutanan, perkebunan, pertanian, peternakan, dan perikanan oleh industri/eksportir', 0.25, 'Harga pembelian tidak termasuk PPN'],
      ['22-mining', 'Pembelian komoditas tambang batubara, mineral logam/nonlogam oleh badan usaha', 1.5, 'Harga pembelian tidak termasuk PPN'],
      ['22-paper', 'Penjualan hasil produksi industri kertas kepada distributor', 0.1, 'DPP PPN'],
      ['22-cement', 'Penjualan hasil produksi industri semen kepada distributor', 0.25, 'DPP PPN'],
      ['22-steel', 'Penjualan hasil produksi industri baja kepada distributor', 0.3, 'DPP PPN'],
      ['22-auto', 'Penjualan hasil produksi industri otomotif kepada distributor', 0.45, 'DPP PPN'],
      ['22-pharma', 'Penjualan hasil produksi industri farmasi kepada distributor', 0.3, 'DPP PPN'],
      ['22-bbm-pertamina', 'BBM kepada SPBU yang membeli dari Pertamina/anak perusahaan Pertamina', 0.25, 'Penjualan tidak termasuk PPN'],
      ['22-bbm-other', 'BBM kepada SPBU non-Pertamina atau pihak lain', 0.3, 'Penjualan tidak termasuk PPN'],
      ['22-bbg', 'Bahan bakar gas', 0.3, 'Penjualan tidak termasuk PPN'],
      ['22-lubricant', 'Pelumas', 0.3, 'Penjualan tidak termasuk PPN'],
      ['22-atpm', 'Penjualan kendaraan oleh ATPM/APM/importir umum kendaraan bermotor', 0.45, 'Harga jual tidak termasuk PPN'],
      ['22-luxury', 'Penjualan barang yang tergolong sangat mewah', 5, 'Harga jual/harga dasar sesuai objek'],
      ['22-gold', 'Penjualan emas perhiasan dan/atau emas batangan sesuai ketentuan PMK 48/2023', 0.25, 'Harga jual'],
      ['22-export-mining', 'Ekspor batubara, mineral logam, dan mineral bukan logam tertentu', 1.5, 'Nilai ekspor sesuai ketentuan']
    ]
  },
  p26: {
    label: 'PPh Pasal 26',
    items: [
      ['26-dividen', 'Dividen kepada Wajib Pajak Luar Negeri', 20, 'Jumlah bruto atau tarif P3B bila memenuhi syarat'],
      ['26-bunga', 'Bunga termasuk premium, diskonto, dan imbalan jaminan pengembalian utang', 20, 'Jumlah bruto atau tarif P3B bila memenuhi syarat'],
      ['26-royalti', 'Royalti', 20, 'Jumlah bruto atau tarif P3B bila memenuhi syarat'],
      ['26-sewa', 'Sewa dan penghasilan lain sehubungan penggunaan harta', 20, 'Jumlah bruto atau tarif P3B bila memenuhi syarat'],
      ['26-jasa', 'Imbalan sehubungan jasa, pekerjaan, dan kegiatan', 20, 'Jumlah bruto atau tarif P3B bila memenuhi syarat'],
      ['26-hadiah', 'Hadiah dan penghargaan', 20, 'Jumlah bruto atau tarif P3B bila memenuhi syarat'],
      ['26-pensiun', 'Pensiun dan pembayaran berkala lainnya', 20, 'Jumlah bruto atau tarif P3B bila memenuhi syarat'],
      ['26-swap', 'Premi swap dan transaksi lindung nilai lainnya', 20, 'Jumlah bruto atau tarif P3B bila memenuhi syarat'],
      ['26-debt', 'Keuntungan karena pembebasan utang', 20, 'Jumlah bruto atau tarif P3B bila memenuhi syarat'],
      ['26-asset-sale', 'Penjualan/pengalihan harta tertentu di Indonesia oleh WPLN — tarif efektif', 5, 'Harga jual (20% × perkiraan neto 25%)'],
      ['26-share-sale', 'Penjualan/pengalihan saham tertentu oleh WPLN — tarif efektif', 5, 'Harga jual (20% × perkiraan neto 25%)'],
      ['26-insured', 'Premi asuransi ke perusahaan asuransi luar negeri — dibayar tertanggung', 10, 'Premi bruto (20% × perkiraan neto 50%)'],
      ['26-insurer', 'Premi ke perusahaan asuransi luar negeri — dibayar perusahaan asuransi Indonesia', 2, 'Premi bruto (20% × perkiraan neto 10%)'],
      ['26-reinsurer', 'Premi ke perusahaan asuransi luar negeri — dibayar perusahaan reasuransi Indonesia', 1, 'Premi bruto (20% × perkiraan neto 5%)'],
      ['26-but', 'Branch Profit Tax / laba BUT setelah pajak yang tidak ditanamkan kembali', 20, 'Penghasilan kena pajak setelah PPh atau tarif P3B'],
      ['26-treaty', 'Objek PPh Pasal 26 dengan tarif Persetujuan Penghindaran Pajak Berganda (P3B)', null, 'Dasar pengenaan sesuai objek dan P3B']
    ]
  },
  custom: {
    label: 'Tarif khusus / objek lain',
    items: [['custom', 'Tarif khusus yang sudah diverifikasi', null, 'Dasar pengenaan sesuai ketentuan khusus']]
  }
};

function formatInput(raw) {
  const digits = String(raw ?? '0').replace(/\D/g, '') || '0';
  return digits.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseInput(text) {
  return String(Number(String(text ?? '').replace(/\D/g, '')) || 0);
}

function CompleteUnifikasi() {
  const [groupId, setGroupId] = useState('p23');
  const [objectId, setObjectId] = useState(groups.p23.items[0][0]);
  const [amount, setAmount] = useState('0');
  const [manualRate, setManualRate] = useState('0');

  const group = groups[groupId];
  const item = useMemo(() => group.items.find((row) => row[0] === objectId) || group.items[0], [group, objectId]);
  const rate = item[2] === null ? Math.max(0, Number(manualRate) || 0) : item[2];
  const base = Math.max(0, Number(amount) || 0);
  const tax = Math.round(base * rate / 100);
  const customRate = item[2] === null;

  const changeGroup = (id) => {
    setGroupId(id);
    setObjectId(groups[id].items[0][0]);
    setManualRate('0');
  };

  return <div className="unifikasi-v8-wrap">
    <div className="unifikasi-v8-note"><b>Daftar PPh Unifikasi lengkap</b><span>Jenis utama: PPh Pasal 4 ayat (2), 15, 22, 23, dan 26. Tarif khusus/P3B tetap harus diverifikasi berdasarkan lawan transaksi dan dokumen pendukung.</span></div>
    <div className="calculator-grid">
      <section className="panel form-panel">
        <label className="field"><span>Jenis PPh Utama</span><select value={groupId} onChange={(e) => changeGroup(e.target.value)}>{Object.entries(groups).map(([id, data]) => <option key={id} value={id}>{data.label}</option>)}</select></label>
        <label className="field"><span>Objek PPh Unifikasi</span><select value={objectId} onChange={(e) => setObjectId(e.target.value)}>{group.items.map(([id, label, itemRate]) => <option key={id} value={id}>{label} — {itemRate === null ? 'Tarif khusus' : `${itemRate}%`}</option>)}</select><small>{group.items.length} objek tersedia pada kelompok ini.</small></label>
        <label className="field"><span>Jumlah bruto / dasar pemotongan</span><div className="money-input"><span>Rp</span><input type="text" inputMode="numeric" value={formatInput(amount)} onChange={(e) => setAmount(parseInput(e.target.value))} /></div></label>
        {customRate && <label className="field"><span>Tarif yang berlaku (%)</span><input type="number" min="0" step="0.01" value={manualRate} onChange={(e) => setManualRate(e.target.value)} /><small>Untuk P3B/tarif khusus, masukkan tarif hanya setelah persyaratan treaty atau dasar hukum dipastikan terpenuhi.</small></label>}
        <div className="info-box"><b>Dasar pengenaan</b><br />{item[3]}</div>
      </section>
      <section className="panel result-panel">
        <div className="eyebrow">Hasil PPh Unifikasi</div>
        <div className="hero-result"><span>PPh dipotong / dipungut</span><strong>{formatRupiah(tax)}</strong></div>
        <div className="result-line strong"><div><span>Jenis PPh</span></div><b>{group.label}</b></div>
        <div className="result-line"><div><span>Objek</span></div><b>{item[1]}</b></div>
        <div className="result-line"><div><span>Tarif</span></div><b>{rate}%</b></div>
        <div className="result-line"><div><span>Dasar pengenaan</span><small>{item[3]}</small></div><b>{formatRupiah(base)}</b></div>
        <div className="formula">PPh = {rate}% × {formatRupiah(base)} = {formatRupiah(tax)}</div>
      </section>
    </div>
    <style>{`.unifikasi-v8-wrap{margin-bottom:18px}.unifikasi-v8-note{display:flex;flex-direction:column;gap:5px;margin-bottom:12px;padding:12px 14px;border:1px solid #bfd1c8;background:#e8efe9;border-radius:13px;color:#0f4a39;font-size:11px;line-height:1.5}.unifikasi-v8-note b{font-size:12px}.unifikasi-v8-note span{color:#466357}.unifikasi-v8-wrap .result-line b{max-width:58%;white-space:normal;text-align:right}.unifikasi-v8-wrap select{line-height:1.3}`}</style>
  </div>;
}

export default function TaxCalculatorPreviewV8() {
  const [portalTarget, setPortalTarget] = useState(null);
  const [isUnifikasi, setIsUnifikasi] = useState(false);

  useEffect(() => {
    let observer;
    let slot;

    const sync = () => {
      const main = document.querySelector('main');
      const tabs = main?.querySelector('nav.tabs');
      if (!main || !tabs) return;

      const active = Array.from(tabs.querySelectorAll('button')).find((button) => button.classList.contains('active'));
      const activeUni = active?.textContent?.trim() === 'PPh Unifikasi';
      setIsUnifikasi(activeUni);

      const candidateGrid = tabs.nextElementSibling;
      if (candidateGrid?.classList?.contains('calculator-grid')) {
        candidateGrid.style.display = activeUni ? 'none' : '';
      }

      slot = document.getElementById('unifikasi-v8-slot');
      if (!slot || !slot.isConnected) {
        slot = document.createElement('div');
        slot.id = 'unifikasi-v8-slot';
        tabs.insertAdjacentElement('afterend', slot);
        setPortalTarget(slot);
      }
      slot.style.display = activeUni ? '' : 'none';
    };

    const timer = setTimeout(() => {
      sync();
      const main = document.querySelector('main');
      if (main) {
        observer = new MutationObserver(sync);
        observer.observe(main, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
        main.addEventListener('click', sync);
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
      document.querySelector('main')?.removeEventListener('click', sync);
      const currentSlot = document.getElementById('unifikasi-v8-slot');
      currentSlot?.remove();
    };
  }, []);

  return <>
    <TaxCalculatorV7 />
    {portalTarget && isUnifikasi ? createPortal(<CompleteUnifikasi />, portalTarget) : null}
  </>;
}
