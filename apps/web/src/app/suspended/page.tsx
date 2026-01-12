"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { Lexend_Deca } from "next/font/google";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { AlertTriangle, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const WHATSAPP_NUMBER = "5561998031185";
const MONTHLY_PRICE = 297;

export default function SuspendedPage() {
  const { user, isLoaded } = useUser();

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Olá! Minha conta no Autevo está suspensa e gostaria de regularizar. Meu email: ${
      user?.emailAddresses?.[0]?.emailAddress || "N/A"
    }`
  )}`;

  if (!isLoaded) {
    return (
      <div
        className={cn(
          "min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center",
          lexendDeca.className
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-[#0A0A0B] text-white",
        lexendDeca.className
      )}
    >
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="font-bold text-white">A</span>
            </div>
            <span className="font-bold text-lg">Autevo</span>
          </Link>
          <SignOutButton>
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white"
            >
              Sair
            </Button>
          </SignOutButton>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-6 py-16 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-6">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Acesso Suspenso</h1>
          <p className="text-zinc-400 text-lg">
            Seu período de teste terminou e não identificamos o pagamento da
            assinatura.
          </p>
        </div>

        {/* Reactivation Card */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 mb-8">
          <p className="text-zinc-300 mb-6">
            Para continuar usando o Autevo e acessar seus dados, regularize sua
            situação:
          </p>

          <div className="bg-zinc-800/50 rounded-xl p-6 mb-6">
            <span className="text-sm text-zinc-400">Assinatura Mensal</span>
            <div className="flex items-baseline justify-center gap-1 mt-2">
              <span className="text-4xl font-bold">R$ {MONTHLY_PRICE}</span>
              <span className="text-zinc-400">/mês</span>
            </div>
          </div>

          <ul className="space-y-2 text-left mb-6 text-sm text-zinc-400">
            <li>✓ Acesso a todos os seus dados</li>
            <li>✓ Todas as funcionalidades</li>
            <li>✓ Cancele quando quiser</li>
          </ul>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            Regularizar Agora
          </a>
        </div>

        {/* Warning */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-amber-200 text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Seus dados serão mantidos por mais <strong>30 dias</strong>. Após
              isso, serão permanentemente excluídos.
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
