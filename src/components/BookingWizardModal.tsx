import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Check, 
  Clock, 
  CreditCard, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  Lock,
  HardHat,
  Smartphone,
  Luggage,
  Sparkles,
  Info
} from 'lucide-react';
import { Motorcycle, PickupLocation, UserProfile, RentalReservation } from '../types';

interface BookingWizardModalProps {
  motorcycle: Motorcycle | null;
  locations: PickupLocation[];
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (newReservation: RentalReservation) => void;
  onNavigateToCnh: () => void;
}

export const BookingWizardModal: React.FC<BookingWizardModalProps> = ({
  motorcycle,
  locations,
  user,
  isOpen,
  onClose,
  onConfirmBooking,
  onNavigateToCnh,
}) => {
  if (!isOpen || !motorcycle) return null;

  // Step state: 1 (Period & Location), 2 (Addons & Protection), 3 (CNH verification), 4 (Payment & Deposit), 5 (Confirmed)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const todayStr = '2026-09-12';
  const defaultReturnStr = '2026-09-15';
  
  const [startDate, setStartDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(defaultReturnStr);
  const [endTime, setEndTime] = useState('18:00');
  const [pickupLocation, setPickupLocation] = useState(locations[0]?.name || motorcycle.locations[0]);
  const [returnLocation, setReturnLocation] = useState(locations[0]?.name || motorcycle.locations[0]);

  // Optionals
  const [optionalHelmet, setOptionalHelmet] = useState(true);
  const [optionalPhoneMount, setOptionalPhoneMount] = useState(true);
  const [optionalTopBox, setOptionalTopBox] = useState(false);
  const [protectionPlan, setProtectionPlan] = useState<'basic' | 'complete'>('complete');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 9012');
  const [cardHolder, setCardHolder] = useState(user.fullName.toUpperCase());
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('834');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Payment simulation state
  const [pixCopied, setPixCopied] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Calculations
  const rentalDays = useMemo(() => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 3;
    }
  }, [startDate, endDate]);

  // Apply weekly discount if >= 7 days
  const dailyRateApplied = rentalDays >= 7 ? motorcycle.weeklyRateDailyEquivalent : motorcycle.dailyRate;
  const rentalSubtotal = dailyRateApplied * rentalDays;

  // Addons costs
  const helmetCostPerDay = 5;
  const phoneMountCostPerDay = 3;
  const topBoxCostPerDay = 8;
  const completeProtectionPerDay = 12;

  const helmetTotal = optionalHelmet ? helmetCostPerDay * rentalDays : 0;
  const phoneMountTotal = optionalPhoneMount ? phoneMountCostPerDay * rentalDays : 0;
  const topBoxTotal = optionalTopBox ? topBoxCostPerDay * rentalDays : 0;
  const protectionTotal = protectionPlan === 'complete' ? completeProtectionPerDay * rentalDays : 0;

  const totalRentAndAddons = rentalSubtotal + helmetTotal + phoneMountTotal + topBoxTotal + protectionTotal;
  const securityDepositAmount = motorcycle.securityDeposit;
  const grandTotalCharged = totalRentAndAddons + securityDepositAmount;

  // Final confirmed reservation object
  const [createdReservation, setCreatedReservation] = useState<RentalReservation | null>(null);

  const handleProcessPayment = () => {
    if (!termsAccepted) {
      alert('É necessário aceitar os termos do contrato de locação e da caução.');
      return;
    }

    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      const randomCode = `LM-${Math.floor(10000 + Math.random() * 90000)}`;
      const newReservation: RentalReservation = {
        id: `res-${Date.now()}`,
        code: randomCode,
        motoId: motorcycle.id,
        moto: motorcycle,
        userId: user.id,
        userName: user.fullName,
        userCnh: user.cnhNumber,
        startDate,
        startTime,
        endDate,
        endTime,
        pickupLocation,
        returnLocation,
        days: rentalDays,
        dailyRateApplied,
        rentalSubtotal,
        optionalHelmet,
        optionalHelmetCost: helmetTotal,
        optionalPhoneMount,
        optionalPhoneMountCost: phoneMountTotal,
        optionalTopBox,
        optionalTopBoxCost: topBoxTotal,
        protectionPlan,
        protectionCost: protectionTotal,
        totalRentAndAddons,
        securityDepositAmount,
        grandTotalCharged,
        securityDepositStatus: 'held',
        status: 'ready_for_pickup',
        paymentMethod,
        paymentStatus: 'paid',
        paidAt: '2026-09-12 09:30',
        createdAt: '2026-09-12 09:30',
        pickupInspection: {
          date: startDate,
          time: startTime,
          odometerKm: 8500,
          fuelLevel: 'Cheio (100%)',
          conditionNotes: 'Veículo vistoriado e pronto para entrega com tanque abastecido e pneus calibrados.',
          helmetProvided: optionalHelmet,
          documentsPresent: true,
          signatureName: user.fullName,
          inspectorName: 'Laudo Digital Automático (Pátio Central)',
        },
      };

      setCreatedReservation(newReservation);
      onConfirmBooking(newReservation);
      setStep(5);
    }, 1200);
  };

  const copyPixCode = () => {
    navigator.clipboard?.writeText(
      '00020126580014br.gov.bcb.pix0136asiarymoto-financeiro-pagamentos@banco.com5204000053039865802BR5920Asiary Moto Locadora6009SAO PAULO62070503***6304E8A2'
    );
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Wizard Top Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-base">
              {step < 5 ? step : <Check className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                {step === 1 && 'Etapa 1 de 4 • Período & Local'}
                {step === 2 && 'Etapa 2 de 4 • Opcionais & Proteção'}
                {step === 3 && 'Etapa 3 de 4 • Habilitação CNH'}
                {step === 4 && 'Etapa 4 de 4 • Resumo & Pagamento'}
                {step === 5 && 'Reserva Confirmada!'}
              </span>
              <h2 className="text-lg font-bold text-white leading-tight">
                {step === 5 ? 'Voucher de Locação Emitido' : `Aluguel: ${motorcycle.name}`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 shrink-0">
          <div
            className="bg-[#00c853] h-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>

        {/* Wizard Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* STEP 1: Period & Location */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Bike quick info bar */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <img
                  src={motorcycle.image}
                  alt={motorcycle.name}
                  className="w-16 h-12 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="font-bold text-sm text-slate-900">{motorcycle.name}</div>
                  <div className="text-xs text-slate-500">
                    Diária padrão: <span className="font-semibold text-slate-800">R$ {motorcycle.dailyRate}</span> • Caução estornável: <span className="font-semibold text-emerald-800">R$ {motorcycle.securityDeposit}</span>
                  </div>
                </div>
              </div>

              {/* Date & Time Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pickup */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Retirada da Moto
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 font-medium block mb-1">Data de início:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 font-medium block mb-1">Horário:</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 font-medium block mb-1">Ponto de Retirada:</label>
                    <select
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.name}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Return */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Devolução da Moto
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 font-medium block mb-1">Data de término:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 font-medium block mb-1">Horário:</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 font-medium block mb-1">Ponto de Devolução:</label>
                    <select
                      value={returnLocation}
                      onChange={(e) => setReturnLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.name}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Dynamic Calculation Notice */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Período calculado:</span>
                  <div className="text-base font-bold text-slate-900">
                    {rentalDays} {rentalDays === 1 ? 'diária' : 'diárias'}
                    {rentalDays >= 7 && (
                      <span className="ml-2 text-xs text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                        Desconto semanal aplicado (-R$ {motorcycle.dailyRate - motorcycle.weeklyRateDailyEquivalent}/dia)
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium">Subtotal das diárias:</span>
                  <div className="text-xl font-black text-emerald-800">
                    R$ {rentalSubtotal}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Addons & Protection */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-1">
                  Acessórios Opcionais
                </h3>
                <p className="text-xs text-slate-500">
                  Itens higienizados e homologados para sua segurança e conveniência durante a locação.
                </p>
              </div>

              <div className="space-y-3">
                {/* Helmet */}
                <label className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={optionalHelmet}
                      onChange={(e) => setOptionalHelmet(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">Capacete Homologado Inmetro</div>
                      <div className="text-xs text-slate-500">Viseira cristal anti-risco, higienização ultravioleta e forro removível</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-800">R$ {helmetCostPerDay}/dia</span>
                    <div className="text-[11px] text-slate-500">Total: R$ {helmetCostPerDay * rentalDays}</div>
                  </div>
                </label>

                {/* Phone mount */}
                <label className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={optionalPhoneMount}
                      onChange={(e) => setOptionalPhoneMount(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">Suporte de Celular Antivibração</div>
                      <div className="text-xs text-slate-500">Fixação mecânica com amortecimento de vibração ótica para GPS</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-800">R$ {phoneMountCostPerDay}/dia</span>
                    <div className="text-[11px] text-slate-500">Total: R$ {phoneMountCostPerDay * rentalDays}</div>
                  </div>
                </label>

                {/* Top Box */}
                <label className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={optionalTopBox}
                      onChange={(e) => setOptionalTopBox(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Luggage className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">Baú Traseiro 45 Litros</div>
                      <div className="text-xs text-slate-500">Com chave, suporte reforçado e capacidade para 2 capacetes ou mochila</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-800">R$ {topBoxCostPerDay}/dia</span>
                    <div className="text-[11px] text-slate-500">Total: R$ {topBoxCostPerDay * rentalDays}</div>
                  </div>
                </label>
              </div>

              {/* Protection Plans */}
              <div className="pt-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Plano de Proteção & Seguro
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setProtectionPlan('basic')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      protectionPlan === 'basic'
                        ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">Proteção Básica</span>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Inclusa</span>
                    </div>
                    <ul className="text-xs text-slate-600 mt-2 space-y-1">
                      <li>• Roubo e furto qualificado</li>
                      <li>• Danos corporais a terceiros</li>
                      <li>• Guincho 24h até 50km</li>
                      <li className="text-slate-500 text-[11px]">• Franquia integral em colisões</li>
                    </ul>
                  </div>

                  <div
                    onClick={() => setProtectionPlan('complete')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      protectionPlan === 'complete'
                        ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">Proteção Total Plus</span>
                      <span className="text-xs font-bold text-slate-800">+R$ {completeProtectionPerDay}/dia</span>
                    </div>
                    <ul className="text-xs text-slate-600 mt-2 space-y-1">
                      <li>• Redução de 50% no valor da franquia</li>
                      <li>• Cobertura para pneu e retrovisores</li>
                      <li>• Guincho 24h sem limite de km na RMSP</li>
                      <li>• Isenção de taxa de lucros cessantes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CNH Verification */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                      A
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Habilitação do Locatário</div>
                      <div className="text-xs text-slate-500">Exigência legal: Categoria A ativa e válida para motos</div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    user.cnhStatus === 'verified'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {user.cnhStatus === 'verified' ? 'Aprovada & Verificada' : 'Em Análise'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block">Condutor:</span>
                    <span className="font-bold text-slate-800">{user.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">CPF:</span>
                    <span className="font-bold text-slate-800">{user.cpf}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Nº de Registro:</span>
                    <span className="font-bold text-slate-800">{user.cnhNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Validade:</span>
                    <span className="font-bold text-slate-800">{user.cnhExpiryDate}</span>
                  </div>
                </div>
              </div>

              {/* Status Notice */}
              {user.cnhStatus === 'verified' ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Habilitação Categoria A verificada com sucesso! </span>
                    Seu documento está regular perante os órgãos de trânsito e atende a todos os requisitos de idade mínima e tempo de habilitação. Você está liberado para retirar a motocicleta.
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs text-amber-900">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Documentação Pendente de Envio: </span>
                      Envie a foto de sua CNH no painel de documentos antes da retirada da moto.
                    </div>
                  </div>
                  <button
                    onClick={onNavigateToCnh}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 shrink-0"
                  >
                    Enviar CNH
                  </button>
                </div>
              )}

              {/* Legal Reminder */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  Regras do Código de Trânsito Brasileiro (CTB):
                </div>
                <p>
                  • É obrigatório o porte da CNH (física ou app CNH Digital) durante toda a condução da motocicleta.
                </p>
                <p>
                  • A condução é estritamente pessoal e intransferível. O empréstimo a terceiros sem prévio cadastro enseja rescisão contratual imediata e retenção da caução.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Summary & Payment */}
          {step === 4 && (
            <div className="space-y-6">
              {/* Financial summary breakdown */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 flex items-center justify-between">
                  <span>Demonstrativo Financeiro do Aluguel</span>
                  <span className="text-xs font-normal text-slate-500">100% Transparente</span>
                </h3>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span>Diárias da moto ({rentalDays}x R$ {dailyRateApplied}):</span>
                    <span className="font-semibold text-slate-900">R$ {rentalSubtotal},00</span>
                  </div>

                  {optionalHelmet && (
                    <div className="flex justify-between">
                      <span>Capacete Homologado ({rentalDays} dias):</span>
                      <span className="font-semibold text-slate-900">R$ {helmetTotal},00</span>
                    </div>
                  )}

                  {optionalPhoneMount && (
                    <div className="flex justify-between">
                      <span>Suporte Antivibração Celular ({rentalDays} dias):</span>
                      <span className="font-semibold text-slate-900">R$ {phoneMountTotal},00</span>
                    </div>
                  )}

                  {optionalTopBox && (
                    <div className="flex justify-between">
                      <span>Baú Traseiro 45L ({rentalDays} dias):</span>
                      <span className="font-semibold text-slate-900">R$ {topBoxTotal},00</span>
                    </div>
                  )}

                  {protectionPlan === 'complete' && (
                    <div className="flex justify-between">
                      <span>Proteção Total Plus ({rentalDays} dias):</span>
                      <span className="font-semibold text-slate-900">R$ {protectionTotal},00</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                    <span>Subtotal de Locação & Acessórios:</span>
                    <span>R$ {totalRentAndAddons},00</span>
                  </div>
                </div>

                {/* Caução Callout */}
                <div className="bg-emerald-50/90 border border-emerald-300 rounded-xl p-3.5 mt-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-950">Depósito de Caução de Segurança:</span>
                        <div className="text-[11px] text-emerald-800">
                          Retenção temporária, 100% estornável após a vistoria de devolução
                        </div>
                      </div>
                    </div>
                    <span className="font-extrabold text-base text-emerald-900 shrink-0">
                      R$ {securityDepositAmount},00
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-baseline font-black text-slate-900 text-base">
                  <span>Total Cobrado na Reserva:</span>
                  <span className="text-xl text-emerald-700">R$ {grandTotalCharged},00</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
                  Método de Pagamento
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      paymentMethod === 'pix'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>PIX (Instantâneo)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      paymentMethod === 'credit_card'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Cartão de Crédito</span>
                  </button>
                </div>

                {/* PIX Details */}
                {paymentMethod === 'pix' && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-32 h-32 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center shrink-0">
                        <QrCode className="w-24 h-24 text-slate-800" />
                      </div>
                      <div className="space-y-2 text-xs flex-1">
                        <div className="font-bold text-slate-800">Pague com QR Code ou Chave Copia e Cola</div>
                        <p className="text-slate-600">
                          A confirmação da reserva e a reserva da moto são automáticas e levam poucos segundos.
                        </p>
                        <button
                          type="button"
                          onClick={copyPixCode}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {pixCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Código PIX Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Código PIX</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Details */}
                {paymentMethod === 'credit_card' && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="text-xs text-slate-600">
                      A caução é registrada como pré-autorização e cancelada após o check-out sem cobrança na fatura.
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="col-span-2">
                        <label className="text-slate-600 block mb-1">Número do Cartão:</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-900"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-slate-600 block mb-1">Nome no Cartão:</label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1">Validade:</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1">CVV:</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Terms Acceptance */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 mt-0.5"
                  />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Declaro que li e concordo com os termos de <span className="font-bold text-slate-900">Locação de Veículo Motorizado</span>, comprometo-me a devolver a moto no horário estipulado com o mesmo nível de combustível e compreendo que o depósito de caução (R$ {securityDepositAmount},00) será estornado integralmente em até 24h a 48h úteis após a vistoria final sem avarias ou pendências.
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: Booking Confirmation & Voucher */}
          {step === 5 && createdReservation && (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Pagamento Aprovado Instantaneamente
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  Reserva {createdReservation.code} Confirmada!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  Sua moto está reservada e pronta para retirada no pátio selecionado. Apresente seu documento e o código localizador no balcão.
                </p>
              </div>

              {/* Voucher Ticket Box */}
              <div className="bg-slate-50 border-2 border-dashed border-emerald-400/80 rounded-2xl p-5 max-w-lg mx-auto text-left text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-slate-500 block">Código Localizador</span>
                    <span className="text-lg font-black text-slate-900">{createdReservation.code}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Veículo</span>
                    <span className="font-bold text-emerald-800 text-sm">{createdReservation.moto.name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-500 block">Data de Retirada:</span>
                    <span className="font-bold">{createdReservation.startDate} às {createdReservation.startTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Data de Devolução:</span>
                    <span className="font-bold">{createdReservation.endDate} às {createdReservation.endTime}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Local de Retirada:</span>
                    <span className="font-bold">{createdReservation.pickupLocation}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Caução Retida:</span>
                    <span className="font-bold text-emerald-800">R$ {createdReservation.securityDepositAmount},00 (Em garantia)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Condutor:</span>
                    <span className="font-bold">{createdReservation.userName}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Você pode acompanhar a locação, realizar a vistoria de retirada e conferir o estorno da caução na aba <span className="font-bold text-slate-700">Minhas Reservas</span>.
              </p>
            </div>
          )}
        </div>

        {/* Wizard Bottom Controls */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 shadow-xs">
          {step > 1 && step < 5 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2.5 rounded-xl bg-[#eafff2] hover:bg-[#cbfae0] border border-[#00c853] text-[#007a2a] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          ) : (
            <div></div>
          )}

          {step === 1 && (
            <button
              id="wizard-step1-next"
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl bg-[#00c853] hover:bg-[#00b341] text-white text-xs font-extrabold shadow-md shadow-[#00c853]/25 transition-all flex items-center gap-2 cursor-pointer ml-auto"
            >
              <span>Continuar para Opcionais</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <button
              id="wizard-step2-next"
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl bg-[#00c853] hover:bg-[#00b341] text-white text-xs font-extrabold shadow-md shadow-[#00c853]/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Continuar para Habilitação</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              id="wizard-step3-next"
              onClick={() => setStep(4)}
              className="px-6 py-2.5 rounded-xl bg-[#00c853] hover:bg-[#00b341] text-white text-xs font-extrabold shadow-md shadow-[#00c853]/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Continuar para Pagamento</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 4 && (
            <button
              id="wizard-step4-pay"
              disabled={isProcessingPayment || !termsAccepted}
              onClick={handleProcessPayment}
              className={`px-6 py-2.5 rounded-xl text-white text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                termsAccepted
                  ? 'bg-[#00c853] hover:bg-[#00b341] shadow-[#00c853]/30'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70'
              }`}
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processando e autorizando caução...</span>
                </>
              ) : (
                <>
                  <span>Pagar R$ {grandTotalCharged},00 e Confirmar</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {step === 5 && (
            <button
              id="wizard-finish-btn"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#00c853] hover:bg-[#00b341] text-white text-xs font-extrabold shadow-md shadow-[#00c853]/25 transition-all flex items-center gap-2 cursor-pointer ml-auto"
            >
              <span>Ver Minhas Reservas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
