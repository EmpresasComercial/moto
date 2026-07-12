import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft } from 'lucide-react';

export const RetirarPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, stats, addWithdrawal, addToast, setIsFullScreenActive, showLoading, hideLoading, refreshUserProfile } = useApp();

  // Mode state: 'amount' | 'tips' | 'pin'
  const [step, setStep] = useState<'amount' | 'tips' | 'pin'>('amount');
  const [amountStr, setAmountStr] = useState<string>('');
  const [walletType, setWalletType] = useState<'pocket' | 'task'>('task'); // Default checked to Task Wallet as it has balance in screenshot
  
  // Pin inputs
  const [pin, setPin] = useState<string>('');
  // No bank account modal
  const [showNoBankModal, setShowNoBankModal] = useState(false);

  // Auto-hide full screen footer layout
  useEffect(() => {
    setIsFullScreenActive(true);
    // Always fetch fresh profile on mount to avoid showing stale bank data from cache
    refreshUserProfile(false);
    return () => {
      setIsFullScreenActive(false);
    };
  }, [setIsFullScreenActive]);

  // Show modal automatically if no bank account is linked
  useEffect(() => {
    if (!user.bankAccount && !user.bankId) {
      setShowNoBankModal(true);
    }
  }, [user.bankAccount, user.bankId]);

  // Derived values
  const displayBank = user.bankName || '';
  const lastFourDigits = user.bankAccount ? user.bankAccount.replace(/\s+/g, '').slice(-4) : '';
  
  const pocketBalance = 0; // Pocket money is KZ 0 in the screenshot
  const taskWalletBalance = stats.balance; // Using stats.balance for task wallet
  
  const currentAvailableBalance = walletType === 'pocket' ? pocketBalance : taskWalletBalance;
  const amount = Number(amountStr) || 0;

  const commission = amount * 0.5;
  const accessFee = 0.00;
  const realAmount = amount - commission - accessFee;

  const handleConfirmAmount = () => {
    if (!user.bankAccount || !user.bankId) {
      addToast('Por favor, vincule uma conta bancária para prosseguir.', 'warning');
      return;
    }
    if (amount <= 0) {
      addToast('Por favor, introduza um valor de retirada válido.', 'warning');
      return;
    }
    if (amount > currentAvailableBalance) {
      addToast('O valor solicitado excede o seu saldo disponível.', 'error');
      return;
    }
    if (amount < 2000) {
      addToast('O saldo mínimo para retirada é de 2.000 AOA.', 'warning');
      return;
    }
    if (amount > 100000) {
      addToast('O limite máximo por operação é de 100.000 AOA.', 'warning');
      return;
    }
    setStep('tips');
  };

  const handleAmountKeyPress = (val: string) => {
    if (val === 'clear') {
      setAmountStr('');
    } else if (val === 'send') {
      handleConfirmAmount();
    } else {
      if (amountStr.length < 10) {
        setAmountStr(prev => (prev === '0' ? val : prev + val));
      }
    }
  };

  const handlePinKeyPress = (val: string) => {
    if (val === 'backspace') {
      setPin(prev => prev.slice(0, -1));
    } else {
      if (pin.length < 4) {
        setPin(prev => prev + val);
      }
    }
  };

  const validatePin = async (finalPin: string) => {
    showLoading('Verificando senha de pagamento...');

    try {
      const res = await addWithdrawal(amount, finalPin);
      if (res.success) {
        addToast(`Retirada de KZ ${amount.toLocaleString('pt-AO')} solicitada com sucesso!`, 'success');
        navigate('/meu');
      } else {
        addToast(res.error || 'Erro ao processar retirada.', 'error');
        setPin('');
      }
    } catch (err: any) {
      addToast(err.message || 'Erro ao processar retirada.', 'error');
      setPin('');
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col font-sans max-w-md mx-auto border-x border-slate-200">
      

      <div className="bg-[#e9eff6] px-4 py-3 flex items-center justify-between border-b border-slate-200 select-none h-12">
        <button 
          onClick={() => {
            if (step === 'tips') setStep('amount');
            else if (step === 'pin') setStep('tips');
            else navigate('/meu', { state: { openMyInfoModal: true } });
          }}
          className="text-neutral-600 hover:text-neutral-900 cursor-pointer focus:outline-none flex items-center justify-center w-8 h-8"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <span className="text-[16px] font-bold text-neutral-800 tracking-tight text-center flex-1">
          {step === 'pin' ? 'Confirme a senha' : 'Retirar'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto bg-white flex flex-col no-scrollbar">
        {step === 'amount' && (
          <div className="flex flex-col flex-1 justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
              <div 
                onClick={() => navigate('/meu', { state: { openMyInfoModal: true, selectBankSection: true } })}
                className="bg-[#f0f3f6] p-4 flex flex-col justify-between border-b border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex justify-between items-center text-neutral-800 font-bold text-[13px]">
                  {displayBank && lastFourDigits ? (
                    <span>Canal de Pagamento: {displayBank} (...{lastFourDigits})</span>
                  ) : displayBank ? (
                    <span>Canal de Pagamento: {displayBank}</span>
                  ) : (
                    <span className="text-neutral-400 text-[12px] font-normal">Nenhuma conta associada</span>
                  )}
                  <span className="text-neutral-400 text-lg font-light">&gt;</span>
                </div>
                <span className="text-[10px] text-neutral-500 text-right mt-3 self-end block max-w-[240px] leading-tight">
                  * Diferentes tipos de métodos de pagamento têm taxas diferentes
                </span>
              </div>


              <div className="p-5 flex flex-col">
                <span className="text-[14px] font-bold text-neutral-800 mb-2">
                  Montante de retirada:
                </span>


                <div className="flex items-baseline border-b border-slate-200 pb-3 mb-6 mt-2">
                  <span className="text-[34px] font-semibold text-neutral-900 mr-3 select-none">KZ</span>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    readOnly
                    value={amountStr}
                    placeholder="0"
                    className="text-[34px] font-semibold text-neutral-900 focus:outline-none w-full bg-transparent p-0 border-none outline-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={walletType === 'pocket'}
                        onChange={() => setWalletType('pocket')}
                        className="w-[18px] h-[18px] text-[#2563eb] rounded border-slate-300 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-[13px] font-medium text-neutral-700">Pocket money</span>
                    </div>
                    <span className="text-[13px] text-neutral-800">KZ{pocketBalance}</span>
                  </label>


                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={walletType === 'task'}
                        onChange={() => setWalletType('task')}
                        className="w-[18px] h-[18px] text-[#2563eb] rounded border-slate-300 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-[13px] font-medium text-neutral-700">Task wallet</span>
                    </div>
                    <span className="text-[13px] text-neutral-800">KZ{taskWalletBalance.toFixed(2)}</span>
                  </label>
                </div>
              </div>
            </div>


            <div className="bg-[#f0f3f6] border-t border-slate-200 p-2 grid grid-cols-3 gap-1 select-none">
              {['1','2','3','4','5','6','7','8','9'].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAmountKeyPress(val)}
                  className="bg-white text-neutral-950 font-medium py-3 rounded-lg text-lg flex items-center justify-center hover:bg-slate-50 cursor-pointer shadow-sm active:bg-slate-100"
                >
                  {val}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleAmountKeyPress('clear')}
                className="bg-white/40 text-neutral-700 py-3 rounded-lg text-[14px] font-bold flex items-center justify-center hover:bg-slate-50 cursor-pointer"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={() => handleAmountKeyPress('0')}
                className="bg-white text-neutral-950 font-medium py-3 rounded-lg text-lg flex items-center justify-center hover:bg-slate-50 cursor-pointer shadow-sm active:bg-slate-100"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleAmountKeyPress('send')}
                className="bg-[#1e88e5] text-white py-3 rounded-lg text-[14px] font-bold flex items-center justify-center hover:bg-[#1565c0] cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {step === 'tips' && (
          <div className="flex flex-col flex-1 bg-white relative">
            <div className="opacity-40 pointer-events-none flex flex-col flex-1">
              <div className="bg-[#f0f3f6] p-4 flex flex-col">
                <div className="flex justify-between items-center text-neutral-800 font-bold text-[13px]">
                  <span>Canal de Pagamento: {displayBank} (...{lastFourDigits})</span>
                </div>
              </div>
              <div className="p-5 flex-1">
                <span className="text-[14px] font-bold text-neutral-800 mb-2">Montante de retirada:</span>
                <div className="text-[34px] font-semibold text-neutral-900 border-b pb-3 mb-6">KZ {amount}</div>
              </div>
            </div>

            <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center px-4">
              <div className="bg-white w-full max-w-[340px] rounded-2xl shadow-xl flex flex-col overflow-hidden animate-fadeIn pb-5 pt-3">
                <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
                  <button 
                    onClick={() => setStep('amount')}
                    className="text-neutral-400 hover:text-neutral-600 focus:outline-none"
                  >
                    <span className="text-xl font-light">×</span>
                  </button>
                  <span className="text-[15px] font-bold text-neutral-800 text-center flex-1 translate-x-[-8px]">Dicas</span>
                  <div className="w-5"></div>
                </div>

                <div className="p-4 space-y-3 text-[12px] text-neutral-600 leading-normal text-left font-medium">
                  <p>1. Hora de chegada: 0-72 horas;</p>
                  <p>2. Diferentes canais de pagamento podem ter taxas de serviço;</p>
                  <p>3. Confirme que as informações de pagamento estão corretas, caso contrário, os fundos serão perdidos e não poderão ser recuperados;</p>
                  <p>4. Se a retirada for rejeitada, seus fundos serão devolvidos para a carteira correspondente e você poderá retirar novamente.</p>
                </div>

                <div className="px-4 pt-3 flex gap-3">
                  <button
                    onClick={() => setStep('amount')}
                    className="flex-1 border border-[#1e88e5] text-[#1e88e5] bg-white py-2 rounded-lg text-[13px] font-bold text-center cursor-pointer"
                  >
                    cancelar
                  </button>
                  <button
                    onClick={() => setStep('pin')}
                    className="flex-1 bg-[#1e88e5] text-white py-2 rounded-lg text-[13px] font-bold text-center cursor-pointer hover:bg-[#1565c0]"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'pin' && (
          <div className="flex flex-col flex-1 bg-white relative justify-between">
            
            <div className="p-4 flex flex-col items-center">
              <span className="text-[12px] text-neutral-500 font-bold mb-1">
                Canal de Pagamento: {displayBank} (...{lastFourDigits})
              </span>
              <span className="text-[28px] font-black text-neutral-900 mb-4">
                KZ {amount.toLocaleString('pt-AO')}
              </span>

              <div className="w-full bg-[#f8fafc] border border-slate-100 rounded-xl p-4 text-[12px] text-neutral-600 space-y-2 mb-6 shadow-sm">
                <div className="flex justify-between">
                  <span>Comissão da plataforma:</span>
                  <span className="font-semibold text-red-600">- KZ{commission.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tarifas de acesso:</span>
                  <span className="font-semibold text-neutral-800">- KZ{accessFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/60 pt-2">
                  <span>Montante real:</span>
                  <span className="font-semibold text-neutral-800">- KZ{realAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Montante real: (KZ):</span>
                  <span className="font-bold text-emerald-600">KZ {realAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2 justify-center w-full max-w-[240px] my-3">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-10 h-10 border border-slate-300 flex items-center justify-center text-lg font-bold text-neutral-900 bg-white"
                  >
                    {pin[i] ? (
                      <span className="w-2.5 h-2.5 bg-neutral-800 rounded-full"></span>
                    ) : (
                      i === pin.length ? <span className="animate-pulse text-neutral-400">|</span> : ''
                    )}
                  </div>
                ))}
              </div>

              <button 
                onClick={() => addToast('Entre em contato com o suporte para redefinir sua senha de pagamento.', 'info')}
                className="text-[11px] text-[#1e88e5] mt-4 font-bold focus:outline-none hover:underline cursor-pointer"
              >
                Esqueceu-se da senha do pagamento?
              </button>
            </div>

            <div className="bg-[#f0f3f6] border-t border-slate-200 p-2 grid grid-cols-3 gap-1 select-none">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(val => (
                <button
                  key={val}
                  onClick={() => handlePinKeyPress(val)}
                  className="bg-white text-neutral-950 font-medium py-3 rounded-lg text-lg flex items-center justify-center hover:bg-slate-50 cursor-pointer shadow-sm active:bg-slate-100"
                >
                  {val}
                </button>
              ))}

              <button
                onClick={() => setPin('')}
                className="bg-white/40 text-neutral-700 py-3 rounded-lg text-[14px] font-bold flex items-center justify-center hover:bg-slate-50 cursor-pointer"
              >
                Limpar
              </button>

              <button
                onClick={() => handlePinKeyPress('0')}
                className="bg-white text-neutral-950 font-medium py-3 rounded-lg text-lg flex items-center justify-center hover:bg-slate-50 cursor-pointer shadow-sm active:bg-slate-100"
              >
                0
              </button>

              <button
                onClick={() => {
                  if (pin.length === 4) {
                    validatePin(pin);
                  } else {
                    addToast('Digite os 4 dígitos para enviar.', 'warning');
                  }
                }}
                className="bg-[#1e88e5] text-white py-3 rounded-lg text-[14px] font-bold flex items-center justify-center hover:bg-[#1565c0] cursor-pointer"
              >
                Enviar
              </button>
            </div>

          </div>
        )}

      </div>

      {showNoBankModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            aria-hidden="true"
          />
          <div className="relative z-10 bg-white rounded-2xl w-full max-w-[270px] overflow-hidden flex flex-col shadow-xl border border-neutral-100/50 animate-scaleIn">
            <div className="px-5 py-6 text-center">
              <p className="text-[14px] font-normal text-neutral-800 leading-snug">
                Nenhuma conta bancária associada. É necessário associar uma conta bancária para continuar.
              </p>
            </div>
            <div className="border-t border-neutral-100 flex">
              <button
                type="button"
                onClick={() => setShowNoBankModal(false)}
                className="flex-1 py-3 text-[14px] font-normal text-neutral-500 hover:bg-neutral-50 active:bg-neutral-100 border-r border-neutral-100 focus:outline-none transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNoBankModal(false);
                  navigate('/meu', { state: { openMyInfoModal: true, selectBankSection: true } });
                }}
                className="flex-1 py-3 text-[14px] font-bold text-[#2563eb] hover:bg-neutral-50 active:bg-neutral-100 focus:outline-none transition-colors cursor-pointer"
              >
                Ir adicionar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
