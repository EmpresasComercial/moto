import React from 'react';
import { Bike, ShieldCheck, MapPin, Phone, Mail, Clock, Scale } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'catalogo' | 'reservas' | 'cnh' | 'regras' | 'suporte') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
          {/* Col 1: Brand & Model note */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#00c853] flex items-center justify-center text-white font-bold shadow-md shadow-[#00c853]/25">
                <Bike className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">Asiary <span className="text-[#00c853]">Moto</span></span>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-sm">
              Plataforma para aluguel de motocicletas e veículos motorizados. Oferecemos locação transparente por período de uso com laudo de vistoria, caução 100% estornável e frota revisada com seguro contra terceiros e guincho 24h.
            </p>

            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#00c853]">
                <Scale className="w-3.5 h-3.5" />
                <span>Aviso de Conformidade Regulatória</span>
              </div>
              <p className="text-slate-400 leading-normal">
                Este serviço constitui estritamente locação de bens móveis (veículos motorizados). Não oferecemos nem intermediamos investimentos ou promessas de rendimentos.
              </p>
            </div>
          </div>

          {/* Col 2: Navegação Rápida */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Navegação</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('catalogo')}
                  className="hover:text-[#00c853] transition-colors cursor-pointer text-left"
                >
                  Catálogo de Motos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('reservas')}
                  className="hover:text-[#00c853] transition-colors cursor-pointer text-left"
                >
                  Minhas Reservas & Vistoria
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cnh')}
                  className="hover:text-[#00c853] transition-colors cursor-pointer text-left"
                >
                  Validação de CNH Cat. A
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('regras')}
                  className="hover:text-[#00c853] transition-colors cursor-pointer text-left"
                >
                  Regras de Caução & Multas
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Categorias de Veículos */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Categorias de Frota</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Econômicas (CG 160, Factor 150)</li>
              <li>Scooters Automáticas (PCX 160, NMAX)</li>
              <li>Trail & Aventura (Bros 160, Lander 250)</li>
              <li>100% Elétricas Urbanas (Voltz EVS)</li>
              <li>Clássicas & Touring (Hunter 350)</li>
            </ul>
          </div>

          {/* Col 4: Contato & Pátios */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Atendimento & Pátios</h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#00c853] shrink-0" />
                <span>0800 770 2026 (SOS 24h)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#00c853] shrink-0" />
                <span>contato@asiarymoto.com.br</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#00c853] shrink-0" />
                <span>Seg a Sáb: 07h às 20h</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#00c853] shrink-0 mt-0.5" />
                <span>Pátios em Centro, Congonhas, Pinheiros e Santo Amaro</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <div>
            © 2026 Asiary Moto Locadora de Veículos Ltda. • CNPJ: 42.190.812/0001-90 • Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('regras')}
              className="hover:text-[#00c853] transition-colors cursor-pointer"
            >
              Termos de Locação
            </button>
            <button
              onClick={() => onNavigate('regras')}
              className="hover:text-[#00c853] transition-colors cursor-pointer"
            >
              Política de Caução
            </button>
            <button
              onClick={() => onNavigate('suporte')}
              className="hover:text-[#00c853] transition-colors cursor-pointer"
            >
              Central de Ajuda
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
