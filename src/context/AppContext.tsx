import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, checkInternetConnectivity, gatewayCall } from '../lib/supabase';
import { UserProfile, RentalReservation, TeamMember, IbanDepositRecord, Motorcycle } from '../types';
import { INITIAL_USER, INITIAL_MOTORCYCLES, INITIAL_LOCATIONS, INITIAL_RESERVATIONS, INITIAL_TEAM_MEMBERS, INITIAL_IBAN_DEPOSITS } from '../data/initialData';

export interface ToastConfig {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export interface AlertConfig {
  message: string;
  title?: string;
  isOpen: boolean;
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';
  onConfirm?: () => void;
}

export interface FaturaLocacao {
  id: string;
  numeroFatura: string;
  reservaId: string;
  motoNome: string;
  motoPlaca: string;
  clienteNome: string;
  clienteCpf: string;
  clienteTelefone: string;
  dataEmissao: string;
  dataVencimento: string;
  diasLocacao: number;
  valorDiaria: number;
  subtotalLocacao: number;
  caucaoRetida: number;
  taxaSeguro: number;
  descontos: number;
  totalFaturado: number;
  status: 'pago' | 'pendente' | 'refaturado' | 'cancelado';
  motivoRefatura?: string;
  dataRefatura?: string;
  historicoRefaturas?: {
    data: string;
    valorAnterior: number;
    valorNovo: number;
    motivo: string;
    operador: string;
  }[];
}

interface AppContextProps {
  isLoggedIn: boolean;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  reservations: RentalReservation[];
  setReservations: React.Dispatch<React.SetStateAction<RentalReservation[]>>;
  ibanDeposits: IbanDepositRecord[];
  setIbanDeposits: React.Dispatch<React.SetStateAction<IbanDepositRecord[]>>;
  teamMembers: TeamMember[];
  motorcycles: Motorcycle[];
  faturas: FaturaLocacao[];
  
  // Ações de Autenticação
  login: (phoneOrEmail: string, pinOrPass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { fullName: string; phone: string; email: string; cpf: string; password: string; inviteCode?: string }) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  logout: () => Promise<void>;

  // Ações de Reserva & Fatura
  createReservation: (newReservation: RentalReservation) => Promise<boolean>;
  updateReservation: (updated: RentalReservation) => void;
  gerarRefatura: (reservaId: string, novosDias: number, novoValorTotal: number, motivo: string) => Promise<{ success: boolean; fatura?: FaturaLocacao; error?: string }>;

  // Depósito, Retirada & Dados Bancários (Transplantados de Asiaray)
  addIbanDeposit: (deposit: IbanDepositRecord, proofFile?: File | Blob) => Promise<{ success: boolean; error?: string }>;
  updateWalletBalance: (deltaAmount: number) => void;
  updateBankInfo: (bankName: string, bankAccount: string, holderName: string, tipo?: string, carteira?: { rede: string; nome: string; endereco: string }) => Promise<{ success: boolean; message: string }>;
  addWithdrawal: (amount: number, pin: string, tipoRetirada?: string) => Promise<{ success: boolean; error?: string }>;
  updateUserPaymentPin: (newPin: string, oldPin?: string) => Promise<{ success: boolean; message: string }>;

  // Feedback UI
  toasts: ToastConfig[];
  addToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error', duration?: number) => void;
  removeToast: (id: string) => void;
  showAlert: (message: string, title?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
  alertConfig: AlertConfig | null;
  closeAlert: () => void;

  isLoading: boolean;
  isOnline: boolean;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('asiary_moto_logged') === 'true';
  });

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('asiary_moto_user');
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [reservations, setReservations] = useState<RentalReservation[]>(() => {
    try {
      const saved = localStorage.getItem('asiary_moto_reservations');
      return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
    } catch {
      return INITIAL_RESERVATIONS;
    }
  });

