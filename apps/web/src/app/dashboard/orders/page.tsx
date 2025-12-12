'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, MoreHorizontal, Eye, Pencil, Car, User, Calendar, Filter } from 'lucide-react';
import { 
  Button, 
  DataTable, 
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Card,
  CardContent,
} from '@/components/ui';
import { StatusBadge } from '@/components/orders';
import type { Column } from '@/components/ui';

// Mock data
interface Order {
  id: string;
  code: string;
  status: string;
  scheduledAt: Date;
  total: number;
  vehicle: {
    id: string;
    plate: string;
    brand: string;
    model: string;
    customer: {
      id: string;
      name: string;
      phone: string;
    };
  };
  assignedTo: {
    id: string;
    name: string;
  };
  _count: {
    items: number;
    payments: number;
  };
}

const mockOrders: Order[] = [
  {
    id: 'os1',
    code: 'OS-2024-001',
    status: 'CONCLUIDO',
    scheduledAt: new Date('2024-12-10'),
    total: 7300,
    vehicle: {
      id: 'v1',
      plate: 'ABC-1234',
      brand: 'BMW',
      model: 'X5',
      customer: { id: 'c1', name: 'João Silva', phone: '(11) 99999-1234' },
    },
    assignedTo: { id: 'u1', name: 'Carlos Técnico' },
    _count: { items: 2, payments: 2 },
  },
  {
    id: 'os2',
    code: 'OS-2024-002',
    status: 'EM_EXECUCAO',
    scheduledAt: new Date('2024-12-11'),
    total: 4500,
    vehicle: {
      id: 'v2',
      plate: 'XYZ-5678',
      brand: 'Mercedes',
      model: 'C300',
      customer: { id: 'c2', name: 'Maria Santos', phone: '(11) 98888-5678' },
    },
    assignedTo: { id: 'u1', name: 'Carlos Técnico' },
    _count: { items: 1, payments: 0 },
  },
  {
    id: 'os3',
    code: 'OS-2024-003',
    status: 'AGENDADO',
    scheduledAt: new Date('2024-12-15'),
    total: 12000,
    vehicle: {
      id: 'v3',
      plate: 'DEF-9012',
      brand: 'Porsche',
      model: '911',
      customer: { id: 'c3', name: 'Pedro Oliveira', phone: '(11) 97777-9012' },
    },
    assignedTo: { id: 'u2', name: 'Ana Técnica' },
    _count: { items: 3, payments: 0 },
  },
  {
    id: 'os4',
    code: 'OS-2024-004',
    status: 'AGUARDANDO_PAGAMENTO',
    scheduledAt: new Date('2024-12-08'),
    total: 2800,
    vehicle: {
      id: 'v4',
      plate: 'GHI-3456',
      brand: 'Audi',
      model: 'A4',
      customer: { id: 'c4', name: 'Ana Costa', phone: '(11) 96666-3456' },
    },
    assignedTo: { id: 'u1', name: 'Carlos Técnico' },
    _count: { items: 1, payments: 1 },
  },
  {
    id: 'os5',
    code: 'OS-2024-005',
    status: 'EM_VISTORIA',
    scheduledAt: new Date('2024-12-11'),
    total: 5500,
    vehicle: {
      id: 'v5',
      plate: 'JKL-7890',
      brand: 'Tesla',
      model: 'Model 3',
      customer: { id: 'c5', name: 'Lucas Mendes', phone: '(11) 95555-7890' },
    },
    assignedTo: { id: 'u2', name: 'Ana Técnica' },
    _count: { items: 2, payments: 0 },
  },
];

const statusOptions = [
  { value: 'AGENDADO', label: 'Agendado' },
  { value: 'EM_VISTORIA', label: 'Em Vistoria' },
  { value: 'EM_EXECUCAO', label: 'Em Execução' },
  { value: 'AGUARDANDO_PAGAMENTO', label: 'Aguardando Pagamento' },
  { value: 'CONCLUIDO', label: 'Concluído' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

export default function OrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter mock data
  const filteredOrders = mockOrders.filter((order) => {
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(order.status)) {
      return false;
    }
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      order.code.toLowerCase().includes(searchLower) ||
      order.vehicle.plate.toLowerCase().includes(searchLower) ||
      order.vehicle.customer.name.toLowerCase().includes(searchLower)
    );
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const columns: Column<Order>[] = [
    {
      key: 'code',
      header: 'OS',
      sortable: true,
      render: (order) => (
        <div className="space-y-1">
          <span className="font-mono font-semibold">{order.code}</span>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(order.scheduledAt)}
          </div>
        </div>
      ),
    },
    {
      key: 'vehicle',
      header: 'Cliente / Veículo',
      render: (order) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <Link 
              href={`/dashboard/customers/${order.vehicle.customer.id}`}
              className="font-medium hover:text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {order.vehicle.customer.name}
            </Link>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Car className="h-3.5 w-3.5" />
            <span className="font-mono">{order.vehicle.plate}</span>
            <span>•</span>
            <span>{order.vehicle.brand} {order.vehicle.model}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order) => <StatusBadge status={order.status} />,
    },
    {
      key: 'total',
      header: 'Valor',
      render: (order) => (
        <span className="font-semibold">{formatCurrency(order.total)}</span>
      ),
    },
    {
      key: 'assignedTo',
      header: 'Responsável',
      render: (order) => (
        <span className="text-sm">{order.assignedTo.name}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ordens de Serviço</h1>
          <p className="text-muted-foreground">
            Gerencie as ordens de serviço do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {selectedStatuses.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedStatuses.length}
              </Badge>
            )}
          </Button>
          <Button asChild>
            <Link href="/dashboard/orders/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova OS
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Filtrar por Status</h3>
                {selectedStatuses.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStatuses([])}
                  >
                    Limpar
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleStatus(option.value)}
                    className={`rounded-full px-3 py-1 text-sm transition-colors ${
                      selectedStatuses.includes(option.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        isLoading={false}
        page={page}
        totalPages={1}
        total={filteredOrders.length}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por código, placa ou cliente..."
        onRowClick={(order) => router.push(`/dashboard/orders/${order.id}`)}
        getRowKey={(order) => order.id}
        emptyTitle="Nenhuma ordem encontrada"
        emptyDescription="Comece criando sua primeira ordem de serviço."
        emptyAction={
          <Button asChild>
            <Link href="/dashboard/orders/new">
              <Plus className="mr-2 h-4 w-4" />
              Criar OS
            </Link>
          </Button>
        }
        renderActions={(order) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/orders/${order.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/orders/${order.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/customers/${order.vehicle.customer.id}`}>
                  <User className="mr-2 h-4 w-4" />
                  Ver Cliente
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/vehicles/${order.vehicle.id}`}>
                  <Car className="mr-2 h-4 w-4" />
                  Ver Veículo
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
    </div>
  );
}
