'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Pencil, 
  DollarSign,
  User,
  Car,
  Phone,
  Calendar,
  Clock,
  MoreHorizontal,
  Printer,
  Send,
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
import { StatusBadge, OrderTimeline, PaymentDialog } from '@/components/orders';

// Mock data
const mockOrder = {
  id: 'os1',
  code: 'OS-2024-001',
  status: 'EM_EXECUCAO',
  scheduledAt: new Date('2024-12-11T09:00:00'),
  startedAt: new Date('2024-12-11T09:30:00'),
  completedAt: null,
  createdAt: new Date('2024-12-08'),
  subtotal: 7300,
  discountType: null,
  discountValue: null,
  total: 7300,
  vehicle: {
    id: 'v1',
    plate: 'ABC-1234',
    brand: 'BMW',
    model: 'X5',
    color: 'Preta',
    year: 2023,
    customer: {
      id: 'c1',
      name: 'João Silva',
      phone: '(11) 99999-1234',
      email: 'joao.silva@email.com',
    },
  },
  assignedTo: {
    id: 'u1',
    name: 'Carlos Técnico',
    avatarUrl: null,
  },
  createdBy: {
    id: 'u2',
    name: 'Ana Gerente',
  },
  items: [
    { id: 'i1', service: { id: 's1', name: 'PPF Frontal' }, customName: null, price: 4500, quantity: 1 },
    { id: 'i2', service: { id: 's3', name: 'Ceramic Coating' }, customName: null, price: 2800, quantity: 1 },
  ],
  payments: [
    { id: 'p1', method: 'PIX', amount: 3000, paidAt: new Date('2024-12-10'), notes: 'Entrada' },
  ],
};

const validNextStatuses: Record<string, { value: string; label: string }[]> = {
  AGENDADO: [
    { value: 'EM_VISTORIA', label: 'Iniciar Vistoria' },
    { value: 'CANCELADO', label: 'Cancelar OS' },
  ],
  EM_VISTORIA: [
    { value: 'EM_EXECUCAO', label: 'Iniciar Execução' },
    { value: 'CANCELADO', label: 'Cancelar OS' },
  ],
  EM_EXECUCAO: [
    { value: 'AGUARDANDO_PAGAMENTO', label: 'Finalizar Serviço' },
    { value: 'CANCELADO', label: 'Cancelar OS' },
  ],
  AGUARDANDO_PAGAMENTO: [
    { value: 'CONCLUIDO', label: 'Concluir OS' },
  ],
};

const paymentMethodLabels: Record<string, string> = {
  PIX: 'PIX',
  CARTAO_CREDITO: 'Cartão de Crédito',
  CARTAO_DEBITO: 'Cartão de Débito',
  DINHEIRO: 'Dinheiro',
  TRANSFERENCIA: 'Transferência',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  
  const order = mockOrder;
  const paidAmount = order.payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = order.total - paidAmount;

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

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleStatusChange = (newStatus: string) => {
    console.log('Change status to:', newStatus);
    // TODO: Call tRPC mutation
  };

  const handleAddPayment = async (data: { method: string; amount: number; notes?: string }) => {
    console.log('Add payment:', { orderId: id, ...data });
    // TODO: Call tRPC mutation
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const nextStatuses = validNextStatuses[order.status] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="mt-1">
            <Link href="/dashboard/orders">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight font-mono">
                {order.code}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-muted-foreground">
              Criada em {formatDate(order.createdAt)} por {order.createdBy.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2 pl-12 sm:pl-0">
          {/* Status Actions */}
          {nextStatuses.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  Atualizar Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {nextStatuses.map((status) => (
                  <DropdownMenuItem
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    className={status.value === 'CANCELADO' ? 'text-destructive focus:text-destructive' : ''}
                  >
                    {status.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/orders/${id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar OS
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Send className="mr-2 h-4 w-4" />
                Enviar WhatsApp
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
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer & Vehicle Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cliente e Veículo</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              {/* Customer */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Link 
                      href={`/dashboard/customers/${order.vehicle.customer.id}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {order.vehicle.customer.name}
                    </Link>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {order.vehicle.customer.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vehicle */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Link 
                      href={`/dashboard/vehicles/${order.vehicle.id}`}
                      className="font-mono font-medium hover:text-primary hover:underline"
                    >
                      {order.vehicle.plate}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {order.vehicle.brand} {order.vehicle.model} • {order.vehicle.color}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Serviços</CardTitle>
              <CardDescription>
                {order.items.length} serviço(s) nesta ordem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-medium">
                        {item.customName || item.service?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Qtd: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discountValue && (
                  <div className="flex justify-between text-sm text-destructive">
                    <span>Desconto</span>
                    <span>-{formatCurrency(Number(order.discountValue))}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Pagamentos</CardTitle>
                <CardDescription>
                  {balance > 0 
                    ? `Saldo devedor: ${formatCurrency(balance)}`
                    : 'Pagamento completo'
                  }
                </CardDescription>
              </div>
              {balance > 0 && (
                <Button size="sm" onClick={() => setPaymentDialogOpen(true)}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Registrar Pagamento
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {order.payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum pagamento registrado
                </p>
              ) : (
                <div className="space-y-3">
                  {order.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {paymentMethodLabels[payment.method] || payment.method}
                          </Badge>
                          {payment.notes && (
                            <span className="text-sm text-muted-foreground">
                              • {payment.notes}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(payment.paidAt)}
                        </p>
                      </div>
                      <p className="font-semibold text-success">
                        +{formatCurrency(payment.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Payment Summary */}
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Pago</span>
                  <span className="text-success font-medium">{formatCurrency(paidAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saldo Devedor</span>
                  <span className={balance > 0 ? 'text-destructive font-medium' : 'text-success font-medium'}>
                    {formatCurrency(balance)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline
                currentStatus={order.status}
                scheduledAt={order.scheduledAt}
                startedAt={order.startedAt || undefined}
                completedAt={order.completedAt || undefined}
              />
            </CardContent>
          </Card>

          {/* Schedule Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agendamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data Agendada</p>
                  <p className="font-medium">{formatDateTime(order.scheduledAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Responsável</p>
                  <p className="font-medium">{order.assignedTo.name}</p>
                </div>
              </div>

              {order.startedAt && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Iniciado em</p>
                    <p className="font-medium">{formatDateTime(order.startedAt)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        orderId={id}
        totalAmount={order.total}
        paidAmount={paidAmount}
        onSubmit={handleAddPayment}
      />
    </div>
  );
}
