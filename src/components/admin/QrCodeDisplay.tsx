
'use client';

import React, { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling'; // Import the new library

interface QrCodeDisplayProps {
  value: string;
  size?: number;
}

// Configuration for the QR code (can be customized)
const qrCodeOptions = {
  width: 80,
  height: 80,
  type: 'canvas',
  data: '', // This will be set dynamically
  image: '', // Optional: path to an image in the center of the QR code
  dotsOptions: {
    color: '#4267b2',
    type: 'rounded'
  },
  backgroundOptions: {
    color: '#ffffff',
  },
  cornersSquareOptions: {
    color: '#4267b2',
    type: 'extra-rounded'
  },
  cornersDotOptions: {
    color: '#4267b2',
    type: 'dot'
  }
} as const;

export default function QrCodeDisplay({ value, size = 80 }: QrCodeDisplayProps) {
  const ref = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!value) return;

    // Initialize QRCodeStyling only once
    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling({
        ...qrCodeOptions,
        width: size, // Use the size prop
        height: size, // Use the size prop
        data: value, // Set initial data
      });
    } else {
      // Update data if QR code already exists
      qrCode.current.update({
        width: size,
        height: size,
        data: value
      });
    }

    const currentRef = ref.current; // Capture ref.current

    // Append QR code to the ref element
    if (currentRef) {
      qrCode.current.append(currentRef);
    }

    // Cleanup function (optional, but good practice)
    return () => {
      if (qrCode.current && currentRef) {
        // qrCode.current.clear(); // No direct clear method, but append replaces
      }
    };
  }, [value, size]); // Re-run effect if value or size changes

  if (!value) return null;

  return (
    <div className="p-2 bg-white inline-block rounded-lg shadow">
      <div ref={ref} /> {/* The div where the QR code will be rendered */}
    </div>
  );
}
