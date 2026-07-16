import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Task, UserProfile, FinancialStats, LogRecord, TeamReferral, TaskType } from '../types';
import { supabase, getAccessToken, checkInternetConnectivity, gatewayCall } from '../lib/supabase';

const normalizeBankName = (bankName?: string) => {
  if (!bankName) return 'Banco BAI';
  const normalized: Record<string, string> = {
    'BAI (Banco Angolano de Investimentos)': 'Banco BAI',
    'BFA (Banco de Fomento Angola)': 'Banco BFA',
    'BIC (Banco BIC)': 'Banco BIC',
    'BCI (Banco de Comércio e Indústria)': 'Banco BCI',
    'Millennium Atlântico': 'Banco ATL',
    'Banco Sol': 'Banco Sol',
    'Standard Bank Angola': 'Standard Bank Angola'
  };
  return normalized[bankName] || bankName;
};

export interface MinhaFinanca {
  saldo_atual_kz: number;
  saldo_atual_usdt: number;
  total_retirado: number;
  total_depositado: number;
  ganho_tarefas: number;
  quantidade_tarefas: number;
  bonus_convite: number;
  quantidade_convidados: number;
}

export interface AlertConfig {
  message: string;
  title?: string;
  isOpen: boolean;
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';
  onConfirm?: () => void;
}

export interface ToastConfig {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface AppContextProps {
  isLoggedIn: boolean;
  user: UserProfile;
  stats: FinancialStats;
  tasks: Task[];
  logs: LogRecord[];
  team: TeamReferral[];
  login: (phone: string, pin: string) => Promise<boolean>;
  logout: () => void;
  registerUser: (phone: string, pin: string, inviteCode: string) => Promise<void>;
  refreshUserProfile: (showLoading?: boolean) => Promise<void>;
  claimTask: (taskId: string) => boolean;

