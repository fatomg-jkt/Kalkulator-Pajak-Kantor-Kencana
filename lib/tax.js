export const PTKP = {
  'TK/0': 54_000_000,
  'TK/1': 58_500_000,
  'TK/2': 63_000_000,
  'TK/3': 67_500_000,
  'K/0': 58_500_000,
  'K/1': 63_000_000,
  'K/2': 67_500_000,
  'K/3': 72_000_000
};

export const TER_CATEGORY = {
  'TK/0': 'A',
  'TK/1': 'A',
  'K/0': 'A',
  'TK/2': 'B',
  'TK/3': 'B',
  'K/1': 'B',
  'K/2': 'B',
  'K/3': 'C'
};

const TER_A = [
  [5_400_000, 0], [5_650_000, 0.25], [5_950_000, 0.5], [6_300_000, 0.75],
  [6_750_000, 1], [7_500_000, 1.25], [8_550_000, 1.5], [9_650_000, 1.75],
  [10_050_000, 2], [10_350_000, 2.25], [10_700_000, 2.5], [11_050_000, 3],
  [11_600_000, 3.5], [12_500_000, 4], [13_750_000, 5], [15_100_000, 6],
  [16_950_000, 7], [19_750_000, 8], [24_150_000, 9], [26_450_000, 10],
  [28_000_000, 11], [30_050_000, 12], [32_400_000, 13], [35_400_000, 14],
  [39_100_000, 15], [43_850_000, 16], [47_800_000, 17], [51_400_000, 18],
  [56_300_000, 19], [62_200_000, 20], [68_600_000, 21], [77_500_000, 22],
  [89_000_000, 23], [103_000_000, 24], [125_000_000, 25], [157_000_000, 26],
  [206_000_000, 27], [337_000_000, 28], [454_000_000, 29], [550_000_000, 30],
  [695_000_000, 31], [910_000_000, 32], [1_400_000_000, 33], [Infinity, 34]
];

const TER_B = [
  [6_200_000, 0], [6_500_000, 0.25], [6_850_000, 0.5], [7_300_000, 0.75],
  [9_200_000, 1], [10_750_000, 1.5], [11_250_000, 2], [11_600_000, 2.5],
  [12_600_000, 3], [13_600_000, 4], [14_950_000, 5], [16_400_000, 6],
  [18_450_000, 7], [21_850_000, 8], [26_000_000, 9], [27_700_000, 10],
  [29_350_000, 11], [31_450_000, 12], [33_950_000, 13], [37_100_000, 14],
  [41_100_000, 15], [45_800_000, 16], [49_500_000, 17], [53_800_000, 18],
  [58_500_000, 19], [64_000_000, 20], [71_000_000, 21], [80_000_000, 22],
  [93_000_000, 23], [109_000_000, 24], [129_000_000, 25], [163_000_000, 26],
  [211_000_000, 27], [374_000_000, 28], [459_000_000, 29], [555_000_000, 30],
  [704_000_000, 31], [957_000_000, 32], [1_405_000_000, 33], [Infinity, 34]
];

const TER_C = [
  [6_600_000, 0], [6_950_000, 0.25], [7_350_000, 0.5], [7_800_000, 0.75],
  [8_850_000, 1], [9_800_000, 1.25], [10_950_000, 1.5], [11_200_000, 1.75],
  [12_050_000, 2], [12_950_000, 3], [14_150_000, 4], [15_550_000, 5],
  [17_050_000, 6], [19_500_000, 7], [22_700_000, 8], [26_600_000, 9],
  [28_100_000, 10], [30_100_000, 11], [32_600_000, 12], [35_400_000, 13],
  [38_900_000, 14], [43_000_000, 15], [47_400_000, 16], [51_200_000, 17],
  [55_800_000, 18], [60_400_000, 19], [66_700_000, 20], [74_500_000, 21],
  [83_200_000, 22], [95_600_000, 23], [110_000_000, 24], [134_000_000, 25],
  [169_000_000, 26], [221_000_000, 27], [390_000_000, 28], [463_000_000, 29],
  [561_000_000, 30], [709_000_000, 31], [965_000_000, 32], [1_419_000_000, 33],
  [Infinity, 34]
];

