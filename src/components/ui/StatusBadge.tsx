'use client';

import React from 'react';
import { STATUS_COLORS } from '@/constants/colors';
import { Status } from '@/types/common';

export interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = ''
}) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  
  const statusLabels = {
    PENDING: 'Pendiente',
    PARTIAL: 'Parcial',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
    EN_TRANSITO: 'En Tránsito'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs font-medium'
  };
  
  const classes = `inline-flex items-center rounded-full ${colors.bg} ${colors.text} ${colors.border} border ${sizeClasses[size]} ${className}`;
  
  return (
    <span className={classes}>
      {statusLabels[status]}
    </span>
  );
};