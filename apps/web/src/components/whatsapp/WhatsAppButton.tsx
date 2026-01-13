"use client";

import { useState } from "react";
import { MessageCircle, AlertTriangle } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { openWhatsApp } from "@/lib/whatsapp";

interface WhatsAppButtonProps {
  phone: string;
  message: string;
  whatsappOptIn?: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function WhatsAppButton({
  phone,
  message,
  whatsappOptIn = true,
  variant = "default",
  size = "default",
  className,
  disabled,
  children,
}: WhatsAppButtonProps) {
  const [showWarning, setShowWarning] = useState(false);

  const handleClick = () => {
    if (!phone) return;

    if (!whatsappOptIn) {
      setShowWarning(true);
      return;
    }

    openWhatsApp(phone, message);
  };

  const handleContinue = () => {
    setShowWarning(false);
    openWhatsApp(phone, message);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
        disabled={disabled || !phone}
      >
        {children || (
          <>
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </>
        )}
      </Button>

      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Cliente não optou por receber mensagens
            </DialogTitle>
            <DialogDescription>
              Este cliente não autorizou o recebimento de mensagens via
              WhatsApp. Deseja continuar mesmo assim?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarning(false)}>
              Cancelar
            </Button>
            <Button onClick={handleContinue}>Continuar mesmo assim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
