
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Ticket } from '@/models/types';
import { getCollection, TICKETS_COLLECTION } from '@/lib/firebase/firestore';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedTickets = await getCollection<Ticket>(TICKETS_COLLECTION);
      setTickets(fetchedTickets);
      setError(null);
    } catch (e) {
      console.error("Error fetching tickets:", e);
      setError('No se pudieron cargar los tickets. Verifique su configuración de Firebase.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  if (isLoading) {
    return <p className="text-center text-lg text-gray-700 mt-8">Cargando tickets...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600 text-lg bg-red-100 p-4 rounded-md border border-red-200 mt-8">Error: {error}</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Listado de Tickets</h1>

      {tickets.length === 0 && !isLoading && !error && (
        <p className="text-center text-gray-700">No hay tickets registrados.</p>
      )}

      {tickets.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto border border-gray-200">
          <table className="w-full table-auto text-left min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">ID Ticket</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Folio</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Materiales</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => {
                const getTypeLabel = (type: string) => {
                  switch (type) {
                    case 'dispatch': return 'Despacho';
                    case 'delivery': return 'Entrega';
                    case 'reception': return 'Recepción';
                    default: return type;
                  }
                };

                const getMaterialsDisplay = (ticket: Ticket) => {
                  if (ticket.materials && ticket.materials.length > 0) {
                    if (ticket.materials.length === 1) {
                      return ticket.materials[0].materialName;
                    } else {
                      return `${ticket.materials.length} materiales`;
                    }
                  }
                  return 'N/A';
                };

                const getDisplayDate = (ticket: Ticket) => {
                  if (ticket.type === 'reception' && ticket.receptionDate) {
                    return formatDate(ticket.receptionDate);
                  }
                  return formatDate(ticket.createdAt);
                };

                return (
                  <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-mono text-sm text-gray-700">{ticket.id}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        ticket.type === 'reception' ? 'bg-purple-100 text-purple-800' :
                        ticket.type === 'dispatch' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {getTypeLabel(ticket.type)}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-sm text-gray-700">
                      {ticket.folio || ticket.shipmentId || (ticket.type === 'reception' ? ticket.purchaseOrderNumber : 'N/A')}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {ticket.materials && ticket.materials.length > 1 ? (
                        <div>
                          <div className="font-medium">{getMaterialsDisplay(ticket)}</div>
                          <details className="mt-1">
                            <summary className="text-xs text-blue-600 cursor-pointer">Ver detalles</summary>
                            <div className="mt-2 space-y-1">
                              {ticket.materials.map((material, index) => (
                                <div key={index} className="text-xs text-gray-600">
                                  {material.materialName}: {material.weight} {material.materialUnit}
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      ) : (
                        getMaterialsDisplay(ticket)
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">{getDisplayDate(ticket)}</td>
                    <td className="py-4 px-4 text-center">
                      <Link href={`/admin/tickets/${ticket.id}`} className="text-blue-600 hover:underline text-sm">
                        Ver Ticket
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
