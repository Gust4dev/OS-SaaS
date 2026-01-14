"use client";

import { motion } from "framer-motion";
import { MessageSquare, Bell, CheckCheck } from "lucide-react";

export function FeatureWhatsapp() {
  return (
    <section className="py-24 px-6 bg-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium mb-6">
          <MessageSquare className="w-4 h-4" />
          Automação Inteligente
        </div>
        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight leading-tight">
          Seu cliente avisado <br />
          <span className="text-green-600">sem você perder tempo.</span>
        </h2>
        <p className="text-slate-600 text-lg leading-relaxed">
          Pare de gastar o dia no WhatsApp respondendo "tá pronto?". O sistema
          avisa automaticamente quando o orçamento for criado, aprovado ou
          quando o carro estiver pronto.
        </p>
      </div>

      <div className="max-w-md mx-auto relative">
        {/* Fake WhatsApp Interface */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="bg-[#E5DDD5] rounded-[2rem] p-4 shadow-2xl border-8 border-slate-900 relative overflow-hidden"
        >
          <div className="bg-[#008069] p-4 -mx-4 -mt-4 mb-4 flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
              A
            </div>
            <div>
              <div className="font-bold">Autevo Oficina</div>
              <div className="text-xs opacity-80">comercial</div>
            </div>
          </div>

          <div className="space-y-4 font-sans text-sm pb-8">
            <div className="bg-white p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm max-w-[85%] text-slate-800">
              Olá João! O orçamento da sua revisão ficou pronto. 🛠️
              <br />
              <br />
              Valor total: R$ 850,00
              <br />
              Clique abaixo para ver os detalhes e aprovar:
              <br />
              <span className="text-blue-500 underline">
                autevo.com/orcamento/123
              </span>
              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-slate-400">10:42</span>
              </div>
            </div>

            <div className="bg-[#D9FDD3] p-3 rounded-tl-xl rounded-bl-xl rounded-br-xl shadow-sm ml-auto max-w-[85%] text-slate-800">
              Opa, maravilha! Já aprovei aí. Podem começar 👍
              <div className="flex justify-end gap-1 mt-1 items-center">
                <span className="text-[10px] text-slate-500">10:45</span>
                <CheckCheck className="w-3 h-3 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm max-w-[85%] text-slate-800">
              Perfeito! Já iniciamos o serviço. Te aviso assim que estiver
              pronto. 🚗💨
              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-slate-400">10:45</span>
              </div>
            </div>
          </div>

          {/* Floating Notifications */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute top-32 -right-20 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 w-64 border border-slate-100 hidden md:flex"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Orçamento Aprovado
              </div>
              <div className="text-xs text-slate-500">
                O cliente aprovou a troca de óleo e filtros.
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
