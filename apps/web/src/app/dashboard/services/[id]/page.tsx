'use client';

import { use } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Clock,
  DollarSign,
  Calendar,
  Percent,
  Power,
  PowerOff,
} from 'lucide-react';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Badge,
  Separator,
} from '@/components/ui';

// Mock data
const mockService = {
  id: 's1',
  name: 'PPF Frontal',
  description: 'Proteção de pintura na parte frontal do veículo. Inclui capô, para-lamas, para-choque dianteiro e retrovisores.',
  basePrice: 4500,
  estimatedTime: 480,
  returnDays: 365,
  isActive: true,
  defaultCommissionPercent: 10,
  createdAt: new Date('2024-01-01'),
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ServiceDetailPage({ params }: PageProps) {
  const { id } = use(params);
  
  const service = mockService;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutos`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours} horas`;
  };

  const handleToggleActive = () => {
    console.log('Toggle active:', id, !service.isActive);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="mt-1">
            <Link href="/dashboard/services">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{service.name}</h1>
              {service.isActive ? (
                <Badge variant="success">Ativo</Badge>
              ) : (
                <Badge variant="secondary">Inativo</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Cadastrado em {new Intl.DateTimeFormat('pt-BR').format(service.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2 pl-12 sm:pl-0">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/services/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button 
            variant={service.isActive ? 'outline' : 'default'}
            onClick={handleToggleActive}
          >
            {service.isActive ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Desativar
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Ativar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preço Base</p>
                <p className="text-xl font-bold">{formatCurrency(service.basePrice)}</p>
              </div>
            </div>

            {service.estimatedTime && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Estimado</p>
                  <p className="font-medium">{formatTime(service.estimatedTime)}</p>
                </div>
              </div>
            )}

            {service.returnDays && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prazo de Retorno</p>
                  <p className="font-medium">{service.returnDays} dias</p>
                </div>
              </div>
            )}

            {service.defaultCommissionPercent && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Percent className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Comissão Padrão</p>
                  <p className="font-medium">{service.defaultCommissionPercent}%</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            {service.description ? (
              <p className="text-sm leading-relaxed">{service.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Nenhuma descrição cadastrada.
              </p>
            )}

            <Separator className="my-6" />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">OS este mês</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-2xl font-bold">{formatCurrency(0)}</p>
                <p className="text-xs text-muted-foreground">Faturado este mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium">Excluir Serviço</p>
            <p className="text-sm text-muted-foreground">
              Esta ação é irreversível. Serviços com OS vinculadas não podem ser excluídos.
            </p>
          </div>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