  approvePendingTasks: () => void;
  addRecharge: (amount: number, txId: string, proofFileName?: string) => void;
  addWithdrawal: (amount: number, pin: string) => Promise<{ success: boolean; error?: string }>;
  convertUsdToKz: (usdAmount: number) => Promise<{ success: boolean; message: string }>;
  updateBankInfo: (bankName: string, bankAccount: string, holderName: string) => Promise<{ success: boolean; message: string }>;
  upgradeMembership: (level: string, cost: number, productId?: string) => Promise<boolean>;
  increaseCreditScore: (points: number) => void;
  updateUserPaymentPin: (newPin: string, oldPin?: string) => Promise<{ success: boolean; message: string }>;
  updateUserLoginPassword: (oldPin: string, newPin: string) => Promise<{ success: boolean; message: string }>;
  resetAll: () => void;
  showAlert: (message: string, title?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
  alertConfig: AlertConfig | null;
  closeAlert: () => void;
  toasts: ToastConfig[];
  addToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error', duration?: number) => void;
  removeToast: (id: string) => void;
  isFullScreenActive: boolean;
  setIsFullScreenActive: (active: boolean) => void;
  isLoading: boolean;
  loadingMessage?: string;
  isOnline: boolean;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  ensureInternetConnectivity: (showError?: boolean) => Promise<boolean>;
  fetchWithdrawalRecords: () => Promise<LogRecord[]>;
  fetchMinhaFinanca: () => Promise<MinhaFinanca | null>;
  isSessionExpired: boolean;
  setIsSessionExpired: (expired: boolean) => void;
  sessionExpiredMessage: string;
  setSessionExpiredMessage: (message: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const INITIAL_TASKS: Task[] = [
  { id: 't0_1', title: 'Curtir Post do Facebook', type: 'Facebook', reward: 100, requiredLevel: 'WS0', desc: 'Curta e comente na publicação indicada para receber a recompensa diária de iniciante.', status: 'disponivel' },
  { id: 't0_2', title: 'Seguir Canal do YouTube', type: 'Whatsapp', reward: 100, requiredLevel: 'WS0', desc: 'Inscreva-se no canal do parceiro e ative as notificações.', status: 'disponivel' },
  { id: 't0_3', title: 'Avaliar Produto Amazónia', type: 'Tiktok', reward: 100, requiredLevel: 'WS0', desc: 'Dê 5 estrelas ao produto listado no carrinho da Amazon parceira.', status: 'disponivel' },
  
  { id: 't1_1', title: 'Seguir Página Facebook Premium', type: 'Facebook', reward: 500, requiredLevel: 'WS1', desc: 'Siga a página da marca parceira de cosméticos e compartilhe uma postagem pública.', status: 'disponivel' },
  { id: 't1_2', title: 'Vídeo Promocional YouTube AS', type: 'Whatsapp', reward: 500, requiredLevel: 'WS1', desc: 'Assista a 2 minutos deste anúncio de produto e curta.', status: 'disponivel' },
  { id: 't1_3', title: 'Adicionar Item ao Carrinho Amazon', type: 'Tiktok', reward: 500, requiredLevel: 'WS1', desc: 'Adicione ao seu carrinho de interesse e tire um print screen.', status: 'disponivel' },
  { id: 't1_4', title: 'Avaliação Positiva de Loja Amazon', type: 'Tiktok', reward: 500, requiredLevel: 'WS1', desc: 'Deixe um feedback positivo na loja do vendedor verificado.', status: 'disponivel' },
  { id: 't1_5', title: 'Compartilhar Post de Evento FB', type: 'Facebook', reward: 500, requiredLevel: 'WS1', desc: 'Publique o link do evento parceiro em seu perfil social publicamente.', status: 'disponivel' },

  { id: 't2_1', title: 'Avaliar Gadget de Alta Tecnologia', type: 'Tiktok', reward: 1300, requiredLevel: 'WS2', desc: 'Escreva um comentário curto e objetivo de 5 estrelas sobre o fone de ouvido de última geração.', status: 'disponivel' },
  { id: 't2_2', title: 'Fazer Compartilhamento Viral FB', type: 'Facebook', reward: 1300, requiredLevel: 'WS2', desc: 'Compartilhe o anúncio oficial do aplicativo com texto recomendado e tire screenshot.', status: 'disponivel' },
  { id: 't2_3', title: 'Subir Review Vídeo YouTube', type: 'Whatsapp', reward: 1300, requiredLevel: 'WS2', desc: 'Dê feedback em vídeo comentado, curta e comente na live stream oficial.', status: 'disponivel' },
  { id: 't2_4', title: 'Comentário em Post no Facebook', type: 'Facebook', reward: 1300, requiredLevel: 'WS2', desc: 'Escreva um comentário focado nas vantagens da marca parceira de vestuários.', status: 'disponivel' },
  { id: 't2_5', title: 'Visualizar Shorts de Viagem YT', type: 'Whatsapp', reward: 1300, requiredLevel: 'WS2', desc: 'Assista a 3 shorts seguidos de nossa rede de entretenimento parceira e favorite.', status: 'disponivel' },
  { id: 't2_6', title: 'Check-in de Compras de Moda Amazon', type: 'Tiktok', reward: 1300, requiredLevel: 'WS2', desc: 'Visite a vitrine de vestuário e clique em simular interesse para validar cupom.', status: 'disponivel' },
  { id: 't2_7', title: 'Inscrição em Canal de Finanças YT', type: 'Whatsapp', reward: 1300, requiredLevel: 'WS2', desc: 'Inscreva-se no canal financeiro parceiro e curta o último vídeo publicado.', status: 'disponivel' },
  { id: 't2_8', title: 'Engajamento no Grupo de FB', type: 'Facebook', reward: 1300, requiredLevel: 'WS2', desc: 'Faça um post construtivo em grupo público parceiro sobre oportunidades de home-office.', status: 'disponivel' },

  { id: 't3_1', title: 'Avaliação de Notebook Gamer Amazon', type: 'Tiktok', reward: 4000, requiredLevel: 'WS3', desc: 'Revisão profissional simulada de produto premium com descrição técnica de compra.', status: 'disponivel' },
  { id: 't3_2', title: 'Campanha de Divulgação YouTube', type: 'Whatsapp', reward: 4000, requiredLevel: 'WS3', desc: 'Assista ao vídeo corporativo de inovação tecnológica de 10 min e valide código oculto.', status: 'disponivel' },
  { id: 't3_3', title: 'Compartilhamento em Grupo FB', type: 'Facebook', reward: 4000, requiredLevel: 'WS3', desc: 'Compartilhe em 5 grupos de classificados locais o banner de recrutamento.', status: 'disponivel' },

  { id: 't4_1', title: 'Promoção de Dropshipping Amazon', type: 'Tiktok', reward: 25000, requiredLevel: 'WS4', desc: 'Divulgue o portfólio de fornecedores globais de alto giro no mercado regional.', status: 'disponivel' },
  { id: 't4_2', title: 'Vídeo Patrocinado de Investimento YT', type: 'Whatsapp', reward: 25000, requiredLevel: 'WS4', desc: 'Engaje na campanha oficial da corretora internacional com curtida, comentário e compartilhamento.', status: 'disponivel' },

  { id: 't5_1', title: 'Parceria de Mídia Estruturada YT', type: 'Whatsapp', reward: 75000, requiredLevel: 'WS5', desc: 'Geração de visualizações orgânicas patrocinadas por parceiros multilaterais de anúncios.', status: 'disponivel' },
  { id: 't5_2', title: 'Promoção de Marca Principal Amazon', type: 'Tiktok', reward: 75000, requiredLevel: 'WS5', desc: 'Classificação máxima e divulgação do hub principal de eletrônicos no e-commerce.', status: 'disponivel' }
];

const INITIAL_STATS: FinancialStats = {
  balance: 0,
  balanceUSDT: 0,
  incomeYesterday: 0,
  incomeToday: 0,
  incomeThisWeek: 0,
  incomeThisMonth: 0,
  incomeLastMonth: 0,
  incomeTotal: 0,
  completedTodayCount: 0,
  unfinishedCount: 0
};

const INITIAL_LOGS: LogRecord[] = [];

const INITIAL_REFERRALS: TeamReferral[] = [];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  const [isLoading, setIsLoadingState] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Carregando...');
  const loadingCountRef = useRef<number>(0);
  const [isFullScreenActive, setIsFullScreenActive] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const offlineToastRef = useRef<boolean>(false);

  const showLoading = (message: string = 'Carregando...') => {
    setLoadingMessage(message);
    loadingCountRef.current += 1;
    setIsLoadingState(true);
  };

  const hideLoading = () => {
    loadingCountRef.current = Math.max(0, loadingCountRef.current - 1);
    if (loadingCountRef.current === 0) {
      setIsLoadingState(false);
    }
  };

  const sanitizeMessage = (msg: string): string =>
    msg.replace(/\bgateway\b/gi, '').replace(/\s{2,}/g, ' ').trim();

  const addToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration: number = 4000) => {
    const safe = sanitizeMessage(message);
    setToasts(prev => {
      const exists = prev.some(t => t.message === safe && t.type === type);
      if (exists) return prev;
      const id = Math.random().toString(36).substring(2, 9);
      return [...prev, { id, message: safe, type, duration }];
    });
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showAlert = (message: string, title?: string, type?: 'info' | 'success' | 'warning' | 'error') => {
    // Show as a high-fidelity toast notification instead of a blocking modal center layout!
    addToast(message, type || 'info', 5000);
  };

  const showConfirm = (message: string, onConfirm: () => void, title?: string) => {
    setAlertConfig({ message, title, type: 'confirm', onConfirm, isOpen: true });
  };

  const closeAlert = () => {
    setAlertConfig(null);
  };

  const ensureInternetConnectivity = async (showError: boolean = true): Promise<boolean> => {
    const connected = await checkInternetConnectivity();
    setIsOnline(connected);

    if (!connected && showError) {
      if (!offlineToastRef.current) {
        offlineToastRef.current = true;
        addToast('Sem conexão de internet. Verifique seus dados móveis ou WiFi e tente novamente.', 'error', 7000);
        window.setTimeout(() => {
          offlineToastRef.current = false;
        }, 7000);
      }
    }

    return connected;
  };

  // Intercept window.alert for absolute sandboxing safety in iframes
  useEffect(() => {
    window.alert = (msg: any) => {
      const rawText = sanitizeMessage(String(msg));
      let type: 'info' | 'success' | 'warning' | 'error' = 'info';
      
      const lower = rawText.toLowerCase();
      if (
        lower.includes('sucesso') || 
        lower.includes('adquirida') || 
        lower.includes('recebido') || 
        lower.includes('promovida') || 
        lower.includes('vinculada') ||
        lower.includes('concluido') ||
        lower.includes('adicionado') ||
        lower.includes('registado') ||
        lower.includes('parabens') ||
        lower.includes('excelente')
      ) {
        type = 'success';
      } else if (
        lower.includes('erro') || 
        lower.includes('falha') || 
        lower.includes('insuficiente') || 
        lower.includes('incorreto') || 
        lower.includes('obrigatório') ||
        lower.includes('limite') ||
        lower.includes('inacabada') ||
        lower.includes('excedeu') ||
        lower.includes('já foi reivindicada')
      ) {
        type = 'error';
      } else if (
        lower.includes('requer') || 
        lower.includes('carregue') || 
        lower.includes('comprovativo') ||
        lower.includes('atenção') ||
        lower.includes('antes de salvar') ||
        lower.includes('aviso') ||
        lower.includes('indique o iban')
      ) {
        type = 'warning';
      }
      addToast(rawText, type, 5000);
    };
  }, []);

  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string>('');
  const sessionExpiredRef = React.useRef(false);
  // Throttle: prevents duplicate fetches within 3 seconds
  const lastFetchRef = React.useRef<number>(0);
  // Debounce: collapses rapid Realtime events into one fetch
  const realtimeDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      offlineToastRef.current = false;
      addToast('Conexão de internet restabelecida.', 'success', 4000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      if (!offlineToastRef.current) {
        offlineToastRef.current = true;
        addToast('Sem conexão de internet. Verifique WiFi ou dados móveis.', 'error', 7000);
        window.setTimeout(() => {
          offlineToastRef.current = false;
        }, 7000);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Keep ref in sync with state so the helper can read it synchronously
  useEffect(() => {
    sessionExpiredRef.current = isSessionExpired;
  }, [isSessionExpired]);

  /**
   * Centralized gateway fetch helper.
   * 1. If session is already expired → returns null immediately (no network call, no data leak)
   * 2. If gateway responds 401 + force_logout → triggers session expired modal and returns null
   * 3. Otherwise returns the parsed JSON body
   */
  const gatewayFetch = async (op: number, data: Record<string, unknown> = {}, loadingMessage: string | false = 'Carregando...'): Promise<any | null> => {
    if (sessionExpiredRef.current) return null;
    if (!(await ensureInternetConnectivity())) {
      return null;
    }

    const shouldShowLoading = loadingMessage !== false && loadingMessage !== null;
    if (shouldShowLoading) {
      showLoading(loadingMessage as string);
    }
    try {
      const res = await gatewayCall(op, data);
      return { resp: { ok: res !== null && typeof res === 'object' }, resData: res };
    } catch (err: any) {
      return { resp: { ok: false }, resData: { success: false, error: err.message } };
    } finally {
      if (shouldShowLoading) {
        hideLoading();
      }
    }
  };

  // Contador de tentativas falhadas de login (em memória, não persiste)
  const loginAttemptsRef = React.useRef<number>(0);
  const loginBlockedUntilRef = React.useRef<number>(0);

  // Try loading from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('asiaray_logged') === 'true';
  });

  // SEGURANÇA F-06: Campos sensíveis (paymentPin, bankAccount, holderName, idChaveUnica)
  // NÃO são persistidos no localStorage. São mantidos apenas em memória (estado React)
  // e recarregados do servidor após cada login/refresh.
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('asiaray_user');
    if (saved) {
      const parsed = JSON.parse(saved) as UserProfile;
      return {
        phone: parsed.phone || '',
        id: parsed.id || '',
        level: parsed.level || 'WS0',
        creditScore: parsed.creditScore || 100,
        inviteCode: parsed.inviteCode || '',
        bankName: normalizeBankName(parsed.bankName),
        // Campos sensíveis: NÃO restaurados do localStorage — sempre vazios no arranque
        bankAccount: '',
        holderName: '',
        paymentPin: undefined,
        idChaveUnica: undefined,
        bankId: parsed.bankId,
        createdAt: parsed.createdAt,
      };
    }
    return {
      phone: '',
      id: '',
      level: 'WS0',
      creditScore: 100,
      inviteCode: '',
      bankName: '',
      bankAccount: '',
      holderName: '',
      paymentPin: undefined
    };
  });

