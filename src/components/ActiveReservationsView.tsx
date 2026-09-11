import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Fuel, 
  Gauge, 
  RefreshCw, 
  PhoneCall, 
  ChevronRight, 
  Lock, 
  Unlock, 
  X, 
  Download,
  Search,
  Check,
  Camera,
  Layers,
  ArrowRight
} from 'lucide-react';
import { RentalReservation, InspectionRecord } from '../types';

interface ActiveReservationsViewProps {
  reservations: RentalReservation[];
  onUpdateReservation: (updated: RentalReservation) => void;
  onNavigateToCatalog: () => void;
  onOpenSupport: () => void;
  onNavigateToRefaturar?: (reservaId: string) => void;
}

export const ActiveReservationsView: React.FC<ActiveReservationsViewProps> = ({
  reservations,
  onUpdateReservation,
  onNavigateToCatalog,
  onOpenSupport,
  onNavigateToRefaturar,
}) => {
  const [filterTab, setFilterTab] = useState<'todas' | 'ativas' | 'concluidas'>('todas');
  const [selectedInspectionModal, setSelectedInspectionModal] = useState<{
    reservation: RentalReservation;
    type: 'pickup' | 'return';
  } | null>(null);

  const [receiptModalReservation, setReceiptModalReservation] = useState<RentalReservation | null>(null);

  // Form states inside inspection modal
  const [inspectionKm, setInspectionKm] = useState<number>(8520);
  const [inspectionFuel, setInspectionFuel] = useState<'Cheio (100%)' | '3/4 (75%)' | '1/2 (50%)' | '1/4 (25%)'>('Cheio (100%)');
  const [inspectionNotes, setInspectionNotes] = useState('Sem avarias identificadas, veículo em perfeito estado de conservação.');
  const [inspectionSignature, setInspectionSignature] = useState('');

  const filteredReservations = reservations.filter((res) => {
    if (filterTab === 'ativas') {
      return res.status === 'confirmed' || res.status === 'ready_for_pickup' || res.status === 'active_rental' || res.status === 'in_return_inspection';
    }
    if (filterTab === 'concluidas') {
      return res.status === 'completed' || res.status === 'cancelled';
    }
    return true;
  });

  const handleOpenInspection = (reservation: RentalReservation, type: 'pickup' | 'return') => {
    setSelectedInspectionModal({ reservation, type });
    if (type === 'pickup') {
      setInspectionKm(reservation.pickupInspection?.odometerKm || 8500);
      setInspectionFuel(reservation.pickupInspection?.fuelLevel as any || 'Cheio (100%)');
      setInspectionNotes('Veículo verificado no pátio: lataria, pneus novos, luzes e freios operando perfeitamente.');
    } else {
      const prevKm = reservation.pickupInspection?.odometerKm || 8500;
      setInspectionKm(prevKm + 180);
      setInspectionFuel('Cheio (100%)');
      setInspectionNotes('Devolução concluída: sem riscos ou quedas, capacete e chave devolvidos sem avarias.');
    }
    setInspectionSignature(reservation.userName);
  };

  const handleSaveInspection = () => {
    if (!selectedInspectionModal) return;
    const { reservation, type } = selectedInspectionModal;

    const record: InspectionRecord = {
      date: '2026-09-12',
      time: '14:20',
      odometerKm: Number(inspectionKm),
      fuelLevel: inspectionFuel as any,
      conditionNotes: inspectionNotes,
      helmetProvided: reservation.optionalHelmet,
      documentsPresent: true,
      signatureName: inspectionSignature || reservation.userName,
      inspectorName: 'Rodrigo Alves (Supervisor Técnico de Pátio)',
    };

    if (type === 'pickup') {
      const updated: RentalReservation = {
        ...reservation,
        status: 'active_rental',
        pickupInspection: record,
      };
      onUpdateReservation(updated);
    } else {
      // Return: Releases the security deposit (caução)!
      const updated: RentalReservation = {
        ...reservation,
        status: 'completed',
        securityDepositStatus: 'released',
        returnInspection: record,
      };
      onUpdateReservation(updated);
    }

    setSelectedInspectionModal(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header with Title and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Minhas Reservas & Locações</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Acompanhe o status do veículo, realize check-in, check-out e consulte a liberação do seu depósito de caução.
          </p>
        </div>

        <button
          onClick={onNavigateToCatalog}
          className="px-4 py-2.5 rounded-xl bg-[#00c853] hover:bg-[#00b341] text-white text-xs font-black shadow-md shadow-[#00c853]/25 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>Nova Locação</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setFilterTab('todas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filterTab === 'todas'
              ? 'bg-[#00c853] text-white shadow-md shadow-[#00c853]/25 font-black'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-[#eafff2] hover:text-[#009935]'
          }`}
        >
          Todas as Reservas ({reservations.length})
        </button>

        <button
          onClick={() => setFilterTab('ativas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filterTab === 'ativas'
              ? 'bg-[#00c853] text-white shadow-md shadow-[#00c853]/25 font-black'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-[#eafff2] hover:text-[#009935]'
          }`}
        >
          Em Andamento / Ativas ({reservations.filter((r) => r.status !== 'completed' && r.status !== 'cancelled').length})
        </button>

        <button
          onClick={() => setFilterTab('concluidas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filterTab === 'concluidas'
              ? 'bg-[#00c853] text-white shadow-md shadow-[#00c853]/25 font-black'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-[#eafff2] hover:text-[#009935]'
          }`}
        >
          Concluídas & Devolvidas ({reservations.filter((r) => r.status === 'completed').length})
        </button>
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Nenhuma reserva encontrada nesta aba</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Escolha uma motocicleta em nosso catálogo para iniciar sua locação com caução estornável e proteção completa.
          </p>
          <button
            onClick={onNavigateToCatalog}
            className="mt-4 px-5 py-2.5 rounded-xl bg-[#00c853] text-white text-xs font-black hover:bg-[#00b341] transition-all shadow-md shadow-[#00c853]/25 cursor-pointer"
          >
            Explorar Catálogo de Motos
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReservations.map((reservation) => {
            const isCompleted = reservation.status === 'completed';
            const isActive = reservation.status === 'active_rental';
            const isReady = reservation.status === 'ready_for_pickup';

            return (
              <div
                key={reservation.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-emerald-300 transition-all duration-200"
              >
                {/* Reservation Top Header */}
                <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Código: <span className="text-slate-900 font-mono text-sm">{reservation.code}</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">
                      Criada em {reservation.createdAt}
                    </span>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2">
                    {isReady && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Pronta para Retirada (Pátio)
                      </span>
                    )}

                    {isActive && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        Locação Ativa (Em Uso)
                      </span>
                    )}

                    {isCompleted && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Concluída & Devolvida
                      </span>
                    )}

                    {/* Caução Badge */}
                    {reservation.securityDepositStatus === 'held' && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-blue-600" />
                        Caução: R$ {reservation.securityDepositAmount} (Garantia Retida)
                      </span>
                    )}

                    {reservation.securityDepositStatus === 'released' && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <Unlock className="w-3 h-3 text-emerald-600" />
                        Caução: R$ {reservation.securityDepositAmount} (100% Devolvida)
                      </span>
                    )}
                  </div>
                </div>

                {/* Reservation Body */}
                <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Bike Info & Picture */}
                  <div className="lg:col-span-4 space-y-3">
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100">
                      <img
                        src={reservation.moto.image}
                        alt={reservation.moto.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/95 text-slate-900 shadow-xs">
                          {reservation.moto.brand}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/60 backdrop-blur-xs rounded-xl text-white text-xs">
                        <div className="font-bold">{reservation.moto.name}</div>
                        <div className="text-[11px] text-slate-300">Placa: {reservation.moto.plateMask}</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex justify-between">
                        <span>Plano Escolhido:</span>
                        <span className="font-bold text-slate-900">{reservation.days} diárias</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Diária Aplicada:</span>
                        <span className="font-bold text-slate-900">R$ {reservation.dailyRateApplied}/dia</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Proteção:</span>
                        <span className="font-bold text-emerald-800">
                          {reservation.protectionPlan === 'complete' ? 'Total Plus' : 'Básica'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Logistics & Schedule */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {/* Pickup Info */}
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">
                          Retirada
                        </span>
                        <div className="font-bold text-slate-900 text-sm">
                          {reservation.startDate}
                        </div>
                        <div className="text-slate-600 text-xs mt-0.5">{reservation.startTime}</div>
                        <div className="text-[11px] text-slate-500 mt-2 flex items-start gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{reservation.pickupLocation}</span>
                        </div>
                      </div>

                      {/* Return Info */}
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">
                          Devolução
                        </span>
                        <div className="font-bold text-slate-900 text-sm">
                          {reservation.endDate}
                        </div>
                        <div className="text-slate-600 text-xs mt-0.5">{reservation.endTime}</div>
                        <div className="text-[11px] text-slate-500 mt-2 flex items-start gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{reservation.returnLocation}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vistoria Checklist Status */}
                    <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                      <div className="font-bold text-slate-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          Laudos de Vistoria Oficial
                        </span>
                        <button
                          onClick={() => setReceiptModalReservation(reservation)}
                          className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                        >
                          Ver Recibo Detalhado
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          {reservation.pickupInspection ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          )}
                          <span>Vistoria de Saída: {reservation.pickupInspection ? 'Concluída' : 'Pendente'}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-700">
                          {reservation.returnInspection ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span>Vistoria de Retorno: {reservation.returnInspection ? 'Concluída' : 'Aguardando'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions & Lifecycle buttons */}
                  <div className="lg:col-span-3 flex flex-col justify-between space-y-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Total da Locação:</span>
                      <div className="text-xl font-black text-slate-900">
                        R$ {reservation.totalRentAndAddons},00
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Caução: <span className="font-semibold text-emerald-800">R$ {reservation.securityDepositAmount},00</span>
                      </div>
                    </div>

                    {/* Dynamic Action Buttons based on status */}
                    <div className="space-y-2 pt-2">
                      {isReady && (
                        <button
                          id={`btn-checkin-${reservation.id}`}
                          onClick={() => handleOpenInspection(reservation, 'pickup')}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#00c853] hover:bg-[#00b341] text-white text-xs font-black shadow-md shadow-[#00c853]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Simular Vistoria de Retirada (Check-in)</span>
                        </button>
                      )}

                      {isActive && (
                        <>
                          <button
                            id={`btn-checkout-${reservation.id}`}
                            onClick={() => handleOpenInspection(reservation, 'return')}
                            className="w-full py-2.5 px-3 rounded-xl bg-[#00c853] hover:bg-[#00b341] text-white text-xs font-black shadow-md shadow-[#00c853]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Simular Devolução & Estornar Caução</span>
                          </button>

                          <button
                            onClick={onOpenSupport}
                            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#eafff2] border border-[#00c853] text-[#007a2a] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-[#00c853]" />
                            <span>SOS Mecânico / Guincho 24h</span>
                          </button>
                        </>
                      )}

                      {isCompleted && (
                        <div className="bg-[#eafff2] border border-[#9bf6c4] rounded-xl p-3 text-center text-xs">
                          <CheckCircle2 className="w-4 h-4 text-[#00c853] mx-auto mb-1" />
                          <span className="font-black text-[#007a2a] block">Devolução Aprovada</span>
                          <span className="text-[11px] text-[#007a2a]">Caução de R$ {reservation.securityDepositAmount} estornada com sucesso.</span>
                        </div>
                      )}

                      {onNavigateToRefaturar && reservation.status !== 'cancelled' && (
                        <button
                          onClick={() => onNavigateToRefaturar(reservation.id)}
                          className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                          <span>Refaturar / Prorrogar Contrato</span>
                        </button>
                      )}

                      <button
                        onClick={() => setReceiptModalReservation(reservation)}
                        className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        Visualizar Contrato & Extrato
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INSPECTION MODAL (Check-in or Check-out) */}
      {selectedInspectionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    {selectedInspectionModal.type === 'pickup' ? 'Check-in de Retirada' : 'Check-out de Devolução'}
                  </span>
                  <h3 className="text-base font-bold">
                    Laudo Pericial & Vistoria da Moto
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedInspectionModal(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-800 flex-1">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="font-bold text-slate-900">{selectedInspectionModal.reservation.moto.name}</div>
                <div className="text-slate-500">
                  Condutor: {selectedInspectionModal.reservation.userName} • Placa: {selectedInspectionModal.reservation.moto.plateMask}
                </div>
              </div>

              {/* Odometer */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Quilometragem (Odômetro em Km):</label>
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-emerald-600" />
                  <input
                    type="number"
                    value={inspectionKm}
                    onChange={(e) => setInspectionKm(Number(e.target.value))}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold"
                  />
                </div>
              </div>

              {/* Fuel Level */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nível de Combustível:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Cheio (100%)', '3/4 (75%)', '1/2 (50%)', '1/4 (25%)'] as const).map((fuel) => (
                    <button
                      key={fuel}
                      type="button"
                      onClick={() => setInspectionFuel(fuel)}
                      className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                        inspectionFuel === fuel
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {fuel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Observações da Vistoria Física:</label>
                <textarea
                  rows={3}
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                ></textarea>
              </div>

              {/* Caução release highlight in Return */}
              {selectedInspectionModal.type === 'return' && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-xs text-emerald-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <Unlock className="w-4 h-4 text-emerald-600" />
                    Estorno Automático da Caução: R$ {selectedInspectionModal.reservation.securityDepositAmount},00
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Ao confirmar a devolução sem avarias e com o nível de combustível regularizado, o sistema emite o comprovante de liberação imediata da garantia para a conta do titular.
                  </p>
                </div>
              )}

              {/* Signature */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Assinatura Digital do Locatário:</label>
                <input
                  type="text"
                  value={inspectionSignature}
                  onChange={(e) => setInspectionSignature(e.target.value)}
                  placeholder="Digite seu nome completo como assinatura"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedInspectionModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={handleSaveInspection}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>
                  {selectedInspectionModal.type === 'pickup'
                    ? 'Assinar e Iniciar Locação'
                    : 'Aprovar Devolução e Liberar Caução'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT / STATEMENT MODAL */}
      {receiptModalReservation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Comprovante de Locação & Caução
                </span>
                <h3 className="text-base font-bold">Extrato Financeiro • {receiptModalReservation.code}</h3>
              </div>
              <button
                onClick={() => setReceiptModalReservation(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-800 flex-1">
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
                <div className="flex justify-between font-bold text-slate-900 text-sm">
                  <span>Asiary Moto Veículos & Frotas Ltda.</span>
                  <span>CNPJ: 42.190.812/0001-90</span>
                </div>
                <div className="text-slate-500">
                  Condutor: {receiptModalReservation.userName} • CNH Cat A: {receiptModalReservation.userCnh}
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2 border-t border-b border-slate-200 py-3">
                <div className="flex justify-between">
                  <span>Diárias ({receiptModalReservation.days}x R$ {receiptModalReservation.dailyRateApplied}):</span>
                  <span className="font-bold">R$ {receiptModalReservation.rentalSubtotal},00</span>
                </div>
                {receiptModalReservation.optionalHelmet && (
                  <div className="flex justify-between">
                    <span>Capacete Inmetro:</span>
                    <span>R$ {receiptModalReservation.optionalHelmetCost},00</span>
                  </div>
                )}
                {receiptModalReservation.optionalPhoneMount && (
                  <div className="flex justify-between">
                    <span>Suporte Antivibração de Celular:</span>
                    <span>R$ {receiptModalReservation.optionalPhoneMountCost},00</span>
                  </div>
                )}
                {receiptModalReservation.optionalTopBox && (
                  <div className="flex justify-between">
                    <span>Baú Traseiro 45L:</span>
                    <span>R$ {receiptModalReservation.optionalTopBoxCost},00</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Plano de Proteção ({receiptModalReservation.protectionPlan}):</span>
                  <span>R$ {receiptModalReservation.protectionCost},00</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-slate-900">
                  <span>Subtotal da Locação:</span>
                  <span>R$ {receiptModalReservation.totalRentAndAddons},00</span>
                </div>
              </div>

              {/* Caução status */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-emerald-950 block">Depósito de Caução de Segurança</span>
                    <span className="text-[11px] text-emerald-800">
                      Status:{' '}
                      {receiptModalReservation.securityDepositStatus === 'released'
                        ? 'Estornado e Liberado 100%'
                        : 'Retido Preventivamente (Ativo)'}
                    </span>
                  </div>
                  <span className="text-base font-extrabold text-emerald-900">
                    R$ {receiptModalReservation.securityDepositAmount},00
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed">
                Este recibo comprova a locação para o período indicado em contrato, conforme a Lei do Inquilinato/Código Civil brasileiro e normas do Contran.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setReceiptModalReservation(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
