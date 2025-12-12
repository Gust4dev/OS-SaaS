'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, User, Car } from 'lucide-react';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  Input,
  Label,
  Skeleton,
  Badge,
} from '@/components/ui';
import { StatusBadge } from '@/components/orders';

// Mock data
const mockOrder = {
  id: 'os1',
  code: 'OS-2024-001',
  status: 'EM_EXECUCAO',
  scheduledAt: new Date('2024-12-11T09:00:00'),
  vehicle: {
    id: 'v1',
    plate: 'ABC-1234',
    brand: 'BMW',
    model: 'X5',
    customer: {
      id: 'c1',
      name: 'João Silva',
    },
  },
  assignedTo: { id: 'u1', name: 'Carlos Técnico' },
  discountType: null as string | null,
  discountValue: null as number | null,
};

const mockUsers = [
  { id: 'u1', name: 'Carlos Técnico' },
  { id: 'u2', name: 'Ana Técnica' },
  { id: 'u3', name: 'Roberto Instalador' },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditOrderPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    scheduledAt: '',
    scheduledTime: '',
    assignedToId: '',
    discountType: '' as '' | 'PERCENTAGE' | 'FIXED',
    discountValue: '',
  });

  useEffect(() => {
    const loadOrder = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const date = mockOrder.scheduledAt;
      setFormData({
        scheduledAt: date.toISOString().split('T')[0],
        scheduledTime: date.toTimeString().slice(0, 5),
        assignedToId: mockOrder.assignedTo.id,
        discountType: (mockOrder.discountType as '' | 'PERCENTAGE' | 'FIXED') || '',
        discountValue: mockOrder.discountValue?.toString() || '',
      });
      setIsLoading(false);
    };
    loadOrder();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log('Update order:', id, formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push(`/dashboard/orders/${id}`);
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Card>
          <CardContent className="space-y-6 pt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/orders/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight font-mono">
              {mockOrder.code}
            </h1>
            <StatusBadge status={mockOrder.status} />
          </div>
          <p className="text-muted-foreground">
            Editar informações da ordem de serviço
          </p>
        </div>
      </div>

      {/* Order Info (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações Fixas</CardTitle>
          <CardDescription>
            Estes campos não podem ser alterados
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-input bg-muted/50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="font-medium">{mockOrder.vehicle.customer.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-input bg-muted/50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Car className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Veículo</p>
              <p className="font-medium font-mono">{mockOrder.vehicle.plate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Editar Agendamento</CardTitle>
            <CardDescription>
              Altere a data, horário, responsável ou desconto
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
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Horário</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduledTime: e.target.value }))}
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
                    onClick={() => setFormData((prev) => ({ ...prev, assignedToId: user.id }))}
                    className={`rounded-lg border p-3 text-center transition-colors ${
                      formData.assignedToId === user.id
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
              <Label>Desconto</Label>
              <div className="flex gap-2">
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    discountType: e.target.value as '' | 'PERCENTAGE' | 'FIXED',
                  }))}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Sem desconto</option>
                  <option value="PERCENTAGE">Percentual (%)</option>
                  <option value="FIXED">Valor Fixo (R$)</option>
                </select>
                {formData.discountType && (
                  <Input
                    type="number"
                    placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '500'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      discountValue: e.target.value,
                    }))}
                    className="w-32"
                    min="0"
                  />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" asChild>
                <Link href={`/dashboard/orders/${id}`}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
