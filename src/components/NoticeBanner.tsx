import React, { useState } from 'react';
import { ShieldCheck, Info, X, CheckCircle2 } from 'lucide-react';

interface NoticeBannerProps {
  onLearnMoreRules?: () => void;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({ onLearnMoreRules }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-emerald-50 border-b border-emerald-200/80 px-4 py-3 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-emerald-950">Diretriz de Transparência & Locação Real: </span>
            <span className="text-slate-600">
              Esta plataforma opera exclusivamente sob o modelo de locação temporária de veículos por período de uso. Não oferecemos investimentos, quotas ou promessas de rendimentos. Todas as diárias, depósitos de caução reembolsáveis e regras contratuais são formalizadas com laudo de vistoria.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          {onLearnMoreRules && (
            <button
              onClick={onLearnMoreRules}
              className="text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver regras e caução</span>
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Fechar aviso"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-emerald-100/50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
