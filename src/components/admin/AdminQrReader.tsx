
'use client';

import React, { useState } from 'react';

interface AdminQrReaderProps {
  onScan: (scannedId: string) => void;
  label: string;
  placeholder?: string;
}

export default function AdminQrReader({ onScan, label, placeholder = "Ingrese o escanee el ID" }: AdminQrReaderProps) {
  const [inputValue, setInputValue] = useState<string>('');

  const handleConfirm = () => {
    if (inputValue.trim()) {
      onScan(inputValue.trim());
      setInputValue(''); // Clear input after scan
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        id="qr-input"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-lg text-gray-900"
        placeholder={placeholder}
        autoFocus
      />
      <button
        onClick={handleConfirm}
        className="w-full bg-green-600 text-white text-lg font-medium py-3 px-6 rounded-md shadow-sm hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        Escanear Ticket
      </button>
    </div>
  );
}