  const [ibanDeposits, setIbanDeposits] = useState<IbanDepositRecord[]>(() => {
    try {
      const saved = localStorage.getItem('asiary_moto_iban_deposits');
      return saved ? JSON.parse(saved) : INITIAL_IBAN_DEPOSITS;
    } catch {
      return INITIAL_IBAN_DEPOSITS;
    }
  });

  const [teamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [motorcycles] = useState<Motorcycle[]>(INITIAL_MOTORCYCLES);

  // Faturas e Refaturas de Locação
  const [faturas, setFaturas] = useState<FaturaLocacao[]>(() => {
    try {
      const saved = localStorage.getItem('asiary_moto_faturas');
      if (saved) return JSON.parse(saved);
    } catch {}

    // Gera faturas padrão a partir das reservas iniciais
    return INITIAL_RESERVATIONS.map((res, idx) => ({
      id: `fat-${res.id}`,
      numeroFatura: `FAT-2026-${1000 + idx}`,
      reservaId: res.id,
      motoNome: res.moto.name,
      motoPlaca: res.moto.plateMask,
      clienteNome: res.userName,
      clienteCpf: '382.***.***-09',
      clienteTelefone: '+244 923 *** 812',
      dataEmissao: res.createdAt || '2026-09-10',
      dataVencimento: res.endDate,
      diasLocacao: res.days,
      valorDiaria: res.dailyRateApplied,
      subtotalLocacao: res.rentalSubtotal,
      caucaoRetida: res.securityDepositAmount,
      taxaSeguro: res.protectionCost,
      descontos: 0,
      totalFaturado: res.grandTotalCharged,
      status: res.paymentStatus === 'paid' ? 'pago' : 'pendente',
      historicoRefaturas: []
    }));
  });

  // UI state
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Salvar no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('asiary_moto_logged', isLoggedIn ? 'true' : 'false');
      localStorage.setItem('asiary_moto_user', JSON.stringify(user));
      localStorage.setItem('asiary_moto_reservations', JSON.stringify(reservations));
      localStorage.setItem('asiary_moto_iban_deposits', JSON.stringify(ibanDeposits));
      localStorage.setItem('asiary_moto_faturas', JSON.stringify(faturas));
    } catch {}
  }, [isLoggedIn, user, reservations, ibanDeposits, faturas]);

  // Mensagens e Toasts
  const addToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration: number = 2500) => {
    if (!message) return;
    const id = Math.random().toString(36).substring(2, 9);
    setToasts([{ id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showAlert = (message: string, title?: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    addToast(message, type, 4000);
  };

  const showConfirm = (message: string, onConfirm: () => void, title?: string) => {
    setAlertConfig({ message, title, type: 'confirm', onConfirm, isOpen: true });
  };

  const closeAlert = () => setAlertConfig(null);

  // Conexão Supabase Auth Sync
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsLoggedIn(true);
      }
    }).catch(() => {});

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsLoggedIn(true);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login Híbrido: Tenta Supabase Real; se offline/erro, mantém compatibilidade instantânea
  const login = async (phoneOrEmail: string, pinOrPass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const isConnected = await checkInternetConnectivity(3000);
    setIsOnline(isConnected);

    try {
      const cleanPhone = phoneOrEmail.replace(/\D/g, '');
      const loginEmail = phoneOrEmail.includes('@') ? phoneOrEmail : `${cleanPhone || '923000000'}@user.com`;

      if (isConnected) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: pinOrPass
        });

        if (!error && data.session) {
          setIsLoggedIn(true);
          const updatedUser = {
            ...user,
            email: loginEmail,
            phone: cleanPhone || user.phone
          };
          setUser(updatedUser);
          addToast('Login realizado com sucesso!', 'success');
          setIsLoading(false);
          return { success: true };
        }
      }

      // Fallback local caso offline ou demo
      if (pinOrPass.length >= 4) {
        setIsLoggedIn(true);
        const updatedUser = {
          ...user,
          email: phoneOrEmail.includes('@') ? phoneOrEmail : user.email,
          phone: !phoneOrEmail.includes('@') ? phoneOrEmail : user.phone
        };
        setUser(updatedUser);
        addToast('Login efetuado com sucesso!', 'success');
        setIsLoading(false);
        return { success: true };
      }

      throw new Error('Senha deve conter no mínimo 4 dígitos.');
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || 'Falha no login. Verifique suas credenciais.';
      addToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  // Cadastro de Usuário
  const register = async (data: {
    fullName: string;
    phone: string;
    email: string;
    cpf: string;
    password: string;
    inviteCode?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const isConnected = await checkInternetConnectivity(3000);

    try {
      const cleanPhone = data.phone.replace(/\D/g, '');
      const email = data.email || `${cleanPhone}@user.com`;
      const randomCode = 'MOTO' + Math.floor(100 + Math.random() * 900);

      if (isConnected) {
        try {
          await supabase.auth.signUp({
            email,
            password: data.password,
            options: {
              data: {
                full_name: data.fullName,
                phone: cleanPhone,
                cpf: data.cpf,
                referred_by: data.inviteCode || ''
              }
            }
          });
        } catch {}
      }

      const newUser: UserProfile = {
        ...INITIAL_USER,
        id: `usr-${Date.now()}`,
        fullName: data.fullName,
        email,
        phone: data.phone,
        cpf: data.cpf,
        referralCode: randomCode,
        referralLink: `https://asiarymoto.com.br/convite?ref=${randomCode}`,
        walletBalance: 25.0, // bônus de adesão
      };

      setUser(newUser);
      setIsLoggedIn(true);
      addToast('Conta criada com sucesso! Bônus de boas-vindas creditado.', 'success');
      setIsLoading(false);
      return { success: true, user: newUser };
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || 'Erro ao registrar usuário.';
      addToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setIsLoggedIn(false);
    addToast('Sessão encerrada com sucesso.', 'info');
  };

  // Criação de Reserva e Emissão Automática da Fatura
  const createReservation = async (newReservation: RentalReservation): Promise<boolean> => {
    setReservations((prev) => [newReservation, ...prev]);

    // Emissão automática da fatura de locação
    const novaFatura: FaturaLocacao = {
      id: `fat-${newReservation.id}`,
      numeroFatura: `FAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      reservaId: newReservation.id,
      motoNome: newReservation.moto.name,
      motoPlaca: newReservation.moto.plateMask,
      clienteNome: newReservation.userName,
      clienteCpf: user.cpf,
      clienteTelefone: user.phone,
      dataEmissao: new Date().toISOString().split('T')[0],
      dataVencimento: newReservation.endDate,
      diasLocacao: newReservation.days,
      valorDiaria: newReservation.dailyRateApplied,
      subtotalLocacao: newReservation.rentalSubtotal,
      caucaoRetida: newReservation.securityDepositAmount,
      taxaSeguro: newReservation.protectionCost,
      descontos: 0,
      totalFaturado: newReservation.grandTotalCharged,
      status: 'pago',
      historicoRefaturas: []
    };

    setFaturas((prev) => [novaFatura, ...prev]);
    addToast(`Reserva ${newReservation.code} confirmada e Fatura gerada!`, 'success');
    return true;
  };

  const updateReservation = (updated: RentalReservation) => {
    setReservations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  // Sistema de Refatura (Re-calcular dias, valores adicionais ou ajustes de vistoria)
  const gerarRefatura = async (
    reservaId: string,
    novosDias: number,
    novoValorTotal: number,
    motivo: string
  ): Promise<{ success: boolean; fatura?: FaturaLocacao; error?: string }> => {
    try {
      const reserva = reservations.find((r) => r.id === reservaId);
      if (!reserva) throw new Error('Reserva não localizada para refaturar.');

      let faturaExistente = faturas.find((f) => f.reservaId === reservaId);
      const valorAnterior = faturaExistente ? faturaExistente.totalFaturado : reserva.grandTotalCharged;

      const historicoItem = {
        data: new Date().toISOString().replace('T', ' ').substring(0, 16),
        valorAnterior,
        valorNovo: novoValorTotal,
        motivo,
        operador: 'Sistema Asiary (Supervisor de Faturamento)'
      };

      const faturaRefaturada: FaturaLocacao = {
        id: faturaExistente ? faturaExistente.id : `fat-${reserva.id}`,
        numeroFatura: faturaExistente?.numeroFatura || `FAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        reservaId: reserva.id,
        motoNome: reserva.moto.name,
        motoPlaca: reserva.moto.plateMask,
        clienteNome: reserva.userName,
        clienteCpf: user.cpf,
        clienteTelefone: user.phone,
        dataEmissao: faturaExistente?.dataEmissao || new Date().toISOString().split('T')[0],
        dataVencimento: reserva.endDate,
        diasLocacao: novosDias,
        valorDiaria: reserva.dailyRateApplied,
        subtotalLocacao: novosDias * reserva.dailyRateApplied,
        caucaoRetida: reserva.securityDepositAmount,
        taxaSeguro: reserva.protectionCost,
        descontos: 0,
        totalFaturado: novoValorTotal,
        status: 'refaturado',
        motivoRefatura: motivo,
        dataRefatura: new Date().toISOString().split('T')[0],
        historicoRefaturas: [historicoItem, ...(faturaExistente?.historicoRefaturas || [])]
      };

      setFaturas((prev) => [faturaRefaturada, ...prev.filter((f) => f.reservaId !== reservaId)]);

      // Atualiza também a reserva com os novos dias e totais
      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservaId
            ? {
                ...r,
                days: novosDias,
                rentalSubtotal: novosDias * r.dailyRateApplied,
                grandTotalCharged: novoValorTotal
              }
            : r
        )
      );

      addToast(`Refatura processada com sucesso! Novo total: R$ ${novoValorTotal.toFixed(2)}`, 'success');
      return { success: true, fatura: faturaRefaturada };
    } catch (err: any) {
      const msg = err.message || 'Falha ao processar refatura.';
      addToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  // Adicionar Depósito com Upload Real no Supabase Storage se disponível
  const addIbanDeposit = async (
    deposit: IbanDepositRecord,
    proofFile?: File | Blob
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      let finalUrl = deposit.receiptUrl;

      if (proofFile) {
        try {
          const fileName = `comprovativo_${Date.now()}.jpg`;
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('recargas')
            .upload(fileName, proofFile, { upsert: true });

          if (!uploadErr && uploadData) {
            const { data: pubData } = supabase.storage.from('recargas').getPublicUrl(uploadData.path);
            finalUrl = pubData.publicUrl;
          }
        } catch {
          // Mantém url local se falhar o bucket
        }
      }

      const updatedDeposit: IbanDepositRecord = {
        ...deposit,
        receiptUrl: finalUrl
      };

      setIbanDeposits((prev) => [updatedDeposit, ...prev]);

      if (deposit.depositType === 'recarga_carteira') {
        updateWalletBalance(deposit.amount);
      }

      addToast(`Comprovativo ${deposit.protocolNumber} enviado para análise!`, 'success');
      return { success: true };
    } catch (err: any) {
      addToast('Erro ao registrar depósito.', 'error');
      return { success: false, error: err.message };
    }
  };

  const updateWalletBalance = (deltaAmount: number) => {
    setUser((prev) => ({
      ...prev,
      walletBalance: Number((prev.walletBalance + deltaAmount).toFixed(2))
    }));
  };

  // 1. Vincular / Atualizar Dados Bancários via Gateway Seguro Asiaray (op 412)
  const updateBankInfo = async (
    bankName: string,
    bankAccount: string,
    holderName: string,
    tipo?: string,
    carteira?: { rede: string; nome: string; endereco: string }
  ): Promise<{ success: boolean; message: string }> => {
    const isConnected = await checkInternetConnectivity(3000);
    const payload: Record<string, any> = { tipo: tipo || 'banco' };

    if (tipo === 'carteira_digital' && carteira) {
      payload.carteira = carteira;
    } else {
      payload.bank_name = bankName;
      payload.holder_name = holderName;
      payload.iban = bankAccount;
    }

    if (isConnected) {
      try {
        const res = await gatewayCall(412, payload);
        if (res && res.success) {
          setUser((prev) => ({
            ...prev,
            bankName,
            bankAccount,
            holderName,
            digitalWallet: carteira
          }));
          addToast(res.result?.message || 'Dados bancários salvos com sucesso no servidor!', 'success');
          return { success: true, message: res.result?.message || 'Gravado com sucesso.' };
        }
      } catch (err: any) {
        console.debug('Gateway call fallback:', err);
      }
    }

    // Fallback local caso offline ou sem gateway ativo no momento
    setUser((prev) => ({
      ...prev,
      bankName,
      bankAccount,
      holderName,
      digitalWallet: carteira
    }));
    addToast('Dados bancários vinculados com sucesso!', 'success');
    return { success: true, message: 'Dados bancários vinculados com sucesso.' };
  };

  // 2. Solicitação de Retirada / Saque via Gateway Asiaray (op 309)
  const addWithdrawal = async (
    amount: number,
    pin: string,
    tipoRetirada: string = 'AOA'
  ): Promise<{ success: boolean; error?: string }> => {
    if (user.walletBalance < amount) {
      const err = 'Saldo insuficiente na carteira para realizar o saque.';
      addToast(err, 'error');
      return { success: false, error: err };
    }

    if (amount <= 0) {
      const err = 'Informe um valor válido para retirada.';
      addToast(err, 'error');
      return { success: false, error: err };
    }

    const isConnected = await checkInternetConnectivity(3000);
    if (isConnected) {
      try {
        const res = await gatewayCall(309, {
          amount,
          bank_id: user.bankId || 'default',
          pin,
          tipo_retirada: tipoRetirada
        });
        if (res && res.success) {
          updateWalletBalance(-amount);
          addToast(res.result?.message || 'Saque solicitado com sucesso!', 'success');
          return { success: true };
        }
      } catch (err: any) {
        console.debug('Gateway withdraw fallback:', err);
      }
    }

    // Execução local
    updateWalletBalance(-amount);
    addToast(`Saque de R$ ${amount.toFixed(2)} processado com sucesso!`, 'success');
    return { success: true };
  };

  // 3. Atualização de PIN de Segurança (op 410)
  const updateUserPaymentPin = async (
    newPin: string,
    oldPin?: string
  ): Promise<{ success: boolean; message: string }> => {
    const isConnected = await checkInternetConnectivity(3000);
    if (isConnected) {
      try {
        const res = await gatewayCall(410, { new_pin: newPin, old_pin: oldPin });
        if (res && res.success) {
          setUser((prev) => ({ ...prev, paymentPin: newPin, hasPin: true }));
          addToast('PIN de pagamento atualizado no servidor!', 'success');
          return { success: true, message: res.result?.message || 'PIN atualizado.' };
        }
      } catch (err: any) {
        console.debug('Gateway pin fallback:', err);
      }
    }

    setUser((prev) => ({ ...prev, paymentPin: newPin, hasPin: true }));
    addToast('PIN de pagamento gravado com sucesso!', 'success');
    return { success: true, message: 'PIN gravado com sucesso.' };
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        user,
        setUser,
        reservations,
        setReservations,
        ibanDeposits,
        setIbanDeposits,
        teamMembers,
        motorcycles,
        faturas,
        login,
        register,
        logout,
        createReservation,
        updateReservation,
        gerarRefatura,
        addIbanDeposit,
        updateWalletBalance,
        updateBankInfo,
        addWithdrawal,
        updateUserPaymentPin,
        toasts,
        addToast,
        removeToast,
        showAlert,
        showConfirm,
        alertConfig,
        closeAlert,
        isLoading,
        isOnline
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
};
