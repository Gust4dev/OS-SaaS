'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  User, 
  Car, 
  Wrench, 
  Calendar,
  Loader2,
  Plus,
  Trash2,
  Search,
} from 'lucide-react';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  Input,
  Label,
  Badge,
} from '@/components/ui';
import { trpc } from '@/lib/trpc/provider';
import { toast } from 'sonner';

interface SelectedItem {
  serviceId: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderData {
  customerId: string;
  vehicleId: string;
  items: SelectedItem[];
  scheduledAt: string;
  scheduledTime: string;
  assignedToId: string;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
}

const steps = [
  { id: 1, title: 'Cliente e Veículo', icon: User },
  { id: 2, title: 'Serviços', icon: Wrench },
  { id: 3, title: 'Agendamento', icon: Calendar },
];

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId');
  const preselectedVehicleId = searchParams.get('vehicleId');

  const [currentStep, setCurrentStep] = useState(1);
  const [customerSearch, setCustomerSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');

  const [orderData, setOrderData] = useState<OrderData>({
    customerId: preselectedCustomerId || '',
    vehicleId: preselectedVehicleId || '',
    items: [],
    scheduledAt: '',
    scheduledTime: '09:00',
    assignedToId: '',
  });

  // tRPC Queries
  const customersQuery = trpc.customer.list.useQuery(
    { search: customerSearch, limit: 10 },
    { keepPreviousData: true }
  );

  const vehiclesQuery = trpc.vehicle.list.useQuery(
    { customerId: orderData.customerId },
    { enabled: !!orderData.customerId }
  );

  const servicesQuery = trpc.service.listActive.useQuery();

  const usersQuery = trpc.user.listForSelect.useQuery();

  const createOrder = trpc.order.create.useMutation({
    onSuccess: () => {
      toast.success('Ordem de serviço criada com sucesso!');
      router.push('/dashboard/orders');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao criar ordem de serviço');
    },
  });

  // Derived state
  const selectedCustomer = customersQuery.data?.customers.find(c => c.id === orderData.customerId);
  const filteredCustomers = customersQuery.data?.customers || [];
  
  const customerVehicles = vehiclesQuery.data?.vehicles || [];
  const selectedVehicle = customerVehicles.find(v => v.id === orderData.vehicleId);

  const availableServices = servicesQuery.data || [];
  const filteredServices = availableServices.filter((s) =>
    s.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const subtotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = orderData.discountType && orderData.discountValue
    ? orderData.discountType === 'PERCENTAGE'
      ? subtotal * (orderData.discountValue / 100)
      : orderData.discountValue
    : 0;
  const total = Math.max(0, subtotal - discount);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!(orderData.customerId && orderData.vehicleId);
      case 2:
        return orderData.items.length > 0;
      case 3:
        return !!(orderData.scheduledAt && orderData.assignedToId);
      default:
        return false;
    }
  };

