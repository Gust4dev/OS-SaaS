"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TenantStatus } from "@prisma/client";

const statusConfig: Record<
  TenantStatus,
  {
    label: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  PENDING_ACTIVATION: {
    label: "Pendente",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    icon: Clock,
  },
  TRIAL: {
    label: "Trial",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: Clock,
  },
  ACTIVE: {
    label: "Ativo",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    icon: CheckCircle,
  },
  SUSPENDED: {
    label: "Suspenso",
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    icon: AlertTriangle,
  },
  PAST_DUE: {
    label: "Atrasado",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: AlertTriangle,
  },
  CANCELED: {
    label: "Cancelado",
    color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    icon: XCircle,
  },
};

export default function TenantsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TenantStatus | undefined>();

  const { data, isLoading, refetch } = trpc.admin.listTenants.useQuery({
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter,
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Clientes</h1>
        <p className="text-zinc-400">Gerenciar todos os clientes do Autevo</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-zinc-900 border-zinc-800"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={!statusFilter ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(undefined)}
          >
            Todos
          </Button>
          {(
            [
              "PENDING_ACTIVATION",
              "TRIAL",
              "ACTIVE",
              "SUSPENDED",
            ] as TenantStatus[]
          ).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
            >
              {statusConfig[status].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : data?.tenants.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              Nenhum cliente encontrado
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-zinc-800">
                <tr className="text-left text-sm text-zinc-400">
                  <th className="px-6 py-4 font-medium">Cliente</th>
                  <th className="px-6 py-4 font-medium">Owner</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Criado em</th>
                  <th className="px-6 py-4 font-medium">Uso</th>
                  <th className="px-6 py-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {data?.tenants.map((tenant) => {
                  const status = statusConfig[tenant.status];
                  const StatusIcon = status.icon;

                  return (
                    <tr key={tenant.id} className="hover:bg-zinc-800/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">
                            {tenant.name}
                          </p>
                          <p className="text-sm text-zinc-500">{tenant.slug}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tenant.owner ? (
                          <div>
                            <p className="text-sm text-white">
                              {tenant.owner.name}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {tenant.owner.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">
                        {formatDistanceToNow(new Date(tenant.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">
                        {tenant.usage.orders} OS, {tenant.usage.customers}{" "}
                        clientes
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/tenants/${tenant.id}`}>
                            Ver
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-zinc-400">
            Mostrando {(page - 1) * data.pagination.limit + 1} a{" "}
            {Math.min(page * data.pagination.limit, data.pagination.total)} de{" "}
            {data.pagination.total} clientes
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
