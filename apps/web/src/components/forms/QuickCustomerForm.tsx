'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc/provider';
import { toast } from 'sonner';

const quickCustomerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
});

type QuickCustomerFormData = z.infer<typeof quickCustomerSchema>;

interface QuickCustomerFormProps {
  onSuccess: (customer: { id: string; name: string; phone: string }) => void;
  onCancel: () => void;
}

export function QuickCustomerForm({ onSuccess, onCancel }: QuickCustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuickCustomerFormData>({
    resolver: zodResolver(quickCustomerSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  const createMutation = trpc.customer.create.useMutation({
    onSuccess: (newCustomer) => {
      toast.success('Cliente cadastrado com sucesso');
      onSuccess({
        id: newCustomer.id,
        name: newCustomer.name,
        phone: newCustomer.phone,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: QuickCustomerFormData) => {
    createMutation.mutate({
      name: data.name,
      phone: data.phone.replace(/\D/g, ''),
      whatsappOptIn: true, // Default to true for quick add
    });
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="quick-name">Nome Completo *</Label>
        <Input
          id="quick-name"
          placeholder="Ex: João da Silva"
          {...register('name')}
          error={errors.name?.message}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quick-phone">Telefone / WhatsApp *</Label>
        <Input
          id="quick-phone"
          placeholder="(11) 99999-9999"
          {...register('phone', {
            onChange: (e) => {
              e.target.value = formatPhone(e.target.value);
            },
          })}
          error={errors.phone?.message}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