  const handleAddService = (service: typeof availableServices[0]) => {
    const existing = orderData.items.find((i) => i.serviceId === service.id);
    if (existing) return;

    setOrderData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          serviceId: service.id,
          name: service.name,
          price: Number(service.basePrice),
          quantity: 1,
        },
      ],
    }));
  };

  const handleRemoveItem = (serviceId: string) => {
    setOrderData((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.serviceId !== serviceId),
    }));
  };

  const handleUpdatePrice = (serviceId: string, newPrice: number) => {
    setOrderData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.serviceId === serviceId ? { ...item, price: newPrice } : item
      ),
    }));
  };

  const handleSubmit = async () => {
    const scheduledDateTime = new Date(`${orderData.scheduledAt}T${orderData.scheduledTime}`);
    
    await createOrder.mutateAsync({
      customerId: orderData.customerId, // Not required by schema but good context
      vehicleId: orderData.vehicleId,
      assignedToId: orderData.assignedToId,
      scheduledAt: scheduledDateTime,
      discountType: orderData.discountType,
      discountValue: orderData.discountValue,
      items: orderData.items.map(item => ({
        serviceId: item.serviceId,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nova Ordem de Serviço</h1>
          <p className="text-muted-foreground">
            Crie uma nova OS em 3 passos simples
          </p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isComplete
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isCurrent
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Passo {step.id}
                  </p>
                  <p className={`text-xs ${isCurrent ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`mx-4 h-0.5 w-12 sm:w-24 ${isComplete ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        {/* Step 1: Customer & Vehicle */}
        {currentStep === 1 && (
          <>
            <CardHeader>
              <CardTitle>Selecione o Cliente e Veículo</CardTitle>
              <CardDescription>
                Escolha o cliente e o veículo para esta ordem de serviço
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Search */}
              <div className="space-y-3">
                <Label>Cliente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou telefone..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Customer List */}
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {customersQuery.isLoading && (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  
                  {!customersQuery.isLoading && filteredCustomers.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Nenhum cliente encontrado.
                    </p>
                  )}

                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => setOrderData((prev) => ({
                        ...prev,
                        customerId: customer.id,
                        vehicleId: '', // Reset vehicle when customer changes
                      }))}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        orderData.customerId === customer.id
                          ? 'border-primary bg-primary/5'
                          : 'border-input hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.phone}</p>
                        </div>
                        {/* Note: We don't have vehicle count in list query, would need to add to router if needed */}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Selection */}
              {orderData.customerId && (
                <div className="space-y-3">
                  <Label>Veículo</Label>
                  {vehiclesQuery.isLoading ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                    {customerVehicles.map((vehicle) => (
                      <button
                        key={vehicle.id}
                        type="button"
                        onClick={() => setOrderData((prev) => ({ ...prev, vehicleId: vehicle.id }))}
                        className={`rounded-lg border p-4 text-left transition-colors ${
                          orderData.vehicleId === vehicle.id
                            ? 'border-primary bg-primary/5'
                            : 'border-input hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Car className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-mono font-semibold">{vehicle.plate}</p>
                            <p className="text-sm text-muted-foreground">
                              {vehicle.brand} {vehicle.model} • {vehicle.color}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                    <Link
                      href={`/dashboard/vehicles/new?customerId=${orderData.customerId}&returnTo=/dashboard/orders/new`}
                      className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-input p-4 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    >
                      <Plus className="h-5 w-5" />
                      Adicionar Veículo
                    </Link>
                  </div>
                  )}
                </div>
              )}
            </CardContent>
          </>
        )}

        {/* Step 2: Services */}
        {currentStep === 2 && (
          <>
            <CardHeader>
              <CardTitle>Adicione os Serviços</CardTitle>
              <CardDescription>
                Selecione os serviços que serão realizados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service Search */}
              <div className="space-y-3">
                <Label>Serviços Disponíveis</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar serviço..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {servicesQuery.isLoading ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {filteredServices.map((service) => {
                      const isSelected = orderData.items.some((i) => i.serviceId === service.id);
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleAddService(service)}
                          disabled={isSelected}
                          className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                            isSelected
                              ? 'border-primary/50 bg-primary/10 text-primary cursor-default'
                              : 'border-input hover:bg-muted/50'
                          }`}
                        >
                          {service.name} - {formatCurrency(Number(service.basePrice))}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Items */}
              {orderData.items.length > 0 && (
                <div className="space-y-3">
                  <Label>Serviços Selecionados</Label>
                  <div className="space-y-2">
                    {orderData.items.map((item) => (
                      <div
                        key={item.serviceId}
                        className="flex items-center justify-between rounded-lg border border-input p-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleUpdatePrice(item.serviceId, Number(e.target.value))}
                            className="w-32 text-right"
                            min="0"
                            step="0.01"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.serviceId)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-end">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Subtotal</p>
                      <p className="text-xl font-bold">{formatCurrency(subtotal)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </>
        )}

        {/* Step 3: Schedule */}
        {currentStep === 3 && (
          <>
            <CardHeader>
              <CardTitle>Agendamento e Finalização</CardTitle>
              <CardDescription>
                Defina a data, responsável e revise os detalhes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date & Time */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Data</Label>
                  <Input
                    id="scheduledAt"
                    type="date"
                    value={orderData.scheduledAt}
                    onChange={(e) => setOrderData((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Horário</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={orderData.scheduledTime}
                    onChange={(e) => setOrderData((prev) => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>
              </div>

              {/* Assigned User */}
              <div className="space-y-3">
                <Label>Responsável</Label>
                {usersQuery.isLoading ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-3">
                    {usersQuery.data?.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => setOrderData((prev) => ({ ...prev, assignedToId: user.id }))}
                        className={`rounded-lg border p-3 text-center transition-colors ${
                          orderData.assignedToId === user.id
                            ? 'border-primary bg-primary/5'
                            : 'border-input hover:bg-muted/50'
                        }`}
                      >
                        {user.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Discount */}
              <div className="space-y-3">
                <Label>Desconto (opcional)</Label>
                <div className="flex gap-2">
                  <select
                    value={orderData.discountType || ''}
                    onChange={(e) => setOrderData((prev) => ({
                      ...prev,
                      discountType: e.target.value as 'PERCENTAGE' | 'FIXED' | undefined,
                    }))}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Sem desconto</option>
                    <option value="PERCENTAGE">Percentual (%)</option>
                    <option value="FIXED">Valor Fixo (R$)</option>
                  </select>
                  {orderData.discountType && (
                    <Input
                      type="number"
                      placeholder={orderData.discountType === 'PERCENTAGE' ? '10' : '500'}
                      value={orderData.discountValue || ''}
                      onChange={(e) => setOrderData((prev) => ({
                        ...prev,
                        discountValue: Number(e.target.value),
                      }))}
                      className="w-32"
                      min="0"
                    />
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="font-semibold mb-3">Resumo da OS</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cliente:</span>
                    <span>{customersQuery.data?.customers.find(c => c.id === orderData.customerId)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Veículo:</span>
                    <span>{selectedVehicle?.plate} - {selectedVehicle?.brand} {selectedVehicle?.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Serviços:</span>
                    <span>{orderData.items.length} item(s)</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-destructive">
                        <span>Desconto:</span>
                        <span>-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg mt-1">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between border-t p-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep((prev) => prev - 1)}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              disabled={!canProceed()}
            >
              Próximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceed() || createOrder.isPending}
            >
              {createOrder.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Criar OS
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
