import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Banknote } from 'lucide-react';
import { Appointment } from '../types';
import { detectOverlaps, formatTime, formatMoney } from '../utils';

interface AppointmentCardProps {
  appointment: Appointment;
  isOverlap?: boolean;
  onClick?: () => void;
}

const statusConfig = {
  scheduled: { 
    dot: 'bg-blue-500', 
    bg: 'bg-blue-50/80 border-blue-200/60 hover:bg-blue-100/80',
    text: 'text-blue-900',
    label: 'Agendado' 
  },
  in_service: { 
    dot: 'bg-yellow-500 animate-pulse', 
    bg: 'bg-yellow-50/80 border-yellow-200/60 hover:bg-yellow-100/80',
    text: 'text-yellow-900',
    label: 'Em Atendimento' 
  },
  completed: { 
    dot: 'bg-green-500', 
    bg: 'bg-green-50/80 border-green-200/60 hover:bg-green-100/80',
    text: 'text-green-900',
    label: 'Concluído' 
  },
  no_show: { 
    dot: 'bg-gray-400', 
    bg: 'bg-gray-50/80 border-gray-200/60 hover:bg-gray-100/80',
    text: 'text-gray-700',
    label: 'Não Compareceu' 
  },
  canceled: { 
    dot: 'bg-red-500', 
    bg: 'bg-red-50/80 border-red-200/60 hover:bg-red-100/80',
    text: 'text-red-900',
    label: 'Cancelado' 
  },
};

export function AppointmentCard({ appointment, isOverlap, onClick }: AppointmentCardProps) {
  const mainProcedure = appointment.procedures[0];
  const hasMoreProcedures = appointment.procedures.length > 1;
  const config = statusConfig[appointment.status];
  const totalValue = appointment.procedures.reduce((sum, p) => sum + p.price, 0);
  
  const getPaymentIcon = () => {
    if (!appointment.payment?.method) return null;
    return appointment.payment.method === 'credit_card' ? 
      <CreditCard className="h-3 w-3" /> : 
      <Banknote className="h-3 w-3" />;
  };

  return (
    <div
      className={`
        relative p-2.5 rounded-lg border text-xs cursor-pointer
        transition-all duration-200 hover:shadow-md backdrop-blur-sm
        ${config.bg} ${config.text}
        ${isOverlap ? 'ring-2 ring-orange-400/60 shadow-orange-200/50' : ''}
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`Agendamento de ${appointment.customer.name} - ${mainProcedure?.name}`}
    >
      {/* Status Dot */}
      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${config.dot}`} />
      
      {/* Customer Name */}
      <div className="font-medium truncate pr-4">
        {appointment.customer.name}
      </div>
      
      {/* Time */}
      <div className="text-xs opacity-75 truncate">
        {formatTime(appointment.startsAt)} - {formatTime(appointment.endsAt)}
      </div>
      
      {/* Main Procedure */}
      {mainProcedure && (
        <div className="text-xs font-medium truncate mt-1">
          {mainProcedure.name}
          {hasMoreProcedures && (
            <span className="opacity-60 font-normal">
              {' '}+{appointment.procedures.length - 1}
            </span>
          )}
        </div>
      )}
      
      {/* Value & Payment Status */}
      {appointment.status === 'completed' && (
        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-current/10">
          <div className="flex items-center gap-1 text-xs font-medium">
            {getPaymentIcon()}
            <span>{formatMoney(totalValue)}</span>
          </div>
          
          {appointment.payment?.status && (
            <Badge 
              variant={appointment.payment.status === 'paid' ? 'default' : 'secondary'} 
              className="text-xs py-0 px-1.5 h-4"
            >
              {appointment.payment.status === 'paid' ? 'Pago' : 'Pendente'}
            </Badge>
          )}
        </div>
      )}
      
      {/* Overlap Indicator */}
      {isOverlap && (
        <div className="absolute -top-1 -left-1 w-3 h-3">
          <div className="w-full h-full bg-orange-500 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}