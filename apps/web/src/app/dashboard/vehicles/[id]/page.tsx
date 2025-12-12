'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Car,
  User,
  Calendar,
  ClipboardList,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  Badge,
  Separator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';

// Mock data
const mockVehicle = {
  id: 'v1',
  plate: 'ABC-1234',
  brand: 'BMW',
  model: 'X5',
  color: 'Preta',
  year: 2023,
  createdAt: new Date('2024-01-15'),
  customer: {
    id: '1',
    name: 'João Silva',
    phone: '(11) 99999-1234',
  },
  orders: [
    {
      id: 'os1',
      code: 'OS-2024-001',
      status: 'CONCLUIDO',
      scheduledAt: new Date('2024-02-10'),
      total: 4500,
      services: ['PPF Frontal', 'Ceramic Coating'],
    },
    {
      id: 'os2',
      code: 'OS-2024-015',
      status: 'EM_EXECUCAO',
      scheduledAt: new Date('2024-03-15'),
      total: 2800,
      services: ['Vitrificação'],
    },
    {
      id: 'os3',
      code: 'OS-2024-028',
      status: 'AGENDADO',
      scheduledAt: new Date('2024-04-20'),
      total: 6200,
      services: ['PPF Full'],
    },
  ],
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'destructive' }> = {
  AGENDADO: { label: 'Agendado', variant: 'secondary' },
  EM_VISTORIA: { label: 'Em Vistoria', variant: 'info' },
  EM_EXECUCAO: { label: 'Em Execução', variant: 'info' },
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando Pagamento', variant: 'warning' },
  CONCLUIDO: { label: 'Concluído', variant: 'success' },
  CANCELADO: { label: 'Cancelado', variant: 'destructive' },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VehicleDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  // TODO: Replace with tRPC query
  const vehicle = mockVehicle;

  const handleDelete = () => {
    // TODO: Implement delete with confirmation dialog
    console.log('Delete vehicle:', id);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="mt-1">
            <Link href="/dashboard/vehicles">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {vehicle.brand} {vehicle.model}
              </h1>
              <Badge variant="outline" className="font-mono text-base">
                {vehicle.plate}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {vehicle.color} • {vehicle.year}
            </p>
          </div>
        </div>
        <div className="flex gap-2 pl-12 sm:pl-0">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/vehicles/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/orders/new?vehicleId=${id}`}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Nova OS
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Veículo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Vehicle Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Car className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Veículo</p>
                <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Proprietário</p>
                <Link 
                  href={`/dashboard/customers/${vehicle.customer.id}`}
                  className="font-medium hover:text-primary hover:underline"
                >
                  {vehicle.customer.name}
                </Link>
                <p className="text-sm text-muted-foreground">{vehicle.customer.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cadastrado em</p>
                <p className="font-medium">
                  {new Intl.DateTimeFormat('pt-BR').format(vehicle.createdAt)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-2xl font-bold">{vehicle.orders.length}</p>
                <p className="text-xs text-muted-foreground">Total de OS</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-2xl font-bold">
                  {formatCurrency(vehicle.orders.reduce((acc, o) => acc + o.total, 0))}
                </p>
                <p className="text-xs text-muted-foreground">Faturado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order History */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Histórico de Ordens</CardTitle>
              <CardDescription>
                Todas as ordens de serviço deste veículo
              </CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link href={`/dashboard/orders/new?vehicleId=${id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Nova OS
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {vehicle.orders.length === 0 ? (
              <div className="py-8 text-center">
                <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-muted-foreground">
                  Nenhuma ordem de serviço registrada
                </p>
                <Button className="mt-4" size="sm" asChild>
                  <Link href={`/dashboard/orders/new?vehicleId=${id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeira OS
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicle.orders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.AGENDADO;
                  return (
                    <Link
                      key={order.id}
                      href={`/dashboard/orders/${order.id}`}
                      className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">{order.code}</span>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.services.join(', ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Intl.DateTimeFormat('pt-BR').format(order.scheduledAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(order.total)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