  const [stats, setStats] = useState<FinancialStats>(() => {
    const saved = localStorage.getItem('asiaray_stats');
    if (saved) return JSON.parse(saved);
    return INITIAL_STATS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('asiaray_tasks');
    if (saved) return JSON.parse(saved);
    return INITIAL_TASKS;
  });

  const [logs, setLogs] = useState<LogRecord[]>(() => {
    const saved = localStorage.getItem('asiaray_logs');
    if (saved) return JSON.parse(saved);
    return INITIAL_LOGS;
  });

  const [team, setTeam] = useState<TeamReferral[]>(() => {
    const saved = localStorage.getItem('asiaray_team');
    if (saved) return JSON.parse(saved);
    return INITIAL_REFERRALS;
  });

  // Persistir no localStorage — EXCLUINDO campos sensíveis
  useEffect(() => {
    localStorage.setItem('asiaray_logged', String(isLoggedIn));
    // SEGURANÇA F-06: Guardar apenas campos não-sensíveis do utilizador
    const safeUser = {
      phone: user.phone,
      id: user.id,
      level: user.level,
      creditScore: user.creditScore,
      inviteCode: user.inviteCode,
      bankName: user.bankName,
      bankId: user.bankId,
      createdAt: user.createdAt,
      // bankAccount, holderName, paymentPin, idChaveUnica → NUNCA guardados
    };
    localStorage.setItem('asiaray_user', JSON.stringify(safeUser));
    localStorage.setItem('asiaray_stats', JSON.stringify(stats));
    localStorage.setItem('asiaray_tasks', JSON.stringify(tasks));
    localStorage.setItem('asiaray_logs', JSON.stringify(logs));
    localStorage.setItem('asiaray_team', JSON.stringify(team));
  }, [isLoggedIn, user, stats, tasks, logs, team]);


