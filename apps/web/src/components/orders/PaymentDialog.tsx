'use client';

import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
} from '@/components/ui';
import { Loader2 } from 'lucide-react';

const paymentMethods = [
  { value: 'PIX', label: 'PIX' },
  { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
  { value: 'CARTAO_DEBITO', label: 'Cartão de Débito' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'TRANSFERENCIA', label: 'Transferência' },
];

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  totalAmount: number;
  paidAmount: number;
  onSubmit: (data: { method: string; amount: number; notes?: string }) => Promise<void>;
}

export function PaymentDialog({
  open,
  onOpenChange,
  orderId,
  totalAmount,
  paidAmount,
  onSubmit,
}: PaymentDialogProps) {
  const [method, setMethod] = useState('PIX');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const balance = totalAmount - paidAmount;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleAmountChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) {
      setAmount('');
      return;
    }
    const numValue = parseInt(numbers) / 100;
    setAmount(numValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  };

  const parseAmount = (formatted: string): number => {
    return parseFloat(formatted.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  };

  const handleSubmit = async () => {
    const numAmount = parseAmount(amount);
    
    if (numAmount <= 0) {
      setError('Informe um valor válido');
      return;
    }

    if (numAmount > balance) {
      setError('Valor excede o saldo devedor');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit({
        method,
        amount: numAmount,
        notes: notes || undefined,
      });
      
      // Reset form
      setMethod('PIX');
      setAmount('');
      setNotes('');
      onOpenChange(false);
    } catch {
      setError('Erro ao registrar pagamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillBalance = () => {
    setAmount(balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>
            Saldo devedor: <strong className="text-foreground">{formatCurrency(balance)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.value}
                  type="button"
                  onClick={() => setMethod(pm.value)}
                  className={`rounded-lg border p-2 text-sm transition-colors ${
                    method === pm.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input hover:bg-muted/50'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Valor</Label>
              <button
                type="button"
                onClick={handleFillBalance}
                className="text-xs text-primary hover:underline"
              >
                Preencher saldo
              </button>
            </div>
            <Input
              id="amount"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="R$ 0,00"
              error={error}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Parcelado em 3x"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              'Registrar Pagamento'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
