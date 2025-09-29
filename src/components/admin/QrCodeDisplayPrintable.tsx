'use client';

import React, { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

interface QrCodeDisplayPrintableProps {
  value: string;
  size?: number;
}

// Configuration for the QR code optimized for PDF
const qrCodeOptions = {
  width: 200,
  height: 200,
  type: 'canvas',
  data: '',
  dotsOptions: {
    color: '#000000', // Black for better PDF contrast
    type: 'square'
  },
  backgroundOptions: {
    color: '#ffffff',
  },
  cornersSquareOptions: {
    color: '#000000',
    type: 'square'
  },
  cornersDotOptions: {
    color: '#000000',
    type: 'square'
  }
} as const;

export default function QrCodeDisplayPrintable({ value, size = 200 }: QrCodeDisplayPrintableProps) {
  const ref = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!value) return;

    // Initialize QRCodeStyling only once
    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling({
        ...qrCodeOptions,
        width: size,
        height: size,
        data: value,
      });
    } else {
      // Update data if QR code already exists
      qrCode.current.update({
        width: size,
        height: size,
        data: value
      });
    }

    const currentRef = ref.current;

    // Append QR code to the ref element
    if (currentRef) {
      // Clear previous content
      currentRef.innerHTML = '';
      qrCode.current.append(currentRef);
    }

    return () => {
      if (currentRef) {
        currentRef.innerHTML = '';
      }
    };
  }, [value, size]);

  if (!value) return null;

  return (
    <div style={{
      padding: '8px',
      backgroundColor: '#ffffff',
      display: 'inline-block',
      borderRadius: '8px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <div ref={ref} />
    </div>
  );
}