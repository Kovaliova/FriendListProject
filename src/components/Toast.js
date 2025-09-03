import React, { useEffect, useRef } from 'react';

export default function Toast({ text, onHide }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!text) return;
    const el = ref.current;
    el.classList.add('show');
    const t = setTimeout(() => { el.classList.remove('show'); onHide && onHide(); }, 1800);
    return () => clearTimeout(t);
  }, [text, onHide]);

  return <div ref={ref} className="toast" aria-live="polite">{text || ''}</div>;
}