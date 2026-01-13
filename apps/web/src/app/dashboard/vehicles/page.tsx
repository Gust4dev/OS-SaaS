"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Car,
  User,
  ChevronRight,
} from "lucide-react";
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
  Skeleton,
  Card,
  CardContent,
} from "@/components/ui";
import type { Column } from "@/components/ui";
import { trpc } from "@/lib/trpc/provider";
import { toast } from "sonner";

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
  } | null;
  _count: {
    orders: number;
  };
}

export default function VehiclesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const { data, isLoading, refetch } = trpc.vehicle.list.useQuery(
    {
      page,
      limit: 20,
      search: search || undefined,
    },
    {
      refetchInterval: 5000,
    }
  );

  const deleteMutation = trpc.vehicle.delete.useMutation({
    onSuccess: () => {
      toast.success("Veículo excluído com sucesso");
      refetch();
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const vehicles = data?.vehicles || [];
  const pagination = data?.pagination;

  const handleDelete = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (vehicleToDelete) {
      deleteMutation.mutate({ id: vehicleToDelete.id });
    }
  };

  const columns: Column<Vehicle>[] = [
    {
      key: "vehicle",
      header: "Veículo",
      render: (vehicle) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Car className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {vehicle.brand} {vehicle.model}
              </span>
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
      key: "plate",
      header: "Placa",
      render: (vehicle) => (
        <Badge variant="secondary" className="font-mono">
          {vehicle.plate}
        </Badge>
      ),
    },
    {
      key: "customer",
      header: "Proprietário",
      render: (vehicle) =>
        vehicle.customer ? (
          <Link
            href={`/dashboard/customers/${vehicle.customer.id}`}
            className="flex items-center gap-2 hover:text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{vehicle.customer.name}</span>
          </Link>
        ) : (
          <span className="text-muted-foreground italic flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground/50" />
            Sem proprietário
          </span>
        ),
    },
    {
      key: "orders",
      header: "OS",
      className: "text-center",
      render: (vehicle) => (
        <span className="font-medium">{vehicle._count.orders}</span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

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

      {/* Desktop Table */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={vehicles}
          isLoading={isLoading}
          page={page}
          totalPages={pagination?.totalPages || 1}
          total={pagination?.total || 0}
          onPageChange={setPage}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por placa, marca, modelo ou proprietário..."
          onRowClick={(vehicle) =>
            router.push(`/dashboard/vehicles/${vehicle.id}`)
          }
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
      </div>

      {/* Mobile List */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))
        ) : vehicles.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center space-y-4">
              <p className="text-muted-foreground">
                Nenhum veículo encontrado.
              </p>
              <Button asChild>
                <Link href="/dashboard/vehicles/new">Cadastrar Veículo</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-card border border-border/50 rounded-xl p-4 space-y-4 active:bg-muted/30 transition-colors"
                onClick={() => router.push(`/dashboard/vehicles/${vehicle.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg">
                        {vehicle.brand} {vehicle.model}
                      </span>
                      {vehicle.year && (
                        <Badge variant="outline" className="text-xs">
                          {vehicle.year}
                        </Badge>
                      )}
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {vehicle.plate}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mr-2"
                      >
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(vehicle);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {vehicle.customer
                        ? vehicle.customer.name
                        : "Sem proprietário"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {vehicle.color}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Ordens de Serviço
                    </span>
                    <span className="font-bold text-base">
                      {vehicle._count.orders}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                      Detalhes <ChevronRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            {(pagination?.totalPages || 0) > 1 && (
              <div className="flex justify-center pt-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center px-2 text-sm text-muted-foreground">
                  {page} de {pagination?.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPage((p) =>
                      Math.min(pagination?.totalPages || 1, p + 1)
                    );
                  }}
                  disabled={page === (pagination?.totalPages || 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Veículo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o veículo{" "}
              <strong>
                {vehicleToDelete?.brand} {vehicleToDelete?.model}
              </strong>{" "}
              ({vehicleToDelete?.plate})? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
