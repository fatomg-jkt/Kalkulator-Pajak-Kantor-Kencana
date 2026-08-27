'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import TaxCalculatorPreviewV8 from './TaxCalculatorPreviewV8';
import UnifikasiCalculatorComplete from './UnifikasiCalculatorComplete';

export default function TaxCalculatorPreviewV9() {
  const [target, setTarget] = useState(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let observer;
    let slot;

    const sync = () => {
      const main = document.querySelector('main');
      const tabs = main?.querySelector('nav.tabs');
      if (!main || !tabs) return;

      const activeButton = Array.from(tabs.querySelectorAll('button')).find((button) => button.classList.contains('active'));
      const isUnifikasi = activeButton?.textContent?.trim() === 'PPh Unifikasi';
      setActive(isUnifikasi);

      slot = document.getElementById('unifikasi-v9-slot');
      if (!slot || !slot.isConnected) {
        slot = document.createElement('div');
        slot.id = 'unifikasi-v9-slot';
        tabs.insertAdjacentElement('afterend', slot);
        setTarget(slot);
      }
      slot.style.display = isUnifikasi ? '' : 'none';

      const allCalculatorGrids = Array.from(main.querySelectorAll('.calculator-grid'));
      allCalculatorGrids.forEach((grid) => {
        const belongsToV9 = Boolean(grid.closest('#unifikasi-v9-slot'));
        if (isUnifikasi) {
          grid.style.display = belongsToV9 ? '' : 'none';
        } else if (!belongsToV9) {
          grid.style.display = '';
        }
      });

      const v8Wrap = main.querySelector('.unifikasi-v8-wrap');
      if (v8Wrap) v8Wrap.style.display = 'none';

      const v8Slot = document.getElementById('unifikasi-v8-slot');
      if (v8Slot) v8Slot.style.display = 'none';
    };

    const timer = window.setTimeout(sync, 0);
    const main = document.querySelector('main');
    if (main) {
      observer = new MutationObserver(sync);
      observer.observe(main, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
      main.addEventListener('click', sync, true);
      main.addEventListener('change', sync, true);
    }

    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
      if (main) {
        main.removeEventListener('click', sync, true);
        main.removeEventListener('change', sync, true);
      }
      document.getElementById('unifikasi-v9-slot')?.remove();
      document.getElementById('unifikasi-v8-slot')?.removeAttribute('style');
      document.querySelectorAll('main .calculator-grid').forEach((grid) => { grid.style.display = ''; });
    };
  }, []);

  return <>
    <TaxCalculatorPreviewV8 />
    {target && active ? createPortal(<UnifikasiCalculatorComplete />, target) : null}
  </>;
}
