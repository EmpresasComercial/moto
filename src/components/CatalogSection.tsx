import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  Fuel, 
  Gauge, 
  ShieldCheck, 
  Check, 
  Zap, 
  Layers, 
  ArrowRight, 
  Info,
  Calendar,
  Sparkles,
  Award
} from 'lucide-react';
import { Motorcycle, VehicleCategory, PickupLocation } from '../types';

interface CatalogSectionProps {
  motorcycles: Motorcycle[];
  locations: PickupLocation[];
  onSelectMotorcycleForBooking: (moto: Motorcycle) => void;
  onViewDetails: (moto: Motorcycle) => void;
  onNavigateToRules: () => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  motorcycles,
  locations,
  onSelectMotorcycleForBooking,
  onViewDetails,
  onNavigateToRules,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>('todas');
  const [selectedLocation, setSelectedLocation] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [transmissionFilter, setTransmissionFilter] = useState<'todas' | 'manual' | 'automatica'>('todas');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'power'>('price_asc');

  // Categories config
  const categories = [
    { id: 'todas', label: 'Todas as Motos', icon: null },
    { id: 'economica', label: 'Econômica & Trabalho', icon: null },
    { id: 'scooter', label: 'Scooter Automática', icon: null },
    { id: 'trail', label: 'Trail & Versátil', icon: null },
    { id: 'eletrica', label: '100% Elétrica Urbana', icon: Zap },
    { id: 'touring', label: 'Clássica & Lazer', icon: null },
  ];

