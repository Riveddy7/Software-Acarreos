'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Ticket, PurchaseOrder } from '@/models/types';
import { TICKETS_COLLECTION, PURCHASE_ORDERS_COLLECTION, getCollection } from '@/lib/firebase/firestore';
import QrCodeDisplay from '@/components/admin/QrCodeDisplay';
import jsPDF from 'jspdf';
import QRCodeStyling from 'qr-code-styling';

export default function AdminTicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.ticketId as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const fetchData = useCallback(async () => {
    if (!ticketId) {
      setError('ID de ticket no proporcionado.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch specific ticket
      const ticketDocRef = doc(db, TICKETS_COLLECTION, ticketId);
      const ticketDocSnap = await getDoc(ticketDocRef);

      if (ticketDocSnap.exists()) {
        const fetchedTicket = { id: ticketDocSnap.id, ...ticketDocSnap.data() } as Ticket;
        setTicket(fetchedTicket);

        // If it's a reception ticket, fetch the purchase order for status
        if (fetchedTicket.type === 'reception' && fetchedTicket.purchaseOrderNumber) {
          try {
            // Find the purchase order by order number
            const allPurchaseOrders = await getCollection<PurchaseOrder>(PURCHASE_ORDERS_COLLECTION);
            const matchingPO = allPurchaseOrders.find(po => po.orderNumber === fetchedTicket.purchaseOrderNumber);

            if (matchingPO) {
              setPurchaseOrder(matchingPO);
            }
          } catch (poError) {
            console.warn('Could not fetch purchase order:', poError);
          }
        }

        setError(null);
      } else {
        setError('Ticket no encontrado.');
      }
    } catch (e) {
      console.error("Error fetching ticket data:", e);
      setError('Error al cargar los datos del ticket. Verifique su configuración de Firebase.');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTicketTitle = (ticket: Ticket) => {
    switch (ticket.type) {
      case 'dispatch': return 'Ticket de Despacho';
      case 'delivery': return 'Ticket de Entrega';
      case 'reception': return 'Ticket de Recepción';
      default: return 'Ticket';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PARTIAL: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      EN_TRANSITO: 'bg-yellow-100 text-yellow-800',
      COMPLETADO: 'bg-green-100 text-green-800'
    };

    const statusLabels = {
      PENDING: 'Pendiente',
      PARTIAL: 'Parcial',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
      EN_TRANSITO: 'En Tránsito',
      COMPLETADO: 'Completado'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  const generatePDF = async () => {
    if (!ticket) return;

    setIsGeneratingPDF(true);

    try {
      console.log('🔍 Creating PDF using direct jsPDF approach...');

      // Create PDF with receipt format (2" x 4" = 50.8mm x 101.6mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [50.8, 101.6]
      });

      // Set up basic styling for receipt format
      const pageWidth = 50.8;
      const margin = 3;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // Helper function to add text with automatic line breaks (optimized for receipt)
      const addText = (text: string, x: number, y: number, options: {
        fontSize?: number;
        maxWidth?: number;
        align?: string;
        lineHeight?: number;
        marginBottom?: number;
        bold?: boolean;
      } = {}) => {
        const fontSize = options.fontSize || 7; // Smaller default font for receipt
        const maxWidth = options.maxWidth || contentWidth;
        const align = options.align || 'left';
        const lineHeight = options.lineHeight || fontSize * 0.35;

        pdf.setFontSize(fontSize);
        // Use serif font for better readability in black and white
        if (options.bold) pdf.setFont('times', 'bold');
        else pdf.setFont('times', 'normal');

        const lines = pdf.splitTextToSize(text, maxWidth);

        lines.forEach((line: string, index: number) => {
          let xPos = x;
          if (align === 'center') {
            xPos = x + (maxWidth / 2) - (pdf.getTextWidth(line) / 2);
          }
          pdf.text(line, xPos, y + (index * lineHeight));
        });

        return y + (lines.length * lineHeight) + (options.marginBottom || 2);
      };

      // Helper function to add real QR code
      const addQRCode = async (data: string, x: number, y: number, size: number) => {
        try {
          // Create QR code using qr-code-styling
          const qrCode = new QRCodeStyling({
            width: size * 10, // Higher resolution for crisp printing
            height: size * 10,
            type: 'canvas',
            data: data,
            dotsOptions: {
              color: '#000000',
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
          });

          // Create a temporary canvas
          const canvas = document.createElement('canvas');
          await qrCode.append(canvas);

          // Wait a moment for the QR to be generated
          await new Promise(resolve => setTimeout(resolve, 100));

          // Get the canvas from the QR code
          const qrCanvas = canvas.querySelector('canvas') as HTMLCanvasElement;
          if (qrCanvas) {
            const imageData = qrCanvas.toDataURL('image/png', 1.0);
            pdf.addImage(imageData, 'PNG', x, y, size, size);
          } else {
            throw new Error('Could not generate QR canvas');
          }
        } catch (error) {
          console.warn('Could not generate QR code, adding placeholder:', error);
          // Fallback: simple black square with border
          pdf.setFillColor(255, 255, 255);
          pdf.rect(x, y, size, size, 'F');
          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.2);
          pdf.rect(x, y, size, size, 'S');

          // Add text ID in the center
          pdf.setFontSize(4);
          pdf.setFont('times', 'normal');
          const textWidth = pdf.getTextWidth(data.substring(0, 8));
          pdf.text(data.substring(0, 8), x + (size - textWidth) / 2, y + size / 2);
        }
      };

      // Compact receipt header
      const headerText = ticket.type === 'reception' ? 'RECEPCIÓN' :
                         ticket.type === 'dispatch' ? 'DESPACHO' : 'ENTREGA';
      currentY = addText(
        headerText,
        margin, currentY,
        { fontSize: 10, bold: true, align: 'center', maxWidth: contentWidth, marginBottom: 3 }
      );

      // Add separator line
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.1);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 2;

      if (ticket.type === 'reception') {
        // Purchase Order Number (most important info)
        currentY = addText(`Orden: ${ticket.purchaseOrderNumber}`, margin, currentY, { fontSize: 8, bold: true, marginBottom: 1 });

        // Supplier
        currentY = addText(`${ticket.supplierName}`, margin, currentY, { fontSize: 7, marginBottom: 2 });

        // Date
        const formatDate = (timestamp: unknown) => {
          if (!timestamp || typeof timestamp !== 'object' || !('toDate' in timestamp)) return 'N/A';
          const date = (timestamp as { toDate: () => Date }).toDate();
          return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        };

        currentY = addText(`${formatDate(ticket.receptionDate)}`, margin, currentY, { fontSize: 6, marginBottom: 2 });

        // Received by
        currentY = addText(`Recibido: ${ticket.receivedByName}`, margin, currentY, { fontSize: 6, marginBottom: 3 });

        // Separator line
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 2;

        // Materials (compact format)
        if (ticket.materials && ticket.materials.length > 0) {
          currentY = addText('MATERIALES:', margin, currentY, { fontSize: 7, bold: true, marginBottom: 1 });

          ticket.materials.forEach((material) => {
            // Material name
            currentY = addText(`${material.materialName}`, margin, currentY, { fontSize: 6, marginBottom: 0.5 });

            // Quantity on next line, right aligned
            const quantityText = `${material.weight} ${material.materialUnit}`;
            pdf.setFontSize(6);
            pdf.setFont('times', 'bold');
            const quantityWidth = pdf.getTextWidth(quantityText);
            pdf.text(quantityText, pageWidth - margin - quantityWidth, currentY);
            currentY += 2;
          });
        }

        currentY += 2;
        // Separator line
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 3;

      } else if (ticket.type === 'dispatch') {
        // Dispatch ticket format
        if (ticket.folio) {
          currentY = addText(`Folio: ${ticket.folio}`, margin, currentY, { fontSize: 8, bold: true, marginBottom: 1 });
        }

        // Truck and driver
        if (ticket.truckPlate) {
          currentY = addText(`Camión: ${ticket.truckPlate}`, margin, currentY, { fontSize: 7, marginBottom: 1 });
        }
        if (ticket.driverName) {
          currentY = addText(`Chofer: ${ticket.driverName}`, margin, currentY, { fontSize: 7, marginBottom: 2 });
        }

        // Date and time
        const formatDispatchDate = (timestamp: unknown) => {
          if (!timestamp || typeof timestamp !== 'object' || !('toDate' in timestamp)) return 'N/A';
          const date = (timestamp as { toDate: () => Date }).toDate();
          return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        };

        if (ticket.dispatchTimestamp) {
          currentY = addText(`Fecha: ${formatDispatchDate(ticket.dispatchTimestamp)}`, margin, currentY, { fontSize: 6, marginBottom: 1 });
        }

        // Dispatched by
        if (ticket.dispatchedByName) {
          currentY = addText(`Despachó: ${ticket.dispatchedByName}`, margin, currentY, { fontSize: 6, marginBottom: 2 });
        }

        // Origin location
        if (ticket.dispatchLocationName) {
          currentY = addText(`Origen: ${ticket.dispatchLocationName}`, margin, currentY, { fontSize: 6, marginBottom: 3 });
        }

        // Separator line
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 2;

        // Materials (dispatch format)
        if (ticket.materials && ticket.materials.length > 0) {
          currentY = addText('MATERIALES:', margin, currentY, { fontSize: 7, bold: true, marginBottom: 1 });

          ticket.materials.forEach((material) => {
            // Material name
            currentY = addText(`${material.materialName}`, margin, currentY, { fontSize: 6, marginBottom: 0.5 });

            // Quantity on next line, right aligned
            const quantityText = `${material.weight} ${material.materialUnit}`;
            pdf.setFontSize(6);
            pdf.setFont('times', 'bold');
            const quantityWidth = pdf.getTextWidth(quantityText);
            pdf.text(quantityText, pageWidth - margin - quantityWidth, currentY);
            currentY += 2;
          });
        }

        currentY += 2;
        // Separator line
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 3;

      } else {
        // Compact format for delivery tickets
        if (ticket.folio) {
          currentY = addText(`Folio: ${ticket.folio}`, margin, currentY, { fontSize: 7, bold: true });
        }
        if (ticket.truckPlate) {
          currentY = addText(`Camión: ${ticket.truckPlate}`, margin, currentY, { fontSize: 7 });
        }
        if (ticket.driverName) {
          currentY = addText(`Chofer: ${ticket.driverName}`, margin, currentY, { fontSize: 7 });
        }
      }

      // QR Code section (compact)
      const qrSize = 20; // Smaller QR for receipt
      const qrX = (pageWidth - qrSize) / 2;

      await addQRCode(ticket.id, qrX, currentY, qrSize);
      currentY += qrSize + 2;

      // ID below QR
      currentY = addText(`ID: ${ticket.id}`, margin, currentY, { align: 'center', maxWidth: contentWidth, fontSize: 5 });

      // Generate filename
      const fileName = ticket.type === 'reception'
        ? `ticket-recepcion-${ticket.purchaseOrderNumber || ticket.id}.pdf`
        : ticket.type === 'dispatch'
        ? `ticket-despacho-${ticket.folio || ticket.id}.pdf`
        : `ticket-entrega-${ticket.folio || ticket.id}.pdf`;

      console.log('🔍 Saving PDF as:', fileName);

      // Save the PDF
      pdf.save(fileName);

      console.log('✅ PDF generation completed successfully!');

    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert('Error al generar el PDF. Inténtalo de nuevo.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Cargando ticket...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Error: {error}</div>
          <button
            onClick={() => router.push('/admin/tickets')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Volver a Tickets
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-700">No se pudo cargar la información del ticket.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">

      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {getTicketTitle(ticket)}
          </h1>
          <div className="text-lg font-mono text-gray-600 bg-gray-100 px-4 py-2 rounded-md">
            ID: {ticket.id}
          </div>
        </div>

        {/* Content based on ticket type */}
        {ticket.type === 'reception' ? (
          /* Reception Ticket Layout */
          <div className="space-y-6">
            {/* Purchase Order Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-blue-900">Orden de Compra</h3>
                {purchaseOrder && getStatusBadge(purchaseOrder.status)}
              </div>
              <div className="space-y-2 text-blue-800">
                <p><strong>Número:</strong> {ticket.purchaseOrderNumber}</p>
                <p><strong>Proveedor:</strong> {ticket.supplierName}</p>
                <p><strong>Ubicación:</strong> {ticket.deliveryLocationName}</p>
              </div>
            </div>

            {/* Reception Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600"><strong>Fecha de Recepción:</strong></p>
                <p className="text-lg">{formatDate(ticket.receptionDate)}</p>
              </div>
              <div>
                <p className="text-gray-600"><strong>Recibido por:</strong></p>
                <p className="text-lg">{ticket.receivedByName}</p>
              </div>
            </div>

            {/* Materials List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Materiales Recibidos</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg">
                {ticket.materials && ticket.materials.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {ticket.materials.map((material, index) => (
                      <div key={index} className="p-4 flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{material.materialName}</div>
                          <div className="text-sm text-gray-600">Unidad: {material.materialUnit}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">{material.weight}</div>
                          <div className="text-sm text-gray-600">{material.materialUnit}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No hay materiales en este ticket
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Legacy Dispatch/Delivery Ticket Layout */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              {ticket.folio && (
                <div>
                  <p className="text-gray-600"><strong>Folio:</strong></p>
                  <p className="text-lg font-mono">{ticket.folio}</p>
                </div>
              )}

              {ticket.truckPlate && (
                <div>
                  <p className="text-gray-600"><strong>Camión:</strong></p>
                  <p className="text-lg">{ticket.truckPlate}</p>
                </div>
              )}

              {ticket.driverName && (
                <div>
                  <p className="text-gray-600"><strong>Chofer:</strong></p>
                  <p className="text-lg">{ticket.driverName}</p>
                </div>
              )}

              {ticket.type === 'dispatch' && ticket.dispatchLocationName && (
                <div>
                  <p className="text-gray-600"><strong>Origen:</strong></p>
                  <p className="text-lg">{ticket.dispatchLocationName}</p>
                </div>
              )}

              {ticket.type === 'delivery' && ticket.deliveryLocationName && (
                <div>
                  <p className="text-gray-600"><strong>Destino:</strong></p>
                  <p className="text-lg">{ticket.deliveryLocationName}</p>
                </div>
              )}

              <div>
                <p className="text-gray-600"><strong>Fecha:</strong></p>
                <p className="text-lg">
                  {ticket.type === 'dispatch'
                    ? formatDate(ticket.dispatchTimestamp)
                    : formatDate(ticket.deliveryTimestamp)
                  }
                </p>
              </div>
            </div>

            {/* Materials for legacy tickets */}
            {ticket.materials && ticket.materials.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Materiales</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg divide-y divide-gray-200">
                  {ticket.materials.map((material, index) => (
                    <div key={index} className="p-4 flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{material.materialName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">{material.weight}</div>
                        <div className="text-sm text-gray-600">{material.materialUnit}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* QR Code Section */}
        <div className="mt-8 flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Código QR del Ticket</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <QrCodeDisplay value={ticket.id} size={256} />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Escanea este código para acceder al ticket
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="bg-green-600 text-white text-lg font-medium py-3 px-8 rounded-lg shadow-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isGeneratingPDF ? 'Generando PDF...' : '📄 Descargar PDF'}
          </button>
          <button
            onClick={() => router.push('/admin/tickets')}
            className="bg-blue-600 text-white text-lg font-medium py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Volver a Tickets
          </button>
        </div>
      </div>
    </div>
  );
}