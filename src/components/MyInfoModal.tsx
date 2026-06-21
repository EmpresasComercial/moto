import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import userInfoIcon from '../../assets/icons8-user-info-48.png';
import withdrawInfoIcon from '../../assets/icons8-informacao-retiradal-48.png';
import loginPasswordIcon from '../../assets/icons8-alterar-senha-login-48.png';
import paymentPinCreateIcon from '../../assets/icons8-gravar-pin-pagamento-48.png';
import paymentPinChangeIcon from '../../assets/icons8-password-retirada-update-48.png';
import { EmptyState } from './EmptyState';

interface MyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBank: () => void;
}

export const MyInfoModal: React.FC<MyInfoModalProps> = ({ isOpen, onClose }) => {
  const { user, logout, resetAll, addToast, updateBankInfo, updateUserPaymentPin, updateUserLoginPassword, showLoading, hideLoading, setIsFullScreenActive, isLoading } = useApp();
  
  // Sub-page state: 'none' (main menu), 'withdrawInfo', 'personalInfo', 'loginPassword', 'payPasswordCreate', 'payPasswordChange'
  const [activeSubPage, setActiveSubPage] = useState<'none' | 'withdrawInfo' | 'personalInfo' | 'loginPassword' | 'payPasswordCreate' | 'payPasswordChange'>('none');
  
  // Password inputs
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOldPin, setShowOldPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  
  const resetPasswordInputs = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowOldPin(false);
    setShowNewPin(false);
    setShowConfirmPin(false);
  };
  
  // Personal Info inputs
  const [realName, setRealName] = useState(user.holderName || '');
  const [nickName, setNickName] = useState('Asiaray VIP');

  // Bank Info inputs
  const [bank, setBank] = useState(user.bankName || '');
  const [account, setAccount] = useState(user.bankAccount || '');
  const [holder, setHolder] = useState(user.holderName || '');
  
  React.useEffect(() => {
    if (isOpen) {
      setIsFullScreenActive(true);
      setRealName(user.holderName || '');
      setBank(user.bankName || '');
      setAccount(user.bankAccount || '');
      setHolder(user.holderName || '');
    }
    return () => {
      setIsFullScreenActive(false);
    };
  }, [isOpen, user, setIsFullScreenActive]);

  if (!isOpen) return null;

  const handlePasswordReset = (type: 'login' | 'paymentCreate' | 'paymentChange') => {
    const isValidPin = (pin: string) => /^\d{4}$/.test(pin);

    if (type === 'login') {
      if (!oldPassword || !newPassword || !confirmPassword) {
        addToast('Por favor preencha todos os campos.', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        addToast('A nova senha e a confirmação não coincidem.', 'error');
        return;
      }

      updateUserLoginPassword(oldPassword, newPassword).then(res => {
        if (res.success) {
          addToast(res.message, 'success');
          resetPasswordInputs();
          setActiveSubPage('none');
        } else {
          addToast(res.message, 'error');
        }
      });
      return;
    }

    if (type === 'paymentCreate') {
      if (user.paymentPin) {
        addToast('Você já possui um PIN de retirada cadastrado. Use a opção Alterar PIN', 'error');
        setActiveSubPage('payPasswordChange');
        resetPasswordInputs();
        return;
      }
      if (!newPassword || !confirmPassword) {
        addToast('Por favor preencha todos os campos.', 'error');
        return;
      }
      if (!isValidPin(newPassword)) {
        addToast('O PIN deve conter exatamente 4 dígitos numéricos.', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        addToast('O PIN e a confirmação não coincidem.', 'error');
        return;
      }

      updateUserPaymentPin(newPassword)
        .then((res) => {
          if (res.success) {
            addToast(res.message, 'success');
            resetPasswordInputs();
            setActiveSubPage('none');
          } else {
            addToast(res.message, 'error');
          }
        })
        .catch((err) => {
          addToast(err.message || 'Erro ao processar.', 'error');
        });
      return;
    }

    if (type === 'paymentChange') {
      if (!user.paymentPin) {
        addToast('Você ainda não possui um PIN de retirada cadastrado. Por favor, cadastre primeiro na opção Gravar PIN', 'error');
        setActiveSubPage('payPasswordCreate');
        resetPasswordInputs();
        return;
      }
      if (!oldPassword || !newPassword || !confirmPassword) {
        addToast('Por favor preencha todos os campos.', 'error');
        return;
      }
      if (!isValidPin(oldPassword)) {
        addToast('O PIN antigo deve conter exatamente 4 dígitos numéricos.', 'error');
        return;
      }
      if (!isValidPin(newPassword)) {
        addToast('O novo PIN deve conter exatamente 4 dígitos numéricos.', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        addToast('O novo PIN e a confirmação não coincidem.', 'error');
        return;
      }

      updateUserPaymentPin(newPassword, oldPassword)
        .then((res) => {
          if (res.success) {
            addToast(res.message, 'success');
            resetPasswordInputs();
            setActiveSubPage('none');
          } else {
            addToast(res.message, 'error');
          }
        })
        .catch((err) => {
          addToast(err.message || 'Erro ao processar.', 'error');
        });
    }
  };

  const handleSavePersonalInfo = () => {
    if (!realName) {
      addToast('Deve preencher o Nome do Titular.', 'error');
      return;
    }
    addToast('Informações pessoais atualizadas!', 'success');
    setActiveSubPage('none');
  };

  const handleSaveBank = async () => {
    if (!account || !holder) {
      addToast('Erro: Titular e IBAN são campos obrigatórios.', 'error');
      return;
    }
    showLoading('A processar e gravar os dados bancários...');
    try {
      await updateBankInfo(bank, account, holder);
      hideLoading();
      addToast('Sucesso: Conta bancária vinculada para levantamentos.', 'success');
      setActiveSubPage('none');
    } catch (err) {
      hideLoading();
      addToast('Erro: Não foi possível gravar os dados.', 'error');
    }
  };

  const handleDeleteAccount = () => {
    const doubleCheck = window.confirm(
      'ALERTA DE SEGURANÇA:\nTem a certeza que deseja apagar a sua conta permanentemente do protocolo WS2?'
    );
    if (doubleCheck) {
      addToast('Conta apagada na rede local. Redirecionando para inscrição...', 'success');
      resetAll();
      logout();
      onClose();
    }
  };

  // 1. RENDERING SUB-PAGE: Informação de retirada (full-page, read-only display matching WSTab IBAN layout)
  if (activeSubPage === 'withdrawInfo') {
    const displayBank = user.bankName || '';
    const displayIBAN = user.bankAccount || '';
    const displayHolder = user.holderName || '';

    return (
      <div className="fixed inset-0 z-[50] bg-[#f5f5f5] flex flex-col font-sans animate-fadeIn">
        {/* Header */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 select-none" style={{ height: '48px' }}>
          <button 
            onClick={() => setActiveSubPage('none')} 
            className="text-neutral-500 hover:text-neutral-800 select-none cursor-pointer focus:outline-none flex items-center p-1"
            id="withdraw-back-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px] text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-[15px] font-bold text-neutral-850 tracking-tight text-center flex-1 translate-x-[-10px]">Minha conta</span>
          <div className="w-6"></div>
        </div>

        <div className="flex-1 p-3 space-y-4 bg-white overflow-y-auto">
          {!displayBank && !displayIBAN ? (
            <div className="mt-10">
              <EmptyState message="Nenhuma conta bancária vinculada." />
            </div>
          ) : (
            <div className="border border-gray-200 bg-white rounded-sm overflow-hidden">

              {/* Tipo */}
              <div className="border-b border-gray-200">
                <div className="text-[#0a52a3] font-medium text-[12px] px-3 py-1 bg-white">Tipo</div>
                <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200 font-mono">
                  BANCO
                </div>
              </div>

              {/* Instituição Bancária */}
              <div className="border-b border-gray-200">
                <div className="text-[#0a52a3] font-medium text-[12px] px-3 py-1 bg-white">Instituição Bancária</div>
                <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200 font-mono">
                  {displayBank}
                </div>
              </div>

              {/* IBAN */}
              <div className="border-b border-gray-200">
                <div className="text-[#0a52a3] font-medium text-[12px] px-3 py-1 bg-white">Número do IBAN</div>
                <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200 font-mono">
                  {displayIBAN}
                </div>
              </div>

              {/* Nome do Titular */}
              <div>
                <div className="text-[#0a52a3] font-medium text-[12px] px-3 py-1 bg-white">Nome Completo do Titular</div>
                <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200 font-mono">
                  {displayHolder}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. RENDERING SUB-PAGE: Alterar a senha de Login
  if (activeSubPage === 'loginPassword') {
    return (
      <div className="fixed inset-0 z-[50] bg-[#f5f5f5] flex flex-col font-sans animate-fadeIn">
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 select-none" style={{ height: '48px' }}>
          <button 
            onClick={() => setActiveSubPage('none')} 
            className="text-neutral-500 hover:text-neutral-800 select-none cursor-pointer focus:outline-none flex items-center p-1"
            id="login-pass-back-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px] text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-[15px] font-normal text-neutral-850 tracking-tight text-center flex-1 translate-x-[-10px]">Alterar a senha de Login</span>
          <div className="w-6"></div>
        </div>

        <div className="flex-1 p-3 space-y-4 bg-white overflow-y-auto">
          {/* Box 1: Inputs */}
          <div className="border border-gray-200 bg-white rounded-sm overflow-hidden">
            {/* Senha Antiga */}
            <div className="border-b border-gray-200">
              <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Senha Antiga</div>
              <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200 flex items-center gap-1">
                <input 
                  type={showOldPassword ? 'text' : 'password'}
                  placeholder="Senha Antiga"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="bg-transparent border-none outline-none flex-1 text-neutral-800 text-[12px] font-sans font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(prev => !prev)}
                  className="shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label={showOldPassword ? 'Ocultar senha antiga' : 'Mostrar senha antiga'}
                >
                  {showOldPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Nova Senha */}
            <div className="border-b border-gray-200">
              <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Nova Senha</div>
              <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200 flex items-center gap-1">
                <input 
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Nova Senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-transparent border-none outline-none flex-1 text-neutral-800 text-[12px] font-sans font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(prev => !prev)}
                  className="shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label={showNewPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'}
                >
                  {showNewPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Nova Senha */}
            <div>
              <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Confirmar Nova Senha</div>
              <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200 flex items-center gap-1">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirmar Nova Senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-transparent border-none outline-none flex-1 text-neutral-800 text-[12px] font-sans font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Box 2: Info */}
          <div className="border border-gray-200 bg-white rounded-sm overflow-hidden">
            <div className="bg-white py-2.5 px-2 border-b border-gray-200 text-center text-[#e1251b] font-bold text-[12px]">
              Requisitos de Segurança
            </div>

            <div>
              <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Recomendação</div>
              <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] font-sans border-t border-gray-200">
                Mínimo de 6 caracteres ou mais
              </div>
            </div>
          </div>

          {/* Box 3: Button */}
          <div className="flex flex-col items-center justify-center pt-2 select-none">
            <button
              type="button"
              onClick={() => handlePasswordReset('login')}
              className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white font-bold text-[12px] py-2 px-6 rounded-sm cursor-pointer transition-colors w-full text-center uppercase tracking-wide"
            >
              Gravar senha
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. RENDERING SUB-PAGE: Gravar/ Alterar a Senha de Pagamento
  if (activeSubPage === 'payPasswordCreate' || activeSubPage === 'payPasswordChange') {
    const isCreateMode = activeSubPage === 'payPasswordCreate';
    const title = isCreateMode ? 'Gravar senha de pagamento' : 'Alterar senha de pagamento';
    return (
      <div className="fixed inset-0 z-[50] bg-[#f5f5f5] flex flex-col font-sans animate-fadeIn">
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 select-none" style={{ height: '48px' }}>
          <button 
            onClick={() => { resetPasswordInputs(); setActiveSubPage('none'); }}
            className="text-neutral-500 hover:text-neutral-800 select-none cursor-pointer focus:outline-none flex items-center p-1"
            id={isCreateMode ? 'save-pass-back-btn' : 'change-pass-back-btn'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px] text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-[15px] font-bold text-neutral-850 tracking-tight text-center flex-1 translate-x-[-10px]">
            {title}
          </span>
          <div className="w-6"></div>
        </div>

        <div className="flex-1 p-3 space-y-4 bg-white overflow-y-auto">
          <div className="border border-gray-200 bg-white rounded-sm overflow-hidden">
            {!isCreateMode && (
              <div className="border-b border-gray-200">
                <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Código PIN Antigo (4 dígitos)</div>
                <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200 flex items-center gap-1">
                  <input 
                    type={showOldPin ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={4}
                    placeholder="PIN Antigo"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value.replace(/[^0-9]/g, ''))}
                    className="bg-transparent border-none outline-none flex-1 text-neutral-800 text-[12px] font-mono font-bold tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPin(prev => !prev)}
                    className="shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    aria-label={showOldPin ? 'Ocultar PIN antigo' : 'Mostrar PIN antigo'}
                  >
                    {showOldPin ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className={isCreateMode ? '' : 'border-b border-gray-200'}>
              <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Novo PIN de 4 dígitos</div>
              <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200 flex items-center gap-1">
                <input 
                  type={showNewPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={4}
                  placeholder="Novo PIN"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value.replace(/[^0-9]/g, ''))}
                  className="bg-transparent border-none outline-none flex-1 text-neutral-800 text-[12px] font-mono font-bold tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(prev => !prev)}
                  className="shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label={showNewPin ? 'Ocultar novo PIN' : 'Mostrar novo PIN'}
                >
                  {showNewPin ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Confirmar Novo PIN</div>
              <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200 flex items-center gap-1">
                <input 
                  type={showConfirmPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={4}
                  placeholder="Confirmar PIN"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value.replace(/[^0-9]/g, ''))}
                  className="bg-transparent border-none outline-none flex-1 text-neutral-800 text-[12px] font-mono font-bold tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(prev => !prev)}
                  className="shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label={showConfirmPin ? 'Ocultar confirmação de PIN' : 'Mostrar confirmação de PIN'}
                >
                  {showConfirmPin ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 bg-white rounded-sm overflow-hidden">
            <div>
              <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Onde é necessário?</div>
              <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] font-sans border-t border-gray-200">
                Será exigido em todas as solicitações de retirada
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center pt-2 select-none">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handlePasswordReset(isCreateMode ? 'paymentCreate' : 'paymentChange')}
              className={`text-white font-bold text-[12px] py-2 px-6 rounded-sm transition-colors w-full text-center uppercase tracking-wide ${isLoading ? 'bg-neutral-300 cursor-not-allowed' : 'bg-[#60a5fa] hover:bg-[#3b82f6] cursor-pointer'}`}
            >
              {isLoading ? 'A processar...' : 'Gravar pin'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. OTHERWISE, RENDER MAIN "AS MINHAS INFORMAÇÕES" LIST
  return (
    <div 
      className="fixed inset-0 bg-white z-[50] flex flex-col animate-slideUp font-sans" 
      id="as-minhas-informacoes-page"
    >
      {/* Header Navigation exactly matching layout */}
      <div className="bg-[#edf2f7] py-4 px-4 flex items-center border-b border-neutral-200 select-none relative h-14">
        <button 
          id="back-profile-from-info"
          onClick={onClose}
          className="p-1 hover:bg-neutral-200 rounded-full cursor-pointer transition-colors absolute left-3 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px] text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-full text-center text-[15.5px] font-normal text-[#1a202c]">
          Configurações
        </div>
      </div>

      {/* Scrollable Rows Container */}
      <div className="flex-1 overflow-y-auto bg-white select-none">
        
        {/* Row 1: Informação: (Mobile Number) */}
        <div 
          onClick={() => addToast(`Número verificado com o código do país: +244${user.phone}`, 'success')}
          className="flex items-center justify-between py-4.5 px-4 cursor-pointer hover:bg-neutral-50 border-b border-slate-100"
          id="row-info-num"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200">
              <img src={userInfoIcon} alt="Informação" className="h-5 w-5 object-contain" />
            </div>
            <span className="text-[13.5px] font-normal text-[#2d3748]">Informação:</span>
          </div>
          <div className="text-[13px] font-normal text-neutral-500 font-mono pr-1 select-text">
            {user.phone || '244922342885'}
          </div>
        </div>

        {/* Row 3: Informação de retirada */}
        <div 
          onClick={() => setActiveSubPage('withdrawInfo')}
          className="flex items-center justify-between py-4.5 px-4 cursor-pointer hover:bg-neutral-50 border-b border-slate-100"
          id="row-retira-info"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200">
              <img src={withdrawInfoIcon} alt="Informação de retirada" className="h-5 w-5 object-contain" />
            </div>
            <span className="text-[13.5px] font-normal text-[#2d3748]">Informação de retirada</span>
          </div>
          <div className="text-neutral-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Row 4: Alterar a senha de Login */}
        <div 
          onClick={() => setActiveSubPage('loginPassword')}
          className="flex items-center justify-between py-4.5 px-4 cursor-pointer hover:bg-neutral-50 border-b border-slate-100"
          id="row-alt-pass"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200">
              <img src={loginPasswordIcon} alt="Alterar a senha de Login" className="h-5 w-5 object-contain" />
            </div>
            <span className="text-[13.5px] font-normal text-[#2d3748]">Alterar a senha de Login</span>
          </div>
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Row 5: Gravar senha de pagamento */}
        <div 
          onClick={() => {
            if (user.paymentPin) {
              addToast('Você já possui um PIN de retirada cadastrado. Use a opção Alterar PIN', 'error');
              resetPasswordInputs();
              setActiveSubPage('payPasswordChange');
              return;
            }
            resetPasswordInputs();
            setActiveSubPage('payPasswordCreate');
          }}
          className="flex items-center justify-between py-4.5 px-4 cursor-pointer hover:bg-neutral-50 border-b border-slate-100"
          id="row-save-pay-pass"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200">
              <img src={paymentPinCreateIcon} alt="Gravar senha de pagamento" className="h-5 w-5 object-contain" />
            </div>
            <span className="text-[13.5px] font-normal text-[#2d3748]">Gravar senha de pagamento</span>
          </div>
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Row 6: Alterar senha de pagamento */}
        <div 
          onClick={() => {
            if (!user.paymentPin) {
              addToast('Você ainda não possui um PIN de retirada cadastrado. Por favor, cadastre primeiro na opção Gravar PIN', 'error');
              resetPasswordInputs();
              setActiveSubPage('payPasswordCreate');
              return;
            }
            resetPasswordInputs();
            setActiveSubPage('payPasswordChange');
          }}
          className="flex items-center justify-between py-4.5 px-4 cursor-pointer hover:bg-neutral-50 border-b border-slate-100"
          id="row-change-pay-pass"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200">
              <img src={paymentPinChangeIcon} alt="Alterar senha de pagamento" className="h-5 w-5 object-contain" />
            </div>
            <span className="text-[13.5px] font-normal text-[#2d3748]">Alterar senha de pagamento</span>
          </div>
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>



      </div>
    </div>
  );
};
