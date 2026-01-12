"use client";

import { trpc } from "@/lib/trpc/provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  DollarSign,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } =
    trpc.admin.getDashboardStats.useQuery();
  const { data: pending, isLoading: pendingLoading } =
    trpc.admin.getPendingActivations.useQuery();
  const { data: expiring, isLoading: expiringLoading } =
    trpc.admin.getExpiringTrials.useQuery({ daysAhead: 7 });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard Admin</h1>
        <p className="text-zinc-400">Gerenciamento de clientes do Autevo</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total de Clientes"
          value={stats?.totalTenants || 0}
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Aguardando Ativação"
          value={stats?.byStatus.pendingActivation || 0}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Em Trial"
          value={stats?.byStatus.trial || 0}
          icon={CheckCircle}
          variant="info"
        />
        <StatCard
          title="Receita Estimada"
          value={`R$ ${(stats?.estimatedMonthlyRevenue || 0).toLocaleString(
            "pt-BR"
          )}`}
          icon={DollarSign}
          variant="success"
        />
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatusRow
                label="Pendente"
                value={stats?.byStatus.pendingActivation || 0}
                color="bg-amber-500"
              />
              <StatusRow
                label="Trial"
                value={stats?.byStatus.trial || 0}
                color="bg-blue-500"
              />
              <StatusRow
                label="Ativo"
                value={stats?.byStatus.active || 0}
                color="bg-emerald-500"
              />
              <StatusRow
                label="Suspenso"
                value={stats?.byStatus.suspended || 0}
                color="bg-orange-500"
              />
              <StatusRow
                label="Cancelado"
                value={stats?.byStatus.canceled || 0}
                color="bg-red-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pending Activations */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Aguardando Pix
            </CardTitle>
            <Badge
              variant="outline"
              className="bg-amber-500/20 text-amber-400 border-amber-500/30"
            >
              {pending?.length || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            {pendingLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
            ) : pending?.length === 0 ? (
              <p className="text-sm text-zinc-500">Nenhum pendente</p>
            ) : (
              <div className="space-y-2">
                {pending?.slice(0, 3).map((tenant) => (
                  <Link
                    key={tenant.id}
                    href={`/admin/tenants/${tenant.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {tenant.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {tenant.owner?.email}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-500" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring Trials */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Trials Expirando
            </CardTitle>
            <Badge
              variant="outline"
              className="bg-orange-500/20 text-orange-400 border-orange-500/30"
            >
              {expiring?.length || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            {expiringLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
            ) : expiring?.length === 0 ? (
              <p className="text-sm text-zinc-500">Nenhum expirando</p>
            ) : (
              <div className="space-y-2">
                {expiring?.slice(0, 3).map((tenant) => (
                  <Link
                    key={tenant.id}
                    href={`/admin/tenants/${tenant.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {tenant.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {tenant.daysRemaining} dias restantes
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-500" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/admin/tenants">
            <Users className="h-4 w-4 mr-2" />
            Ver Todos os Clientes
          </Link>
        </Button>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  variant,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  variant: "default" | "warning" | "info" | "success";
}) {
  const variantStyles = {
    default: "bg-zinc-500/20 text-zinc-400",
    warning: "bg-amber-500/20 text-amber-400",
    info: "bg-blue-500/20 text-blue-400",
    success: "bg-emerald-500/20 text-emerald-400",
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center ${variantStyles[variant]}`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${color}`} />
        <span className="text-sm text-zinc-300">{label}</span>
      </div>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}
