import React, { useState } from 'react';
import { 
  Building2, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  DollarSign, 
  ArrowDownLeft,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BankManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'bank' | 'withdraw' | 'pin';
}

export const BankManagementModal: React.FC<BankManagementModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'bank',
}) => {
  const { user, updateBankInfo, addWithdrawal, updateUserPaymentPin, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'bank' | 'withdraw' | 'pin'>(initialMode);

  // Bank Form State
  const [bankName, setBankName] = useState(user.bankName || 'Banco BAI');
  const [accountIban, setAccountIban] = useState(user.bankAccount || '');
  const [holderName, setHolderName] = useState(user.holderName || user.fullName || '');
  const [accountType, setAccountType] = useState<'banco' | 'carteira_digital'>('banco');
  const [walletRede, setWalletRede] = useState('TRX / TRON (TRC20)');
  const [walletAddress, setWalletAddress] = useState(user.digitalWallet?.endereco || '');

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState<string>('50');
  const [withdrawPin, setWithdrawPin] = useState<string>('');

  // PIN Form State
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [oldPin, setOldPin] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();

    if (accountType === 'banco') {
      if (!accountIban.trim() || accountIban.replace(/\D/g, '').length < 10) {
        addToast('Por favor, informe um número de conta / IBAN válido.', 'error');
        return;
      }
      if (!holderName.trim()) {
        addToast('Informe o nome do titular da conta bancária.', 'error');
        return;
      }
      setIsLoading(true);
      await updateBankInfo(bankName, accountIban.trim(), holderName.trim(), 'banco');
      setIsLoading(false);
      onClose();
    } else {
      if (!walletAddress.trim()) {
        addToast('Cole o endereço da carteira digital para recebimento.', 'error');
        return;
      }
      setIsLoading(true);
      await updateBankInfo('', '', holderName.trim(), 'carteira_digital', {
        rede: walletRede,
        nome: holderName.trim(),
        endereco: walletAddress.trim()
      });
      setIsLoading(false);
      onClose();
    }
  };

  const handleExecuteWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val <= 0) {
      addToast('Informe um valor de saque válido.', 'error');
      return;
    }
    if (!withdrawPin) {
      addToast('Digite o seu PIN de segurança de pagamento.', 'error');
      return;
    }
    if (!user.bankAccount && !user.digitalWallet?.endereco) {
      addToast('Vincule sua conta bancária antes de solicitar saques.', 'error');
      setActiveTab('bank');
      return;
    }

    setIsLoading(true);
    const res = await addWithdrawal(val, withdrawPin);
    setIsLoading(false);
    if (res.success) {
      onClose();
    }
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      addToast('O PIN deve conter no mínimo 4 números.', 'error');
      return;
    }
    if (newPin !== confirmPin) {
      addToast('A confirmação do PIN não confere.', 'error');
      return;
    }

    setIsLoading(true);
    await updateUserPaymentPin(newPin, oldPin);
    setIsLoading(false);
    onClose();
  };

  const banksList = [
    'Banco BAI (Banco Angolano de Investimentos)',
    'Banco BFA (Banco de Fomento Angola)',
    'Banco BIC',
    'Banco BCI',
    'Banco Sol',
    'Banco Millennium Atlântico',
    'Standard Bank'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header com Tabs */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#00c853]" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Gestão Financeira & Banco
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-100/60 p-1 text-xs">
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'bank'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Conta / Cartão
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'withdraw'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sacar Saldo
          </button>
          <button
            onClick={() => setActiveTab('pin')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'pin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            PIN de Saque
          </button>
        </div>

        {/* Conteúdo Dinâmico */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: VINCULAR BANCO / CARTEIRA */}
          {activeTab === 'bank' && (
            <form onSubmit={handleSaveBank} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('banco')}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    accountType === 'banco'
                      ? 'border-[#00c853] bg-emerald-50 text-[#009935]'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Conta Bancária</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('carteira_digital')}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    accountType === 'carteira_digital'
                      ? 'border-[#00c853] bg-emerald-50 text-[#009935]'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>USDT (TRC20)</span>
                </button>
              </div>

              {accountType === 'banco' ? (
                <>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Selecione o Banco:</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-[#00c853] focus:outline-none text-slate-800 font-semibold"
                    >
                      {banksList.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Número do IBAN / Conta:</label>
                    <input
                      type="text"
                      value={accountIban}
                      onChange={(e) => setAccountIban(e.target.value)}
                      placeholder="AO06 0040 0000 1234 5678 9012 3"
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-[#00c853] focus:outline-none font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nome Completo do Titular:</label>
                    <input
                      type="text"
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      placeholder="Nome exatamente como na conta bancária"
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-[#00c853] focus:outline-none text-slate-900"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Rede da Carteira:</label>
                    <input
                      type="text"
                      disabled
                      value={walletRede}
                      className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Endereço TRC20 (USDT):</label>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Cole aqui seu endereço T..."
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-[#00c853] focus:outline-none font-mono text-xs text-slate-900"
                    />
                  </div>
                </>
              )}

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-slate-600 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00c853] shrink-0" />
                <span>Os dados bancários são validados no sistema do Asiaray para transferências seguras.</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-xl bg-[#00c853] hover:bg-[#00b341] text-white font-bold transition-colors shadow-md shadow-[#00c853]/25 cursor-pointer"
              >
                {isLoading ? 'Gravando...' : 'Salvar Dados Bancários'}
              </button>
            </form>
          )}

          {/* TAB 2: SOLICITAR SAQUE */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleExecuteWithdraw} className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Saldo Disponível</span>
                  <span className="text-lg font-black text-[#009935]">R$ {user.walletBalance.toFixed(2)}</span>
                </div>
                <span className="text-[11px] bg-slate-200 px-2 py-0.5 rounded-md font-bold text-slate-700">
                  {user.bankName || 'Banco não vinculado'}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Valor da Retirada (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={user.walletBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-[#00c853] focus:outline-none font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">PIN de Pagamento (Segurança):</label>
                <input
                  type="password"
                  maxLength={6}
                  value={withdrawPin}
                  onChange={(e) => setWithdrawPin(e.target.value)}
                  placeholder="Informe seu PIN de 4 a 6 dígitos"
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-[#00c853] focus:outline-none font-mono font-bold text-slate-900"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Saques são transferidos diretamente para o titular cadastrado na conta.</span>
              </div>

              <button
                type="submit"
                disabled={isLoading || user.walletBalance <= 0}
                className="w-full h-10 rounded-xl bg-[#00c853] hover:bg-[#00b341] text-white font-bold transition-colors shadow-md shadow-[#00c853]/25 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Processando...' : 'Confirmar Solicitação de Saque'}
              </button>
            </form>
          )}

          {/* TAB 3: GERENCIAR PIN DE SEGURANÇA */}
          {activeTab === 'pin' && (
            <form onSubmit={handleSavePin} className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Novo PIN Numérico (4 a 6 dígitos):</label>
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Ex: 1234"
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-[#00c853] focus:outline-none font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Confirme o Novo PIN:</label>
                <input
                  type="password"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Repita o mesmo PIN"
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:border-[#00c853] focus:outline-none font-mono font-bold text-slate-900"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 text-[11px] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#00c853] shrink-0" />
                <span>O PIN é exigido para autorizar qualquer retirada de saldo da carteira.</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-xl bg-[#00c853] hover:bg-[#00b341] text-white font-bold transition-colors shadow-md shadow-[#00c853]/25 cursor-pointer"
              >
                {isLoading ? 'Atualizando...' : 'Gravar PIN de Pagamento'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
