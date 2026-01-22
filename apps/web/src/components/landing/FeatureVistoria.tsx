"use client";

import { motion } from "framer-motion";
import { ScanLine, ShieldCheck } from "lucide-react";

export function FeatureVistoria() {
  return (
    <section
      id="vistoria"
      className="py-24 px-6 bg-white relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Visual Mobile Mockup */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="order-1 relative flex justify-center lg:justify-end"
        >
          <div className="relative w-[320px] h-[640px] bg-slate-900 rounded-[3rem] p-4 shadow-2xl border-[8px] border-slate-900 ring-1 ring-slate-900/10">
            {/* Screen Content */}
            <div className="w-full h-full bg-slate-50 rounded-[2rem] overflow-hidden relative flex flex-col">
              {/* Header */}
              <div className="h-16 bg-white border-b border-slate-100 flex items-center px-4 gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <ScanLine className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-slate-800 leading-none">
                    Vistoria de Entrada
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    12 de 12 itens obrigatórios
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-red-600 w-full" />

              {/* Checklist Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-20">
                {/* Category Header */}
                <div className="flex items-center justify-between px-1 mb-2">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-3 h-3 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    <span className="text-[12px] font-bold text-slate-800">
                      Exterior Geral
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-bold">
                    8/8
                  </span>
                </div>

                {/* Item: Com Avaria */}
                <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
                  <div className="p-2.5 flex gap-3">
                    <div className="w-14 h-14 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 relative">
                      <img
                        src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=200"
                        alt="Car Front"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1 w-4 h-4 bg-amber-500 rounded flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">
                          !
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-bold text-slate-800">
                          Frente Completa
                        </span>
                        <span className="text-[8px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                          Com Avaria
                        </span>
                      </div>
                      <div className="flex gap-1 mb-1">
                        <span className="text-[8px] font-bold text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full">
                          Arranhão
                        </span>
                        <span className="text-[8px] font-bold text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full">
                          Leve
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 truncate">
                        Arranhão abaixo da lanterna.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Item: OK */}
                <div className="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden">
                  <div className="p-2.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-slate-800">
                          Para-brisa
                        </span>
                        <span className="text-[8px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
                          OK
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Item: OK 2 */}
                <div className="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden opacity-60">
                  <div className="p-2.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="text-[12px] font-bold text-slate-800">
                        Teto
                      </span>
                    </div>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm mt-4">
                  <div className="text-[11px] font-bold text-slate-800 mb-2">
                    Assinatura do Cliente
                  </div>
                  <div className="h-16 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                    <svg
                      className="w-24 h-12 text-slate-900 opacity-80"
                      viewBox="0 0 100 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M10,25 Q30,15 45,25 T85,20"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20,30 Q40,20 55,30 T90,25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.5"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="absolute bottom-0 inset-x-0 h-16 bg-white border-t border-slate-100 flex items-center justify-center px-4">
                <div className="w-full h-10 bg-red-600 rounded-full flex items-center justify-center text-white text-[12px] font-bold shadow-lg shadow-red-200">
                  Concluir Vistoria
                </div>
              </div>
            </div>
          </div>

          {/* Background Blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl -z-10" />
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="order-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm font-medium mb-6">
            <ShieldCheck className="w-4 h-4" />
            Amparo Jurídico
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight leading-tight">
            Vistoria digital <br />
            <span className="text-red-600">sem complicações.</span>
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            Evite dores de cabeça com clientes que alegam avarias que já
            existiam. Faça um checklist completo com fotos e assinatura digital
            direto do seu celular.
          </p>

          <ul className="space-y-4">
            {[
              "Checklist profissional e customizável.",
              "Marcação detalhada de avarias.",
              "Fotos ilimitadas com marca d'água.",
              "Assinatura digital do cliente na tela.",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-slate-700 font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
