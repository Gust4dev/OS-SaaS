"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden min-h-screen flex flex-col justify-center bg-white text-slate-900"
    >
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <motion.div
          style={{ y: y1 }}
          className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-[80px] opacity-60 mix-blend-multiply"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute top-[20%] -right-[10%] w-[500px] h-[500px] bg-gradient-to-tr from-pink-100 to-rose-100 rounded-full blur-[80px] opacity-60 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-20">
        {/* Left Column: Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center lg:items-start text-center lg:text-left"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-sm font-medium text-black mb-8 hover:bg-red-100 transition-colors cursor-default"
          >
            <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            Oferta Exclusiva: 60 Dias Premium por R$ 97
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-slate-900 leading-[1.1]"
          >
            Sua oficina nunca mais será <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
              a mesma.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed"
          >
            De oficina comum a referência no mercado. Otimize seus processos,
            fidelize seus clientes e garanta previsibilidade financeira todos os
            meses.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-base bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 font-semibold"
              >
                Elevar o nível da sua oficina
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#pricing" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-base rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all font-medium"
              >
                Ver Planos
              </Button>
            </Link>
          </motion.div>

          {/* Social Proof / Features List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-12 pt-8 border-t border-slate-100 w-full flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-8 text-sm text-slate-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-500" />
              <span>Instalação imediata</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-500" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-500" />
              <span>Suporte via WhatsApp</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Visual/Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2, type: "spring" }}
          className="relative hidden lg:block"
        >
          <div className="relative rounded-2xl bg-slate-900/5 p-4 backdrop-blur-sm border border-slate-200/50 shadow-2xl skew-y-1 hover:skew-y-0 transition-transform duration-700 ease-out">
            {/* Decorative "App Window" */}
            <div className="w-full aspect-[4/3] rounded-xl bg-white shadow-inner overflow-hidden border border-slate-100 relative">
              {/* Fake UI Header */}
              <div className="h-10 border-b border-slate-100 flex items-center px-4 gap-2 bg-slate-50/50">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              {/* Main Content Area - Keeping it abstract to spark curiosity */}
              <div className="p-6 grid gap-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-24 rounded-lg bg-indigo-50/80 animate-pulse" />
                  <div className="h-24 rounded-lg bg-purple-50/80 animate-pulse delay-75" />
                  <div className="h-24 rounded-lg bg-pink-50/80 animate-pulse delay-150" />
                </div>
                <div className="h-40 rounded-lg bg-slate-50 border border-slate-100" />
                <div className="flex gap-4">
                  <div className="w-1/3 h-32 rounded-lg bg-slate-50 border border-slate-100" />
                  <div className="w-2/3 h-32 rounded-lg bg-slate-50 border border-slate-100" />
                </div>
              </div>

              {/* Floating Elements on top */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="absolute -right-4 top-20 bg-white p-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 max-w-[200px]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                    $
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    Faturamento
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">+127%</div>
                <div className="text-xs text-green-600 mt-1 whitespace-nowrap">
                  vs. mês anterior
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -left-6 bottom-20 bg-white p-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    🚗
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      Veículos Prontos
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      14 Entregues hoje
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