  const filteredMotorcycles = useMemo(() => {
    return motorcycles
      .filter((moto) => {
        // Category filter
        if (selectedCategory !== 'todas' && moto.category !== selectedCategory) {
          return false;
        }
        // Location filter
        if (selectedLocation !== 'todas' && !moto.locations.includes(selectedLocation)) {
          return false;
        }
        // Transmission filter
        if (transmissionFilter === 'manual' && !moto.transmission.toLowerCase().includes('manual')) {
          return false;
        }
        if (transmissionFilter === 'automatica' && !moto.transmission.toLowerCase().includes('automática')) {
          return false;
        }
        // Search query
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchName = moto.name.toLowerCase().includes(q);
          const matchBrand = moto.brand.toLowerCase().includes(q);
          const matchDesc = moto.popularFor.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.dailyRate - b.dailyRate;
        if (sortBy === 'price_desc') return b.dailyRate - a.dailyRate;
        if (sortBy === 'power') {
          const ccA = typeof a.engineCc === 'number' ? a.engineCc : 125;
          const ccB = typeof b.engineCc === 'number' ? b.engineCc : 125;
          return ccB - ccA;
        }
        return 0;
      });
  }, [motorcycles, selectedCategory, selectedLocation, transmissionFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero presentation with search widget */}
      <section className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-700 text-emerald-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Frota 100% Revisada e Pronta para Retirada</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Alugue sua moto com <span className="text-emerald-400">segurança</span> e clareza total.
          </h1>

          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Diárias acessíveis, planos semanais com desconto, caução estornável pós-vistoria e assistência 24h. Escolha o veículo ideal para trabalho, deslocamento diário ou finais de semana.
          </p>

          {/* Quick Pillars */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-emerald-800/60 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sem burocracia</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Caução 100% estornável</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Seguro & Guincho 24h</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Retirada em 30 min</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="search-input"
              type="text"
              placeholder="Buscar por modelo (ex: CG 160, PCX, Factor, Lander)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Location Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <select
                id="location-filter"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-medium focus:outline-hidden cursor-pointer w-full text-slate-800"
              >
                <option value="todas">Todas as Unidades (São Paulo)</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Transmission filter */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700">
              <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
              <select
                id="transmission-filter"
                value={transmissionFilter}
                onChange={(e) => setTransmissionFilter(e.target.value as any)}
                className="bg-transparent text-xs sm:text-sm font-medium focus:outline-hidden cursor-pointer text-slate-800"
              >
                <option value="todas">Câmbio: Todos</option>
                <option value="manual">Manual (com embreagem)</option>
                <option value="automatica">Automática CVT</option>
              </select>
            </div>

            {/* Sort filter */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600 shrink-0" />
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs sm:text-sm font-medium focus:outline-hidden cursor-pointer text-slate-800"
              >
                <option value="price_asc">Menor valor da diária</option>
                <option value="price_desc">Maior valor da diária</option>
                <option value="power">Maior potência / cilindrada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                id={`cat-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id as VehicleCategory)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Motos Encontradas ({filteredMotorcycles.length})
          </h2>
          <p className="text-xs text-slate-500">
            Valores incluem seguro obrigatório contra terceiros e assistência 24h
          </p>
        </div>
        <button
          onClick={onNavigateToRules}
          className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Tabela de cauções e regras</span>
        </button>
      </div>

      {/* Motorcycle Cards Grid */}
      {filteredMotorcycles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Nenhuma motocicleta encontrada</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tente redefinir seus filtros ou pesquise por outro termo para encontrar motos disponíveis.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('todas');
              setSelectedLocation('todas');
              setSearchQuery('');
              setTransmissionFilter('todas');
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            Limpar todos os filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMotorcycles.map((moto) => {
            return (
              <div
                key={moto.id}
                id={`card-${moto.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/* Image Container with Badges */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={moto.image}
                    alt={moto.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/95 text-slate-900 shadow-xs backdrop-blur-xs">
                      {moto.brand}
                    </span>
                    {moto.category === 'eletrica' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        100% Elétrica
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/90 text-white backdrop-blur-xs">
                      {moto.availableUnits} un. disponíveis
                    </span>
                  </div>

                  {/* Bottom Image Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-xs font-medium text-emerald-300">Ano {moto.year}</div>
                    <div className="font-bold text-base leading-snug drop-shadow-xs">{moto.name}</div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  {/* Quick specs grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <Gauge className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate font-medium">{typeof moto.engineCc === 'number' ? `${moto.engineCc} cc` : moto.engineCc}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <Fuel className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{moto.consumptionKmPerL.split(' ')[0]} km/l</span>
                    </div>

                    <div className="col-span-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="truncate">{moto.transmission}</span>
                    </div>
                  </div>

                  {/* Pricing Breakdown Card */}
                  <div className="bg-emerald-50/60 border border-emerald-100/90 rounded-xl p-3 text-left">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-500">Diária avulsa:</span>
                        <div className="text-xl font-extrabold text-slate-900">
                          R$ {moto.dailyRate}
                          <span className="text-xs font-normal text-slate-600"> /dia</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Semanal
                        </span>
                        <div className="text-xs font-bold text-emerald-800">
                          R$ {moto.weeklyRateDailyEquivalent}/dia
                        </div>
                      </div>
                    </div>

                    {/* Caução Indicator */}
                    <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600">Caução de garantia:</span>
                      <span className="font-semibold text-slate-800" title="Estornada na devolução pós-vistoria">
                        R$ {moto.securityDeposit} <span className="text-emerald-700 font-normal">(estornável)</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      id={`btn-alugar-${moto.id}`}
                      onClick={() => onSelectMotorcycleForBooking(moto)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Alugar Esta Moto</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      id={`btn-detalhes-${moto.id}`}
                      onClick={() => onViewDetails(moto)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Ficha Técnica & Termos
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Explanatory Steps Section */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Simples, Transparente e Rápido
          </span>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            Como funciona a locação de motos na Asiary Moto
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Todo o processo é digital, seguro e em conformidade com o Código de Trânsito Brasileiro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-3">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Escolha a Moto & Ponto</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Consulte modelos e selecione as datas de início e término e o pátio de retirada mais conveniente.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-3">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Envio e Validação da CNH</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Envie sua CNH definitiva com Categoria A. A validação do condutor ocorre digitalmente em minutos.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-3">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Pagamento & Caução</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Pague as diárias e autorize o depósito de garantia (caução) de forma segura por PIX ou Cartão.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-3">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Vistoria & Devolução</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Faça a checagem fotográfica no check-in. Ao devolver com tanque no nível e sem avarias, a caução é 100% devolvida.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
