'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScanSuccess: (result: string) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}

export default function QRScanner({ 
  onScanSuccess, 
  onError, 
  enabled = true 
}: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Detect iOS device
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);
  }, []);

  const startScanning = useCallback(async () => {
    if (!enabled || !videoRef.current || !canvasRef.current) return;

    try {
      setIsLoading(true);
      setIsScanning(true);
      setCameraError(null);

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Su navegador no soporta acceso a la cámara. Por favor, use un navegador moderno.');
      }

      // iOS specific constraints
      let constraints;
      if (isIOS) {
        // iOS requires specific constraints
        constraints = {
          video: {
            facingMode: 'environment',
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 }
          }
        };
      } else {
        constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
      }

      // Request camera access with multiple fallbacks
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (_firstError: unknown) {
        console.log('First constraint failed, trying basic constraints');
        try {
          // Fallback 1: Basic video constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment'
            }
          });
        } catch (_secondError: unknown) {
          console.log('Environment constraint failed, trying any camera');
          try {
            // Fallback 2: Any camera available
            stream = await navigator.mediaDevices.getUserMedia({
              video: true
            });
          } catch (_thirdError: unknown) {
            // Final fallback with detailed error
            let errorMessage = 'No se pudo acceder a la cámara. ';
            
            if (isIOS) {
              errorMessage += 'En iOS, asegúrese de: 1) Usar Safari, 2) Estar en HTTPS, 3) Permitir acceso a la cámara en Configuración > Safari > Cámara.';
            } else {
              errorMessage += 'Asegúrese de que está usando HTTPS y ha permitido el acceso a la cámara.';
            }
            
            throw new Error(errorMessage);
          }
        }
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(playError => {
            console.error('Video play error:', playError);
            throw new Error('No se pudo reproducir el video de la cámara. Intente recargar la página.');
          });
        };

        // Start scanning loop
        const scan = () => {
          if (!videoRef.current || !canvasRef.current) return;

          const video = videoRef.current;
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');

          if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
            // Set canvas dimensions to match video
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;

            // Draw current video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get image data and try to decode QR
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code) {
              // QR code found!
              onScanSuccess(code.data);
              setIsScanning(false);
              setShowModal(false);
              setIsLoading(false);
              
              // Stop camera stream
              if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
              }
              return;
            }
          }

          // Continue scanning
          animationRef.current = requestAnimationFrame(scan);
        };

        // Start scanning after a short delay to ensure video is ready
        setTimeout(() => {
          setIsLoading(false);
          scan();
        }, 1000);
      }
    } catch (error: unknown) {
      console.error('Camera error:', error);
      setIsLoading(false);
      let errorMessage;
      
      const errorObj = error as Error;
      
      if (errorObj.name === 'NotAllowedError') {
        errorMessage = isIOS
          ? 'Permiso de cámara denegado. En iOS, vaya a Configuración > Safari > Cámara y permita el acceso.'
          : 'Permiso de cámara denegado. Por favor, permita el acceso a la cámara en la configuración de su navegador.';
      } else if (errorObj.name === 'NotFoundError') {
        errorMessage = 'No se encontró cámara en el dispositivo.';
      } else if (errorObj.name === 'NotReadableError') {
        errorMessage = 'La cámara está siendo utilizada por otra aplicación.';
      } else if (errorObj.name === 'OverconstrainedError') {
        errorMessage = 'La cámara no cumple con los requisitos solicitados.';
      } else if (errorObj.message && errorObj.message.includes('navegador no soporta')) {
        errorMessage = errorObj.message;
      } else {
        errorMessage = errorObj.message || 'Error al acceder a la cámara';
      }
      
      setCameraError(errorMessage);
      setIsScanning(false);
      onError?.(errorMessage);
    }
  }, [enabled, onScanSuccess, onError, isIOS]);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    setIsLoading(false);
    
    // Stop animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopScanning();
    };
  }, [stopScanning]);

  const handleRetry = () => {
    setCameraError(null);
    startScanning();
  };

  const openModal = () => {
    setShowModal(true);
    setCameraError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    stopScanning();
    setCameraError(null);
  };

  // Start scanning when modal opens
  useEffect(() => {
    if (showModal && !isScanning && !cameraError && !isLoading) {
      startScanning();
    }
  }, [showModal, isScanning, cameraError, isLoading, startScanning]);

  if (!enabled) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-gray-500">Escáner QR desactivado</p>
      </div>
    );
  }

  return (
    <>
      {/* Simple button */}
      <div className="flex items-center justify-center p-4">
        <button
          onClick={openModal}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-lg font-medium shadow-lg"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Escanear QR
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Escanear Código QR</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal content */}
            <div className="p-4">
              {cameraError ? (
                <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error de Cámara</h3>
                    <p className="text-red-600 mb-4">{cameraError}</p>
                    {isIOS && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-800">
                        <p className="font-medium mb-1">Instrucciones para iOS:</p>
                        <ul className="text-xs space-y-1">
                          <li>• Use el navegador Safari</li>
                          <li>• Asegúrese de estar en HTTPS</li>
                          <li>• Vaya a Configuración {'>'} Safari {'>'} Cámara</li>
                          <li>• Permita el acceso a la cámara</li>
                        </ul>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleRetry}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reintentar
                      </button>
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '400px' }}>
                  {/* Hidden canvas for QR processing */}
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Video element */}
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p>Iniciando cámara...</p>
                      </div>
                    </div>
                  )}

                  {/* Scanning overlay */}
                  {isScanning && !isLoading && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Scanning frame */}
                      <div className="absolute inset-4 border-2 border-blue-400 rounded-lg">
                        {/* Corner indicators */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                      </div>
                      
                      {/* Scanning line animation */}
                      <div className="absolute inset-4 flex items-center justify-center">
                        <div className="w-full h-1 bg-blue-400 opacity-75 animate-pulse"></div>
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="absolute top-4 left-4 right-4">
                    <div className="bg-black bg-opacity-75 text-white p-3 rounded-lg text-sm">
                      <p className="font-medium mb-1">Instrucciones:</p>
                      <ul className="text-xs space-y-1">
                        <li>• Centre el código QR del camión en el marco</li>
                        <li>• Mantenga estable el dispositivo</li>
                        <li>• El escaneo se realizará automáticamente</li>
                        {isIOS && <li>• En iOS, use Safari y permita el acceso a la cámara</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal footer */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}