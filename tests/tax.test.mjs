import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAnnualPph21,
  calculateMonthlyPph21,
  calculateUmkmFinal,
  calculateVat
} from '../lib/tax.js';

test('PPh21 TER contoh resmi K/0 bruto 10 juta = 200 ribu', () => {
  const result = calculateMonthlyPph21(10_000_000, 'K/0');
  assert.equal(result.category, 'A');
  assert.equal(result.rate, 2);
  assert.equal(result.tax, 200_000);
});

test('PPh21 masa terakhir contoh resmi = 515 ribu', () => {
  const result = calculateAnnualPph21({
    annualGross: 120_000_000,
    pensionContribution: 1_200_000,
    ptkpStatus: 'K/0',
    monthsWorked: 12,
    priorWithheld: 2_200_000
  });
  assert.equal(result.positionExpense, 6_000_000);
  assert.equal(result.pkp, 54_300_000);
  assert.equal(result.annualTax, 2_715_000);
  assert.equal(result.lastPeriodTax, 515_000);
});

test('PPN non mewah efektif 11%', () => {
  const result = calculateVat({ amount: 100_000_000, kind: 'nonLuxury', inclusive: false });
  assert.equal(result.vat, 11_000_000);
  assert.equal(result.total, 111_000_000);
});

test('PPh Final UMKM OP hanya bagian di atas 500 juta', () => {
  const result = calculateUmkmFinal({ taxpayerType: 'individual', priorYtd: 450_000_000, currentMonth: 100_000_000 });
  assert.equal(result.taxableTurnover, 50_000_000);
  assert.equal(result.tax, 250_000);
});
