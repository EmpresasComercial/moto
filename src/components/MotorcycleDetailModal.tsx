import React from 'react';
import { 
  X, 
  Fuel, 
  Gauge, 
  ShieldCheck, 
  Zap, 
  Wrench, 
  CheckCircle2, 
  MapPin, 
  ArrowRight,
  Info,
  Calendar,
  Lock
} from 'lucide-react';
import { Motorcycle } from '../types';

interface MotorcycleDetailModalProps {
  motorcycle: Motorcycle | null;
  onClose: () => void;
  onBookNow: (moto: Motorcycle) => void;
}

export const MotorcycleDetailModal: React.FC<MotorcycleDetailModalProps> = ({
  motorcycle,
  onClose,
  onBookNow,
}) => {
  if (!motorcycle) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header with Image */}
        <div className="relative h-64 sm:h-72 bg-slate-900 shrink-0">
          <img
            src={motorcycle.image}
            alt={motorcycle.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Bottom Title on Image */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#00c853] text-white shadow-xs">
                {motorcycle.brand}
              </span>
              <span className="text-xs text-[#00c853] font-bold">Ano {motorcycle.year}</span>
              <span className="text-xs text-slate-300">• Placa {motorcycle.plateMask}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{motorcycle.name}</h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-0.5">{motorcycle.popularFor}</p>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 bg-white">
          {/* Price & Deposit Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#eafff2] border border-[#9bf6c4] rounded-2xl p-4 shadow-2xs">
              <span className="text-xs text-slate-600 font-medium">Diária Regular</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                R$ {motorcycle.dailyRate}
                <span className="text-xs font-normal text-slate-600"> / dia</span>
              </div>
              <span className="text-[11px] text-[#009935] font-bold block mt-1">
                Quilometragem livre inclusa
              </span>
            </div>

            <div className="bg-[#eafff2] border border-[#9bf6c4] rounded-2xl p-4 shadow-2xs">
              <span className="text-xs text-slate-600 font-medium">Plano Semanal (7+ dias)</span>
              <div className="text-2xl font-extrabold text-[#009935] mt-0.5">
                R$ {motorcycle.weeklyRateDailyEquivalent}
                <span className="text-xs font-normal text-[#007a2a]"> / dia</span>
              </div>
              <span className="text-[11px] text-[#009935] font-bold block mt-1">
                Economia aplicada automaticamente
              </span>
            </div>

            <div className="bg-white border border-slate-200 shadow-2xs rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Caução (Garantia)</span>
                <Lock className="w-3.5 h-3.5 text-[#00c853]" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                R$ {motorcycle.securityDeposit}
              </div>
              <span className="text-[11px] text-slate-600 block mt-1 font-medium">
                100% estornável após vistoria final
              </span>
            </div>
          </div>

          {/* Technical Specs Table */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#00c853]" />
              Especificações Técnicas
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block">Cilindrada / Motor</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {typeof motorcycle.engineCc === 'number' ? `${motorcycle.engineCc} cc` : motorcycle.engineCc}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block">Potência</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {motorcycle.powerHp}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block">Transmissão</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {motorcycle.transmission}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block">Combustível</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {motorcycle.fuelType}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block">Consumo Médio</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {motorcycle.consumptionKmPerL}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block">Sistema de Freios</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {motorcycle.brakeSystem}
                </span>
              </div>
            </div>
          </div>

          {/* Features and Included Benefits */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00c853]" />
              Itens Inclusos na Locação
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2.5 bg-[#eafff2] rounded-xl text-[#007a2a] border border-[#9bf6c4]">
                <CheckCircle2 className="w-4 h-4 text-[#00c853] shrink-0" />
                <span>Seguro obrigatório contra terceiros e roubo/furto</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-[#eafff2] rounded-xl text-[#007a2a] border border-[#9bf6c4]">
                <CheckCircle2 className="w-4 h-4 text-[#00c853] shrink-0" />
                <span>Assistência técnica e guincho 24h na Grande SP</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-[#eafff2] rounded-xl text-[#007a2a] border border-[#9bf6c4]">
                <CheckCircle2 className="w-4 h-4 text-[#00c853] shrink-0" />
                <span>Manutenção preventiva e troca de óleo periódica</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-[#eafff2] rounded-xl text-[#007a2a] border border-[#9bf6c4]">
                <CheckCircle2 className="w-4 h-4 text-[#00c853] shrink-0" />
                <span>Suporte a aplicativo e telefone de plantão</span>
              </div>
              {motorcycle.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00c853] shrink-0"></span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Locations where available */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#00c853]" />
              Pátios Disponíveis para Retirada
            </h3>
            <div className="space-y-2">
              {motorcycle.locations.map((loc, idx) => (
                <div key={idx} className="text-xs text-slate-700 flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <MapPin className="w-3.5 h-3.5 text-[#00c853] shrink-0" />
                  <span>{loc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transparency note */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Regra Contratual de Caução: </span>
              O depósito de segurança de R$ {motorcycle.securityDeposit} é retido preventivamente no ato da locação e estornado em até 24h a 48h úteis após a devolução com laudo de vistoria concluído sem pendências.
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-6 bg-white border-t border-slate-200 flex items-center justify-between gap-4 shrink-0 shadow-xs">
          <div>
            <span className="text-xs text-slate-500">Valor da diária:</span>
            <div className="text-xl font-black text-slate-900">
              R$ {motorcycle.dailyRate} <span className="text-xs font-normal text-slate-600">/dia</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#eafff2] hover:bg-[#cbfae0] border border-[#00c853] text-[#007a2a] text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              Fechar
            </button>
            <button
              id="modal-book-now-btn"
              onClick={() => {
                onClose();
                onBookNow(motorcycle);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#00c853] hover:bg-[#00b341] text-white text-xs font-black shadow-md shadow-[#00c853]/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Alugar Esta Moto</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
