"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { Lexend_Deca } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Copy, Check, MessageCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const PIX_KEY = "3d8b2e72-72be-4d71-bfbd-0eeaea20a4e8";
const PIX_PHONE = "+5561998031185";
const WHATSAPP_NUMBER = "5561998031185";
const TRIAL_PRICE = 97;
const TRIAL_DAYS = 60;

export default function ActivatePage() {
  const { user, isLoaded } = useUser();
  const [copied, setCopied] = useState(false);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Olá! Acabei de criar minha conta no Autevo e fiz o Pix de R$ ${TRIAL_PRICE}. Meu email: ${
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
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Olá, {user?.firstName || "Usuário"}! 👋
          </h1>
          <p className="text-zinc-400 text-lg">
            Sua conta foi criada com sucesso.
            <br />
            Para começar a usar o Autevo, ative seu acesso.
          </p>
        </div>

        {/* Offer Card */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 mb-8">
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-medium mb-4">
              Oferta de Lançamento
            </span>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-bold">R$ {TRIAL_PRICE}</span>
            </div>
            <p className="text-zinc-400">
              {TRIAL_DAYS} dias de acesso completo
            </p>
          </div>

          <ul className="space-y-3 mb-6">
            {[
              "Todas as funcionalidades",
              "Usuários ilimitados",
              "OS ilimitadas",
              "Suporte por WhatsApp",
              "Sem fidelidade",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-zinc-300">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <p className="text-center text-zinc-500 text-sm">
            Depois: R$ 297/mês
          </p>
        </div>

        {/* Payment Section */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Para ativar, faça um Pix:
          </h2>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-xl">
              <Image
                src="/qrcode/qr1.webp"
                alt="QR Code Pix"
                width={200}
                height={200}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Pix Key */}
          <div className="mb-6">
            <label className="block text-sm text-zinc-400 mb-2 text-center">
              Ou copie a chave Pix:
            </label>
            <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-3">
              <code className="flex-1 text-sm text-zinc-300 break-all">
                {PIX_KEY}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyPix}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-center text-zinc-500 text-sm mt-2">
              Valor: <strong className="text-white">R$ {TRIAL_PRICE},00</strong>
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-center">
            <p className="text-zinc-300 text-sm">
              Após o pagamento, sua conta será liberada em até{" "}
              <strong className="text-white">2 horas úteis</strong>.
            </p>
          </div>
        </div>

        {/* WhatsApp Contact */}
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Já pagou? Entre em contato:</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            Falar no WhatsApp
          </a>
        </div>

        {/* FAQ */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <h3 className="text-lg font-semibold mb-6">Dúvidas frequentes</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-zinc-300 font-medium">• E se eu não gostar?</p>
              <p className="text-zinc-500 ml-4">
                Sem problema. Não tem fidelidade.
              </p>
            </div>
            <div>
              <p className="text-zinc-300 font-medium">
                • Quanto tempo demora pra liberar?
              </p>
              <p className="text-zinc-500 ml-4">
                Até 2 horas úteis após confirmarmos o Pix.
              </p>
            </div>
            <div>
              <p className="text-zinc-300 font-medium">
                • Posso pedir reembolso?
              </p>
              <p className="text-zinc-500 ml-4">
                Sim, em até 7 dias se não gostar.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
