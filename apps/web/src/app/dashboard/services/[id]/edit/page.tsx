'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
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

const serviceFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  basePrice: z.string().min(1, 'Preço obrigatório'),
  estimatedTime: z.string().optional(),
  returnDays: z.string().optional(),
  defaultCommissionPercent: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

const mockService = {
  id: 's1',
  name: 'PPF Frontal',
  description: 'Proteção de pintura na parte frontal do veículo',
  basePrice: 4500,
  estimatedTime: 480,
  returnDays: 365,
  isActive: true,
  defaultCommissionPercent: 10,
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditServicePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
  });

  const isActive = watch('isActive');

  useEffect(() => {
    const loadService = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset({
        name: mockService.name,
        description: mockService.description || '',
        basePrice: mockService.basePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        estimatedTime: mockService.estimatedTime?.toString() || '',
        returnDays: mockService.returnDays?.toString() || '',
        defaultCommissionPercent: mockService.defaultCommissionPercent?.toString() || '',
        isActive: mockService.isActive,
      });
      setIsLoading(false);
    };
    loadService();
  }, [id, reset]);

  const onSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Update service:', id, data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push(`/dashboard/services/${id}`);
    } catch (error) {
      console.error('Error updating service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const amount = parseInt(numbers) / 100;
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
            {Array.from({ length: 5 }).map((_, i) => (
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/services/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Serviço</h1>
          <p className="text-muted-foreground">Atualize as informações do serviço</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Serviço</CardTitle>
            <CardDescription>Campos marcados com * são obrigatórios.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" required>Nome do Serviço</Label>
              <Input id="name" {...register('name')} error={errors.name?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                rows={3}
                {...register('description')}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="basePrice" required>Preço Base</Label>
              <Input
                id="basePrice"
                {...register('basePrice', {
                  onChange: (e) => { e.target.value = formatCurrency(e.target.value); },
                })}
                error={errors.basePrice?.message}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Tempo Estimado (minutos)</Label>
                <Input id="estimatedTime" type="number" min="0" {...register('estimatedTime')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="returnDays">Retorno (dias)</Label>
                <Input id="returnDays" type="number" min="0" {...register('returnDays')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultCommissionPercent">Comissão Padrão (%)</Label>
              <Input id="defaultCommissionPercent" type="number" min="0" max="100" step="0.1" {...register('defaultCommissionPercent')} />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setValue('isActive', e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Serviço ativo (disponível para novas OS)
              </Label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" asChild>
                <Link href={`/dashboard/services/${id}`}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" />Salvar Alterações</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
