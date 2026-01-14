"use client";

import { motion } from "framer-motion";
import { DollarSign, TrendingUp } from "lucide-react";

export function FeatureFinance() {
  return (
    <section
      id="financeiro"
      className="py-24 px-6 bg-slate-50 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="order-2 lg:order-1"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6">
            <DollarSign className="w-4 h-4" />
            Lucro Real
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight leading-tight">
            Você realmente sabe <br />
            <span className="text-emerald-600">quanto está ganhando?</span>
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            Chega de misturar CPF com CNPJ. Tenha controle financeiro
            profissional e saiba exatamente quanto sua oficina lucra no fim do
            mês.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                Fluxo de Caixa
              </h4>
              <p className="text-slate-500 text-sm">
                Entradas e saídas diárias, semanais e mensais. Previsibilidade
                total.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                Comissões
              </h4>
              <p className="text-slate-500 text-sm">
                Cálculo automático de comissão por serviço ou peça para cada
                mecânico.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Visual Abstract Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="order-1 lg:order-2 relative"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-sm text-slate-500">
                  Lucro Líquido (Mês Atual)
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  R$ 24.580,00
                </div>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            {/* Abstract Chart Bars */}
            <div className="flex items-end gap-3 h-48 w-full">
              {[40, 65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className={`flex-1 rounded-t-lg ${
                    i % 2 === 0 ? "bg-emerald-500" : "bg-emerald-300"
                  }`}
                />
              ))}
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">Mecânico do Mês</div>
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                João P. (R$ 4.2k)
              </div>
            </div>
          </div>
          {/* Background Decoration */}
          <div className="absolute inset-0 bg-emerald-500/5 blur-3xl transform -skew-y-6 rounded-3xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
}
