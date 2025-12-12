'use client';

import { Badge } from '@/components/ui';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'destructive' }> = {
  AGENDADO: { label: 'Agendado', variant: 'secondary' },
  EM_VISTORIA: { label: 'Em Vistoria', variant: 'info' },
  EM_EXECUCAO: { label: 'Em Execução', variant: 'info' },
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando Pagamento', variant: 'warning' },
  CONCLUIDO: { label: 'Concluído', variant: 'success' },
  CANCELADO: { label: 'Cancelado', variant: 'destructive' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'default' as const };
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

export function getStatusLabel(status: string): string {
  return statusConfig[status]?.label || status;
}

export function getStatusVariant(status: string) {
  return statusConfig[status]?.variant || 'default';
}

export { statusConfig };