  // Sync session state with auth state changes
  useEffect(() => {
    let wasLoggedIn = localStorage.getItem('asiaray_logged') === 'true';
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setIsLoggedIn(true);
        localStorage.setItem('asiaray_logged', 'true');
        wasLoggedIn = true;
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem('asiaray_logged');
        if (wasLoggedIn) {
          window.dispatchEvent(new CustomEvent('force-logout', { detail: { message: 'A sua sessão expirou por segurança. Por favor, faça login novamente.' } }));
        }
        wasLoggedIn = false;
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchFinancialStats = async (showLoader: boolean = false) => {
    try {
      const gw = await gatewayFetch(102, {}, showLoader ? 'Carregando estatísticas...' : false);
      if (!gw) return; // session expired or no token

      const { resp, resData } = gw;
      if (resp.ok && resData?.success && resData?.result) {
        const rawResult = resData.result;
        const r = Array.isArray(rawResult) ? rawResult[0] : rawResult;
        if (r) {
          const parseNum = (val: any, fallback: number = 0) => {
            const n = Number(val);
            return isNaN(n) ? fallback : n;
          };
          setStats(prev => ({
            ...prev,
            // balance and balanceUSDT intentionally omitted — refreshUserProfile
            // is the single source of truth to prevent cascading re-renders.
            incomeYesterday: parseNum(r.income_yesterday, 0),
            incomeToday: parseNum(r.income_today, 0),
            incomeThisWeek: parseNum(r.income_this_week, 0),
            incomeThisMonth: parseNum(r.income_this_month, 0),
            incomeLastMonth: parseNum(r.income_last_month, 0),
            incomeTotal: parseNum(r.income_total, 0),
            completedTodayCount: parseNum(r.completed_today_count, 0),
            unfinishedCount: parseNum(r.unfinished_count, 0)
          }));
        }
      }
    } catch {
      // silent — financial stats fetch failed
    }
  };

  useEffect(() => {
    if (!isLoggedIn || isSessionExpired) return;

    // Coordinated fetch with throttle to prevent rapid double-fetching
    const fetchAllData = async (force: boolean = false) => {
      if (sessionExpiredRef.current) return;
      const now = Date.now();
      // Skip if last fetch was less than 3 seconds ago (unless forced by a real event)
      if (!force && now - lastFetchRef.current < 3000) return;
      lastFetchRef.current = now;
      // Sequential: profile first (sets balance + balanceUSDT), then stats (income only)
      await refreshUserProfile(false);
      await fetchFinancialStats(false);
    };

    fetchAllData(true); // force on initial login

    // Realtime covers live changes; 60s polling is just a safety net fallback
    const interval = setInterval(() => {
      fetchAllData(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [isLoggedIn, isSessionExpired]);

  useEffect(() => {
    if (!isLoggedIn || !user?.id || isSessionExpired) return;

    // Debounced handler: collapses bursts of Realtime events into a single fetch
    const handleRealtimeChange = (source: string, payload: any) => {
      if (sessionExpiredRef.current) return;
      // Cancel any pending call and schedule a fresh one after 500ms quiet period
      if (realtimeDebounceRef.current) clearTimeout(realtimeDebounceRef.current);
      realtimeDebounceRef.current = setTimeout(async () => {
        lastFetchRef.current = 0; // reset throttle so forced fetch goes through
        await refreshUserProfile(false);
        await fetchFinancialStats(false);
      }, 500);
    };

    let channel: any = null;
    try {
      // Realtime via WebSocket — works on Cloudflare/Render.
      // On Vercel serverless, WebSockets are not supported; the catch block
      // silently falls back to the 60s polling interval above.
      channel = supabase
        .channel(`realtime_db_changes_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => handleRealtimeChange('profile', payload)
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tarefas_diarias',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => handleRealtimeChange('tarefa', payload)
        )
        .subscribe((status: string, err: any) => {
          if (err) {
            // WebSocket failed (e.g. Vercel) — polling fallback is active, ignore.
            console.warn('[Realtime] WebSocket unavailable, using polling fallback.');
          }
        });
    } catch {
      // Silently ignore — polling fallback covers data freshness.
    }

    return () => {
      if (realtimeDebounceRef.current) clearTimeout(realtimeDebounceRef.current);
      if (channel) {
        try { supabase.removeChannel(channel); } catch {}
      }
    };
  }, [isLoggedIn, user?.id, isSessionExpired]);


  useEffect(() => {
    const handleForceLogout = (e: Event) => {
      const customEvent = e as CustomEvent;
      const msg = customEvent.detail?.message || 'A sua sessão expirou por motivos de segurança. Por favor, faça login novamente.';
      setSessionExpiredMessage(msg);
      setIsSessionExpired(true);
      // Immediately wipe sensitive bank data and session indicators
      setUser(prev => ({
        ...prev,
        bankName: '',
        bankAccount: '',
        holderName: ''
      }));
      localStorage.removeItem('asiaray_user');
      localStorage.removeItem('asiaray_logged');
    };
    window.addEventListener('force-logout', handleForceLogout);
    return () => window.removeEventListener('force-logout', handleForceLogout);
  }, []);

  // Auth: Login real via Supabase Auth
  const login = async (phone: string, pin: string): Promise<boolean> => {
    // SEGURANÇA F-08: Rate limiting no cliente — backoff exponencial após falhas
    const now = Date.now();
    if (now < loginBlockedUntilRef.current) {
      const secsLeft = Math.ceil((loginBlockedUntilRef.current - now) / 1000);
      addToast(`Demasiadas tentativas. Aguarde ${secsLeft} segundos.`, 'error');
      return false;
    }

    if (!(await ensureInternetConnectivity())) {
      return false;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        phone: cleanPhone,
        password: pin
      });
      if (error) {
        // SEGURANÇA F-08: Incrementar contador e aplicar backoff exponencial
        loginAttemptsRef.current += 1;
        const attempts = loginAttemptsRef.current;
        if (attempts >= 3) {
          // 3 falhas = 5s, 4 = 10s, 5 = 20s, 6+ = 60s
          const delayMs = Math.min(60000, 2500 * Math.pow(2, attempts - 2));
          loginBlockedUntilRef.current = Date.now() + delayMs;
        }
        throw new Error(error.message);
      }
      // Login bem-sucedido — resetar contador
      loginAttemptsRef.current = 0;
      loginBlockedUntilRef.current = 0;
      if (!data.session || !data.user) throw new Error('Sessão não criada');

      const token = data.session.access_token;
      let profileData: any = null;
      try {
        if (!(await ensureInternetConnectivity())) {
          return true;
        }
        const res = await gatewayCall(101, {});
        if (res?.success) {
          const raw = res.result;
          profileData = Array.isArray(raw) ? raw[0] : raw;
        }
      } catch (_) { /* perfil será carregado depois */ }

      const loggedUser: UserProfile = {
        phone: profileData?.phone || cleanPhone,
        id: profileData?.id || data.user.id,
        level: profileData?.level || 'WS0',
        creditScore: 85,
        inviteCode: profileData?.invite_code || '',
        bankName: profileData?.bank_name || '',
        bankAccount: profileData?.bank_account || '',
        holderName: profileData?.holder_name || '',
        paymentPin: profileData?.payment_pin ?? undefined,
        idChaveUnica: profileData?.id_chave_unica ?? undefined,
        bankId: profileData?.bank_id || undefined,
        createdAt: profileData?.created_at || new Date().toISOString()
      };
      setUser(loggedUser);
      // Set real balances from profile
      if (profileData) {
        const parseNum = (val: any, fallback: number = 0) => {
          const n = Number(val);
          return isNaN(n) ? fallback : n;
        };
        setStats(prev => ({
          ...prev,
          balance: profileData.balance !== undefined && profileData.balance !== null ? parseNum(profileData.balance, prev.balance) : prev.balance,
          balanceUSDT: profileData.balance_correte_usdt20 !== undefined && profileData.balance_correte_usdt20 !== null ? parseNum(profileData.balance_correte_usdt20, prev.balanceUSDT) : prev.balanceUSDT,
        }));
      }
      setIsLoggedIn(true);
      return true;
    } catch (e) {
      addToast((e as Error).message, 'error');
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  const registerUser = async (phone: string, pin: string, inviteCode: string): Promise<void> => {
    if (!(await ensureInternetConnectivity())) {
      throw new Error('Sem conexão de internet. Verifique WiFi ou dados móveis.');
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    // SEGURANÇA F-09: Obter IP via endpoint interno (Cloudflare Worker)
    // em vez de enviar dados do utilizador a um serviço externo (api.ipify.org)
    let ipAddress = 'unknown';
    try {
      const res = await fetch('/api/data/health?ip=1', { method: 'GET', cache: 'no-cache' });
      if (res.ok) {
        const ipHeader = res.headers.get('x-client-ip');
        if (ipHeader) ipAddress = ipHeader;
      }

      // Verificar se o IP já atingiu o limite
      if (ipAddress && ipAddress !== 'unknown') {
        const checkData = await gatewayCall(903, { p_ip: ipAddress }, false);
        if (checkData?.result?.blocked) {
          addToast('Aviso: IP excedido (Já registrou uma conta neste dispositivo)', 'error');
          throw new Error('IP excedido');
        }
      }
    } catch (e: any) {
      if (e.message === 'IP excedido') throw e;
      // silent — ip fetch failed, continua sem IP
    }

    const { data, error } = await supabase.auth.signUp({
      phone: cleanPhone,
      password: pin,
      options: {
        data: {
          phone: cleanPhone,
          referred_by: inviteCode || '',
          ip_address: ipAddress
        }
      }
    });

    if (error) {
      if (error.message.includes('IP excedido')) {
        addToast('Aviso: IP excedido (Já registrou uma conta neste dispositivo)', 'error');
        throw new Error('IP excedido');
      }
      addToast(error.message, 'error');
      throw new Error(error.message);
    }

    if (!data.user) {
      addToast('Erro ao criar conta.', 'error');
      throw new Error('Erro ao criar conta.');
    }

    if (data.session) {
      const token = data.session.access_token;
      let profileData: any = null;
      try {
        // Pequeno delay para dar tempo ao trigger executar
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (!(await ensureInternetConnectivity())) {
          return;
        }
        const res = await gatewayCall(101, {});
        if (res?.success) {
          const raw = res.result;
          profileData = Array.isArray(raw) ? raw[0] : raw;
        }
      } catch (_) { /* perfil será carregado depois */ }

      const newUser: UserProfile = {
        phone: profileData?.phone || cleanPhone,
        id: profileData?.id || data.user.id,
        level: profileData?.level || 'WS0',
        creditScore: 80,
        inviteCode: profileData?.invite_code || '',
        bankName: profileData?.bank_name || '',
        bankAccount: profileData?.bank_account || '',
        holderName: profileData?.holder_name || '',
        paymentPin: profileData?.payment_pin ?? undefined,
        idChaveUnica: profileData?.id_chave_unica ?? undefined,
        bankId: profileData?.bank_id || undefined
      };
      setUser(newUser);
      // Set real balances from profile
      if (profileData) {
        const parseNum = (val: any, fallback: number = 0) => {
          const n = Number(val);
          return isNaN(n) ? fallback : n;
        };
        setStats(prev => ({
          ...prev,
          balance: profileData.balance !== undefined && profileData.balance !== null ? parseNum(profileData.balance, prev.balance) : prev.balance,
          balanceUSDT: profileData.balance_correte_usdt20 !== undefined && profileData.balance_correte_usdt20 !== null ? parseNum(profileData.balance_correte_usdt20, prev.balanceUSDT) : prev.balanceUSDT,
        }));
      }
      setIsLoggedIn(true);
    }
  };

  // Claim (Join) task
  const claimTask = (taskId: string): boolean => {
    // Check if user reached maximum tasks allowed for their level today
    const maxTasksByLevel: Record<string, number> = {
      WS0: 3,
      WS1: 5,
      WS2: 10,
      WS3: 15,
      WS4: 20,
      WS5: 30
    };
    
    const allowed = maxTasksByLevel[user.level] || 3;
    const currentClaimedAndDoneToday = tasks.filter(t => 
      t.status !== 'disponivel' && 
      (t.requiredLevel === user.level || t.id.startsWith(`t${user.level.slice(-1)}`))
    ).length;

    const activeCount = tasks.filter(t => t.status === 'andamento' || t.status === 'revisao').length;
    if (activeCount >= allowed) {
      return false; // Limit exceeded for concurrent tasks
    }

    setTasks(prev => prev.map(t => {
      if (t.id === taskId && t.status === 'disponivel') {
        return { ...t, status: 'andamento', joinedAt: new Date().toISOString() };
      }
      return t;
    }));

    setStats(prev => ({
      ...prev,
      unfinishedCount: prev.unfinishedCount + 1
    }));

    // Auto-approve task after 7 seconds for interactive simulation
    setTimeout(() => {
      approveTask(taskId);
    }, 7000);

    return true;
  };

  // Support direct approval
  const approveTask = (taskId: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (!task || task.status !== 'revisao') return prev;

      // Reward points!
      const rewardVal = task.reward;
      
      // Update stats inside transaction
      setStats(currentStats => {
        const newBalance = currentStats.balance + rewardVal;
        const newToday = currentStats.incomeToday + rewardVal;
        const newWeek = currentStats.incomeThisWeek + rewardVal;
        const newMonth = currentStats.incomeThisMonth + rewardVal;
        const newTotal = currentStats.incomeTotal + rewardVal;
        const completedToday = currentStats.completedTodayCount + 1;
        const unfinished = Math.max(0, currentStats.unfinishedCount - 1);

        return {
          ...currentStats,
          balance: newBalance,
          incomeToday: newToday,
          incomeThisWeek: newWeek,
          incomeThisMonth: newMonth,
          incomeTotal: newTotal,
          completedTodayCount: completedToday,
          unfinishedCount: unfinished
        };
      });

      // Add a reward log
      const newLog: LogRecord = {
        id: 'rwd_' + String(Math.floor(10000 + Math.random() * 900000)),
        type: 'recompensa',
        amount: rewardVal,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        status: 'aprovado',
        details: `Recompensa ${task.type} (${task.title})`
      };
      setLogs(prevLogs => [newLog, ...prevLogs]);

      // Move task to 'concluido'
      return prev.map(t => t.id === taskId ? { ...t, status: 'concluido' } : t);
    });
  };

  const approvePendingTasks = () => {
    const pending = tasks.filter(t => t.status === 'revisao');
    pending.forEach(t => {
      approveTask(t.id);
    });
  };

  // Recharge trigger (mock)
  const addRecharge = (amount: number, txId: string, proofFileName?: string) => {
    const proofDetails = proofFileName ? `${txId} • ${proofFileName}` : txId || 'Depósito Bancário';
    const newLog: LogRecord = {
      id: 'rec_' + String(Math.floor(10000 + Math.random() * 90000)),
      type: 'recarga',
      amount: amount,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'aprovado', // Immediately approve for simulation speed
      details: proofDetails
    };

    setLogs(prev => [newLog, ...prev]);
    setStats(prev => ({
      ...prev,
      balance: prev.balance + amount
    }));
  };

  // Withdraw real logic via gateway
  const addWithdrawal = async (amount: number, pin: string): Promise<{ success: boolean; error?: string }> => {
    if (stats.balance < amount) {
      return { success: false, error: 'O valor solicitado excede o seu saldo disponível.' };
    }
    if (amount < 2000) {
      return { success: false, error: 'O saldo mínimo para retirada é de 2.000 AOA.' };
    }
    if (!user.bankAccount) {
      return { success: false, error: 'Por favor, vincule uma conta bancária para prosseguir.' };
    }
    if (!user.bankId) {
      return { success: false, error: 'Por favor, vincule uma conta bancária para prosseguir.' };
    }

    try {
      const gw = await gatewayFetch(309, {
        amount: amount,
        bank_id: user.bankId || null,
        pin: pin
      }, 'A processar a sua solicitação de retirada...');

      if (!gw) {
        return { success: false, error: 'Sessão expirada. Faça login novamente.' };
      }

      const { resp, resData } = gw;
      if (resp.ok) {
        if (resData?.success && resData?.result) {
          const r = resData.result;
          if (r.success) {
            // Refresh stats, profile and logs in real-time
            await refreshUserProfile(false);
            await fetchFinancialStats(false);
            const wRecords = await fetchWithdrawalRecords();
            if (wRecords.length > 0) {
              setLogs(prev => {
                // filter out existing 'retirada' logs
                const nonRetiradas = prev.filter(l => l.type !== 'retirada');
                const newRetiradas: LogRecord[] = wRecords.map((rec: any) => ({
                  id: rec.id || 'ret_' + String(Math.floor(10000 + Math.random() * 90000)),
                  type: 'retirada',
                  amount: Number(rec.valor_solicitado),
                  date: rec.created_at ? new Date(rec.created_at).toISOString().replace('T', ' ').slice(0, 16) : new Date().toISOString().replace('T', ' ').slice(0, 16),
                  status: rec.estado_da_retirada === 'pendente' ? 'pendente' : (rec.estado_da_retirada === 'rejeitado' ? 'rejeitado' : 'aprovado'),
                  details: `Banco: ${rec.nome_do_banco} - IBAN: ${rec.iban}`
                }));
                return [...newRetiradas, ...nonRetiradas];
              });
            }
            return { success: true };
          } else {
            return { success: false, error: r.message || 'Erro ao processar retirada.' };
          }
        } else {
          return { success: false, error: resData?.error || 'Erro ao processar retirada.' };
        }
      } else {
        return { success: false, error: resData?.error || 'Falha na comunicação com o servidor.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro de rede. Tente novamente.' };
    }
  };

  const fetchMinhaFinanca = async (): Promise<MinhaFinanca | null> => {
    if (!isLoggedIn || !user.id || !isOnline) return null;
    try {
      const res = await gatewayFetch(103, {});
      if (res && res.resData && res.resData.success && res.resData.result) {
        return res.resData.result;
      }
      return null;
    } catch {
      return null;
    }
  };

  const convertUsdToKz = async (usdAmount: number): Promise<{ success: boolean; message: string }> => {
    try {
      const gw = await gatewayFetch(310, { amount_usd: usdAmount });
      if (!gw) {
        return { success: false, message: 'Sessão expirada. Faça login novamente.' };
      }

      const { resp, resData } = gw;
      if (resp.ok) {
        if (resData?.success && resData?.result) {
          const r = resData.result;
          if (r.success) {
            // Refresh stats and profile in real-time
            await refreshUserProfile();
            await fetchFinancialStats();
          }
          return { success: r.success, message: r.message };
        } else {
          return { success: false, message: resData?.error || 'Erro ao converter saldo.' };
        }
      } else {
        return { success: false, message: resData?.error || 'Falha na comunicação com o servidor.' };
      }
    } catch {
      return { success: false, message: 'Erro de rede. Tente novamente mais tarde.' };
    }
  };

  const updateBankInfo = async (bankName: string, bankAccount: string, holderName: string): Promise<{success: boolean; message: string}> => {
    const gw = await gatewayFetch(412, {
      bank_name: bankName,
      holder_name: holderName,
      iban: bankAccount
    });
    if (!gw) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    const { resp, resData } = gw;
    if (!resp.ok || !resData.success) {
      throw new Error(resData.error || 'Erro desconhecido');
    }
    // Refresh full profile from backend to pick up the new bank_id
    await refreshUserProfile(false);
    const resultMsg = resData.result?.message || 'Operação concluída.';
    return { success: true, message: resultMsg };
  };
  const fetchWithdrawalRecords = async () => {
    try {
      const gw = await gatewayFetch(311);
      if (!gw) return []; // session expired
      const { resp, resData } = gw;
      if (resp.ok) {
        if (resData?.success === false) {
           addToast("Não foi possível carregar os registos de retirada.", "error");
        }
        if (resData?.success && resData?.result) {
          return Array.isArray(resData.result) ? resData.result : [resData.result];
        }
      }
    } catch {
      // silent — fetch withdrawal records failed
    }
    return [];
  };

  const refreshUserProfile = async (useLoading: boolean = true) => {
    try {
      const gw = await gatewayFetch(101, {}, useLoading ? 'Carregando perfil...' : false);
      if (!gw) return; // session expired or no token
      const { resp, resData: res } = gw;
      if (!resp.ok || res?.success === false) {
        // Falha silenciosa — o utilizador não deve ver este erro em background.
        // Se a sessão expirou, o gatewayFetch já despacha o evento force-logout.
        return;
      }
      if (res?.success && res?.result) {
        // result can be an array (RETURNS TABLE) or single object
        const p = Array.isArray(res.result) ? res.result[0] : res.result;
        if (!p) return;

        // Update user profile fields
        setUser(prev => ({
          ...prev,
          phone: p.phone || prev.phone,
          id: p.id || prev.id,
          inviteCode: p.invite_code || prev.inviteCode,
          idChaveUnica: p.id_chave_unica ?? prev.idChaveUnica,
          // Bank fields: use DB value even if empty/null to clear stale cache
          bankName: p.bank_name ?? '',
          bankAccount: p.bank_account ?? '',
          holderName: p.holder_name ?? '',
          bankId: p.bank_id ?? undefined,
          createdAt: p.created_at || new Date().toISOString(),
          level: p.level || prev.level,
          // SEGURANÇA F-10: payment_pin NÃO é guardado no estado do cliente.
          // A validação do PIN é feita apenas no servidor (gateway op 309/415).
          // paymentPin mantém o valor anterior em memória (undefined por defeito).
        }));

        // Update financial stats with real balance from profiles.balance
        // and USDT balance from tarefas_diarias.balance_correte
        const parseNum = (val: any, fallback: number = 0) => {
          const n = Number(val);
          return isNaN(n) ? fallback : n;
        };
        setStats(prev => ({
          ...prev,
          balance: p.balance !== undefined && p.balance !== null ? parseNum(p.balance, prev.balance) : prev.balance,
          balanceUSDT: p.balance_correte_usdt20 !== undefined && p.balance_correte_usdt20 !== null ? parseNum(p.balance_correte_usdt20, prev.balanceUSDT) : prev.balanceUSDT,
        }));
      }
    } catch {
      // silent — profile refresh failed
    }
  };

  // Upgrade membership level
  const upgradeMembership = async (level: string, cost: number, productId?: string): Promise<boolean> => {
    if (productId) {
      try {
        const gw = await gatewayFetch(511, { product_id: productId });
        if (!gw) return false; // session expired
        
        const { resp, resData: res } = gw;
        if (resp.ok) {
          if (res?.success && res.result?.success) {
            addToast(res.result?.message || 'Ativação realizada com sucesso!', 'success');
            await refreshUserProfile();
            return true;
          } else {
            addToast(res?.error || res?.result?.message || 'Falha na ativação', 'error');
            return false;
          }
        }
      } catch {
        addToast('Erro ao processar ativação.', 'error');
        return false;
      }
    }

    if (stats.balance < cost) {
      return false;
    }

    setUser(prev => ({
      ...prev,
      level: level
    }));

    setStats(prev => ({
      ...prev,
      balance: prev.balance - cost
    }));

    const newLog: LogRecord = {
      id: 'upg_' + String(Math.floor(10000 + Math.random() * 90000)),
      type: 'retirada',
      amount: cost,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'aprovado',
      details: `Upgrade de Membro para nível ${level}`
    };

    setLogs(prev => [newLog, ...prev]);
    return true;
  };

  // Increase credit
  const increaseCreditScore = (points: number) => {
    setUser(prev => ({
      ...prev,
      creditScore: Math.min(100, prev.creditScore + points)
    }));
  };

  const updateUserPaymentPin = async (newPin: string, oldPin?: string): Promise<{ success: boolean; message: string }> => {
    showLoading('Validando PIN...');
    try {
      const gw = await gatewayFetch(415, {
        new_pin: newPin,
        old_pin: oldPin || null
      });
      if (!gw) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      const { resp, resData: res } = gw;
      if (!resp.ok || res?.success === false) {
        return { success: false, message: res?.error || 'Erro ao gravar PIN de pagamento.' };
      }

      // SEGURANÇA F-10: Não guardar o novo PIN no estado do cliente.
      // O servidor já atualizou — o estado local não precisa do PIN.

      return { success: true, message: res?.result?.message || 'PIN de pagamento gravado com sucesso.' };
    } finally {
      hideLoading();
    }
  };

  const updateUserLoginPassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!(await ensureInternetConnectivity())) {
      return { success: false, message: 'Sem conexão à internet.' };
    }
    showLoading('A processar segurança...');
    try {
      const cleanPhone = user.phone.replace(/[^0-9]/g, '');
      const email = `${cleanPhone}@user.com`;
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: oldPassword
      });
      if (signInError || !signInData.session) {
        return { success: false, message: 'Senha Antiga incorreta.' };
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        return { success: false, message: updateError.message };
      }

      return { success: true, message: 'Senha de Login alterada com sucesso!' };
    } catch (e) {
      return { success: false, message: (e as Error).message };
    } finally {
      hideLoading();
    }
  };

  const resetAll = () => {
    setIsLoggedIn(true);
    setUser({
      phone: '',
      id: '',
      level: 'WS0',
      creditScore: 100,
      inviteCode: '',
      bankName: '',
      bankAccount: '',
      holderName: '',
      paymentPin: undefined
    });
    setStats(INITIAL_STATS);
    setTasks(INITIAL_TASKS.map(t => ({ ...t, status: 'disponivel' })));
    setLogs(INITIAL_LOGS);
    setTeam(INITIAL_REFERRALS);
  };

  return <AppContext.Provider value={{ isLoggedIn, user, stats, tasks, logs, team, login, logout, registerUser, refreshUserProfile, claimTask, approvePendingTasks, addRecharge, addWithdrawal, convertUsdToKz, updateBankInfo, upgradeMembership, increaseCreditScore, updateUserPaymentPin, updateUserLoginPassword, resetAll, fetchWithdrawalRecords, fetchMinhaFinanca, showAlert, showConfirm, alertConfig, closeAlert, toasts, addToast, removeToast, isFullScreenActive, setIsFullScreenActive, isLoading, loadingMessage, showLoading, hideLoading, isOnline, ensureInternetConnectivity, isSessionExpired, setIsSessionExpired, sessionExpiredMessage, setSessionExpiredMessage }}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
};
