import React, { useState } from 'react';
import { 
  Bike, 
  Landmark, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  Receipt, 
  FileText, 
  Clock, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  X,
  ExternalLink,
  ChevronRight,
  Headphones,
  Navigation,
  KeyRound,
  FileCheck2,
  CalendarCheck
} from 'lucide-react';
import { Motorcycle, UserProfile } from '../types';
import { ContinuousTopCarousel } from './ContinuousTopCarousel';

interface HomeViewProps {
  user: UserProfile;
  motorcycles: Motorcycle[];
  activeReservationsCount: number;
  onNavigateToRent: () => void;
  onNavigateToTeam: () => void;
  onNavigateToReservations: () => void;
  onNavigateToRules: () => void;
  onNavigateToDeposit: () => void;
  onNavigateToFaturas?: () => void;
  onOpenSupport: () => void;
  onSelectMotorcycleForBooking: (moto: Motorcycle) => void;
  onViewDetails: (moto: Motorcycle) => void;
}

// Mensagens informativas contínuas para o ticker deslizante (direita para a esquerda lentamente)
const TICKER_MESSAGES = [
  '🚀 Locação 100% transparente com diárias a partir de R$ 46/dia sem taxas ocultas',
  '⚡ Retirada expressa no pátio: veículo revisado, com tanque cheio e documentação em dia entregue em minutos',
  '🛡️ Caução 100% estornável via PIX ou IBAN em até 24h úteis após laudo de vistoria presencial sem avarias',
  '🏍️ Manutenção preventiva inclusa: troca de óleo e revisões periódicas custeadas pela locadora',
  '⛽ Quilometragem livre sem limite diário de KM para rodar com liberdade e segurança',
  '💳 Recarga de saldo e caução facilitada com dados bancários oficiais IBAN / SEPA e confirmação rápida',
  '📄 Faturamento transparente: emissão automática de fatura de locação e Nota Fiscal Eletrônica (NFS-e)',
  '📞 Central de socorro mecânico e SOS Guincho 24 Horas em toda a região metropolitana: 0800 770 2026',
];

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  motorcycles,
  activeReservationsCount,
  onNavigateToRent,
  onNavigateToTeam,
  onNavigateToReservations,
  onNavigateToRules,
  onNavigateToDeposit,
  onNavigateToFaturas,
  onOpenSupport,
  onSelectMotorcycleForBooking,
  onViewDetails,
}) => {
  // Modal de Retirada (Pátios credenciados e instruções para retirada da moto)
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);

  // Duplicamos as mensagens para criar um loop horizontal infinito e perfeitamente contínuo
  const duplicatedTicker = [...TICKER_MESSAGES, ...TICKER_MESSAGES];

  return (
    <div className="w-full max-w-7xl mx-auto pb-24 space-y-4 sm:space-y-5 animate-fade-in">
      
      {/* =========================================================
          1. CARROSSEL DE MOTOS (Toca mesmo no topo da página)
      ========================================================= */}
      <section id="home-top-carousel" className="w-full">
        <ContinuousTopCarousel
          motorcycles={motorcycles}
          onSelectMotorcycle={onSelectMotorcycleForBooking}
          onViewDetails={onViewDetails}
        />
      </section>

      {/* =========================================================
          2. BANNER DESLIZANTE CONTÍNUO (Direita à Esquerda Lentamente)
      ========================================================= */}
      <section 
        id="home-marquee-banner" 
        className="w-full bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md overflow-hidden relative"
      >
        <div className="flex items-center">
          {/* Badge fixo à esquerda com indicação visual */}
          <div className="shrink-0 bg-[#00c853] text-white px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 z-20 shadow-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="hidden xs:inline">Comunicados Oficiais</span>
            <span className="xs:hidden">Avisos</span>
          </div>

          {/* Área de texto em movimento contínuo */}
          <div className="relative flex-1 overflow-hidden py-2.5 sm:py-3">
            {/* Gradientes laterais suaves para entrada e saída imperceptíveis */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-r from-slate-900 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-l from-slate-900 to-transparent z-10" />

            <div className="animate-text-ticker flex items-center gap-8 sm:gap-12 whitespace-nowrap">
              {duplicatedTicker.map((msg, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 text-xs sm:text-[13px] font-medium text-slate-200 tracking-wide select-none"
                >
                  <span>{msg}</span>
                  <span className="text-[#00c853] font-bold">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          3. BOTÕES DE ATALHO (Retirar, Recarregar, Aluguel)
      ========================================================= */}
      <section id="home-action-shortcuts" className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          
          {/* BOTÃO 1: RETIRAR */}
          <button
            id="btn-atalho-retirar"
            onClick={() => setIsPickupModalOpen(true)}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#00c853] hover:shadow-lg transition-all text-left group cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#eafff2] text-[#00c853] flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 group-hover:bg-[#eafff2] group-hover:text-[#009935] transition-colors flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#00c853]" />
                {activeReservationsCount > 0 ? `${activeReservationsCount} Pronta p/ Retirar` : '4 Pátios Ativos'}
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-[#009935] transition-colors flex items-center gap-1.5">
                <span>Retirar Moto</span>
                <ArrowRight className="w-4 h-4 text-[#00c853] group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Consulte os pátios credenciados, código de liberação e laudo de vistoria para retirada expressa.
              </p>
            </div>
          </button>

          {/* BOTÃO 2: RECARREGAR */}
          <button
            id="btn-atalho-recarregar"
            onClick={onNavigateToDeposit}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-lg transition-all text-left group cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <Landmark className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-600" />
                Depósito IBAN & SEPA
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-teal-700 transition-colors flex items-center gap-1.5">
                <span>Recarregar</span>
                <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Deposite saldo na sua carteira, pague cauções reembolsáveis ou envie comprovantes de pagamento.
              </p>
            </div>
          </button>

          {/* BOTÃO 3: ALUGUEL */}
          <button
            id="btn-atalho-aluguel"
            onClick={onNavigateToRent}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#00c853] hover:shadow-lg transition-all text-left group cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#00c853] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-[#00c853]/25">
                <Bike className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#eafff2] text-[#007a2a] border border-[#9bf6c4]">
                Diárias a R$ 46/dia
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-[#009935] transition-colors flex items-center gap-1.5">
                <span>Aluguel</span>
                <ArrowRight className="w-4 h-4 text-[#00c853] group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Veja o catálogo completo de motos, modelos 125cc a 300cc com quilometragem livre e seguro.
              </p>
            </div>
          </button>

        </div>
      </section>

      {/* =========================================================
          4. INFORMAÇÕES DA EMPRESA & FATURAMENTO
      ========================================================= */}
      <section id="home-company-info" className="w-full bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-6">
        
        {/* Cabeçalho da Seção Institucional */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-[#009935] block">
                Transparência & Dados Oficiais
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Informações da Empresa & Faturamento
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#00c853]" />
            <span>Operação Formalizada e Conforme a Legislação</span>
          </div>
        </div>

        {/* Grade com os 4 Blocos Corporativos Oficiais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* BLOCO 1: DADOS CADASTRAIS & CNPJ */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Building2 className="w-4 h-4 text-[#00c853]" />
                <span>Dados Corporativos</span>
              </div>
              <div className="space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <div><strong>Razão Social:</strong> Asiary Moto Locadora e Mobilidade Urbana S.A.</div>
                <div><strong>Nome Fantasia:</strong> Asiary Moto Brasil & Europa</div>
                <div><strong>CNPJ Oficial:</strong> 48.293.104/0001-82</div>
                <div><strong>Inscrição Estadual:</strong> 114.892.401.119</div>
                <div><strong>CNAE:</strong> 77.11-0-00 (Locação de Veículos sem Condutor)</div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200 text-[10px] text-[#007a2a] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00c853]" />
              <span>Situação Cadastral: Ativa e Regular</span>
            </div>
          </div>

          {/* BLOCO 2: FATURAMENTO & NOTAS FISCAIS */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Receipt className="w-4 h-4 text-[#00c853]" />
                <span>Faturamento & Fiscal</span>
              </div>
              <div className="space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <div><strong>Emissão de Fatura:</strong> Automática a cada ciclo de locação (diário ou semanal).</div>
                <div><strong>Nota Fiscal (NFS-e):</strong> Enviada para o e-mail cadastrado com chave de validação.</div>
                <div><strong>Recibo de Caução:</strong> Documento formal assinado digitalmente com valor retido.</div>
                <div><strong>Estorno de Caução:</strong> 100% devolvida em até 24h a 48h úteis pós-vistoria sem avarias.</div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-medium space-y-1">
              <div>E-mail: <strong className="text-slate-700">faturamento@asiarymoto.com</strong></div>
              {onNavigateToFaturas && (
                <button
                  type="button"
                  onClick={onNavigateToFaturas}
                  className="text-[10px] text-[#007a2a] font-bold hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                >
                  <span>Acessar painel de faturas e refaturas</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* BLOCO 3: SEDE & PÁTIOS OFICIAIS */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <MapPin className="w-4 h-4 text-[#00c853]" />
                <span>Sede & Pátios de Retirada</span>
              </div>
              <div className="space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <div><strong>Sede Matriz:</strong> Av. das Nações Unidas, 14.401 - Chácara Santo Antônio, São Paulo - SP</div>
                <div><strong>Polo Europa:</strong> Av. da Liberdade, 245 - Lisboa, Portugal</div>
                <div><strong>Pátios SP:</strong> Centro (República), Aeroporto (24h), Pinheiros e Santo Amaro</div>
                <div><strong>Horário Geral:</strong> Seg a Sáb: 08h às 20h | SOS 24h</div>
              </div>
            </div>
            <button
              onClick={() => setIsPickupModalOpen(true)}
              className="pt-2 border-t border-slate-200 text-[10px] text-[#007a2a] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver detalhes e endereços dos pátios</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* BLOCO 4: CONTATO & CENTRAL 24 HORAS */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Phone className="w-4 h-4 text-[#00c853]" />
                <span>Atendimento & Suporte</span>
              </div>
              <div className="space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <div><strong>Central Telefônica:</strong> 0800 770 2026 (Ligação Gratuita)</div>
                <div><strong>WhatsApp Atendimento:</strong> +55 (11) 98842-2026</div>
                <div><strong>E-mail Geral:</strong> contato@asiarymoto.com</div>
                <div><strong>SOS Guincho 24h:</strong> Reboque imediato em caso de pane ou acidente na via</div>
              </div>
            </div>
            <button
              onClick={onOpenSupport}
              className="pt-2 border-t border-slate-200 text-[10px] text-purple-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Headphones className="w-3 h-3" />
              <span>Abrir Chamado com Suporte Técnico</span>
            </button>
          </div>

        </div>

        {/* Rodapé Informativo de Transparência */}
        <div className="bg-[#eafff2] rounded-2xl border border-[#9bf6c4] p-4 text-xs text-[#00591e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#00c853] shrink-0" />
            <div>
              <span className="font-bold">Locação Formal & Segura: </span>
              <span>Todos os contratos possuem validade jurídica, termo de vistoria com registro fotográfico e cobertura securitária para o condutor.</span>
            </div>
          </div>
          <button
            onClick={onNavigateToRules}
            className="text-[11px] font-bold text-[#007a2a] hover:text-[#00591e] underline whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            Consultar Termos & Regras de Caução
          </button>
        </div>

      </section>

      {/* =========================================================
          MODAL INTERATIVO: RETIRAR MOTO & PÁTIOS CREDENCIADOS
      ========================================================= */}
      {isPickupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-5">
            
            {/* Topo do Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#eafff2] text-[#00c853] flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Retirada de Motocicleta
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pátios credenciados e instruções para retirada presencial
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPickupModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status da Reserva Atual do Usuário */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Status do Usuário</span>
              {activeReservationsCount > 0 ? (
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-[#009935] font-bold">
                    <CheckCircle2 className="w-4 h-4 text-[#00c853]" />
                    <span>Você possui {activeReservationsCount} reserva ativa pronta para retirada!</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsPickupModalOpen(false);
                      onNavigateToReservations();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#00c853] text-white font-bold text-xs hover:bg-[#00b341] transition-colors cursor-pointer"
                  >
                    Ver Minhas Reservas
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-slate-600">
                    Você ainda não possui reserva ativa. Escolha um modelo no catálogo para retirar no pátio mais próximo.
                  </div>
                  <button
                    onClick={() => {
                      setIsPickupModalOpen(false);
                      onNavigateToRent();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#00c853] text-white font-bold text-xs hover:bg-[#00b341] transition-colors cursor-pointer"
                  >
                    Ir para Aluguel
                  </button>
                </div>
              )}
            </div>

            {/* Pátios Oficiais de Retirada */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00c853]" />
                <span>Pátios Oficiais Asiary Moto para Retirada</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Unidade Centro (República)</span>
                    <span className="text-[10px] font-bold text-[#009935] bg-[#eafff2] px-2 py-0.5 rounded-md">12 motos</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Praça da República, 240 - Centro, São Paulo</p>
                  <p className="text-slate-400 text-[10px]">Horário: Seg a Sáb das 07h às 20h</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Unidade Aeroporto (Congonhas)</span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">24 Horas</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Av. Washington Luís, 6500 - Campo Belo, São Paulo</p>
                  <p className="text-slate-400 text-[10px]">Plantão 24h para retiradas e devoluções</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Unidade Pinheiros</span>
                    <span className="text-[10px] font-bold text-[#009935] bg-[#eafff2] px-2 py-0.5 rounded-md">15 motos</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Rua dos Pinheiros, 820 - Pinheiros, São Paulo</p>
                  <p className="text-slate-400 text-[10px]">Horário: Seg a Sáb das 08h às 19h</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Unidade Santo Amaro</span>
                    <span className="text-[10px] font-bold text-[#009935] bg-[#eafff2] px-2 py-0.5 rounded-md">9 motos</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Av. Adolfo Pinheiro, 1100 - Santo Amaro, São Paulo</p>
                  <p className="text-slate-400 text-[10px]">Horário: Seg a Sex das 07h às 19h</p>
                </div>

              </div>
            </div>

            {/* Checklist rápido para retirar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-[#00c853]" />
                <span>Documentos Necessários no Pátio</span>
              </h5>
              <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
                <li>CNH definitiva ou provisória válida Categoria A física ou digital (app CNH Digital).</li>
                <li>Comprovante de reserva ou confirmação da locação no aplicativo.</li>
                <li>Assinatura digital do laudo fotográfico de vistoria de entrega com o vistoriador do pátio.</li>
              </ul>
            </div>

            {/* Botões do Modal */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsPickupModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setIsPickupModalOpen(false);
                  onNavigateToRent();
                }}
                className="px-5 py-2.5 rounded-xl bg-[#00c853] text-white text-xs font-bold hover:bg-[#00b341] transition-colors shadow-md shadow-[#00c853]/25 cursor-pointer flex items-center gap-1.5"
              >
                <Bike className="w-4 h-4" />
                <span>Escolher Moto no Catálogo</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
