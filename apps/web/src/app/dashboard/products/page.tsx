'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, MoreHorizontal, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react';
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

// Mock data
interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  unit: string;
  costPrice: number | null;
  salePrice: number | null;
  stock: number;
  minStock: number;
}

const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Película PPF 3M Pro Series',
    description: 'Película premium para proteção de pintura',
    sku: 'PPF-3M-001',
    unit: 'm²',
    costPrice: 180,
    salePrice: null,
    stock: 45,
    minStock: 20,
  },
  {
    id: 'p2',
    name: 'Ceramic Coating Gtechniq Crystal Serum',
    description: 'Coating cerâmico de alta durabilidade',
    sku: 'CC-GT-001',
    unit: 'un',
    costPrice: 450,
    salePrice: null,
    stock: 8,
    minStock: 5,
  },
  {
    id: 'p3',
    name: 'Película de Vidro Llumar',
    description: 'Insulfilm premium para vidros automotivos',
    sku: 'VID-LL-001',
    unit: 'm²',
    costPrice: 85,
    salePrice: null,
    stock: 3,
    minStock: 10,
  },
  {
    id: 'p4',
    name: 'Shampoo Neutro Meguiars',
    description: 'Shampoo para lavagem profissional',
    sku: 'SH-MG-001',
    unit: 'un',
    costPrice: 45,
    salePrice: null,
    stock: 25,
    minStock: 10,
  },
  {
    id: 'p5',
    name: 'Microfibra Premium 40x40',
    description: 'Pano de microfibra alta qualidade',
    sku: 'MF-40-001',
    unit: 'un',
    costPrice: 12,
    salePrice: null,
    stock: 0,
    minStock: 20,
  },
];

export default function ProductsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Filter mock data
  const filteredProducts = mockProducts.filter((p) => {
    if (showLowStock && p.stock > p.minStock) return false;
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(searchLower) ||
      p.sku?.toLowerCase().includes(searchLower)
    );
  });

  const lowStockCount = mockProducts.filter((p) => p.stock <= p.minStock).length;

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    console.log('Delete product:', productToDelete?.id);
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Produto',
      render: (product) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{product.name}</span>
            </div>
            {product.sku && (
              <span className="text-sm text-muted-foreground font-mono">
                {product.sku}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'costPrice',
      header: 'Custo',
      render: (product) => (
        product.costPrice ? (
          <span>{formatCurrency(product.costPrice)}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: 'stock',
      header: 'Estoque',
      render: (product) => {
        const isLow = product.stock <= product.minStock;
        const isEmpty = product.stock === 0;
        return (
          <div className="flex items-center gap-2">
            <span className={isEmpty ? 'text-destructive font-semibold' : isLow ? 'text-amber-600 font-semibold' : ''}>
              {product.stock} {product.unit}
            </span>
            {isEmpty && (
              <Badge variant="destructive" className="text-xs">Zerado</Badge>
            )}
            {!isEmpty && isLow && (
              <Badge variant="warning" className="text-xs">Baixo</Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'minStock',
      header: 'Mínimo',
      render: (product) => (
        <span className="text-muted-foreground">{product.minStock} {product.unit}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie os produtos e controle de estoque
          </p>
        </div>
        <div className="flex gap-2">
          {lowStockCount > 0 && (
            <Button
              variant={showLowStock ? 'secondary' : 'outline'}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
              {lowStockCount} Estoque Baixo
            </Button>
          )}
          <Button asChild>
            <Link href="/dashboard/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Link>
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        isLoading={false}
        page={page}
        totalPages={1}
        total={filteredProducts.length}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome ou SKU..."
        onRowClick={(product) => router.push(`/dashboard/products/${product.id}/edit`)}
        getRowKey={(product) => product.id}
        emptyTitle="Nenhum produto encontrado"
        emptyDescription="Comece cadastrando seu primeiro produto."
        emptyAction={
          <Button asChild>
            <Link href="/dashboard/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Produto
            </Link>
          </Button>
        }
        renderActions={(product) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/products/${product.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDelete(product)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Produto</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o produto{' '}
              <strong>{productToDelete?.name}</strong>?
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
