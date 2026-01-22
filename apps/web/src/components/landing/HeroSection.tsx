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
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Abstract Background Shapes - More vibrant and depth-oriented */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <motion.div
          style={{ y: y1 }}
          className="absolute -top-[5%] -left-[10%] w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-gradient-to-br from-red-100/40 via-indigo-100/30 to-purple-100/40 rounded-full blur-[60px] md:blur-[80px] opacity-70 mix-blend-multiply"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute top-[10%] -right-[5%] w-[350px] h-[350px] md:w-[500px] md:h-[500px] bg-gradient-to-tr from-pink-100/40 via-red-50/30 to-rose-100/40 rounded-full blur-[60px] md:blur-[80px] opacity-70 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.4]" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-20">
        {/* Left Column: Content */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Badge - More refined */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/[0.03] border border-black/[0.08] text-[13px] font-semibold text-slate-900 mb-8 backdrop-blur-sm transition-colors cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
            Oferta Exclusiva: 60 Dias Premium por R$ 97
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-slate-900 leading-[1.1] [text-wrap:balance]">
            Sua oficina nunca mais será <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
              a mesma.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
            De oficina comum a referência no mercado. Otimize seus processos,
            fidelize seus clientes e garanta previsibilidade financeira todos os
            meses.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-10 text-base bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-[0_10px_30px_-10px_rgba(220,38,38,0.5)] hover:shadow-[0_15px_35px_-10px_rgba(220,38,38,0.6)] hover:-translate-y-1 font-bold"
              >
                Começar agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#pricing" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-base rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold backdrop-blur-sm"
              >
                Ver planos
              </Button>
            </Link>
          </motion.div>
          {/* Social Proof / Features List */}
          <div className="mt-12 pt-8 border-t border-slate-100 w-full flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-8 text-sm text-slate-500">
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
          </div>
        </div>

        {/* Right Column: Visual/Dashboard Preview - Visible but simplified on mobile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="relative mt-12 lg:mt-0"
        >
          <div className="relative rounded-2xl bg-slate-900/5 p-2 md:p-4 backdrop-blur-sm border border-slate-200/50 shadow-2xl lg:skew-y-1 lg:hover:skew-y-0 transition-transform duration-700 ease-out">
            {/* Decorative "App Window" */}
            <div className="w-full aspect-[4/3] md:aspect-auto md:h-[400px] lg:h-auto rounded-xl bg-white shadow-inner overflow-hidden border border-slate-100 relative">
              {/* Fake UI Header */}
              <div className="h-8 md:h-10 border-b border-slate-100 flex items-center px-4 gap-2 bg-slate-50/50">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              {/* Main Content Area */}
              <div className="p-4 md:p-6 grid gap-4 md:gap-6">
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  <div className="h-16 md:h-24 rounded-lg bg-indigo-50/80 animate-pulse" />
                  <div className="h-16 md:h-24 rounded-lg bg-purple-50/80 animate-pulse delay-75" />
                  <div className="h-16 md:h-24 rounded-lg bg-pink-50/80 animate-pulse delay-150" />
                </div>
                <div className="h-24 md:h-40 rounded-lg bg-slate-50 border border-slate-100" />
                <div className="flex gap-2 md:gap-4">
                  <div className="w-1/3 h-20 md:h-32 rounded-lg bg-slate-50 border border-slate-100" />
                  <div className="w-2/3 h-20 md:h-32 rounded-lg bg-slate-50 border border-slate-100" />
                </div>
              </div>

              {/* Floating Elements - Adjusted for mobile */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="absolute right-2 md:-right-4 top-16 md:top-20 bg-white p-2 md:p-4 rounded-lg md:rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.1)] border border-slate-100 max-w-[120px] md:max-w-[200px]"
              >
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-[10px] md:text-sm">
                    $
                  </div>
                  <div className="text-[10px] md:text-xs font-semibold text-slate-700">
                    Faturamento
                  </div>
                </div>
                <div className="text-base md:text-2xl font-bold text-slate-900">
                  +127%
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute left-2 md:-left-6 bottom-16 md:bottom-20 bg-white p-2 md:p-4 rounded-lg md:rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.1)] border border-slate-100 max-w-[140px] md:max-w-none"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm md:text-base">
                    🚗
                  </div>
                  <div>
                    <div className="text-[10px] md:text-xs text-slate-500">
                      Veículos Prontos
                    </div>
                    <div className="text-[10px] md:text-sm font-bold text-slate-900">
                      Entregas hoje
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
