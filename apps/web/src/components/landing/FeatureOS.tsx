"use client";

import { motion } from "framer-motion";
import { FileText, Camera, CheckSquare } from "lucide-react";

export function FeatureOS() {
  return (
    <section className="py-24 px-6 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="order-2 lg:order-1"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-6">
            <FileText className="w-4 h-4" />
            Coração da Oficina
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight leading-tight">
            Ordem de Serviço <br />
            <span className="text-indigo-600">rápida e profissional.</span>
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            Abandone o bloco de papel. Crie uma OS detalhada em segundos,
            adicione peças, serviços e envie para o cliente aprovar direto no
            celular.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <Camera className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  Fotos do Antes e Depois
                </h4>
                <p className="text-slate-600">
                  Registre o estado do veículo na entrada e prove o serviço
                  feito na saída. Fim das reclamações indevidas.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <CheckSquare className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  Checklist de Entrada
                </h4>
                <p className="text-slate-600">
                  Marque nível de combustível, quilometragem e itens deixados no
                  carro. Segurança total.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Visual Abstract UI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="order-1 lg:order-2 relative"
        >
          {/* Abstract OS Card */}
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 md:p-8 rotate-3 transition-transform hover:rotate-0 duration-500">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
              <div>
                <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                <div className="h-3 w-20 bg-slate-100 rounded" />
              </div>
              <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase">
                Em Andamento
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between">
                <div className="h-4 w-40 bg-slate-100 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-48 bg-slate-100 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-36 bg-slate-100 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
              </div>
            </div>

            <div className="flex gap-2 mb-8">
              <div className="h-16 w-16 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Camera className="w-6 h-6 text-indigo-300" />
              </div>
              <div className="h-16 w-16 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Camera className="w-6 h-6 text-indigo-300" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <div className="text-sm text-slate-500">Total:</div>
              <div className="text-2xl font-bold text-slate-900">
                R$ 1.450,00
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/5 blur-[80px] rounded-full mix-blend-multiply" />
        </motion.div>
      </div>
    </section>
  );
}
