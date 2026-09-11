import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Bike, 
  Download, 
  Printer, 
  ShieldCheck, 
  ChevronRight, 
  ArrowRight,
  DollarSign,
  User,
  Phone,
  FileCheck,
  X,
  Search,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import { useApp, FaturaLocacao } from '../context/AppContext';
import { RentalReservation } from '../types';

interface FaturasViewProps {
  initialReservaIdToRefaturar?: string | null;
  onClearInitialReserva?: () => void;
}

export const FaturasView: React.FC<FaturasViewProps> = ({
  initialReservaIdToRefaturar,
  onClearInitialReserva,
}) => {
  const { faturas, gerarRefatura, addToast, reservations, user } = useApp();
  const [selectedFatura, setSelectedFatura] = useState<FaturaLocacao | null>(null);
  const [refaturaModalFatura, setRefaturaModalFatura] = useState<FaturaLocacao | null>(null);
  const [isSelectReservaModalOpen, setIsSelectReservaModalOpen] = useState(false);

  // Filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | 'pagas' | 'refaturadas'>('todas');

  // Form states para refaturamento
  const [novosDias, setNovosDias] = useState<number>(7);
  const [novoValor, setNovoValor] = useState<number>(0);
  const [motivoRefatura, setMotivoRefatura] = useState<string>('Extensão de período de locação solicitada pelo cliente');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleOpenRefaturar = (fatura: FaturaLocacao) => {
    setRefaturaModalFatura(fatura);
    const diasExtras = 3;
    const diasTotais = fatura.diasLocacao + diasExtras;
    setNovosDias(diasTotais);
    const taxaExtra = diasExtras * fatura.valorDiaria;
    setNovoValor(fatura.totalFaturado + taxaExtra);
    setMotivoRefatura(`Prorrogação de +${diasExtras} diárias contratuais com ajuste proporcional`);
  };

  const handleQuickAddDays = (extraDays: number) => {
    if (!refaturaModalFatura) return;
    const diasTotais = refaturaModalFatura.diasLocacao + extraDays;
    setNovosDias(diasTotais);
    const taxaExtra = extraDays * refaturaModalFatura.valorDiaria;
    setNovoValor(refaturaModalFatura.totalFaturado + taxaExtra);
    setMotivoRefatura(`Prorrogação de +${extraDays} diárias contratuais acordada com o condutor`);
  };

  // Abrir refatura automaticamente se veio via link direto de uma reserva
  useEffect(() => {
    if (initialReservaIdToRefaturar) {
      const existing = faturas.find((f) => f.reservaId === initialReservaIdToRefaturar);
      if (existing) {
        handleOpenRefaturar(existing);
      } else {
        const res = reservations.find((r) => r.id === initialReservaIdToRefaturar);
        if (res) {
          const synthesized: FaturaLocacao = {
            id: `fat-${res.id}`,
            numeroFatura: `FAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            reservaId: res.id,
            motoNome: res.moto.name,
            motoPlaca: res.moto.plateMask,
            clienteNome: res.userName,
            clienteCpf: user.cpf,
            clienteTelefone: user.phone,
            dataEmissao: res.createdAt ? res.createdAt.split(' ')[0] : '2026-09-10',
            dataVencimento: res.endDate,
            diasLocacao: res.days,
            valorDiaria: res.dailyRateApplied,
            subtotalLocacao: res.rentalSubtotal,
            caucaoRetida: res.securityDepositAmount,
            taxaSeguro: res.protectionCost,
            descontos: 0,
            totalFaturado: res.grandTotalCharged,
            status: 'pago',
            historicoRefaturas: [],
          };
          handleOpenRefaturar(synthesized);
        }
      }
      onClearInitialReserva?.();
    }
  }, [initialReservaIdToRefaturar, faturas, reservations]);

  const handleConfirmarRefatura = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refaturaModalFatura) return;

    if (novosDias <= 0 || novoValor <= 0) {
      addToast('Informe valores válidos para novos dias e valor faturado.', 'error');
      return;
    }

    setIsProcessing(true);
    const res = await gerarRefatura(refaturaModalFatura.reservaId, novosDias, novoValor, motivoRefatura);
    setIsProcessing(false);

    if (res.success && res.fatura) {
      setRefaturaModalFatura(null);
      setSelectedFatura(res.fatura);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  // Filtragem
  const filteredFaturas = useMemo(() => {
    return faturas.filter((fat) => {
      // Filtro por status
      if (statusFilter === 'pagas' && fat.status !== 'pago') return false;
      if (statusFilter === 'refaturadas' && fat.status !== 'refaturado') return false;

      // Busca por texto
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchNumber = fat.numeroFatura.toLowerCase().includes(query);
        const matchMoto = fat.motoNome.toLowerCase().includes(query) || fat.motoPlaca.toLowerCase().includes(query);
        const matchCliente = fat.clienteNome.toLowerCase().includes(query);
        const matchId = fat.reservaId.toLowerCase().includes(query);
        return matchNumber || matchMoto || matchCliente || matchId;
      }
      return true;
    });
  }, [faturas, statusFilter, searchTerm]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#eafff2] text-[#00c853]">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Faturas & Refaturas de Locação
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão transparente de emissão fiscal, comprovantes de diárias, retenção de caução e recálculo contratual expresso.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsSelectReservaModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-[#00c853] hover:bg-[#00b341] text-white text-xs font-black shadow-md shadow-[#00c853]/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Refatura</span>
          </button>
          <span className="px-3 py-1.5 rounded-full bg-[#eafff2] text-[#009935] border border-[#9bf6c4] text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Emissão em Conformidade
          </span>
        </div>
      </div>

      {/* Barra de Filtros e Busca Rápida */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por placa, modelo, cliente ou número de fatura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-2xl text-xs focus:border-[#00c853] focus:outline-none bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter('todas')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'todas'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({faturas.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pagas')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'pagas'
                ? 'bg-white text-emerald-800 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pagas ({faturas.filter((f) => f.status === 'pago').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('refaturadas')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'refaturadas'
                ? 'bg-white text-blue-800 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Refaturadas ({faturas.filter((f) => f.status === 'refaturado').length})
          </button>
        </div>
      </div>

      {/* Lista de Faturas */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">Histórico de Faturas Emitidas</h2>
          <span className="text-xs text-slate-400">{filteredFaturas.length} faturas encontradas</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredFaturas.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1" />
              <div>Nenhuma fatura encontrada com os filtros selecionados.</div>
            </div>
          ) : (
            filteredFaturas.map((fat) => (
              <div
                key={fat.id}
                className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-black text-slate-900">
                      {fat.numeroFatura}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        fat.status === 'pago'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fat.status === 'refaturado'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {fat.status === 'refaturado' ? 'Refaturado (Ajustado)' : fat.status}
                    </span>
                    {fat.historicoRefaturas && fat.historicoRefaturas.length > 0 && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-bold">
                        {fat.historicoRefaturas.length} ajuste{fat.historicoRefaturas.length > 1 ? 's' : ''} registrado{fat.historicoRefaturas.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Bike className="w-3.5 h-3.5 text-[#00c853]" />
                      {fat.motoNome} ({fat.motoPlaca})
                    </span>
                    <span className="text-slate-400">•</span>
                    <span>{fat.diasLocacao} diárias ({fat.dataEmissao} até {fat.dataVencimento})</span>
                    <span className="text-slate-400">•</span>
                    <span>Caução: R$ {fat.caucaoRetida.toFixed(2)}</span>
                  </div>

                  {fat.motivoRefatura && (
                    <p className="text-[11px] text-blue-700 bg-blue-50/70 p-2 rounded-xl border border-blue-100">
                      <strong>Motivo do Ajuste:</strong> {fat.motivoRefatura}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Faturado</span>
                    <span className="text-base font-black text-slate-900">
                      R$ {fat.totalFaturado.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedFatura(fat)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ver Recibo</span>
                    </button>

                    <button
                      onClick={() => handleOpenRefaturar(fat)}
                      className="px-3 py-1.5 rounded-xl bg-[#00c853] hover:bg-[#00b341] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refaturar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL 1: VISUALIZAR FATURA / RECIBO DETALHADO */}
      {selectedFatura && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#00c853]" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Fatura Oficial de Locação #{selectedFatura.numeroFatura}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFatura(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 block">Status da Cobrança</span>
                  <span className="text-[11px] text-emerald-800">
                    {selectedFatura.status === 'refaturado'
                      ? 'Fatura Reajustada e Aprovada'
                      : 'Fatura Liquidada • Pagamento Confirmado'}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase">
                  {selectedFatura.status}
                </span>
              </div>

              {/* Dados do Locatário */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Dados do Locatário
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nome:</span>
                    <strong className="text-slate-900">{selectedFatura.clienteNome}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Telefone / WhatsApp:</span>
                    <strong className="text-slate-900">{selectedFatura.clienteTelefone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Veículo:</span>
                    <strong className="text-slate-900">{selectedFatura.motoNome}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Placa:</span>
                    <strong className="text-slate-900 font-mono">{selectedFatura.motoPlaca}</strong>
                  </div>
                </div>
              </div>

              {/* Discriminação dos Valores */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Discriminação dos Valores Faturados
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-3 space-y-2">
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Diárias contratadas ({selectedFatura.diasLocacao}x R$ {selectedFatura.valorDiaria.toFixed(2)})</span>
                    <strong className="text-slate-900">R$ {selectedFatura.subtotalLocacao.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Caução Retida (Estorno após devolução):</span>
                    <strong className="text-slate-900">R$ {selectedFatura.caucaoRetida.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Plano de Proteção & Seguro contra Terceiros:</span>
                    <strong className="text-slate-900">R$ {selectedFatura.taxaSeguro.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between pt-2 text-sm font-black text-slate-900 border-t border-slate-200">
                    <span>Valor Total Faturado:</span>
                    <span className="text-[#00c853]">R$ {selectedFatura.totalFaturado.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Histórico de Refaturas */}
              {selectedFatura.historicoRefaturas && selectedFatura.historicoRefaturas.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                    Histórico de Refaturamentos
                  </span>
                  <div className="space-y-2">
                    {selectedFatura.historicoRefaturas.map((h, i) => (
                      <div key={i} className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] space-y-1">
                        <div className="flex justify-between font-bold text-blue-950">
                          <span>Ajuste #{i + 1} em {h.data}</span>
                          <span>R$ {h.valorAnterior.toFixed(2)} → R$ {h.valorNovo.toFixed(2)}</span>
                        </div>
                        <p className="text-blue-800">
                          <strong>Motivo:</strong> {h.motivo}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
              <button
                onClick={handleImprimir}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / PDF</span>
              </button>
              <button
                onClick={() => setSelectedFatura(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PROCESSAR REFATURA EXPRESSA */}
      {refaturaModalFatura && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#00c853]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Refaturar Contrato #{refaturaModalFatura.numeroFatura}
                </h3>
              </div>
              <button
                onClick={() => setRefaturaModalFatura(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarRefatura} className="p-6 space-y-4 text-xs">
              <p className="text-slate-500 text-xs">
                O refaturamento recalcula o valor contratual devido a diárias adicionais, extensão de prazo ou reajuste acordado com o cliente.
              </p>

              {/* Botões Rápidos de Prorrogação (seja rápido e breve) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00c853]" />
                  <span>Prorrogação Rápida (1 Clique):</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickAddDays(3)}
                    className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-[#eafff2] hover:text-[#009935] hover:border-[#9bf6c4] border border-slate-200 font-bold text-[11px] transition-all cursor-pointer text-center"
                  >
                    +3 Dias
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddDays(7)}
                    className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-[#eafff2] hover:text-[#009935] hover:border-[#9bf6c4] border border-slate-200 font-bold text-[11px] transition-all cursor-pointer text-center"
                  >
                    +7 Dias
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddDays(15)}
                    className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-[#eafff2] hover:text-[#009935] hover:border-[#9bf6c4] border border-slate-200 font-bold text-[11px] transition-all cursor-pointer text-center"
                  >
                    +15 Dias
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddDays(30)}
                    className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-[#eafff2] hover:text-[#009935] hover:border-[#9bf6c4] border border-slate-200 font-bold text-[11px] transition-all cursor-pointer text-center"
                  >
                    +30 Dias
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Total de Dias Contratados:</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={novosDias}
                  onChange={(e) => {
                    const d = parseInt(e.target.value) || 1;
                    setNovosDias(d);
                    const sub = d * refaturaModalFatura.valorDiaria;
                    setNovoValor(sub + refaturaModalFatura.caucaoRetida + refaturaModalFatura.taxaSeguro);
                  }}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-[#00c853] focus:outline-none font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Valor diário aplicado: R$ {refaturaModalFatura.valorDiaria.toFixed(2)}/dia
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Novo Valor Total da Fatura (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={novoValor}
                  onChange={(e) => setNovoValor(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-[#00c853] focus:outline-none font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motivo / Justificativa da Refatura:</label>
                <textarea
                  rows={2}
                  value={motivoRefatura}
                  onChange={(e) => setMotivoRefatura(e.target.value)}
                  placeholder="Ex: Prorrogação acordada com o condutor."
                  className="w-full p-3 border border-slate-200 rounded-xl focus:border-[#00c853] focus:outline-none text-slate-800 text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Diferença a Liquidar</span>
                  <span className="font-black text-slate-900 text-sm">
                    {novoValor >= refaturaModalFatura.totalFaturado ? '+' : '-'} R${' '}
                    {Math.abs(novoValor - refaturaModalFatura.totalFaturado).toFixed(2)}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Ajustado no saldo / caução
                </span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRefaturaModalFatura(null)}
                  className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 h-10 rounded-xl bg-[#00c853] hover:bg-[#00b341] text-white font-bold text-xs transition-colors shadow-md shadow-[#00c853]/25 cursor-pointer"
                >
                  {isProcessing ? 'Gravando...' : 'Emitir Refatura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SELECIONAR RESERVA PARA NOVA REFATURA */}
      {isSelectReservaModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#00c853]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Selecione o Contrato para Refaturar
                </h3>
              </div>
              <button
                onClick={() => setIsSelectReservaModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto divide-y divide-slate-100 space-y-1">
              {reservations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhuma reserva disponível no momento.
                </div>
              ) : (
                reservations.map((res) => {
                  const existingFat = faturas.find((f) => f.reservaId === res.id);
                  return (
                    <div
                      key={res.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-slate-900">{res.code}</span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-slate-100 text-slate-700">
                            {res.days} dias
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                          <Bike className="w-3.5 h-3.5 text-[#00c853]" />
                          {res.moto.name} ({res.moto.plateMask})
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Total: R$ {res.grandTotalCharged.toFixed(2)} • Diária: R$ {res.dailyRateApplied}/dia
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsSelectReservaModalOpen(false);
                          if (existingFat) {
                            handleOpenRefaturar(existingFat);
                          } else {
                            const syn: FaturaLocacao = {
                              id: `fat-${res.id}`,
                              numeroFatura: `FAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                              reservaId: res.id,
                              motoNome: res.moto.name,
                              motoPlaca: res.moto.plateMask,
                              clienteNome: res.userName,
                              clienteCpf: user.cpf,
                              clienteTelefone: user.phone,
                              dataEmissao: res.createdAt ? res.createdAt.split(' ')[0] : '2026-09-10',
                              dataVencimento: res.endDate,
                              diasLocacao: res.days,
                              valorDiaria: res.dailyRateApplied,
                              subtotalLocacao: res.rentalSubtotal,
                              caucaoRetida: res.securityDepositAmount,
                              taxaSeguro: res.protectionCost,
                              descontos: 0,
                              totalFaturado: res.grandTotalCharged,
                              status: 'pago',
                              historicoRefaturas: [],
                            };
                            handleOpenRefaturar(syn);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#00c853] hover:bg-[#00b341] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                      >
                        Refaturar
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
