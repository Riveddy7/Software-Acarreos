'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Timestamp, doc, getDoc, getFirestore } from 'firebase/firestore';
import { Acarreo, Obra, Ruta } from '@/models/types'; // Import Obra and Ruta
import QrCodeDisplay from '@/components/admin/QrCodeDisplay';
import jsPDF from 'jspdf';
import QRCodeStyling from 'qr-code-styling';

const ACARREOS_COLLECTION = 'acarreos';
const OBRAS_COLLECTION = 'obras';
const RUTAS_COLLECTION = 'rutas';

export default function AdminTicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.ticketId as string;

  const [ticket, setTicket] = useState<Acarreo | null>(null);
  const [obra, setObra] = useState<Obra | null>(null); // State for Obra
  const [ruta, setRuta] = useState<Ruta | null>(null); // State for Ruta

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) {
      setError('ID de ticket no proporcionado.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const db = getFirestore();

      // Fetch specific ticket (Acarreo)
      const ticketDocRef = doc(db, ACARREOS_COLLECTION, ticketId);
      const ticketDocSnap = await getDoc(ticketDocRef);

      if (ticketDocSnap.exists()) {
        const fetchedTicket = { id: ticketDocSnap.id, ...ticketDocSnap.data() } as Acarreo;

        // Handle dates
        if (fetchedTicket.fechaHora && (fetchedTicket.fechaHora as any).toDate) {
          fetchedTicket.fechaHora = (fetchedTicket.fechaHora as any).toDate();
        }

        setTicket(fetchedTicket);

        // Fetch Obra and Ruta for details (like logo, extra info)
        const promises = [];
        if (fetchedTicket.idObra) {
          promises.push(getDoc(doc(db, OBRAS_COLLECTION, fetchedTicket.idObra)).then(s => s.exists() ? { type: 'obra', data: s.data() } : null));
        }
        if (fetchedTicket.idRuta) {
          promises.push(getDoc(doc(db, RUTAS_COLLECTION, fetchedTicket.idRuta)).then(s => s.exists() ? { type: 'ruta', data: s.data() } : null));
        }

        const res = await Promise.all(promises);
        res.forEach(r => {
          if (r?.type === 'obra') setObra(r.data as Obra);
          if (r?.type === 'ruta') setRuta(r.data as Ruta);
        });

        setError(null);
      } else {
        setError('Ticket no encontrado.');
      }
    } catch (e) {
      console.error("Error fetching ticket data:", e);
      setError('Error al cargar los datos del ticket. Verifique su conexión.');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const formatDate = (date: Date | any) => {
    if (!date) return '---';
    const d = (date.toDate) ? date.toDate() : new Date(date);
    return d.toLocaleString('es-MX', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const generatePDF = async () => {
    if (!ticket) return;

    setIsGeneratingPDF(true);

    try {
      console.log('🔍 Creating PDF...');

      // Create PDF with receipt format (50.8mm x 101.6mm approx 2x4")
      // Using slightly larger layout for clarity as per user design
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200] // 80mm width (standard thermal receipt), height dynamic but set to 200
      });

      const pageWidth = 80;
      const margin = 5;
      let currentY = 10;

      const addText = (text: string, options: any = {}) => {
        const fontSize = options.fontSize || 10;
        pdf.setFontSize(fontSize);
        if (options.bold) pdf.setFont('helvetica', 'bold');
        else pdf.setFont('helvetica', 'normal');

        const align = options.align || 'left';
        let x = margin;
        if (align === 'center') x = pageWidth / 2;
        if (align === 'right') x = pageWidth - margin;

        pdf.text(text, x, currentY, { align: align as any });
        currentY += (options.marginBottom || 5);
      };

      // Header
      if (obra?.empresaInternaNombre) {
        addText(obra.empresaInternaNombre, { align: 'center', bold: true, fontSize: 12 });
      }
      addText('TICKET DE ACARREO', { align: 'center', bold: true, fontSize: 14, marginBottom: 8 });
      addText(`ID: ${ticket.id?.slice(0, 8)}`, { align: 'center', fontSize: 8 });

      currentY += 5;

      // Warning if needed
      if ((ticket.nombreMostrarTipoAcarreo?.toLowerCase().includes('interno') ||
        ticket.nombreMostrarTipoAcarreo?.toLowerCase().includes('movimiento')) && ticket.esTiro) {
        addText('TICKET INFORMATIVO', { align: 'center', bold: true, fontSize: 10 });
        addText('USAR TICKET CARGA PARA CONCILIACION', { align: 'center', fontSize: 7, marginBottom: 8 });
      }

      // Details
      addText('--------------------------------', { align: 'center' });

      addText(`Obra: ${ticket.nombreMostrarObra}`, { fontSize: 9 });
      addText(`Fecha: ${formatDate(ticket.fechaHora)}`, { fontSize: 9 });

      addText('--------------------------------', { align: 'center' });

      addText(`Ruta: ${ticket.nombreMostrarRuta}`, { fontSize: 9 });
      addText(`Camión: ${ticket.nombreMostrarCamion}`, { fontSize: 9, bold: true });
      addText(`Material: ${ticket.nombreMostrarMaterial || ticket.nombreMaterial}`, { fontSize: 9 });

      addText('--------------------------------', { align: 'center' });
      addText(`Volumen: ${ticket.cantidadCapturada} m3`, { align: 'center', bold: true, fontSize: 14 });

      currentY += 5;
      addText(`${ticket.esCarga ? '[X] CARGA' : '[ ] CARGA'}   ${ticket.esTiro ? '[X] TIRO' : '[ ] TIRO'}`, { align: 'center', fontSize: 10 });

      if (ticket.esCarga) addText(`Origen: ${ruta?.lugarOrigenNombre || 'N/A'}`, { fontSize: 8, align: 'center' });
      if (ticket.esTiro) addText(`Destino: ${ruta?.lugarDestinoNombre || 'N/A'}`, { fontSize: 8, align: 'center' });

      addText('--------------------------------', { align: 'center' });
      addText(`Capturó: ${ticket.nombreMostrarUsuario}`, { fontSize: 8 });

      // Save
      pdf.save(`Ticket_${ticket.id?.slice(0, 8)}.pdf`);

    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert('Error al generar el PDF.');
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
          <button onClick={() => router.push('/admin/tickets')} className="bg-blue-600 text-white px-4 py-2 rounded">Volver</button>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  // Render similar to Operator Ticket View
  const isInternal = ticket.nombreMostrarTipoAcarreo?.toLowerCase().includes('interno') ||
    ticket.nombreMostrarTipoAcarreo?.toLowerCase().includes('movimiento');
  const isInformative = isInternal && ticket.esTiro;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">

        {/* Admin Header */}
        <div className="bg-gray-100 px-6 py-2 border-b flex justify-between items-center">
          <span className="text-xs font-mono text-gray-500">VISTA ADMINISTRADOR</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${ticket.estatusConciliado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {ticket.estatusConciliado ? 'CONCILIADO' : 'PENDIENTE'}
          </span>
        </div>

        {/* Ticket Header */}
        <div className="p-6 text-center border-b border-gray-100">
          {obra?.empresaInternaNombre && (
            <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide mb-1">
              {obra.empresaInternaNombre}
            </h3>
          )}
          <h1 className="text-xl font-black text-gray-900 mb-1">TICKET DE ACARREO</h1>
          <p className="text-sm text-gray-500 font-mono">{ticket.id?.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Warning Badge */}
        {isInformative && (
          <div className="bg-yellow-50 border-y border-yellow-200 p-3 text-center">
            <p className="text-yellow-800 text-xs font-bold uppercase">
              TICKET INFORMATIVO<br />
              <span className="font-normal opacity-75">USAR EL TICKET DE CARGA PARA CONCILIACIÓN</span>
            </p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4 text-sm text-gray-800">
          <div className="grid grid-cols-2 gap-y-2">
            <div className="col-span-2">
              <span className="text-xs text-gray-400 uppercase block">Obra</span>
              <span className="font-semibold block">{ticket.nombreMostrarObra}</span>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-gray-400 uppercase block">Fecha y Hora</span>
              <span className="font-mono">{formatDate(ticket.fechaHora)}</span>
            </div>
          </div>

          <hr className="border-gray-100 border-dashed" />

          <div className="grid grid-cols-2 gap-y-3">
            <div className="col-span-2">
              <span className="text-xs text-gray-400 uppercase block">Ruta</span>
              <span className="font-semibold block">{ticket.nombreMostrarRuta || ruta?.nombreParaMostrar}</span>
            </div>

            <div className="col-span-2">
              <span className="text-xs text-gray-400 uppercase block">Camión</span>
              <span className="font-bold">{ticket.nombreMostrarCamion}</span>
            </div>

            <div>
              <span className="text-xs text-gray-400 uppercase block">Material</span>
              <span className="font-semibold block">{ticket.nombreMostrarMaterial || ticket.nombreMaterial}</span>
            </div>
          </div>

          <hr className="border-gray-100 border-dashed" />

          {/* Volume */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-gray-500 uppercase font-bold">Volumen Capturado</span>
              <span className={`text-2xl font-black ${isInformative ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                {ticket.cantidadCapturada} m³
              </span>
            </div>
          </div>

          {/* QR */}
          <div className="flex justify-center mt-6">
            <QrCodeDisplay value={ticket.id} size={120} />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col gap-3">
          <button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="w-full bg-gray-800 text-white font-bold py-3 rounded-lg shadow hover:bg-gray-700 transition"
          >
            {isGeneratingPDF ? 'Generando PDF...' : 'Descargar PDF'}
          </button>

          <button
            onClick={() => router.push('/admin/tickets')}
            className="w-full bg-white text-blue-600 font-bold py-3 rounded-lg border border-blue-200 hover:bg-blue-50 transition"
          >
            Volver a Lista
          </button>
        </div>
      </div>
    </div>
  );
}