import React, { useState, useId } from 'react';
import { 
  Search, 
  Filter, 
  Bike, 
  Fuel, 
  Gauge, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Info,
  Calendar,
  Clock,
  DollarSign,
  HelpCircle,
  FileCheck,
  Check,
  AlertCircle,
  Wrench,
  Shield,
  ChevronDown,
  ChevronUp,
  Calculator,
  Zap,
  TrendingDown,
  Award
} from 'lucide-react';
import { Motorcycle, PickupLocation, VehicleCategory } from '../types';

interface ProductsRentViewProps {
  motorcycles: Motorcycle[];
  locations: PickupLocation[];
  onSelectMotorcycleForBooking: (moto: Motorcycle) => void;
  onViewDetails: (moto: Motorcycle) => void;
  onNavigateToRules: () => void;
}

type RentalNavSection = 'todos' | 'catalogo' | 'planos' | 'inclusoes' | 'requisitos' | 'simulador' | 'faq';

export const ProductsRentView: React.FC<ProductsRentViewProps> = ({
  motorcycles,
  locations,
  onSelectMotorcycleForBooking,
  onViewDetails,
  onNavigateToRules,
}) => {
  const [activeSection, setActiveSection] = useState<RentalNavSection>('todos');
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>('todas');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Simulator State
  const [simDays, setSimDays] = useState<number>(7);
  const [simCategory, setSimCategory] = useState<VehicleCategory>('economica');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const categories: { id: VehicleCategory; label: string }[] = [
    { id: 'todas', label: 'Todas as Motos' },
    { id: 'economica', label: 'Econômica & Trabalho' },
    { id: 'scooter', label: 'Scooter Automática' },
    { id: 'trail', label: 'Trail & Aventura' },
    { id: 'eletrica', label: '100% Elétrica' },
    { id: 'touring', label: 'Clássica & Lazer' },
  ];

  const filteredMotorcycles = motorcycles.filter((moto) => {
    const matchesCategory = selectedCategory === 'todas' || moto.category === selectedCategory;
    const matchesLocation =
      selectedLocation === 'all' || moto.locations.some((loc) => loc.includes(selectedLocation));
    const matchesSearch =
      moto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      moto.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      moto.popularFor.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesLocation && matchesSearch;
  });

  // Simulator calculations
  const simMotoSample = motorcycles.find((m) => m.category === simCategory) || motorcycles[0];
  const simDailyRate = simDays >= 30 
    ? Math.round(simMotoSample.dailyRate * 0.65) 
    : simDays >= 7 
    ? simMotoSample.weeklyRateDailyEquivalent 
    : simMotoSample.dailyRate;
  const simTotal = simDailyRate * simDays;
  const simStandardTotal = simMotoSample.dailyRate * simDays;
  const simDiscountTotal = simStandardTotal - simTotal;

  const faqs = [
    {
      q: 'Como funciona o estorno do depósito de caução?',
      a: 'A caução é retida preventivamente no momento da contratação e permanece resguardada. Ao devolver a moto e concluir o laudo pericial de vistoria no pátio sem avarias, o valor é 100% estornado via PIX ou estorno no cartão em até 24h a 48h úteis.'
    },
    {
      q: 'Posso usar a moto alugada para entregas em aplicativos (iFood, Rappi, Loggi)?',
      a: 'Sim! Nossos planos Semanais e Mensais foram concebidos com quilometragem livre e manutenção preventiva inclusa, sendo altamente recomendados para entregadores profissionais de aplicativos.'
    },
    {
      q: 'O que está incluso na manutenção preventiva gratuita?',
      a: 'Troca de óleo periódica a cada 1.500 km rodados, ajuste e lubrificação de corrente, revisão de freios (pastilhas e lonas) e lâmpadas, tudo realizado em oficinas credenciadas sem custo adicional para o locatário.'
    },
    {
      q: 'E se a moto apresentar alguma pane na via?',
      a: 'Você conta com nosso SOS Mecânico e Guincho 24 horas gratuito. Se o reparo não puder ser feito na hora, você recebe uma moto reserva equivalente para não interromper seu trabalho ou viagem.'
    },
    {
      q: 'Quais documentos são exigidos para retirar a moto?',
      a: 'CNH Categoria A válida (definitiva ou provisória), documento oficial de identidade, comprovante de endereço recente em seu nome e aprovação de cadastro na plataforma.'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 animate-fade-in">
      {/* 1. DEDICATED RENTAL HEADER BANNER */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eafff2] text-[#009935] text-xs font-black border border-[#9bf6c4]">
              <Bike className="w-3.5 h-3.5 text-[#00c853]" />
              <span>PÁGINA EXCLUSIVA DE ALUGUEL & LOCAÇÃO</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Informações de Aluguel, Planos & Frota Disponível
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Consulte todas as condições de locação, compare os planos <strong>Diário</strong>, <strong>Semanal (15% OFF)</strong> e <strong>Mensal (35% OFF)</strong>, entenda como funciona a caução 100% estornável e escolha sua motocicleta para retirada imediata.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <Check className="w-3.5 h-3.5 text-[#00c853]" />
                Quilometragem Livre
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <Check className="w-3.5 h-3.5 text-[#00c853]" />
                Manutenção Inclusa
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <Check className="w-3.5 h-3.5 text-[#00c853]" />
                Seguro & Guincho 24h
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <Check className="w-3.5 h-3.5 text-[#00c853]" />
                Caução 100% Estornável
              </span>
            </div>
          </div>

          {/* Quick Rental Stats Card */}
          <div className="bg-[#eafff2] rounded-2xl p-5 border border-[#9bf6c4] text-xs space-y-3 shrink-0 lg:w-72 shadow-2xs">
            <span className="font-extrabold text-[#007a2a] uppercase tracking-wider text-[10px] block">
              Condições em Destaque
            </span>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-[#9bf6c4]/60">
                <span className="text-slate-700 font-medium">Diárias a partir de:</span>
                <span className="text-base font-black text-[#007a2a]">R$ 46,00</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#9bf6c4]/60">
                <span className="text-slate-700 font-medium">No Plano Mensal:</span>
                <span className="font-black text-[#007a2a]">R$ 32/dia (-35%)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#9bf6c4]/60">
                <span className="text-slate-700 font-medium">Estorno da Caução:</span>
                <span className="font-black text-slate-900">24h a 48h úteis</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-700 font-medium">Oficinas Parceiras:</span>
                <span className="font-black text-[#007a2a]">Gratuitas</span>
              </div>
            </div>

            <button
              onClick={() => {
                const el = document.getElementById('catalogo-motos');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full py-2.5 bg-[#00c853] hover:bg-[#00b341] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#00c853]/25 transition-all text-center cursor-pointer block"
            >
              Ver Motos Disponíveis
            </button>
          </div>
        </div>
      </section>

      {/* 2. SUB-NAVIGATION PILLS TO EXPLORE RENTAL SECTIONS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        <button
          onClick={() => setActiveSection('todos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'todos'
              ? 'bg-[#00c853] text-white font-black shadow-md shadow-[#00c853]/25'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#eafff2] hover:text-[#009935]'
          }`}
        >
          Visão Geral Completa
        </button>

        <button
          onClick={() => setActiveSection('catalogo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'catalogo'
              ? 'bg-[#00c853] text-white font-black shadow-md shadow-[#00c853]/25'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#eafff2] hover:text-[#009935]'
          }`}
        >
          Frota de Motos ({filteredMotorcycles.length})
        </button>

        <button
          onClick={() => setActiveSection('planos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'planos'
              ? 'bg-[#00c853] text-white font-black shadow-md shadow-[#00c853]/25'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#eafff2] hover:text-[#009935]'
          }`}
        >
          Planos de Aluguel (Diário, Semanal, Mensal)
        </button>

        <button
          onClick={() => setActiveSection('simulador')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'simulador'
              ? 'bg-[#00c853] text-white font-black shadow-md shadow-[#00c853]/25'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#eafff2] hover:text-[#009935]'
          }`}
        >
          Simulador de Economia
        </button>

        <button
          onClick={() => setActiveSection('inclusoes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'inclusoes'
              ? 'bg-[#00c853] text-white font-black shadow-md shadow-[#00c853]/25'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#eafff2] hover:text-[#009935]'
          }`}
        >
          O Que Está Incluso & Caução
        </button>

        <button
          onClick={() => setActiveSection('requisitos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'requisitos'
              ? 'bg-[#00c853] text-white font-black shadow-md shadow-[#00c853]/25'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#eafff2] hover:text-[#009935]'
          }`}
        >
          Requisitos para Alugar
        </button>

        <button
          onClick={() => setActiveSection('faq')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'faq'
              ? 'bg-[#00c853] text-white font-black shadow-md shadow-[#00c853]/25'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#eafff2] hover:text-[#009935]'
          }`}
        >
          Dúvidas Frequentes (FAQ)
        </button>
      </div>

      {/* 3. SECTION: RENTAL PLANS COMPARISON TABLE (DIÁRIO / SEMANAL / MENSAL) */}
      {(activeSection === 'todos' || activeSection === 'planos') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-[#009935] block">
                Tabela de Locação
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Planos de Aluguel sob Medida
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Escolha o período ideal: quanto maior o tempo contratado, menor o valor da diária.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#009935] font-bold bg-[#eafff2] px-3 py-1.5 rounded-xl border border-[#9bf6c4]">
              <TrendingDown className="w-4 h-4" />
              <span>Descontos progressivos de até 35%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Plan 1: Diário */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between shadow-2xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-800 uppercase">
                    1 a 6 dias
                  </span>
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Plano Diário Flex</h3>
                <p className="text-xs text-slate-500">
                  Liberdade total sem fidelidade. Pague apenas pelos dias de que precisa, ideal para emergências ou passeios de fim de semana.
                </p>
                <div className="pt-2">
                  <div className="text-2xl font-black text-slate-900">R$ 46 a R$ 68</div>
                  <span className="text-xs text-slate-500 font-medium">por diária contratada</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00c853] shrink-0" />
                    <span>Quilometragem 100% livre</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00c853] shrink-0" />
                    <span>Seguro contra terceiros incluso</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00c853] shrink-0" />
                    <span>Guincho e resgate 24h na cidade</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00c853] shrink-0" />
                    <span>Caução estornável na devolução</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setActiveSection('catalogo');
                  const el = document.getElementById('catalogo-motos');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Ver Motos para Diária
              </button>
            </div>

            {/* Plan 2: Semanal (Destaque) */}
            <div className="bg-white rounded-3xl border-2 border-[#00c853] p-6 space-y-4 shadow-md shadow-[#00c853]/15 flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00c853] text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs">
                Mais Escolhido • 15% OFF
              </div>
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#eafff2] text-[#007a2a] uppercase">
                    7 a 29 dias
                  </span>
                  <Award className="w-4 h-4 text-[#00c853]" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Plano Semanal Econômico</h3>
                <p className="text-xs text-slate-600">
                  Desenvolvido para condutores e entregadores de aplicativo que buscam redução de custos e alta rentabilidade.
                </p>
                <div className="pt-2">
                  <div className="text-2xl font-black text-[#007a2a]">R$ 39 a R$ 56</div>
                  <span className="text-xs text-slate-500 font-medium">por diária equivalente</span>
                </div>
                <ul className="text-xs text-slate-700 space-y-2 pt-2 border-t border-slate-100 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00c853] shrink-0" />
                    <span>Desconto de 15% a 20% na diária</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00c853] shrink-0" />
                    <span>Troca de óleo preventiva gratuita</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00c853] shrink-0" />
                    <span>Caução com valor especial reduzido</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00c853] shrink-0" />
                    <span>Prioridade no atendimento SOS 24h</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setActiveSection('catalogo');
                  const el = document.getElementById('catalogo-motos');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2.5 bg-[#00c853] hover:bg-[#00b341] text-white font-black text-xs rounded-xl shadow-md shadow-[#00c853]/25 transition-all cursor-pointer"
              >
                Alugar no Semanal
              </button>
            </div>

            {/* Plan 3: Mensal */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between shadow-2xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#eafff2] text-[#007a2a] uppercase">
                    30+ dias • 35% OFF
                  </span>
                  <Sparkles className="w-4 h-4 text-[#00c853]" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Plano Mensal Pro</h3>
                <p className="text-xs text-slate-500">
                  Máxima economia e suporte integral. Moto sempre em dia com manutenção preventiva completa por conta da locadora.
                </p>
                <div className="pt-2">
                  <div className="text-2xl font-black text-slate-900">R$ 32 a R$ 44</div>
                  <span className="text-xs text-slate-500 font-medium">por diária equivalente</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00c853] shrink-0" />
                    <span>Economia de até 35% no total</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00c853] shrink-0" />
                    <span>Moto reserva garantida em sinistro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00c853] shrink-0" />
                    <span>Troca de pneus e freios inclusa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00c853] shrink-0" />
                    <span>Pagamento facilitado em faturas semanais</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setActiveSection('catalogo');
                  const el = document.getElementById('catalogo-motos');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2.5 bg-[#eafff2] hover:bg-[#cbfae0] border border-[#00c853] text-[#007a2a] font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                Ver Opções Mensais
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. SECTION: SIMULADOR DE ALUGUEL INTERATIVO */}
      {(activeSection === 'todos' || activeSection === 'simulador') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eafff2] text-[#00c853] flex items-center justify-center font-black">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Simulador Interativo de Custo & Economia do Aluguel
              </h2>
              <p className="text-xs text-slate-500">
                Arraste os dias ou selecione o pacote para calcular os valores exatos de diária, total e caução.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="lg:col-span-7 space-y-5">
              {/* Category selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  1. Escolha a Categoria de Motocicleta:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.filter((c) => c.id !== 'todas').map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSimCategory(cat.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        simCategory === cat.id
                          ? 'bg-[#00c853] text-white shadow-md shadow-[#00c853]/25 font-black'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#eafff2] hover:text-[#009935]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider for days */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">
                    2. Quantidade de Diárias Desejadas:
                  </label>
                  <span className="text-sm font-black text-[#007a2a] bg-[#eafff2] px-3 py-0.5 rounded-full border border-[#9bf6c4]">
                    {simDays} {simDays === 1 ? 'dia' : 'dias'}
                  </span>
                </div>
                
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={simDays}
                  onChange={(e) => setSimDays(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00c853]"
                />

                <div className="flex justify-between text-[11px] text-slate-400 font-bold mt-1.5">
                  <span>1 dia (Diário)</span>
                  <span>7 dias (Semanal -15%)</span>
                  <span>15 dias</span>
                  <span>30 dias (Mensal -35%)</span>
                  <span>60 dias</span>
                </div>

                <div className="flex gap-2 mt-3">
                  {[1, 3, 7, 14, 30].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSimDays(preset)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        simDays === preset
                          ? 'bg-[#00c853] text-white font-black shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {preset}d
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Result Column */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs text-slate-500 font-medium">Modelo de Referência:</span>
                <span className="text-xs font-bold text-slate-900">{simMotoSample.name}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Diária Aplicada:</span>
                  <span className="font-bold text-slate-900">R$ {simDailyRate},00 / dia</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Período Total:</span>
                  <span className="font-bold text-slate-900">{simDays} diárias</span>
                </div>

                {simDiscountTotal > 0 && (
                  <div className="flex justify-between items-center text-[#009935] font-bold bg-[#eafff2] p-2 rounded-xl">
                    <span>Economia no Pacote:</span>
                    <span>- R$ {simDiscountTotal},00</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-sm font-bold text-slate-900">Total do Aluguel:</span>
                  <span className="text-2xl font-black text-[#007a2a]">R$ {simTotal},00</span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span>Caução reembolsável:</span>
                  <span className="font-bold text-slate-800">R$ {simMotoSample.securityDeposit},00 (estorno 100%)</span>
                </div>
              </div>

              <button
                onClick={() => onSelectMotorcycleForBooking(simMotoSample)}
                className="w-full py-3 bg-[#00c853] hover:bg-[#00b341] text-white font-black text-xs rounded-xl shadow-md shadow-[#00c853]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Alugar com Este Período</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 5. SECTION: O QUE ESTÁ INCLUSO NO ALUGUEL & REGRAS DE CAUÇÃO */}
      {(activeSection === 'todos' || activeSection === 'inclusoes') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#eafff2] text-[#00c853] flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                O Que Está Incluso no Seu Aluguel & Política de Caução
              </h2>
              <p className="text-xs text-slate-500">
                Transparência contratual absoluta: sem taxas surpresa e com proteção integral.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#eafff2] text-[#00c853] flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Seguro e Proteção</h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Cobertura contra terceiros (RCF), roubo, furto e perda total inclusa em todos os planos de locação.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#eafff2] text-[#00c853] flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Manutenção Preventiva</h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Troca de óleo, regulagem de cabos, freios e pastilhas gratuitos em qualquer oficina credenciada da rede.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#eafff2] text-[#00c853] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Caução 100% Devolvida</h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Devolução integral do valor da caução via PIX ou estorno no cartão em 24h a 48h úteis após entrega da moto.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#eafff2] text-[#00c853] flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Quilometragem Livre</h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Rode sem preocupação. Não cobramos valor por quilômetro rodado excedente em nenhum modelo da frota.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 6. SECTION: REQUISITOS PARA ALUGAR UMA MOTO */}
      {(activeSection === 'todos' || activeSection === 'requisitos') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#eafff2] text-[#00c853] flex items-center justify-center font-black">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Requisitos Obrigatórios para Alugar
              </h2>
              <p className="text-xs text-slate-500">
                O que você precisa para alugar e retirar sua motocicleta hoje mesmo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-6 h-6 rounded-full bg-[#00c853] text-white flex items-center justify-center font-black text-xs">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm">CNH Categoria A</h4>
              <p className="text-slate-600 text-[11px]">
                Habilitação definitiva ou PPD válida, sem bloqueios judiciais ou suspensão no DETRAN.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-6 h-6 rounded-full bg-[#00c853] text-white flex items-center justify-center font-black text-xs">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Idade Mínima</h4>
              <p className="text-slate-600 text-[11px]">
                Ter no mínimo 18 anos completos na data de retirada do veículo no pátio credenciado.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-6 h-6 rounded-full bg-[#00c853] text-white flex items-center justify-center font-black text-xs">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Comprovante de Residência</h4>
              <p className="text-slate-600 text-[11px]">
                Conta de luz, água ou telefone emitida nos últimos 90 dias em seu nome ou de parente de 1º grau.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-6 h-6 rounded-full bg-[#00c853] text-white flex items-center justify-center font-black text-xs">
                4
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Pagamento & Caução</h4>
              <p className="text-slate-600 text-[11px]">
                Pagamento da primeira locação e garantia de caução no ato via PIX ou Cartão de Crédito.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 7. SECTION: CATÁLOGO DE MOTOS DISPONÍVEIS COM FILTROS AVANÇADOS */}
      <section id="catalogo-motos" className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eafff2] text-[#009935] text-xs font-black mb-1 border border-[#9bf6c4]">
              <Bike className="w-3.5 h-3.5 text-[#00c853]" />
              <span>Frota Pronta para Retirada Imediata</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Modelos de Motocicletas Disponíveis
            </h2>
            <p className="text-xs text-slate-500">
              Selecione o modelo desejado para conferir as especificações completas e iniciar a reserva.
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar modelo ou marca..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#00c853] shadow-xs"
            />
          </div>
        </div>

        {/* Category Filter Chips & Location Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-y border-slate-200 py-3 bg-white rounded-2xl px-4 shadow-2xs">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#00c853] text-white shadow-md shadow-[#00c853]/25 font-black ring-1 ring-[#00c853]'
                    : 'bg-[#eafff2] text-[#007a2a] hover:bg-[#cbfae0] border border-[#9bf6c4]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Location Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-[#00c853] shrink-0" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="text-xs font-bold bg-[#eafff2] border border-[#9bf6c4] rounded-xl px-3 py-1.5 text-[#007a2a] focus:outline-hidden focus:ring-2 focus:ring-[#00c853] cursor-pointer"
            >
              <option value="all">Todos os Pátios de Retirada</option>
              <option value="Centro">Unidade Centro / República</option>
              <option value="Aeroporto">Unidade Congonhas / Aeroporto</option>
              <option value="Zona Sul">Unidade Santo Amaro / Zona Sul</option>
              <option value="Pinheiros">Unidade Pinheiros / Faria Lima</option>
            </select>
          </div>
        </div>

        {/* Count and helper */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Exibindo <strong className="text-slate-900 font-bold">{filteredMotorcycles.length}</strong> motocicletas disponíveis para aluguel
          </span>
          <button
            onClick={onNavigateToRules}
            className="text-[#007a2a] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Regras de Caução & Multas</span>
          </button>
        </div>

        {/* Grid of Rental Motorcycles */}
        {filteredMotorcycles.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <Bike className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">Nenhuma moto encontrada</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tente alterar o filtro de categoria ou os termos da busca para encontrar outros veículos disponíveis.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('todas');
                setSelectedLocation('all');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-[#00c853] hover:bg-[#00b341] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00c853]/25 transition-all cursor-pointer"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMotorcycles.map((moto) => (
              <div
                key={moto.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-48 sm:h-52 bg-slate-900 overflow-hidden">
                    <img
                      src={moto.image}
                      alt={moto.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-xs text-white border border-white/10 uppercase">
                        {moto.brand}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00c853] text-white shadow-xs uppercase">
                        {moto.category}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-white text-slate-900 shadow-md">
                        {typeof moto.engineCc === 'number' ? `${moto.engineCc} cc` : moto.engineCc}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <span className="text-xs font-semibold drop-shadow-sm flex items-center gap-1">
                        <Fuel className="w-3.5 h-3.5 text-[#00c853]" />
                        {moto.consumptionKmPerL}
                      </span>
                      <span className="text-[11px] bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded text-[#00c853] font-bold">
                        {moto.availableUnits} disponíveis no pátio
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-[#00c853] transition-colors">
                        {moto.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {moto.popularFor}
                      </p>
                    </div>

                    {/* Specs Pill List */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                      <div>
                        <span className="text-slate-400 block">Câmbio:</span>
                        <span className="font-semibold text-slate-700">{moto.transmission}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Freios:</span>
                        <span className="font-semibold text-slate-700">{moto.brakeSystem.split(' ')[0]}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Combustível:</span>
                        <span className="font-semibold text-slate-700">{moto.fuelType}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Placa:</span>
                        <span className="font-mono font-semibold text-slate-700">{moto.plateMask}</span>
                      </div>
                    </div>

                    {/* Price and Deposit Box */}
                    <div className="pt-1 flex items-end justify-between border-t border-slate-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor do Aluguel</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-slate-900">R$ {moto.dailyRate}</span>
                          <span className="text-xs text-slate-500">/dia</span>
                        </div>
                        <span className="text-[10px] text-[#009935] font-bold block">
                          R$ {moto.weeklyRateDailyEquivalent}/dia no semanal (7+ dias)
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Caução</span>
                        <span className="text-xs font-bold text-slate-700">R$ {moto.securityDeposit}</span>
                        <span className="text-[10px] text-slate-400 block">100% estornável</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onViewDetails(moto)}
                    className="flex-1 py-2.5 bg-[#eafff2] hover:bg-[#cbfae0] border border-[#00c853] rounded-xl text-xs font-bold text-[#007a2a] transition-all cursor-pointer shadow-2xs"
                  >
                    Ver Detalhes
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectMotorcycleForBooking(moto)}
                    className="flex-1 py-2.5 bg-[#00c853] hover:bg-[#00b341] text-white rounded-xl text-xs font-extrabold shadow-md shadow-[#00c853]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Alugar Agora</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 8. SECTION: PERGUNTAS FREQUENTES (FAQ) DE ALUGUEL */}
      {(activeSection === 'todos' || activeSection === 'faq') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#eafff2] text-[#00c853] flex items-center justify-center font-black">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Perguntas Frequentes sobre o Aluguel de Motos
              </h2>
              <p className="text-xs text-slate-500">
                Tire suas dúvidas antes de retirar sua motocicleta.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#00c853] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