const TER_TABLE = { A: TER_A, B: TER_B, C: TER_C };

export function getTerRate(grossMonthly, ptkpStatus) {
  const category = TER_CATEGORY[ptkpStatus] || 'A';
  const table = TER_TABLE[category];
  const row = table.find(([upper]) => grossMonthly <= upper) || table[table.length - 1];
  return { category, rate: row[1] };
}

export function calculateMonthlyPph21(grossMonthly, ptkpStatus) {
  const gross = Math.max(0, Number(grossMonthly) || 0);
  const { category, rate } = getTerRate(gross, ptkpStatus);
  return {
    gross,
    category,
    rate,
    tax: Math.round(gross * rate / 100)
  };
}

export function calculateProgressivePph(pkp) {
  let remaining = Math.max(0, Math.floor(pkp / 1000) * 1000);
  let tax = 0;
  const layers = [
    [60_000_000, 0.05],
    [190_000_000, 0.15],
    [250_000_000, 0.25],
    [4_500_000_000, 0.30],
    [Infinity, 0.35]
  ];

  for (const [width, rate] of layers) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, width);
    tax += taxable * rate;
    remaining -= taxable;
  }
  return Math.round(tax);
}

export function calculateAnnualPph21({ annualGross, pensionContribution = 0, ptkpStatus = 'TK/0', monthsWorked = 12, priorWithheld = 0 }) {
  const gross = Math.max(0, Number(annualGross) || 0);
  const months = Math.min(12, Math.max(1, Number(monthsWorked) || 12));
  const positionExpense = Math.min(gross * 0.05, 500_000 * months);
  const pension = Math.max(0, Number(pensionContribution) || 0);
  const net = Math.max(0, gross - positionExpense - pension);
  const ptkp = PTKP[ptkpStatus] ?? PTKP['TK/0'];
  const pkp = Math.max(0, Math.floor((net - ptkp) / 1000) * 1000);
  const annualTax = calculateProgressivePph(pkp);
  const prior = Math.max(0, Number(priorWithheld) || 0);
  return {
    gross,
    months,
    positionExpense: Math.round(positionExpense),
    pension,
    net: Math.round(net),
    ptkp,
    pkp,
    annualTax,
    priorWithheld: prior,
    lastPeriodTax: annualTax - prior
  };
}

export function calculateVat({ amount, kind = 'nonLuxury', inclusive = false }) {
  const input = Math.max(0, Number(amount) || 0);
  const effectiveRate = kind === 'luxury' ? 0.12 : 0.11;
  const preVat = inclusive ? input / (1 + effectiveRate) : input;
  const vat = preVat * effectiveRate;
  const total = preVat + vat;
  const dpp = kind === 'luxury' ? preVat : preVat * 11 / 12;
  return {
    input,
    effectiveRate,
    preVat: Math.round(preVat),
    dpp: Math.round(dpp),
    vat: Math.round(vat),
    total: Math.round(total)
  };
}

export function calculateUmkmFinal({ taxpayerType = 'individual', priorYtd = 0, currentMonth = 0 }) {
  const before = Math.max(0, Number(priorYtd) || 0);
  const month = Math.max(0, Number(currentMonth) || 0);
  const after = before + month;
  let taxableTurnover = month;

  if (taxpayerType === 'individual') {
    const exemption = 500_000_000;
    taxableTurnover = Math.max(0, after - exemption) - Math.max(0, before - exemption);
  }

  return {
    before,
    month,
    after,
    taxableTurnover: Math.round(taxableTurnover),
    tax: Math.round(taxableTurnover * 0.005)
  };
}

export function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}
