'use client';

import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/cn';

interface TimelineItem {
  status: string;
  label: string;
  date?: Date;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface OrderTimelineProps {
  currentStatus: string;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  className?: string;
}

const statusOrder = [
  'AGENDADO',
  'EM_VISTORIA',
  'EM_EXECUCAO',
  'AGUARDANDO_PAGAMENTO',
  'CONCLUIDO',
];

const statusLabels: Record<string, string> = {
  AGENDADO: 'Agendado',
  EM_VISTORIA: 'Vistoria',
  EM_EXECUCAO: 'Em Execução',
  AGUARDANDO_PAGAMENTO: 'Pagamento',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

export function OrderTimeline({
  currentStatus,
  scheduledAt,
  startedAt,
  completedAt,
  className,
}: OrderTimelineProps) {
  // If cancelled, show special state
  if (currentStatus === 'CANCELADO') {
    return (
      <div className={cn('p-4 rounded-lg bg-destructive/10 border border-destructive/20', className)}>
        <p className="text-sm font-medium text-destructive">Ordem Cancelada</p>
      </div>
    );
  }

  const currentIndex = statusOrder.indexOf(currentStatus);

  const getDateForStatus = (status: string): Date | undefined => {
    switch (status) {
      case 'AGENDADO':
        return scheduledAt;
      case 'EM_EXECUCAO':
        return startedAt;
      case 'CONCLUIDO':
        return completedAt;
      default:
        return undefined;
    }
  };

  const items: TimelineItem[] = statusOrder.map((status, index) => ({
    status,
    label: statusLabels[status],
    date: getDateForStatus(status),
    isCompleted: index < currentIndex,
    isCurrent: index === currentIndex,
  }));

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className={cn('space-y-0', className)}>
      {items.map((item, index) => (
        <div key={item.status} className="flex gap-3">
          {/* Line and Circle */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full border-2',
                item.isCompleted && 'bg-primary border-primary',
                item.isCurrent && 'border-primary bg-primary/20',
                !item.isCompleted && !item.isCurrent && 'border-muted-foreground/30'
              )}
            >
              {item.isCompleted ? (
                <Check className="h-3 w-3 text-primary-foreground" />
              ) : item.isCurrent ? (
                <Circle className="h-2 w-2 fill-primary text-primary" />
              ) : null}
            </div>
            {index < items.length - 1 && (
              <div
                className={cn(
                  'w-0.5 flex-1 min-h-[24px]',
                  item.isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                )}
              />
            )}
          </div>

          {/* Content */}
          <div className="pb-4">
            <p
              className={cn(
                'text-sm font-medium',
                item.isCompleted && 'text-muted-foreground',
                item.isCurrent && 'text-foreground',
                !item.isCompleted && !item.isCurrent && 'text-muted-foreground/50'
              )}
            >
              {item.label}
            </p>
            {item.date && (
              <p className="text-xs text-muted-foreground">
                {formatDate(item.date)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
