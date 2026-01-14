"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Preciso instalar algum programa no computador?",
    answer:
      "Não! O Autevo é 100% online. Você acessa pelo navegador do seu computador, tablet ou celular, de onde estiver. Não precisa baixar nem instalar nada.",
  },
  {
    question: "Funciona bem no celular?",
    answer:
      "Sim, perfeitamente. Criamos um design específico para celular, para que você possa fazer vistorias, criar orçamentos e consultar placas direto do pátio, sem precisar ir até o escritório.",
  },
  {
    question: "Dá para emitir Nota Fiscal?",
    answer:
      "No momento estamos focados na gestão interna e controle financeiro. A emissão de NF-e será adicionada em breve, mas você já pode exportar relatórios prontos para sua contabilidade.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Com certeza. Usamos criptografia de ponta a ponta e backups diários automáticos. Seus dados estão mais seguros com a gente do que em um computador na oficina que pode queimar ou pegar vírus.",
  },
  {
    question: "Tem fidelidade ou multa de cancelamento?",
    answer:
      "Nenhuma. Você assina mês a mês e pode cancelar quando quiser, sem perguntas e sem letras miúdas. Queremos que você fique pelos resultados, não por contrato.",
  },
];

export function FAQSection() {
  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 tracking-tight">
            Dúvidas Frequentes
          </h2>
          <p className="text-slate-600 text-lg">
            Tire suas dúvidas e veja porque o Autevo é a escolha certa.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-slate-200"
            >
              <AccordionTrigger className="text-left text-slate-900 font-semibold text-lg hover:text-red-600 hover:no-underline px-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base leading-relaxed px-4 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
