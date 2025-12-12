'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Phone, Mail, Car } from 'lucide-react';
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
interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  document: string | null;
  whatsappOptIn: boolean;
  createdAt: Date;
  _count: {
    vehicles: number;
  };
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'João Silva',
    phone: '(11) 99999-1234',
    email: 'joao@email.com',
    document: '123.456.789-00',
    whatsappOptIn: true,
    createdAt: new Date('2024-01-15'),
    _count: { vehicles: 2 },
  },
  {
    id: '2',
    name: 'Maria Santos',
    phone: '(11) 98888-5678',
    email: 'maria@email.com',
    document: null,
    whatsappOptIn: true,
    createdAt: new Date('2024-02-20'),
    _count: { vehicles: 1 },
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    phone: '(11) 97777-9012',
    email: null,
    document: '987.654.321-00',
    whatsappOptIn: false,
    createdAt: new Date('2024-03-10'),
    _count: { vehicles: 3 },
  },
  {
    id: '4',
    name: 'Ana Costa',
    phone: '(11) 96666-3456',
    email: 'ana.costa@email.com',
    document: null,
    whatsappOptIn: true,
    createdAt: new Date('2024-04-05'),
    _count: { vehicles: 1 },
  },
  {
    id: '5',
    name: 'Pedro Ferreira',
    phone: '(11) 95555-7890',
    email: 'pedro.f@email.com',
    document: '111.222.333-44',
    whatsappOptIn: true,
    createdAt: new Date('2024-05-12'),
    _count: { vehicles: 2 },
  },
];

export default function CustomersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Filter and sort mock data (will be replaced with tRPC query)
  const filteredCustomers = mockCustomers
    .filter((c) => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(searchLower) ||
        c.phone.includes(search) ||
        c.email?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const aVal = a[sortBy as keyof Customer];
      const bVal = b[sortBy as keyof Customer];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // TODO: Call tRPC mutation
    console.log('Delete customer:', customerToDelete?.id);
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Nome',
      sortable: true,
      render: (customer) => (
        <div className="flex flex-col">
          <span className="font-medium">{customer.name}</span>
          {customer.document && (
            <span className="text-xs text-muted-foreground">{customer.document}</span>
          )}
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contato',
      render: (customer) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-sm">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            {customer.phone}
            {customer.whatsappOptIn && (
              <Badge variant="success" className="ml-1 text-[10px] px-1.5 py-0">
                WhatsApp
              </Badge>
            )}
          </div>
          {customer.email && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {customer.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'vehicles',
      header: 'Veículos',
      className: 'text-center',
      render: (customer) => (
        <div className="flex items-center justify-center gap-1.5">
          <Car className="h-4 w-4 text-muted-foreground" />
          <span>{customer._count.vehicles}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Cadastro',
      sortable: true,
      render: (customer) => (
        <span className="text-sm text-muted-foreground">
          {new Intl.DateTimeFormat('pt-BR').format(customer.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e seus veículos
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/customers/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Link>
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredCustomers}
        isLoading={false}
        page={page}
        totalPages={1}
        total={filteredCustomers.length}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, telefone ou email..."
        onRowClick={(customer) => router.push(`/dashboard/customers/${customer.id}`)}
        getRowKey={(customer) => customer.id}
        emptyTitle="Nenhum cliente encontrado"
        emptyDescription="Comece cadastrando seu primeiro cliente."
        emptyAction={
          <Button asChild>
            <Link href="/dashboard/customers/new">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Cliente
            </Link>
          </Button>
        }
        renderActions={(customer) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/customers/${customer.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/customers/${customer.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDelete(customer)}
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
            <DialogTitle>Excluir Cliente</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o cliente{' '}
              <strong>{customerToDelete?.name}</strong>? Esta ação não pode ser
              desfeita.
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
