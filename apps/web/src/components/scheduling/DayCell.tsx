'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { format, isBefore, startOfDay } from 'date-fns';
import { ChevronDown, Car } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OrderInfo {
  id: string;
  code: string;
  status: string;
  scheduledAt: Date;
  carModel: string;
  plate: string;
  service: string;
}

interface DayCellProps {
  date: Date;
  orders: OrderInfo[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isLoading?: boolean;
}

const MAX_VISIBLE = 3;

/**
 * Retorna a cor semântica baseada no status e data:
 * - Cinza: Agendado (Futuro)
 * - Amarelo: Em Andamento (Hoje)
 * - Verde: Concluído
 * - Vermelho: Atrasado
 */
function getStatusColor(status: string, scheduledAt: Date): string {
  const today = startOfDay(new Date());
  const orderDate = startOfDay(new Date(scheduledAt));

  // Concluído = Verde
  if (status === 'CONCLUIDO') {
    return 'bg-green-500/20 border-green-500/40 text-green-400';
  }

  // Cancelado = Muted
  if (status === 'CANCELADO') {
    return 'bg-muted/30 border-muted/40 text-muted-foreground line-through';
  }

  // Atrasado = Vermelho (data passou e não está concluído)
  if (isBefore(orderDate, today) && status !== 'CONCLUIDO') {
    return 'bg-red-500/20 border-red-500/40 text-red-400';
  }

  // Em andamento (hoje ou status EM_VISTORIA/EM_EXECUCAO) = Amarelo
  if (
    status === 'EM_VISTORIA' ||
    status === 'EM_EXECUCAO' ||
    status === 'AGUARDANDO_PAGAMENTO'
  ) {
    return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400';
  }

  // Agendado (Futuro) = Cinza
  return 'bg-muted/20 border-muted/40 text-muted-foreground';
}

export function DayCell({
  date,
  orders,
  isCurrentMonth,
  isToday,
  isLoading,
}: DayCellProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const visibleOrders = orders.slice(0, MAX_VISIBLE);
  const extraCount = orders.length - MAX_VISIBLE;

  return (
    <>
      <div
        className={cn(
          'min-h-[120px] p-2 transition-colors relative group',
          'bg-background hover:bg-muted/30',
          !isCurrentMonth && 'bg-muted/10 text-muted-foreground',
          isToday && 'bg-primary/5'
        )}
      >
        {/* Day Indicator */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
              isToday
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground group-hover:text-foreground'
            )}
          >
            {format(date, 'd')}
          </span>
          
          {orders.length > 0 && (
             <span className="text-[10px] font-medium text-muted-foreground">
               {orders.length} agend.
             </span>
          )}
        </div>

        {/* Orders List */}
        <div className="space-y-1">
          {isLoading ? (
            <div className="h-8 animate-pulse rounded bg-white/10" />
          ) : (
            <>
              {visibleOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className={cn(
                    'block rounded border px-1.5 py-0.5 text-[10px] truncate transition-all hover:scale-[1.02]',
                    getStatusColor(order.status, order.scheduledAt)
                  )}
                  title={`${order.carModel} - ${order.service}`}
                >
                  <span className="font-medium">{order.carModel}</span>
                  <span className="mx-1">•</span>
                  <span className="opacity-80">{order.service}</span>
                </Link>
              ))}

              {extraCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-full px-1 text-[10px] text-muted-foreground hover:text-foreground"
                  onClick={() => setModalOpen(true)}
                >
                  <ChevronDown className="h-3 w-3 mr-1" />
                  +{extraCount} mais
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal com lista completa do dia */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Car className="h-5 w-5 text-primary" />
              {format(date, "dd 'de' MMMM", { locale: undefined })} — {orders.length} OS
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum agendamento para este dia.
              </p>
            ) : (
              orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className={cn(
                    'block rounded-lg border p-3 transition-all hover:scale-[1.01] hover:shadow-md',
                    getStatusColor(order.status, order.scheduledAt)
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{order.carModel}</p>
                      <p className="text-xs opacity-80">{order.plate}</p>
                    </div>
                    <span className="text-xs font-mono opacity-60">
                      {order.code}
                    </span>
                  </div>
                  <p className="text-xs mt-1 opacity-80">{order.service}</p>
                </Link>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
