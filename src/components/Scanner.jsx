import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

const Scanner = ({ onScan }) => {
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef(null);
  
  // Auto-focus logic to keep scanner ready
  useEffect(() => {
    const keepFocus = () => {
      if(inputRef.current && document.activeElement !== inputRef.current) {
        // Only focus if user isn't typing in another input
        if(document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          inputRef.current.focus();
        }
      }
    };
    document.addEventListener('click', keepFocus);
    return () => document.removeEventListener('click', keepFocus);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputVal.trim() !== '') {
        onScan(inputVal.trim());
        setInputVal('');
      }
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--color-surface)', padding: '20px 24px', borderRadius: '20px', boxShadow: 'var(--shadow-md)', border: '1px solid rgba(226, 232, 240, 0.8)', maxWidth: '600px', margin: '0 0 40px 0' }}>
      <Search size={32} color="var(--color-primary)" />
      <input
        ref={inputRef}
        type="text"
        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '1.25rem', color: 'var(--color-text)', fontWeight: '500' }}
        placeholder="Escanea el código de barras o ingresa el SKU..."
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    </div>
  );
};

export default Scanner;
