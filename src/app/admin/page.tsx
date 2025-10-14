'use client';

import React, { useState, useEffect } from 'react';
import { getCollection } from '@/lib/firebase/firestore';
import { PurchaseOrder, Shipment, Reception } from '@/models/types';
import { PURCHASE_ORDERS_COLLECTION, SHIPMENTS_COLLECTION, RECEPTIONS_COLLECTION } from '@/lib/firebase/firestore';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function AdminDashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState({
    pendingOrders: 0,
    partialOrders: 0,
    completedOrders: 0,
    totalReceptions: 0,
    activeShipments: 0,
    completedShipments: 0,
    totalReceptions24h: 0
  });
  const [lastReception, setLastReception] = useState<Reception | null>(null);
  const [recentOrders, setRecentOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [orders, shipments, receptions] = await Promise.all([
        getCollection<PurchaseOrder>(PURCHASE_ORDERS_COLLECTION),
        getCollection<Shipment>(SHIPMENTS_COLLECTION),
        getCollection<Reception>(RECEPTIONS_COLLECTION)
      ]);

      // Calculate stats
      const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
      const partialOrders = orders.filter(o => o.status === 'PARTIAL').length;
      const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;

      const receptionShipments = shipments.filter(s => s.isReception === true);
      const regularShipments = shipments.filter(s => !s.isReception);
      const activeShipments = regularShipments.filter(s => s.status === 'EN_TRANSITO').length;
      const completedShipments = regularShipments.filter(s => s.status === 'COMPLETADO').length;

      // Get receptions from last 24 hours
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const receptions24h = receptions.filter(r =>
        r.receptionDate && r.receptionDate.toDate() > yesterday
      ).length;

      setStats({
        pendingOrders,
        partialOrders,
        completedOrders,
        totalReceptions: receptionShipments.length,
        activeShipments,
        completedShipments,
        totalReceptions24h: receptions24h
      });

      // Get last reception
      if (receptions.length > 0) {
        setLastReception(receptions[0]); // Already sorted by createdAt desc
      }

      // Get 5 most recent orders
      setRecentOrders(orders.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (isDark) {
      switch (status) {
        case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'PARTIAL': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'COMPLETED': return 'bg-green-500/20 text-green-400 border-green-500/30';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      }
    } else {
      switch (status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'PARTIAL': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'PARTIAL': return 'Parcial';
      case 'COMPLETED': return 'Completado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={`text-lg ${isDark ? 'text-[#bebfd5]' : 'text-gray-600'}`}>Cargando datos del panel...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">


      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Orders */}
        <div className={`rounded-sm p-6 transition-colors ${isDark ? 'bg-[#313636] border border-[#7a7282]/20 hover:border-[#7a7282]/40' : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-[#bebfd5]' : 'text-gray-600'}`}>Por Recepcionar</h3>
            <svg className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-4xl font-light ${isDark ? 'text-[#f6eef6]' : 'text-gray-900'}`}>{stats.pendingOrders}</span>
            <span className={`text-sm ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>órdenes</span>
          </div>
          <div className={`mt-2 text-xs ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>
            {stats.partialOrders} parciales
          </div>
        </div>

        {/* Completed Orders */}
        <div className={`rounded-sm p-6 transition-colors ${isDark ? 'bg-[#313636] border border-[#7a7282]/20 hover:border-[#7a7282]/40' : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-[#bebfd5]' : 'text-gray-600'}`}>Recepcionadas</h3>
            <svg className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-4xl font-light ${isDark ? 'text-[#f6eef6]' : 'text-gray-900'}`}>{stats.completedOrders}</span>
            <span className={`text-sm ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>órdenes</span>
          </div>
          <div className={`mt-2 text-xs ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>
            completadas
          </div>
        </div>

        {/* Total Receptions */}
        <div className={`rounded-sm p-6 transition-colors ${isDark ? 'bg-[#313636] border border-[#7a7282]/20 hover:border-[#7a7282]/40' : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-[#bebfd5]' : 'text-gray-600'}`}>Recepciones Total</h3>
            <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-4xl font-light ${isDark ? 'text-[#f6eef6]' : 'text-gray-900'}`}>{stats.totalReceptions}</span>
            <span className={`text-sm ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>registros</span>
          </div>
          <div className={`mt-2 text-xs ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>
            {stats.totalReceptions24h} últimas 24h
          </div>
        </div>

        {/* Active Shipments */}
        <div className={`rounded-sm p-6 transition-colors ${isDark ? 'bg-[#313636] border border-[#7a7282]/20 hover:border-[#7a7282]/40' : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-[#bebfd5]' : 'text-gray-600'}`}>Acarreos Activos</h3>
            <svg className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-4xl font-light ${isDark ? 'text-[#f6eef6]' : 'text-gray-900'}`}>{stats.activeShipments}</span>
            <span className={`text-sm ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>en tránsito</span>
          </div>
          <div className={`mt-2 text-xs ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>
            {stats.completedShipments} completados
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Last Reception */}
        <div className={`rounded-sm ${isDark ? 'bg-[#313636] border border-[#7a7282]/20' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className={`border-b px-6 py-4 ${isDark ? 'border-[#7a7282]/20' : 'border-gray-200'}`}>
            <h2 className={`text-lg font-medium ${isDark ? 'text-[#f6eef6]' : 'text-gray-900'}`}>Última Recepción</h2>
          </div>
          <div className="p-6">
            {lastReception ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>Número</p>
                    <p className={`font-mono ${isDark ? 'text-[#f6eef6]' : 'text-gray-900'}`}>{lastReception.receptionNumber}</p>
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>Fecha</p>
                    <p className={isDark ? 'text-[#f6eef6]' : 'text-gray-900'}>{lastReception.receptionDate?.toDate().toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>Proveedor</p>
                  <p className={isDark ? 'text-[#f6eef6]' : 'text-gray-900'}>{lastReception.supplierName}</p>
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>Ubicación</p>
                  <p className={isDark ? 'text-[#f6eef6]' : 'text-gray-900'}>{lastReception.deliveryLocationName}</p>
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>Recibido por</p>
                  <p className={isDark ? 'text-[#f6eef6]' : 'text-gray-900'}>{lastReception.receivedByName}</p>
                </div>
                <div className="pt-2">
                  <p className={`text-xs uppercase tracking-wider mb-2 ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>Materiales</p>
                  <div className="space-y-1">
                    {lastReception.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className={isDark ? 'text-[#bebfd5]' : 'text-gray-700'}>{item.materialName}</span>
                        <span className={isDark ? 'text-[#7a7282]' : 'text-gray-500'}>{item.currentReceived} {item.materialUnit}</span>
                      </div>
                    ))}
                    {lastReception.items.length > 3 && (
                      <p className={`text-xs italic ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>+{lastReception.items.length - 3} más</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className={`text-center py-8 ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>No hay recepciones registradas</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className={`rounded-sm ${isDark ? 'bg-[#313636] border border-[#7a7282]/20' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className={`border-b px-6 py-4 flex items-center justify-between ${isDark ? 'border-[#7a7282]/20' : 'border-gray-200'}`}>
            <h2 className={`text-lg font-medium ${isDark ? 'text-[#f6eef6]' : 'text-gray-900'}`}>Órdenes Recientes</h2>
            <Link href="/admin/purchase-orders" className={`text-sm transition-colors ${isDark ? 'text-[#bebfd5] hover:text-[#f6eef6]' : 'text-blue-600 hover:text-blue-700'}`}>
              Ver todas →
            </Link>
          </div>
          <div className={`divide-y ${isDark ? 'divide-[#7a7282]/20' : 'divide-gray-200'}`}>
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/purchase-orders/${order.id}`}
                  className={`block p-4 transition-colors ${isDark ? 'hover:bg-[#7a7282]/10' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-mono text-sm ${isDark ? 'text-[#f6eef6]' : 'text-gray-900'}`}>{order.orderNumber}</span>
                    <span className={`px-2 py-1 rounded-sm text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className={`text-sm mb-1 ${isDark ? 'text-[#bebfd5]' : 'text-gray-700'}`}>{order.supplierName}</p>
                  <div className={`flex items-center justify-between text-xs ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>
                    <span>{order.items.length} producto(s)</span>
                    <span>{order.orderDate.toDate().toLocaleDateString()}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className={`text-center py-8 ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>No hay órdenes registradas</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#313636] border border-[#7a7282]/20 rounded-sm p-6">
        <h2 className="text-[#f6eef6] text-lg font-medium mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/purchase-orders/new"
            className="bg-[#000006] border border-[#7a7282]/30 rounded-sm p-4 text-center hover:border-[#bebfd5] transition-colors group"
          >
            <svg className="w-8 h-8 mx-auto mb-2 text-[#bebfd5] group-hover:text-[#f6eef6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm text-[#bebfd5] group-hover:text-[#f6eef6]">Nueva Orden</span>
          </Link>
          <Link
            href="/operator/receptions"
            className="bg-[#000006] border border-[#7a7282]/30 rounded-sm p-4 text-center hover:border-[#bebfd5] transition-colors group"
          >
            <svg className="w-8 h-8 mx-auto mb-2 text-[#bebfd5] group-hover:text-[#f6eef6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-[#bebfd5] group-hover:text-[#f6eef6]">Recepcionar</span>
          </Link>
          <Link
            href="/operator/dispatch"
            className="bg-[#000006] border border-[#7a7282]/30 rounded-sm p-4 text-center hover:border-[#bebfd5] transition-colors group"
          >
            <svg className="w-8 h-8 mx-auto mb-2 text-[#bebfd5] group-hover:text-[#f6eef6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="text-sm text-[#bebfd5] group-hover:text-[#f6eef6]">Despachar</span>
          </Link>
          <Link
            href="/admin/shipments"
            className="bg-[#000006] border border-[#7a7282]/30 rounded-sm p-4 text-center hover:border-[#bebfd5] transition-colors group"
          >
            <svg className="w-8 h-8 mx-auto mb-2 text-[#bebfd5] group-hover:text-[#f6eef6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm text-[#bebfd5] group-hover:text-[#f6eef6]">Ver Acarreos</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
