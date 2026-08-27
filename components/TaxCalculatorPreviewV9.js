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

      const oldUnifikasi = main.querySelector('.unifikasi-v8-wrap');
      if (oldUnifikasi) oldUnifikasi.style.display = isUnifikasi ? 'none' : '';

      slot = document.getElementById('unifikasi-v9-slot');
      if (!slot || !slot.isConnected) {
        slot = document.createElement('div');
        slot.id = 'unifikasi-v9-slot';
        const v8slot = document.getElementById('unifikasi-v8-slot');
        if (v8slot?.parentNode) v8slot.parentNode.insertBefore(slot, v8slot.nextSibling);
        else tabs.insertAdjacentElement('afterend', slot);
        setTarget(slot);
      }
      slot.style.display = isUnifikasi ? '' : 'none';
    };

    const timer = setTimeout(() => {
      sync();
      const main = document.querySelector('main');
      if (main) {
        observer = new MutationObserver(sync);
        observer.observe(main, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style'] });
        main.addEventListener('click', sync, true);
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
      document.querySelector('main')?.removeEventListener('click', sync, true);
      document.getElementById('unifikasi-v9-slot')?.remove();
      const oldUnifikasi = document.querySelector('.unifikasi-v8-wrap');
      if (oldUnifikasi) oldUnifikasi.style.display = '';
    };
  }, []);

  return <>
    <TaxCalculatorPreviewV8 />
    {target && active ? createPortal(<UnifikasiCalculatorComplete />, target) : null}
  </>;
}
