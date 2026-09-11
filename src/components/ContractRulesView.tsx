import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Fuel, 
  Clock, 
  Scale, 
  CreditCard,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { CONTRACT_RULES } from '../data/initialData';

interface ContractRulesViewProps {
  onOpenSupport: () => void;
  onNavigateToCatalog: () => void;
}

export const ContractRulesView: React.FC<ContractRulesViewProps> = ({
  onOpenSupport,
  onNavigateToCatalog,
}) => {
  const [activeCategory, setActiveCategory] = useState<'todas' | 'caucao' | 'devolucao' | 'multas' | 'seguro' | 'manutencao'>('todas');
  const [expandedFaq, setExpandedFaq] = useState<string | null>('cr-1');

  const filteredRules = activeCategory === 'todas'
    ? CONTRACT_RULES
    : CONTRACT_RULES.filter((r) => r.category === activeCategory);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Regras Contratuais, Caução & Transparência
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Entenda claramente como funciona a locação, prazos de estorno da caução e a tabela de encargos.
          </p>
        </div>

        <button
          onClick={onOpenSupport}
          className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>Falar com o Suporte</span>
        </button>
      </div>

      {/* Strict Compliance Statement Box */}
      <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-6 shadow-xs relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                Modelo de Locação de Veículos
              </span>
              <span className="text-xs text-slate-500 font-medium">Conformidade Legal</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Serviço Exclusivo de Locação por Período de Uso
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              A Asiary Moto opera estritamente no formato de <strong className="text-slate-900">locação de veículos motorizados</strong>, com pagamento fixado pelo período de uso contratado (diária, semanal ou mensal), depósito de garantia (caução) temporário e regras contratuais objetivas. Não apresentamos nem promovemos o aluguel como investimento, promessa de rentabilidade ou distribuição de rendimentos.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Transparency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Caução Reembolsável</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Depósito de segurança retido durante o uso e 100% devolvido em 24h a 48h após vistoria sem avarias.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Fuel className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Combustível no Mesmo Nível</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Entregamos a moto com tanque cheio. Devolvendo cheio, nenhuma taxa de combustível é cobrada.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Tolerância de 29 Minutos</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tolerância de cortesia para o trânsito da cidade na devolução do veículo no pátio credenciado.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Manutenção Preventiva</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Troca de óleo, pastilhas e revisões por desgaste natural são 100% custeadas pela locadora.
          </p>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'todas', label: 'Todas as Cláusulas' },
          { id: 'caucao', label: 'Depósito de Caução' },
          { id: 'devolucao', label: 'Prazos & Combustível' },
          { id: 'multas', label: 'Infrações de Trânsito' },
          { id: 'seguro', label: 'Seguro & Guincho' },
          { id: 'manutencao', label: 'Revisões & Cuidados' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Interactive Accordion of Rules */}
      <div className="space-y-3">
        {filteredRules.map((rule) => {
          const isExpanded = expandedFaq === rule.id;
          return (
            <div
              key={rule.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => setExpandedFaq(isExpanded ? null : rule.id)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{rule.title}</h4>
                    {rule.importantTag && (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded mt-0.5 inline-block">
                        {rule.importantTag}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {rule.valueOrPenalty && (
                    <span className="hidden sm:inline-block text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {rule.valueOrPenalty}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 text-xs text-slate-600 space-y-3">
                  <p className="leading-relaxed">{rule.description}</p>
                  {rule.valueOrPenalty && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Valor de referência / Prazo:</span>
                      <span className="font-bold text-emerald-900 text-sm">{rule.valueOrPenalty}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Official Table of Operational Fees & Penalties */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Tabela Oficial de Taxas Operacionais e Eventuais Multas
        </h3>
        <p className="text-xs text-slate-500">
          Valores aplicados somente quando houver descumprimento das condições de devolução ou autuação em vias públicas:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3 px-4">Ocorrência Contratual</th>
                <th className="py-3 px-4">Regra Aplicável</th>
                <th className="py-3 px-4">Valor / Cobrança</th>
                <th className="py-3 px-4">Destino Financeiro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Tanque de Combustível Incompleto</td>
                <td className="py-3 px-4">Devolução com nível abaixo do laudo fotográfico inicial</td>
                <td className="py-3 px-4 font-bold text-slate-900">R$ 6,50/litro + R$ 25,00 taxa de posto</td>
                <td className="py-3 px-4 text-slate-500">Deduzido da caução ou cobrado no balcão</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Atraso na Devolução (&gt; 29 min)</td>
                <td className="py-3 px-4">Até 3 horas de tolerância estendida</td>
                <td className="py-3 px-4 font-bold text-slate-900">R$ 15,00 por hora adicional</td>
                <td className="py-3 px-4 text-slate-500">Acrescido no fechamento do contrato</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Multa de Trânsito (Detran/DSV/PRF)</td>
                <td className="py-3 px-4">Notificação de excesso de velocidade, rodízio ou sinal</td>
                <td className="py-3 px-4 font-bold text-slate-900">Valor da multa + R$ 35,00 taxa administrativa</td>
                <td className="py-3 px-4 text-slate-500">Indicação de pontos na CNH do condutor</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Perda de Chave ou Documento Físico</td>
                <td className="py-3 px-4">Não entrega na devolução do veículo</td>
                <td className="py-3 px-4 font-bold text-slate-900">R$ 120,00 (chave) / R$ 60,00 (segunda via CRLV)</td>
                <td className="py-3 px-4 text-slate-500">Custo de cópia e confecção do chaveiro</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Capacete Danificado ou Extraviado</td>
                <td className="py-3 px-4">Acessório opcional contratado não restituído íntegro</td>
                <td className="py-3 px-4 font-bold text-slate-900">R$ 180,00 (reposição de capacete novo homologado)</td>
                <td className="py-3 px-4 text-slate-500">Substituição do equipamento de proteção</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
