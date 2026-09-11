import React, { useState, useRef } from 'react';
import { 
  Landmark, 
  Copy, 
  Check, 
  Upload, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  HelpCircle, 
  RefreshCw, 
  DollarSign, 
  Sparkles, 
  Eye, 
  X, 
  Download, 
  Building2, 
  FileCheck, 
  Calendar, 
  Send,
  Zap,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  IbanDepositRecord, 
  IbanDepositType, 
  UserProfile, 
  RentalReservation, 
  BankAccountDetails 
} from '../types';
import { OFFICIAL_IBAN_DETAILS } from '../data/initialData';

interface DepositIbanViewProps {
  user: UserProfile;
  reservations: RentalReservation[];
  ibanDeposits: IbanDepositRecord[];
  onAddIbanDeposit: (newDeposit: IbanDepositRecord) => void;
  onUpdateWalletBalance?: (amountToAdd: number) => void;
  onOpenSupport?: () => void;
  onNavigateToReservations?: () => void;
}

type IbanSubSection = 'todos' | 'dados_bancarios' | 'enviar_comprovativo' | 'historico' | 'calculadora' | 'duvidas';

export const DepositIbanView: React.FC<DepositIbanViewProps> = ({
  user,
  reservations,
  ibanDeposits,
  onAddIbanDeposit,
  onUpdateWalletBalance,
  onOpenSupport,
  onNavigateToReservations,
}) => {
  const [activeSection, setActiveSection] = useState<IbanSubSection>('todos');

  // Copy status indicators
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form State
  const [depositType, setDepositType] = useState<IbanDepositType>('caucao');
  const [selectedReservationCode, setSelectedReservationCode] = useState<string>(
    reservations[0]?.code || 'LM-84920'
  );
  const [customReservationCode, setCustomReservationCode] = useState<string>('');
  const [amount, setAmount] = useState<string>('600');
  const [currency, setCurrency] = useState<'BRL' | 'EUR'>('BRL');
  const [sourceHolderName, setSourceHolderName] = useState<string>(user.fullName || '');
  const [sourceIban, setSourceIban] = useState<string>('');
  const [sourceBankName, setSourceBankName] = useState<string>('');
  const [transferDate, setTransferDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [transferTime, setTransferTime] = useState<string>('10:00');
  const [bankTransactionRef, setBankTransactionRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Upload file state
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    previewUrl?: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form Submission feedback
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccessRecord, setSubmissionSuccessRecord] = useState<IbanDepositRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Receipt details modal
  const [viewingRecord, setViewingRecord] = useState<IbanDepositRecord | null>(null);

  // Currency Converter State
  const EUR_TO_BRL_RATE = 6.10;
  const [calcEur, setCalcEur] = useState<string>('100');
  const [calcBrl, setCalcBrl] = useState<string>((100 * EUR_TO_BRL_RATE).toFixed(2));

  // FAQ open/close state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Copy helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2500);
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const sizeInKb = Math.round(file.size / 1024);
    const sizeStr = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`;
    
    // Create preview if image
    let previewUrl: string | undefined;
    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
    }

    setUploadedFile({
      name: file.name,
      size: sizeStr,
      previewUrl,
    });
    setFormError(null);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Calculator converters
  const handleEurChange = (val: string) => {
    setCalcEur(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setCalcBrl((num * EUR_TO_BRL_RATE).toFixed(2));
    } else {
      setCalcBrl('');
    }
  };

  const handleBrlChange = (val: string) => {
    setCalcBrl(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setCalcEur((num / EUR_TO_BRL_RATE).toFixed(2));
    } else {
      setCalcEur('');
    }
  };

  // Handle Form Submit
  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Por favor, informe um valor de depósito válido maior que zero.');
      return;
    }

    if (!sourceHolderName.trim()) {
      setFormError('Por favor, informe o nome do titular da conta bancária de origem.');
      return;
    }

    if (!bankTransactionRef.trim()) {
      setFormError('Por favor, informe o número de operação / referência da transferência bancária.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().substring(0, 5);
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const protocolNumber = `IBAN-2026-${randomId}`;

      const resCode = depositType === 'recarga_carteira' 
        ? undefined 
        : selectedReservationCode === 'outro' 
        ? customReservationCode.trim() || 'LM-AVULSO'
        : selectedReservationCode;

      const newRecord: IbanDepositRecord = {
        id: `iban-dep-${Date.now()}`,
        protocolNumber,
        depositType,
        reservationCode: resCode,
        amount: parsedAmount,
        currency,
        sourceIban: sourceIban.trim() || undefined,
        sourceHolderName: sourceHolderName.trim(),
        sourceBankName: sourceBankName.trim() || undefined,
        transferDate,
        transferTime,
        bankTransactionRef: bankTransactionRef.trim(),
        receiptFileName: uploadedFile?.name || 'comprovativo_transferencia_bancaria.pdf',
        receiptFileSize: uploadedFile?.size || '340 KB',
        receiptUrl: uploadedFile?.previewUrl,
        status: 'em_analise',
        submittedAt: `${dateStr} ${timeStr}`,
        notes: notes.trim() || undefined,
      };

      onAddIbanDeposit(newRecord);

      // If user selected wallet recharge, also credit balance
      if (depositType === 'recarga_carteira' && onUpdateWalletBalance) {
        onUpdateWalletBalance(parsedAmount);
      }

      setIsSubmitting(false);
      setSubmissionSuccessRecord(newRecord);

      // Reset form
      setBankTransactionRef('');
      setUploadedFile(null);
      setNotes('');
    }, 900);
  };

  const faqs = [
    {
      q: 'Quanto tempo leva para compensar uma transferência via IBAN?',
      a: 'Transferências SEPA Instantâneas ou no mesmo banco (Millennium BCP) são compensadas em até 10 a 30 minutos. Transferências SEPA normais e de outros bancos europeus costumam ser compensadas no mesmo dia útil ou em até 24h úteis. Transferências internacionais SWIFT levam de 24h a 48h úteis.'
    },
    {
      q: 'Por que é obrigatório colocar o CPF ou Código de Reserva na descrição da transferência?',
      a: 'Nosso sistema de tesouraria realiza a conciliação bancária de forma automatizada através do extrato. Inserir seu CPF ou o código da reserva (ex: LM-84920) no campo Descrição/Motivo permite a vinculação imediata do pagamento à sua moto e agiliza a liberação no pátio.'
    },
    {
      q: 'Como funciona o estorno do depósito de caução se paguei via IBAN?',
      a: 'Caso você tenha depositado a caução via transferência bancária IBAN, após a devolução da moto e a conferência do laudo de vistoria sem avarias, o valor integral da caução é estornado via transferência para o mesmo IBAN de origem em até 24h a 48h úteis.'
    },
    {
      q: 'Posso pagar em Euros (€) se a minha conta bancária for de Portugal ou outro país europeu?',
      a: 'Sim! Aceitamos transferências diretas em Euros (€) pela rede SEPA sem taxas extras de nossa parte. Basta utilizar o valor convertido pela nossa calculadora oficial ou conforme discriminado na sua reserva.'
    },
    {
      q: 'O que devo fazer se esqueci de anexar o comprovativo no formulário?',
      a: 'Você pode enviar o comprovativo bancário a qualquer momento entrando em contato com nossa Central Financeira através do botão de Suporte ou pelo WhatsApp da Tesouraria com o número do seu protocolo de envio.'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 animate-fade-in">
      {/* 1. TOP HERO BANNER: DEPÓSITO & PAGAMENTO IBAN */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eafff2] text-[#009935] text-xs font-black border border-[#9bf6c4]">
              <Landmark className="w-3.5 h-3.5 text-[#00c853]" />
              <span>CANAL OFICIAL DE DEPÓSITO & TRANSFERÊNCIA BANCÁRIA</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Depósito Bancário & Envio de Pagamento via IBAN
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Consulte os dados bancários oficiais da Asiary Moto (IBAN, BIC/SWIFT, Banco Beneficiário) para depósito de <strong>Caução Estornável</strong>, pagamento de <strong>Aluguel de Motocicletas</strong> ou <strong>Recarga de Saldo</strong> com conciliação prioritária.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00c853]" />
                Conta Oficial Verificada
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <Zap className="w-3.5 h-3.5 text-[#00c853]" />
                Rede SEPA & Internacional
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-[#00c853]" />
                Conciliação Rápida
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <Check className="w-3.5 h-3.5 text-[#00c853]" />
                Estorno 100% Garantido
              </span>
            </div>
          </div>

          {/* Quick Bank Summary Card */}
          <div className="bg-[#eafff2] rounded-2xl p-5 border border-[#9bf6c4] text-xs space-y-3 shrink-0 lg:w-80 shadow-2xs">
            <span className="font-extrabold text-[#007a2a] uppercase tracking-wider text-[10px] block">
              Dados Rápidos para Envio
            </span>
            <div className="space-y-2">
              <div className="py-1 border-b border-[#9bf6c4]/60">
                <span className="text-slate-600 block text-[10px]">Banco Beneficiário:</span>
                <span className="font-bold text-slate-900">Millennium BCP (Rede SEPA)</span>
              </div>
              <div className="py-1 border-b border-[#9bf6c4]/60">
                <span className="text-slate-600 block text-[10px]">IBAN Oficial:</span>
                <span className="font-mono font-black text-[#007a2a] text-xs tracking-tight">
                  PT50 0033 0000 4521 8974 6321 0
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <div>
                  <span className="text-slate-600 block text-[10px]">BIC / SWIFT:</span>
                  <span className="font-mono font-bold text-slate-900">BCPTPTLX</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(OFFICIAL_IBAN_DETAILS.iban, 'hero_iban')}
                  className="px-3 py-1.5 bg-[#00c853] hover:bg-[#00b341] text-white text-[11px] font-bold rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'hero_iban' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'hero_iban' ? 'Copiado!' : 'Copiar IBAN'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                const el = document.getElementById('form-envio-iban');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full py-2.5 bg-[#00c853] hover:bg-[#00b341] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#00c853]/25 transition-all text-center cursor-pointer block"
            >
              Enviar Comprovativo de Pagamento
            </button>
          </div>
        </div>
      </section>

      {/* 2. SUB-NAVIGATION PILLS */}
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
          onClick={() => setActiveSection('dados_bancarios')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'dados_bancarios'
              ? 'bg-[#00c853] text-white font-black shadow-md shadow-[#00c853]/25'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#eafff2] hover:text-[#009935]'
          }`}
        >
          Dados da Conta IBAN
        </button>

        <button
          onClick={() => setActiveSection('enviar_comprovativo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'enviar_comprovativo'
              ? 'bg-[#00c853] text-white font-black shadow-md shadow-[#00c853]/25'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#eafff2] hover:text-[#009935]'
          }`}
        >
          Enviar Comprovativo
        </button>

        <button
          onClick={() => setActiveSection('historico')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'historico'
              ? 'bg-[#00c853] text-white font-black shadow-md shadow-[#00c853]/25'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#eafff2] hover:text-[#009935]'
          }`}
        >
          Histórico de Depósitos ({ibanDeposits.length})
        </button>

        <button
          onClick={() => setActiveSection('calculadora')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'calculadora'
              ? 'bg-[#00c853] text-white font-black shadow-md shadow-[#00c853]/25'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#eafff2] hover:text-[#009935]'
          }`}
        >
          Conversor EUR ↔ BRL
        </button>

        <button
          onClick={() => setActiveSection('duvidas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'duvidas'
              ? 'bg-[#00c853] text-white font-black shadow-md shadow-[#00c853]/25'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#eafff2] hover:text-[#009935]'
          }`}
        >
          Prazos & Perguntas Frequentes
        </button>
      </div>

      {/* 3. SECTION: DADOS BANCÁRIOS OFICIAIS IBAN */}
      {(activeSection === 'todos' || activeSection === 'dados_bancarios') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-[#009935] block">
                Contas Oficiais de Recebimento
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Dados Bancários para Transferência & Depósito IBAN
              </h2>
              <p className="text-xs text-slate-500">
                Realize a transferência pelo seu aplicativo ou internet banking utilizando os parâmetros abaixo:
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs text-[#007a2a] font-bold bg-[#eafff2] px-3 py-1.5 rounded-xl border border-[#9bf6c4]">
              <Lock className="w-4 h-4 text-[#00c853]" />
              <span>Titularidade Verificada & Registrada</span>
            </div>
          </div>

          {/* Bank Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* IBAN Card (Destaque Principal) */}
            <div className="md:col-span-2 bg-[#f4fcf6] border-2 border-[#00c853] p-5 sm:p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#00c853] text-white flex items-center justify-center font-black">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#007a2a] block">
                      Número Internacional de Conta Bancária (IBAN)
                    </span>
                    <span className="text-xs text-slate-600">Rede SEPA (União Europeia e Internacional)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(OFFICIAL_IBAN_DETAILS.iban, 'iban_main')}
                  className="px-4 py-2 bg-[#00c853] hover:bg-[#00b341] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  {copiedField === 'iban_main' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>IBAN Copiado com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar IBAN Completo</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#9bf6c4] flex items-center justify-between">
                <span className="font-mono text-base sm:text-xl font-black text-slate-900 tracking-wider break-all">
                  {OFFICIAL_IBAN_DETAILS.iban}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Suporta transferências em <strong>Euros (€)</strong> e pagamentos via SEPA Instantâneo com liquidação em minutos.
              </p>
            </div>

            {/* BIC / SWIFT Card */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Código BIC / SWIFT</span>
                <button
                  type="button"
                  onClick={() => handleCopy(OFFICIAL_IBAN_DETAILS.bicSwift, 'bic')}
                  className="text-xs text-[#007a2a] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'bic' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'bic' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <div className="font-mono font-black text-lg text-slate-900">
                {OFFICIAL_IBAN_DETAILS.bicSwift}
              </div>
              <p className="text-[11px] text-slate-500">
                Utilizado para transações internacionais ou bancos fora de Portugal.
              </p>
            </div>

            {/* Banco e Agência */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Instituição Bancária</span>
              <div className="font-bold text-slate-900 text-sm">
                {OFFICIAL_IBAN_DETAILS.bankName}
              </div>
              <p className="text-[11px] text-slate-500">
                {OFFICIAL_IBAN_DETAILS.bankAddress}
              </p>
            </div>

            {/* Titular e Empresa */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Titular da Conta</span>
                <button
                  type="button"
                  onClick={() => handleCopy(OFFICIAL_IBAN_DETAILS.companyName, 'empresa')}
                  className="text-xs text-[#007a2a] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'empresa' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'empresa' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {OFFICIAL_IBAN_DETAILS.companyName}
              </div>
              <p className="text-[11px] text-slate-500">
                {OFFICIAL_IBAN_DETAILS.taxId}
              </p>
            </div>

            {/* Instrução de Identificação Obrigatória */}
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-2 text-xs text-amber-950 shadow-2xs">
              <div className="flex items-center gap-1.5 font-black text-amber-900 uppercase tracking-wider text-[10px]">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                Campo Descrição / Motivo Obrigatório
              </div>
              <p className="text-[11px] leading-relaxed">
                Ao preencher a transferência no seu banco, digite no campo <strong>"Descrição"</strong> ou <strong>"Mensagem"</strong> o seu <strong>CPF</strong> ou o <strong>Código da Reserva</strong> (Ex: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">LM-84920</code>).
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 4. SECTION: FORMULÁRIO DE ENVIO DE COMPROVATIVO / NOTIFICAÇÃO */}
      {(activeSection === 'todos' || activeSection === 'enviar_comprovativo') && (
        <section id="form-envio-iban" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#eafff2] text-[#00c853] flex items-center justify-center font-black">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Enviar Notificação & Comprovativo de Pagamento IBAN
                </h2>
                <p className="text-xs text-slate-500">
                  Informe os dados da transferência e anexe o comprovativo para que a tesouraria compense em prioridade.
                </p>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-500">
              Protocolo emitido na hora
            </div>
          </div>

          {/* SUCCESS MODAL / CARD AFTER SUBMISSION */}
          {submissionSuccessRecord && (
            <div className="bg-[#eafff2] border-2 border-[#00c853] rounded-2xl p-6 space-y-4 animate-fade-in shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#00c853] text-white flex items-center justify-center font-black shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#007a2a] block">
                      Comprovativo Registrado com Sucesso
                    </span>
                    <h3 className="text-lg font-black text-slate-900">
                      Protocolo: {submissionSuccessRecord.protocolNumber}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSubmissionSuccessRecord(null)}
                  className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer border border-[#9bf6c4]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-[#9bf6c4] text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Tipo de Operação:</span>
                  <span className="font-bold text-slate-900 capitalize">
                    {submissionSuccessRecord.depositType === 'caucao' ? 'Depósito de Caução' : submissionSuccessRecord.depositType === 'aluguel' ? 'Pagamento de Aluguel' : 'Recarga de Saldo'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Valor Informado:</span>
                  <span className="font-black text-[#007a2a]">
                    {submissionSuccessRecord.currency === 'EUR' ? '€' : 'R$'} {submissionSuccessRecord.amount.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Status Inicial:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                    <Clock className="w-3 h-3" />
                    Em Análise
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Previsão de Liberação:</span>
                  <span className="font-bold text-slate-900">10 a 30 minutos</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-600">
                  Nossa equipe de tesouraria foi notificada e já está conferindo o extrato bancário. Você receberá a confirmação em seu painel.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmissionSuccessRecord(null);
                      setActiveSection('historico');
                    }}
                    className="px-4 py-2 bg-white border border-[#00c853] text-[#007a2a] hover:bg-[#eafff2] rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Ver no Histórico
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmissionSuccessRecord(null)}
                    className="px-4 py-2 bg-[#00c853] hover:bg-[#00b341] text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
                  >
                    Novo Envio
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmitDeposit} className="space-y-6">
            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* 1. Tipo de Operação */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-2">
                1. Finalidade do Depósito ou Pagamento IBAN:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDepositType('caucao');
                    setAmount('600');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    depositType === 'caucao'
                      ? 'bg-[#eafff2] border-[#00c853] text-[#007a2a] ring-2 ring-[#00c853]/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-xs">Depósito de Caução</span>
                    <ShieldCheck className={`w-4 h-4 ${depositType === 'caucao' ? 'text-[#00c853]' : 'text-slate-400'}`} />
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Garantia contratual da moto (100% estornável após vistoria)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDepositType('aluguel');
                    setAmount('285');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    depositType === 'aluguel'
                      ? 'bg-[#eafff2] border-[#00c853] text-[#007a2a] ring-2 ring-[#00c853]/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-xs">Pagamento de Aluguel</span>
                    <DollarSign className={`w-4 h-4 ${depositType === 'aluguel' ? 'text-[#00c853]' : 'text-slate-400'}`} />
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Quitação de diárias, plano semanal ou renovação de locação
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDepositType('recarga_carteira');
                    setAmount('150');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    depositType === 'recarga_carteira'
                      ? 'bg-[#eafff2] border-[#00c853] text-[#007a2a] ring-2 ring-[#00c853]/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-xs">Recarga de Saldo</span>
                    <Sparkles className={`w-4 h-4 ${depositType === 'recarga_carteira' ? 'text-[#00c853]' : 'text-slate-400'}`} />
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Adicionar créditos na sua Carteira para futuras utilizações
                  </span>
                </button>
              </div>
            </div>

            {/* 2. Reserva Associada (caso não seja recarga de saldo) */}
            {depositType !== 'recarga_carteira' && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-800 block">
                  2. Vincular a uma Reserva de Motocicleta:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <select
                      value={selectedReservationCode}
                      onChange={(e) => setSelectedReservationCode(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#00c853] cursor-pointer"
                    >
                      {reservations.map((res) => (
                        <option key={res.id} value={res.code}>
                          {res.code} • {res.moto.name} ({res.status === 'ready_for_pickup' ? 'Aguardando Retirada' : res.status})
                        </option>
                      ))}
                      <option value="outro">Outro Código de Reserva / Avulso</option>
                    </select>
                  </div>

                  {selectedReservationCode === 'outro' && (
                    <div>
                      <input
                        type="text"
                        value={customReservationCode}
                        onChange={(e) => setCustomReservationCode(e.target.value)}
                        placeholder="Digite o código da reserva (ex: LM-99201)"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#00c853]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. Valores e Moeda */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Valor Transferido:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {currency === 'EUR' ? '€' : 'R$'}
                  </span>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#00c853]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Moeda da Transferência:
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'BRL' | 'EUR')}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#00c853] cursor-pointer"
                >
                  <option value="BRL">R$ - Real Brasileiro (BRL)</option>
                  <option value="EUR">€ - Euro (EUR - Rede SEPA)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Data da Transferência:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    required
                  />
                  <input
                    type="time"
                    value={transferTime}
                    onChange={(e) => setTransferTime(e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* 4. Dados do Remetente e Transação */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Titular da Conta de Origem:
                </label>
                <input
                  type="text"
                  value={sourceHolderName}
                  onChange={(e) => setSourceHolderName(e.target.value)}
                  placeholder="Nome completo do remetente"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#00c853]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  IBAN de Origem (Opcional):
                </label>
                <input
                  type="text"
                  value={sourceIban}
                  onChange={(e) => setSourceIban(e.target.value)}
                  placeholder="Ex: PT50 0018 0000 ..."
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#00c853]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nº da Operação / TXN Ref:
                </label>
                <input
                  type="text"
                  value={bankTransactionRef}
                  onChange={(e) => setBankTransactionRef(e.target.value)}
                  placeholder="Código do recibo bancário"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#00c853]"
                  required
                />
              </div>
            </div>

            {/* 5. Área de Upload de Comprovativo Bancário */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Comprovativo Bancário (PDF, PNG, JPG):
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,image/png,image/jpeg,image/webp"
                className="hidden"
              />

              {!uploadedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-[#00c853] bg-[#eafff2]'
                      : 'border-slate-300 hover:border-[#00c853] bg-slate-50 hover:bg-[#eafff2]/40'
                  }`}
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <div className="font-bold text-slate-800 text-xs sm:text-sm">
                    Clique para selecionar ou arraste o comprovativo aqui
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Formatos suportados: PDF, JPG, PNG (tamanho máximo: 15MB)
                  </p>
                </div>
              ) : (
                <div className="bg-[#eafff2] border border-[#9bf6c4] p-4 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white text-[#00c853] border border-[#9bf6c4] flex items-center justify-center font-bold">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs truncate max-w-xs sm:max-w-md">
                        {uploadedFile.name}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {uploadedFile.size} • Comprovativo anexado com sucesso
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Trocar Arquivo
                  </button>
                </div>
              )}
            </div>

            {/* Observações Opcionais */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Observações para o Setor Financeiro (Opcional):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Ex: Pagamento referente ao adiantamento do caução para retirada amanhã às 09h."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#00c853]"
              />
            </div>

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-[#00c853]" />
                <span>Dados protegidos por criptografia de ponta a ponta</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#00c853] hover:bg-[#00b341] text-white font-black text-xs rounded-xl shadow-md shadow-[#00c853]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Registrando Comprovativo...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Notificação de Pagamento IBAN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 5. SECTION: HISTÓRICO DE DEPÓSITOS & PAGAMENTOS IBAN */}
      {(activeSection === 'todos' || activeSection === 'historico') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-[#009935] block">
                Auditoria & Protocolos
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Histórico de Depósitos & Pagamentos via IBAN
              </h2>
              <p className="text-xs text-slate-500">
                Acompanhe o status de conciliação bancária de todos os seus comprovativos enviados.
              </p>
            </div>

            <div className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              Total Registrado: <strong className="text-slate-900">{ibanDeposits.length}</strong> operações
            </div>
          </div>

          {ibanDeposits.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <Landmark className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">Nenhum depósito IBAN registrado ainda</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Assim que você realizar uma transferência e enviar o comprovativo pelo formulário acima, ele aparecerá aqui com protocolo.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {ibanDeposits.map((dep) => (
                <div
                  key={dep.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {dep.protocolNumber}
                      </span>
                      
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-[#eafff2] text-[#007a2a] border border-[#9bf6c4]">
                        {dep.depositType === 'caucao' ? 'Depósito de Caução' : dep.depositType === 'aluguel' ? 'Pagamento de Aluguel' : 'Recarga de Saldo'}
                      </span>

                      {dep.reservationCode && (
                        <span className="text-[11px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          Reserva: {dep.reservationCode}
                        </span>
                      )}

                      {/* Status badge */}
                      {dep.status === 'aprovado' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Compensado / Aprovado
                        </span>
                      )}

                      {dep.status === 'em_analise' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Em Análise pela Tesouraria
                        </span>
                      )}

                      {dep.status === 'pendente' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          <RefreshCw className="w-3 h-3 text-blue-600" />
                          Aguardando Compensação SEPA
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5">
                      <div>
                        Titular Remetente: <strong className="text-slate-800">{dep.sourceHolderName}</strong>
                        {dep.sourceBankName && ` • Banco: ${dep.sourceBankName}`}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Transferido em: {dep.transferDate} {dep.transferTime && `às ${dep.transferTime}`} • Ref. Bancária: <span className="font-mono">{dep.bankTransactionRef}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor da Operação</span>
                      <span className="text-lg font-black text-[#007a2a]">
                        {dep.currency === 'EUR' ? '€' : 'R$'} {dep.amount.toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setViewingRecord(dep)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detalhes</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 6. SECTION: CONVERSOR & CALCULADORA IBAN (EUR ↔ BRL) */}
      {(activeSection === 'todos' || activeSection === 'calculadora') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#eafff2] text-[#00c853] flex items-center justify-center font-black">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Calculadora & Conversor de Moeda IBAN (EUR ↔ BRL)
              </h2>
              <p className="text-xs text-slate-500">
                Simule os valores correspondentes em Euros (€) para depósitos via SEPA de contas bancárias internacionais.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
            {/* Input EUR */}
            <div className="lg:col-span-5 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Valor em Euro (€):
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">€</span>
                <input
                  type="number"
                  value={calcEur}
                  onChange={(e) => handleEurChange(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-black text-base text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#00c853]"
                  placeholder="100.00"
                />
              </div>
              <span className="text-[11px] text-slate-500 block">
                Valor a ser transferido do seu banco europeu
              </span>
            </div>

            {/* Exchange Symbol */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-[#00c853] text-white flex items-center justify-center shadow-xs">
                <RefreshCw className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 mt-1">1 EUR ≈ R$ {EUR_TO_BRL_RATE.toFixed(2)}</span>
            </div>

            {/* Input BRL */}
            <div className="lg:col-span-5 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Equivalente em Reais (R$):
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  value={calcBrl}
                  onChange={(e) => handleBrlChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-black text-base text-[#007a2a] focus:outline-hidden focus:ring-2 focus:ring-[#00c853]"
                  placeholder="610.00"
                />
              </div>
              <span className="text-[11px] text-slate-500 block">
                Crédito creditado no contrato de locação / caução
              </span>
            </div>
          </div>

          {/* Quick presets for Caução */}
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Valores Rápidos de Caução de Motos Convertidos:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setCalcBrl('450.00');
                  setCalcEur((450 / EUR_TO_BRL_RATE).toFixed(2));
                  setAmount('450');
                }}
                className="p-3 bg-slate-50 hover:bg-[#eafff2] border border-slate-200 hover:border-[#00c853] rounded-xl text-left transition-all cursor-pointer"
              >
                <div className="font-bold text-xs text-slate-900">Motos Econômicas (CG / Factor)</div>
                <div className="text-xs font-black text-[#007a2a] mt-0.5">R$ 450,00 ≈ € {(450 / EUR_TO_BRL_RATE).toFixed(2)}</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCalcBrl('600.00');
                  setCalcEur((600 / EUR_TO_BRL_RATE).toFixed(2));
                  setAmount('600');
                }}
                className="p-3 bg-slate-50 hover:bg-[#eafff2] border border-slate-200 hover:border-[#00c853] rounded-xl text-left transition-all cursor-pointer"
              >
                <div className="font-bold text-xs text-slate-900">Scooters & Elétricas (NMAX / Voltz)</div>
                <div className="text-xs font-black text-[#007a2a] mt-0.5">R$ 600,00 ≈ € {(600 / EUR_TO_BRL_RATE).toFixed(2)}</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCalcBrl('800.00');
                  setCalcEur((800 / EUR_TO_BRL_RATE).toFixed(2));
                  setAmount('800');
                }}
                className="p-3 bg-slate-50 hover:bg-[#eafff2] border border-slate-200 hover:border-[#00c853] rounded-xl text-left transition-all cursor-pointer"
              >
                <div className="font-bold text-xs text-slate-900">Trail & Touring (Crosser / Hunter)</div>
                <div className="text-xs font-black text-[#007a2a] mt-0.5">R$ 800,00 ≈ € {(800 / EUR_TO_BRL_RATE).toFixed(2)}</div>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 7. SECTION: DÚVIDAS FREQUENTES & CENTRAL DE SUPORTE */}
      {(activeSection === 'todos' || activeSection === 'duvidas') && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#eafff2] text-[#00c853] flex items-center justify-center font-black">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Dúvidas Frequentes sobre Depósito & Pagamento via IBAN
              </h2>
              <p className="text-xs text-slate-500">
                Entenda os prazos de compensação, estorno e regras de conciliação bancária.
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
                  type="button"
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

          {/* Direct contact with treasury */}
          <div className="bg-[#f4fcf6] border border-[#9bf6c4] p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-black text-slate-900 text-sm">
                Precisa de liberação urgente no pátio de retirada?
              </div>
              <p className="text-xs text-slate-600">
                Fale diretamente com o plantão da Tesouraria e apresente o número do seu protocolo IBAN.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenSupport}
              className="px-5 py-2.5 bg-[#00c853] hover:bg-[#00b341] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#00c853]/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Falar com a Tesouraria 24h</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* 8. MODAL DE DETALHES DO REGISTRO DE DEPÓSITO */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fade-in border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#eafff2] text-[#00c853] flex items-center justify-center font-black">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Comprovante de Submissão</span>
                  <div className="font-mono font-black text-sm text-slate-900">{viewingRecord.protocolNumber}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Tipo:</span>
                  <span className="font-bold text-slate-900 capitalize">
                    {viewingRecord.depositType === 'caucao' ? 'Depósito de Caução' : viewingRecord.depositType === 'aluguel' ? 'Pagamento de Aluguel' : 'Recarga de Saldo'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Valor:</span>
                  <span className="font-black text-[#007a2a]">
                    {viewingRecord.currency === 'EUR' ? '€' : 'R$'} {viewingRecord.amount.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Data do Envio:</span>
                  <span className="font-bold text-slate-900">{viewingRecord.submittedAt}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Status:</span>
                  <span className="font-bold text-emerald-700 capitalize">{viewingRecord.status}</span>
                </div>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Titular de Origem:</span>
                  <span className="font-semibold text-slate-800">{viewingRecord.sourceHolderName}</span>
                </div>
                {viewingRecord.sourceIban && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">IBAN de Origem:</span>
                    <span className="font-mono font-semibold text-slate-800">{viewingRecord.sourceIban}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Ref. da Operação:</span>
                  <span className="font-mono font-semibold text-slate-800">{viewingRecord.bankTransactionRef}</span>
                </div>
                {viewingRecord.receiptFileName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Arquivo do Comprovativo:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-xs">{viewingRecord.receiptFileName}</span>
                  </div>
                )}
              </div>

              {viewingRecord.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                  <span className="font-bold block text-slate-800 mb-0.5">Notas do Setor Financeiro:</span>
                  {viewingRecord.notes}
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Imprimir Protocolo</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="flex-1 py-2.5 bg-[#00c853] hover:bg-[#00b341] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
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
