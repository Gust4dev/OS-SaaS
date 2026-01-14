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
          <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3rem] p-4 shadow-2xl border-[8px] border-slate-900 ring-1 ring-slate-900/10">
            {/* Screen Content */}
            <div className="w-full h-full bg-slate-50 rounded-[2rem] overflow-hidden relative">
              {/* Header */}
              <div className="h-14 bg-white border-b border-slate-100 flex items-center justify-center font-bold text-slate-800">
                Vistoria #4023
              </div>
              {/* Car Diagram Abstract */}
              <div className="p-6 flex flex-col items-center gap-6 mt-4">
                <div className="w-40 h-64 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center relative bg-slate-100">
                  <div className="absolute top-4 left-4 w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  <div className="absolute bottom-10 right-4 w-4 h-4 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                  <span className="text-slate-400 text-xs">
                    Diagrama do Veículo
                  </span>
                </div>

                <div className="w-full space-y-3">
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="text-xs text-red-700 font-medium">
                      Lateral Esquerda: Amassado
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div className="text-xs text-amber-700 font-medium">
                      Farol Traseiro: Quebrado
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating Action Button */}
              <div className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white">
                <ScanLine className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Background Blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl -z-10" />
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="order-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-6">
            <ShieldCheck className="w-4 h-4" />
            Segurança Garantida
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight leading-tight">
            Vistoria digital <br />
            <span className="text-indigo-600">na palma da mão.</span>
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            Evite dores de cabeça com clientes que alegam avarias que já
            existiam. Faça uma vistoria completa em minutos direto do seu
            celular.
          </p>

          <ul className="space-y-4">
            {[
              "Diagrama visual intuitivo.",
              "Marcação de avarias com toque.",
              "Fotos ilimitadas por vistoria.",
              "Cliente assina na tela do celular.",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-slate-700 font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
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
