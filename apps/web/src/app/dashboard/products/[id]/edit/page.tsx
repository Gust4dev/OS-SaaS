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

const productFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  sku: z.string().optional(),
  unit: z.string().min(1, 'Unidade obrigatória'),
  costPrice: z.string().optional(),
  salePrice: z.string().optional(),
  stock: z.string(),
  minStock: z.string(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

const mockProduct = {
  id: 'p1',
  name: 'Película PPF 3M Pro Series',
  description: 'Película premium para proteção de pintura',
  sku: 'PPF-3M-001',
  unit: 'm²',
  costPrice: 180,
  salePrice: null as number | null,
  stock: 45,
  minStock: 20,
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
  });

  useEffect(() => {
    const loadProduct = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset({
        name: mockProduct.name,
        description: mockProduct.description || '',
        sku: mockProduct.sku || '',
        unit: mockProduct.unit,
        costPrice: mockProduct.costPrice 
          ? mockProduct.costPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
          : '',
        salePrice: mockProduct.salePrice 
          ? mockProduct.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
          : '',
        stock: mockProduct.stock.toString(),
        minStock: mockProduct.minStock.toString(),
      });
      setIsLoading(false);
    };
    loadProduct();
  }, [id, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Update product:', id, data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/dashboard/products');
    } catch (error) {
      console.error('Error updating product:', error);
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
          <Link href="/dashboard/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Produto</h1>
          <p className="text-muted-foreground">Atualize as informações do produto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
            <CardDescription>Campos marcados com * são obrigatórios.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" required>Nome do Produto</Label>
              <Input id="name" {...register('name')} error={errors.name?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                rows={2}
                {...register('description')}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU / Código</Label>
                <Input id="sku" {...register('sku')} className="uppercase" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit" required>Unidade</Label>
                <Input id="unit" {...register('unit')} error={errors.unit?.message} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Preço de Custo</Label>
                <Input
                  id="costPrice"
                  {...register('costPrice', {
                    onChange: (e) => { e.target.value = formatCurrency(e.target.value); },
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">Preço de Venda</Label>
                <Input
                  id="salePrice"
                  {...register('salePrice', {
                    onChange: (e) => { e.target.value = formatCurrency(e.target.value); },
                  })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stock">Estoque Atual</Label>
                <Input id="stock" type="number" min="0" {...register('stock')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Estoque Mínimo</Label>
                <Input id="minStock" type="number" min="0" {...register('minStock')} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/products">Cancelar</Link>
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
