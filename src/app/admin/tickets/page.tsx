'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Acarreo } from '@/models/types';
import { getCollection } from '@/lib/firebase/firestore';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { Column } from '@/components/ui/DataTable';

const ACARREOS_COLLECTION = 'acarreos';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Acarreo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedTickets = await getCollection<Acarreo>(ACARREOS_COLLECTION);
      // Sort by date descending
      fetchedTickets.sort((a, b) => {
        const dateA = a.fechaHora instanceof Timestamp ? a.fechaHora.toMillis() : new Date(a.fechaHora).getTime();
        const dateB = b.fechaHora instanceof Timestamp ? b.fechaHora.toMillis() : new Date(b.fechaHora).getTime();
        return dateB - dateA;
      });
      setTickets(fetchedTickets);
      setError(null);
    } catch (e) {
      console.error("Error fetching tickets:", e);
      setError('No se pudieron cargar los tickets. Verifique su conexión.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const formatDate = (date: Date | any) => {
    if (!date) return '---';
    const d = (date.toDate) ? date.toDate() : new Date(date);
    return d.toLocaleString('es-MX', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Filter tickets based on search query
  const filteredTickets = tickets.filter(ticket =>
    ticket.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.nombreMostrarObra?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.nombreMostrarCamion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.nombreMostrarRuta?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Define columns for the DataTable
  const columns: Column<Acarreo>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (value) => (
        <span className="font-mono text-xs text-gray-500" title={value}>{value?.slice(0, 8)}...</span>
      )
    },
    {
      key: 'fechaHora',
      label: 'Fecha',
      render: (value) => (
        <span className="text-sm">{formatDate(value)}</span>
      )
    },
    {
      key: 'nombreMostrarObra',
      label: 'Obra',
      render: (value) => <span className="font-medium text-sm text-gray-800">{value}</span>
    },
    {
      key: 'nombreMostrarCamion',
      label: 'Camión',
      render: (value) => <span className="text-sm text-gray-700">{value}</span>
    },
    {
      key: 'nombreMostrarMaterial', // Using the field I am saving now
      label: 'Material',
      render: (value, row) => <span className="text-sm">{value || (row as any).nombreMaterial || '---'}</span>
    },
    {
      key: 'cantidadCapturada',
      label: 'Vol (m³)',
      render: (value) => <span className="font-bold text-gray-900">{value}</span>
    },
    {
      key: 'esTiro',
      label: 'Tipo',
      render: (_, row) => (
        <div className="flex flex-col text-xs">
          {row.esCarga && <span className="text-blue-600 font-semibold">Carga</span>}
          {row.esTiro && <span className="text-orange-600 font-semibold">Tiro</span>}
        </div>
      )
    },
    {
      key: 'id',
      label: 'Ver',
      render: (_, ticket) => (
        <Link
          href={`/admin/tickets/${ticket.id}`} // Revert to tickets route which I will update
          // Since user asked for "tickets admin view", usually they want to see details.
          // Is there an admin detail view? I saw /admin/acarreos earlier in user prompt.
          // User said: "en la pagina de acarreo del admin, si se mira pero por ningun lado me deja ver el ID de ese acarreo: http://localhost:3000/admin/acarreos"
          // So this page IS likely supposed to be the table.
          // I will link to `/operator/ticket/${ticket.id}` for the "Ticket View" or `/admin/acarreos/${ticket.id}` if that exists.
          // Let's make it link to the ticket view for now as that is what I built.
          className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tickets de Acarreo</h1>
        <div className="w-1/3">
          <SearchInput
            placeholder="Buscar por obra, camión..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          Error: {error}
        </div>
      )}

      <DataTable
        data={filteredTickets}
        columns={columns as any} // Cast to avoid strict column type mismatch if any
        loading={isLoading}
        emptyMessage="No se han encontrado tickets."
      />
    </div>
  );
}
