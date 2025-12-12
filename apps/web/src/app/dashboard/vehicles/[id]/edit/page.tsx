'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
} from '@/components/ui';

// Form validation schema
const vehicleFormSchema = z.object({
  plate: z.string().min(7, 'Placa inválida').max(8),
  brand: z.string().min(2, 'Marca obrigatória'),
  model: z.string().min(1, 'Modelo obrigatório'),
  color: z.string().min(2, 'Cor obrigatória'),
  year: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

// Mock data
const mockVehicle = {
  id: 'v1',
  plate: 'ABC-1234',
  brand: 'BMW',
  model: 'X5',
  color: 'Preta',
  year: 2023,
  customer: {
    id: '1',
    name: 'João Silva',
    phone: '(11) 99999-1234',
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditVehiclePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customer, setCustomer] = useState<typeof mockVehicle.customer | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
  });

  // Load vehicle data
  useEffect(() => {
    const loadVehicle = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset({
        plate: mockVehicle.plate,
        brand: mockVehicle.brand,
        model: mockVehicle.model,
        color: mockVehicle.color,
        year: mockVehicle.year?.toString() || '',
      });
      setCustomer(mockVehicle.customer);
      setIsLoading(false);
    };
    loadVehicle();
  }, [id, reset]);

  const onSubmit = async (data: VehicleFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Update vehicle:', id, data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push(`/dashboard/vehicles/${id}`);
    } catch (error) {
      console.error('Error updating vehicle:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPlate = (value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length <= 3) return clean;
    if (clean.length <= 7) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    return `${clean.slice(0, 3)}-${clean.slice(3, 7)}`;
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
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
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
          <Link href={`/dashboard/vehicles/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Veículo</h1>
          <p className="text-muted-foreground">
            Atualize as informações do veículo
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Veículo</CardTitle>
            <CardDescription>
              Campos marcados com * são obrigatórios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Owner (read-only) */}
            {customer && (
              <div className="space-y-2">
                <Label>Proprietário</Label>
                <div className="flex items-center gap-3 rounded-lg border border-input bg-muted/50 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Para alterar o proprietário, exclua este veículo e crie um novo.
                </p>
              </div>
            )}

            {/* Plate */}
            <div className="space-y-2">
              <Label htmlFor="plate" required>Placa</Label>
              <Input
                id="plate"
                placeholder="ABC-1234"
                {...register('plate', {
                  onChange: (e) => {
                    e.target.value = formatPlate(e.target.value);
                  },
                })}
                error={errors.plate?.message}
                className="uppercase"
              />
            </div>

            {/* Brand & Model */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand" required>Marca</Label>
                <Input
                  id="brand"
                  placeholder="Ex: BMW"
                  {...register('brand')}
                  error={errors.brand?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model" required>Modelo</Label>
                <Input
                  id="model"
                  placeholder="Ex: X5"
                  {...register('model')}
                  error={errors.model?.message}
                />
              </div>
            </div>

            {/* Color & Year */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="color" required>Cor</Label>
                <Input
                  id="color"
                  placeholder="Ex: Preta"
                  {...register('color')}
                  error={errors.color?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Ano</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="Ex: 2024"
                  min="1900"
                  max="2030"
                  {...register('year')}
                  error={errors.year?.message}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" asChild>
                <Link href={`/dashboard/vehicles/${id}`}>Cancelar</Link>
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
