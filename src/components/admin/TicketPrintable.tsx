'use client';

import React from 'react';
import { Timestamp } from 'firebase/firestore';
import { Ticket, PurchaseOrder } from '@/models/types';
import QrCodeDisplayPrintable from './QrCodeDisplayPrintable';

interface TicketPrintableProps {
  ticket: Ticket;
  purchaseOrder?: PurchaseOrder | null;
}

const TicketPrintable: React.FC<TicketPrintableProps> = ({ ticket, purchaseOrder }) => {
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
    const statusConfig = {
      PENDING: { bg: '#fef3c7', color: '#92400e', label: 'Pendiente' },
      PARTIAL: { bg: '#dbeafe', color: '#1e40af', label: 'Parcial' },
      COMPLETED: { bg: '#d1fae5', color: '#065f46', label: 'Completada' },
      CANCELLED: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelada' },
      EN_TRANSITO: { bg: '#fef3c7', color: '#92400e', label: 'En Tránsito' },
      COMPLETADO: { bg: '#d1fae5', color: '#065f46', label: 'Completado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { bg: '#f3f4f6', color: '#374151', label: status };

    return (
      <span style={{
        backgroundColor: config.bg,
        color: config.color,
        padding: '6px 12px',
        borderRadius: '9999px',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        {config.label}
      </span>
    );
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '8px',
          margin: '0 0 8px 0'
        }}>
          {getTicketTitle(ticket)}
        </h1>
        <div style={{
          fontSize: '16px',
          fontFamily: 'monospace',
          color: '#6b7280',
          backgroundColor: '#f3f4f6',
          padding: '8px 16px',
          borderRadius: '6px',
          display: 'inline-block'
        }}>
          ID: {ticket.id}
        </div>
      </div>

      {/* Content based on ticket type */}
      {ticket.type === 'reception' ? (
        /* Reception Ticket Layout */
        <div>
          {/* Purchase Order Status */}
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e3a8a',
                margin: '0'
              }}>
                Orden de Compra
              </h3>
              {purchaseOrder && (
                <div style={{ display: 'inline-block' }}>
                  {getStatusBadge(purchaseOrder.status)}
                </div>
              )}
            </div>
            <div style={{ color: '#1e40af' }}>
              <p style={{ margin: '4px 0' }}>
                <strong>Número:</strong> {ticket.purchaseOrderNumber}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Proveedor:</strong> {ticket.supplierName}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Ubicación:</strong> {ticket.deliveryLocationName}
              </p>
            </div>
          </div>

          {/* Reception Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div>
              <p style={{ color: '#6b7280', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                Fecha de Recepción:
              </p>
              <p style={{ fontSize: '18px', margin: '0' }}>
                {formatDate(ticket.receptionDate)}
              </p>
            </div>
            <div>
              <p style={{ color: '#6b7280', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                Recibido por:
              </p>
              <p style={{ fontSize: '18px', margin: '0' }}>
                {ticket.receivedByName}
              </p>
            </div>
          </div>

          {/* Materials List */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              Materiales Recibidos
            </h3>
            <div style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}>
              {ticket.materials && ticket.materials.length > 0 ? (
                <div>
                  {ticket.materials.map((material, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: index < ticket.materials!.length - 1 ? '1px solid #e5e7eb' : 'none'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: '500',
                          color: '#111827',
                          marginBottom: '4px'
                        }}>
                          {material.materialName}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          Unidad: {material.materialUnit}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#111827'
                        }}>
                          {material.weight}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          {material.materialUnit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  No hay materiales en este ticket
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Legacy Dispatch/Delivery Ticket Layout */
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            color: '#374151',
            marginBottom: '24px'
          }}>
            {ticket.folio && (
              <div>
                <p style={{ color: '#6b7280', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                  Folio:
                </p>
                <p style={{ fontSize: '18px', fontFamily: 'monospace', margin: '0' }}>
                  {ticket.folio}
                </p>
              </div>
            )}

            {ticket.truckPlate && (
              <div>
                <p style={{ color: '#6b7280', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                  Camión:
                </p>
                <p style={{ fontSize: '18px', margin: '0' }}>
                  {ticket.truckPlate}
                </p>
              </div>
            )}

            {ticket.driverName && (
              <div>
                <p style={{ color: '#6b7280', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                  Chofer:
                </p>
                <p style={{ fontSize: '18px', margin: '0' }}>
                  {ticket.driverName}
                </p>
              </div>
            )}

            {ticket.type === 'dispatch' && ticket.dispatchLocationName && (
              <div>
                <p style={{ color: '#6b7280', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                  Origen:
                </p>
                <p style={{ fontSize: '18px', margin: '0' }}>
                  {ticket.dispatchLocationName}
                </p>
              </div>
            )}

            {ticket.type === 'delivery' && ticket.deliveryLocationName && (
              <div>
                <p style={{ color: '#6b7280', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                  Destino:
                </p>
                <p style={{ fontSize: '18px', margin: '0' }}>
                  {ticket.deliveryLocationName}
                </p>
              </div>
            )}

            <div>
              <p style={{ color: '#6b7280', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                Fecha:
              </p>
              <p style={{ fontSize: '18px', margin: '0' }}>
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
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '12px'
              }}>
                Materiales
              </h3>
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                {ticket.materials.map((material, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: index < ticket.materials!.length - 1 ? '1px solid #e5e7eb' : 'none'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: '500',
                        color: '#111827'
                      }}>
                        {material.materialName}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#111827'
                      }}>
                        {material.weight}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        {material.materialUnit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR Code Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '2px solid #e5e7eb'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          Código QR del Ticket
        </h3>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <QrCodeDisplayPrintable value={ticket.id} size={200} />
        </div>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          marginTop: '8px',
          textAlign: 'center',
          margin: '8px 0 0 0'
        }}>
          Escanea este código para acceder al ticket
        </p>
      </div>
    </div>
  );
};

export default TicketPrintable;