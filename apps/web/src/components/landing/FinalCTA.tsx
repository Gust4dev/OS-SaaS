"use client";

import Link from "next/link";
import { ArrowRight, Check, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function FinalCTA() {
  return (
    <section
      id="pricing"
      className="py-24 px-6 relative overflow-hidden bg-slate-900 text-white"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-50%] right-[-20%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Escolha o plano ideal para <br />
            <span className="text-red-500">evoluir sua oficina</span>
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Comece hoje mesmo a ter controle total do seu negócio.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Mensal Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-8 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col"
          >
            <div className="mb-6">
              <h3 className="text-xl font-medium text-zinc-400 mb-2">
                Plano Mensal
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-zinc-400">R$</span>
                <span className="text-5xl font-bold text-white">190</span>
                <span className="text-zinc-500">/mês</span>
              </div>
              <p className="text-zinc-500 text-sm mt-2">
                Sem fidelidade. Cancele quando quiser.
              </p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {[
                "Emissão de Ordens de Serviço ilimitadas",
                "Vistoria Digital com fotos e marcações",
                "Link de Acompanhamento (Tracking) para o cliente",
                "Assinatura digital na tela do celular",
                "Orçamentos via WhatsApp em 1 clique",
                "Cadastro de clientes e veículos",
                "Checklist de entrada personalizado",
                "Alertas de vencimento de revisão",
                "Controle financeiro (Caixa e Lucro)",
                "Cálculo automático de comissões",
                "Suporte técnico especializado",
                "Acesso simultâneo (Celular e PC)",
                "Backup automático na nuvem",
                "Segurança de dados bancária",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-zinc-400 text-sm"
                >
                  <Check className="w-5 h-5 text-zinc-600 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/sign-up" className="w-full">
              <Button
                variant="outline"
                className="w-full h-14 rounded-full border-zinc-700 text-white hover:bg-zinc-800 hover:text-white bg-transparent"
              >
                Assinar Mensal
              </Button>
            </Link>
          </motion.div>

          {/* Anual Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-8 bg-black border border-red-500/30 relative flex flex-col shadow-2xl shadow-red-900/10"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
              2 MESES OFF
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-medium text-red-500 mb-2">
                Plano Anual
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-zinc-400">R$</span>
                <span className="text-5xl font-bold text-white">158</span>
                <span className="text-zinc-500">/mês</span>
              </div>
              <p className="text-zinc-500 text-sm mt-2">
                R$ 1.900/ano à vista.{" "}
                <span className="text-green-500 font-bold">
                  Economize R$ 380.
                </span>
              </p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {[
                "Todas as funcionalidades do Mensal",
                "Prioridade máxima no suporte",
                "Consultoria de implantação gratuita",
                "Migração de dados (se tiver sistema antigo)",
                "Treinamento online para sua equipe",
                "Personalização avançada da OS (Logo/Cores)",
                "Relatórios de desempenho da oficina",
                "Gestão de múltiplos mecânicos",
                "Garantia de preço na renovação",
                "Selo de Oficina Parceira Autevo",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-white text-sm"
                >
                  <div className="bg-red-500/20 p-0.5 rounded-full">
                    <Check className="w-4 h-4 text-red-500 shrink-0" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/sign-up" className="w-full">
              <Button className="w-full h-14 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-900/20 hover:shadow-red-900/40 transition-all hover:scale-105">
                Quero Economizar R$ 380
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-8 text-zinc-500 text-sm">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>7 dias de garantia total</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Compra segura e criptografada</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>Ativação imediata</span>
          </div>
        </div>
      </div>
    </section>
  );
}
