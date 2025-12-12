import { currentUser } from '@clerk/nextjs/server';
import {
  ClipboardList,
  Calendar,
  Users,
  TrendingUp,
  Plus,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Olá, {user?.firstName || 'Usuário'} 👋
          </h1>
          <p className="text-muted-foreground">
            Aqui está o resumo do seu dia
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/orders/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova OS
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Agendamentos Hoje"
          value="5"
          description="+2 desde ontem"
          icon={Calendar}
          trend="up"
        />
        <StatCard
          title="OS em Andamento"
          value="3"
          description="2 aguardando"
          icon={ClipboardList}
        />
        <StatCard
          title="Clientes Ativos"
          value="127"
          description="+12 este mês"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Faturamento Mensal"
          value="R$ 15.420"
          description="+18% vs mês anterior"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Agenda de Hoje</CardTitle>
              <CardDescription>Próximos agendamentos</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/scheduling">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScheduleItem
              time="09:00"
              customer="João Silva"
              vehicle="BMW X5 - ABC-1234"
              service="PPF Frontal"
              status="confirmed"
            />
            <ScheduleItem
              time="11:30"
              customer="Maria Santos"
              vehicle="Mercedes C200 - XYZ-5678"
              service="Ceramic Coating"
              status="confirmed"
            />
            <ScheduleItem
              time="14:00"
              customer="Carlos Oliveira"
              vehicle="Audi A4 - DEF-9012"
              service="Vitrificação"
              status="pending"
            />
            <ScheduleItem
              time="16:30"
              customer="Ana Costa"
              vehicle="Porsche 911 - GHI-3456"
              service="PPF Full"
              status="confirmed"
            />
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Ordens Recentes</CardTitle>
              <CardDescription>Últimas atualizações</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/orders">
                Ver todas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <OrderItem
              code="OS-2024-001"
              customer="João Silva"
              total="R$ 4.500,00"
              status="em_execucao"
            />
            <OrderItem
              code="OS-2024-002"
              customer="Maria Santos"
              total="R$ 2.800,00"
              status="aguardando"
            />
            <OrderItem
              code="OS-2024-003"
              customer="Pedro Costa"
              total="R$ 6.200,00"
              status="concluido"
            />
            <OrderItem
              code="OS-2024-004"
              customer="Ana Ferreira"
              total="R$ 3.100,00"
              status="agendado"
            />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard
          href="/dashboard/customers/new"
          title="Novo Cliente"
          description="Cadastrar cliente"
          icon={Users}
        />
        <QuickActionCard
          href="/dashboard/scheduling/new"
          title="Novo Agendamento"
          description="Agendar serviço"
          icon={Calendar}
        />
        <QuickActionCard
          href="/dashboard/orders/new"
          title="Nova OS"
          description="Criar ordem"
          icon={ClipboardList}
        />
        <QuickActionCard
          href="/dashboard/services"
          title="Serviços"
          description="Gerenciar catálogo"
          icon={TrendingUp}
        />
      </div>
    </div>
  );
}

// Subcomponents

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={`text-xs ${
            trend === 'up'
              ? 'text-emerald-600'
              : trend === 'down'
                ? 'text-red-600'
                : 'text-muted-foreground'
          }`}
        >
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function ScheduleItem({
  time,
  customer,
  vehicle,
  service,
  status,
}: {
  time: string;
  customer: string;
  vehicle: string;
  service: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10">
        <Clock className="h-4 w-4 text-primary" />
        <span className="mt-0.5 text-xs font-semibold text-primary">{time}</span>
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{customer}</span>
          <Badge
            variant={
              status === 'confirmed'
                ? 'success'
                : status === 'pending'
                  ? 'warning'
                  : 'destructive'
            }
            className="text-[10px]"
          >
            {status === 'confirmed' ? 'Confirmado' : status === 'pending' ? 'Pendente' : 'Cancelado'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {vehicle} • {service}
        </p>
      </div>
    </div>
  );
}

function OrderItem({
  code,
  customer,
  total,
  status,
}: {
  code: string;
  customer: string;
  total: string;
  status: 'agendado' | 'em_execucao' | 'aguardando' | 'concluido';
}) {
  const statusConfig = {
    agendado: { label: 'Agendado', variant: 'secondary' as const },
    em_execucao: { label: 'Em Execução', variant: 'info' as const },
    aguardando: { label: 'Aguardando', variant: 'warning' as const },
    concluido: { label: 'Concluído', variant: 'success' as const },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{code}</span>
          <Badge variant={config.variant} className="text-[10px]">
            {config.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{customer}</p>
      </div>
      <div className="text-right">
        <span className="font-semibold">{total}</span>
      </div>
    </div>
  );
}

function QuickActionCard({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <Link href={href}>
      <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
