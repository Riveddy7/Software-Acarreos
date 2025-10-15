
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Ticket } from '@/models/types';
import { getCollection, TICKETS_COLLECTION } from '@/lib/firebase/firestore';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { Column } from '@/components/ui/DataTable';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter tickets based on search query
  const filteredTickets = tickets.filter(ticket =>
    ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.folio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.shipmentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.purchaseOrderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Define columns for the DataTable
  const columns: Column<Ticket>[] = [
    {
      key: 'id',
      label: 'ID Ticket',
      render: (value) => (
        <span className="font-mono text-sm text-gray-700">{value}</span>
      )
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (value) => {
        const getTypeLabel = (type: string) => {
          switch (type) {
            case 'dispatch': return 'Despacho';
            case 'delivery': return 'Entrega';
            case 'reception': return 'Recepción';
            default: return type;
          }
        };
        
        const getBadgeClass = (type: string) => {
          switch (type) {
            case 'reception': return 'bg-purple-100 text-purple-800';
            case 'dispatch': return 'bg-blue-100 text-blue-800';
            case 'delivery': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
          }
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getBadgeClass(value)}`}>
            {getTypeLabel(value)}
          </span>
        );
      }
    },
    {
      key: 'folio',
      label: 'Folio',
      render: (_, ticket) => (
        <span className="font-mono text-sm text-gray-700">
          {ticket.folio || ticket.shipmentId || (ticket.type === 'reception' ? ticket.purchaseOrderNumber : 'N/A')}
        </span>
      )
    },
    {
      key: 'materials',
      label: 'Materiales',
      render: (_, ticket) => {
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
        
        return (
          <div>
            <div className="font-medium text-gray-700">{getMaterialsDisplay(ticket)}</div>
            {ticket.materials && ticket.materials.length > 1 && (
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
            )}
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      render: (_, ticket) => {
        const getDisplayDate = (ticket: Ticket) => {
          if (ticket.type === 'reception' && ticket.receptionDate) {
            return formatDate(ticket.receptionDate);
          }
          return formatDate(ticket.createdAt);
        };
        
        return (
          <span className="text-sm text-gray-700">{getDisplayDate(ticket)}</span>
        );
      }
    },
    {
    key: 'id' as keyof Ticket,
    label: 'Acciones',
    render: (_, ticket) => (
      <Link
        href={`/admin/tickets/${ticket.id}`}
        className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </Link>
    )
  }
  ];

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-3">
          <SearchInput
            placeholder="Buscar por ID, folio o tipo..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="md:col-span-1">
          {/* Tickets no tienen botón de creación, se generan automáticamente */}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          Error: {error}
        </div>
      )}

      <DataTable
        data={filteredTickets}
        columns={columns}
        loading={isLoading}
        emptyMessage="No hay tickets que coincidan con la búsqueda"
      />
    </div>
  );
}
