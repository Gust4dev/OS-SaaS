'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Car, User } from 'lucide-react';
import { 
  Button, 
  DataTable, 
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import type { Column } from '@/components/ui';

// Mock data - will be replaced with tRPC
interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  color: string;
  year: number | null;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  _count: {
    orders: number;
  };
}

const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    plate: 'ABC-1234',
    brand: 'BMW',
    model: 'X5',
    color: 'Preta',
    year: 2023,
    customer: { id: '1', name: 'João Silva', phone: '(11) 99999-1234' },
    _count: { orders: 3 },
  },
  {
    id: 'v2',
    plate: 'XYZ-5678',
    brand: 'Mercedes-Benz',
    model: 'C200',
    color: 'Branca',
    year: 2022,
    customer: { id: '1', name: 'João Silva', phone: '(11) 99999-1234' },
    _count: { orders: 1 },
  },
  {
    id: 'v3',
    plate: 'DEF-9012',
    brand: 'Audi',
    model: 'A4',
    color: 'Cinza',
    year: 2024,
    customer: { id: '2', name: 'Maria Santos', phone: '(11) 98888-5678' },
    _count: { orders: 5 },
  },
  {
    id: 'v4',
    plate: 'GHI-3456',
    brand: 'Porsche',
    model: '911 Carrera',
    color: 'Vermelha',
    year: 2023,
    customer: { id: '3', name: 'Carlos Oliveira', phone: '(11) 97777-9012' },
    _count: { orders: 2 },
  },
  {
    id: 'v5',
    plate: 'JKL-7890',
    brand: 'Tesla',
    model: 'Model S',
    color: 'Azul',
    year: 2024,
    customer: { id: '4', name: 'Ana Costa', phone: '(11) 96666-3456' },
    _count: { orders: 0 },
  },
];

export default function VehiclesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  // Filter mock data (will be replaced with tRPC query)
  const filteredVehicles = mockVehicles.filter((v) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      v.plate.toLowerCase().includes(searchLower) ||
      v.brand.toLowerCase().includes(searchLower) ||
      v.model.toLowerCase().includes(searchLower) ||
      v.customer.name.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // TODO: Call tRPC mutation
    console.log('Delete vehicle:', vehicleToDelete?.id);
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  const columns: Column<Vehicle>[] = [
    {
      key: 'vehicle',
      header: 'Veículo',
      render: (vehicle) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Car className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{vehicle.brand} {vehicle.model}</span>
              {vehicle.year && (
                <Badge variant="outline" className="text-xs">
                  {vehicle.year}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{vehicle.color}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'plate',
      header: 'Placa',
      render: (vehicle) => (
        <Badge variant="secondary" className="font-mono">
          {vehicle.plate}
        </Badge>
      ),
    },
    {
      key: 'customer',
      header: 'Proprietário',
      render: (vehicle) => (
        <Link 
          href={`/dashboard/customers/${vehicle.customer.id}`}
          className="flex items-center gap-2 hover:text-primary"
          onClick={(e) => e.stopPropagation()}
        >
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{vehicle.customer.name}</span>
        </Link>
      ),
    },
    {
      key: 'orders',
      header: 'OS',
      className: 'text-center',
      render: (vehicle) => (
        <span className="font-medium">{vehicle._count.orders}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Veículos</h1>
          <p className="text-muted-foreground">
            Gerencie os veículos cadastrados
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/vehicles/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Veículo
          </Link>
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredVehicles}
        isLoading={false}
        page={page}
        totalPages={1}
        total={filteredVehicles.length}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por placa, marca, modelo ou proprietário..."
        onRowClick={(vehicle) => router.push(`/dashboard/vehicles/${vehicle.id}`)}
        getRowKey={(vehicle) => vehicle.id}
        emptyTitle="Nenhum veículo encontrado"
        emptyDescription="Comece cadastrando um veículo para um cliente."
        emptyAction={
          <Button asChild>
            <Link href="/dashboard/vehicles/new">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Veículo
            </Link>
          </Button>
        }
        renderActions={(vehicle) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/vehicles/${vehicle.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDelete(vehicle)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Veículo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o veículo{' '}
              <strong>{vehicleToDelete?.brand} {vehicleToDelete?.model}</strong> ({vehicleToDelete?.plate})?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
