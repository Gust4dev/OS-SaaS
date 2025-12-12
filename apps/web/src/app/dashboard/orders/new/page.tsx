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

// Mock data
const mockCustomers = [
  { id: 'c1', name: 'João Silva', phone: '(11) 99999-1234', vehicles: [
    { id: 'v1', plate: 'ABC-1234', brand: 'BMW', model: 'X5', color: 'Preta', year: 2023 },
  ]},
  { id: 'c2', name: 'Maria Santos', phone: '(11) 98888-5678', vehicles: [
    { id: 'v2', plate: 'XYZ-5678', brand: 'Mercedes', model: 'C300', color: 'Branca', year: 2024 },
  ]},
  { id: 'c3', name: 'Pedro Oliveira', phone: '(11) 97777-9012', vehicles: [
    { id: 'v3', plate: 'DEF-9012', brand: 'Porsche', model: '911', color: 'Vermelha', year: 2023 },
    { id: 'v4', plate: 'GHI-3456', brand: 'Audi', model: 'RS5', color: 'Cinza', year: 2024 },
  ]},
];

const mockServices = [
  { id: 's1', name: 'PPF Frontal', basePrice: 4500, estimatedTime: 480 },
  { id: 's2', name: 'PPF Full', basePrice: 12000, estimatedTime: 1440 },
  { id: 's3', name: 'Ceramic Coating', basePrice: 2800, estimatedTime: 360 },
  { id: 's4', name: 'Vitrificação de Vidros', basePrice: 450, estimatedTime: 90 },
  { id: 's5', name: 'Polimento Técnico', basePrice: 800, estimatedTime: 240 },
];

const mockUsers = [
  { id: 'u1', name: 'Carlos Técnico' },
  { id: 'u2', name: 'Ana Técnica' },
  { id: 'u3', name: 'Roberto Instalador' },
];

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
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Filter customers
  const filteredCustomers = mockCustomers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  const selectedCustomer = mockCustomers.find((c) => c.id === orderData.customerId);
  const selectedVehicle = selectedCustomer?.vehicles.find((v) => v.id === orderData.vehicleId);

  // Filter services
  const filteredServices = mockServices.filter((s) =>
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
        return orderData.customerId && orderData.vehicleId;
      case 2:
        return orderData.items.length > 0;
      case 3:
        return orderData.scheduledAt && orderData.assignedToId;
      default:
        return false;
    }
  };

  const handleAddService = (service: typeof mockServices[0]) => {
    const existing = orderData.items.find((i) => i.serviceId === service.id);
    if (existing) return;

    setOrderData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          serviceId: service.id,
          name: service.name,
          price: service.basePrice,
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
    setIsSubmitting(true);
    try {
      // TODO: Call tRPC mutation
      console.log('Create order:', {
        ...orderData,
        scheduledAt: new Date(`${orderData.scheduledAt}T${orderData.scheduledTime}`),
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push('/dashboard/orders');
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setIsSubmitting(false);
    }
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
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => setOrderData((prev) => ({
                        ...prev,
                        customerId: customer.id,
                        vehicleId: customer.vehicles.length === 1 ? customer.vehicles[0].id : '',
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
                        <Badge variant="secondary">{customer.vehicles.length} veículo(s)</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Selection */}
              {selectedCustomer && (
                <div className="space-y-3">
                  <Label>Veículo</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedCustomer.vehicles.map((vehicle) => (
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
                      href={`/dashboard/vehicles/new?customerId=${selectedCustomer.id}&returnTo=/dashboard/orders/new`}
                      className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-input p-4 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    >
                      <Plus className="h-5 w-5" />
                      Adicionar Veículo
                    </Link>
                  </div>
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
                        {service.name} - {formatCurrency(service.basePrice)}
                      </button>
                    );
                  })}
                </div>
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
                <div className="grid gap-2 sm:grid-cols-3">
                  {mockUsers.map((user) => (
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
                    <span>{selectedCustomer?.name}</span>
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
              disabled={!canProceed() || isSubmitting}
            >
              {isSubmitting ? (
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
