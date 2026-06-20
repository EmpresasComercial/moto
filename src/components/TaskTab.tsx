import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TaskType } from '../types';
import { EmptyState } from './EmptyState';
import { GATEWAY_URL, getAccessToken } from '../lib/supabase';

interface TaskTabProps {
  selectedCategory: TaskType;
  setSelectedCategory: (category: TaskType) => void;
  setActiveTab: (tab: string) => void;
}

// ─── Shop item from the database ───
interface ShopItem {
  id: number;
  user_id: string;
  nome_produto: string;
  preco: number;
  rendimento_diario: number;
  data_compra: string;
  duracao_dias: number;
  data_expiracao: string;
  status: string;
}

// ─── Inline SVGs for tab header icons ───

const WhatsappWordmark: React.FC = () => (
  <div className="flex flex-col items-center select-none pt-0.5">
    <div className="flex items-center justify-center h-8">
      <svg className="h-[21px] shrink-0" viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.27 0 0 6.27 0 14C0 17.07 1 19.92 2.68 22.3L0.9 27.9L6.7 26.2C8.98 27.53 11.4 28 14 28C21.73 28 28 21.73 28 14C28 6.27 21.73 0 14 0Z" fill="#25D366" />
        <path d="M21.5 19.1C21.1 20.2 19.6 21 18.3 21C17.3 21 16 20.7 14.5 20.1C11.5 18.8 8.9 16 8.3 15.3C7.6 14.4 6 12.3 6 9.8C6 7.3 7.3 6.1 7.8 5.6C8.3 5.1 9.1 4.9 9.6 4.9C9.8 4.9 10 4.9 10.2 5C10.5 5.1 10.7 5.1 11 5.8C11.3 6.6 12 8.3 12.1 8.5C12.2 8.7 12.3 9 12.1 9.3C12 9.6 11.9 9.8 11.6 10.1C11.4 10.3 11.1 10.7 10.9 10.9C10.7 11.1 10.4 11.3 10.7 11.8C11 12.3 11.7 13.5 12.8 14.4C14.2 15.6 15.3 16 15.8 16.2C16.3 16.4 16.6 16.4 16.9 16.1C17.2 15.8 17.7 15.2 18.1 14.6C18.4 14.1 18.8 14.2 19.3 14.4C19.8 14.6 21.3 15.3 21.6 15.5C21.9 15.6 22.1 15.8 22.2 16.1C22.2 16.4 22.2 17.6 21.5 19.1Z" fill="white" />
        <text x="35" y="20" fill="#000000" fontSize="18" fontWeight="bold" fontFamily="sans-serif">Whatsapp</text>
      </svg>
    </div>
    <span className="text-[12px] font-semibold text-zinc-500 mt-1 select-none font-sans">Whatsapp</span>
  </div>
);

const TiktokLogo: React.FC = () => (
  <div className="flex flex-col items-center select-none pt-0.5">
    <div className="flex items-center justify-center h-8">
      <svg className="h-[21px] shrink-0" viewBox="0 0 100 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C16 2 16.5 6 22 6V10C19 10 16 8.5 16 8.5V18.5C16 22.6 12.6 26 8.5 26C4.4 26 1 22.6 1 18.5C1 14.4 4.4 11 8.5 11C9.2 11 9.8 11.1 10.4 11.3V15.5C9.8 15.2 9.2 15 8.5 15C6.6 15 5 16.6 5 18.5C5 20.4 6.6 22 8.5 22C10.4 22 12 20.4 12 18.5V2H16Z" fill="#000000" />
        <path d="M16 2C16 2 16.5 6 22 6V10C19 10 16 8.5 16 8.5V18.5C16 22.6 12.6 26 8.5 26C4.4 26 1 22.6 1 18.5C1 14.4 4.4 11 8.5 11C9.2 11 9.8 11.1 10.4 11.3V15.5C9.8 15.2 9.2 15 8.5 15C6.6 15 5 16.6 5 18.5C5 20.4 6.6 22 8.5 22C10.4 22 12 20.4 12 18.5V2H16Z" stroke="#00f2fe" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <text x="30" y="20" fill="#000000" fontSize="18" fontWeight="bold" fontFamily="sans-serif">Tik tok</text>
      </svg>
    </div>
    <span className="text-[12px] font-semibold text-zinc-500 mt-1 select-none font-sans">Tik tok</span>
  </div>
);

const FacebookLogo: React.FC = () => (
  <div className="flex flex-col items-center select-none pt-0.5">
    <div className="flex items-center justify-center h-8">
      <svg className="h-[25px] w-[25px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="5" fill="#1877F2" />
        <path d="M16 8.5H14.5C13.8 8.5 13.5 8.9 13.5 9.6V11H16L15.5 13H13.5V19.5H11V13H9.5V11H11V9.5C11 7.6 12.1 6.5 14 6.5C14.9 6.5 15.6 6.6 16 6.7V8.5Z" fill="white" />
      </svg>
    </div>
    <span className="text-[12px] font-semibold text-zinc-500 mt-1 select-none font-sans">Facebook</span>
  </div>
);

const CardLeftLogo: React.FC<{ type: TaskType }> = ({ type }) => {
  if (type === 'Whatsapp') {
    return (
      <div className="flex flex-col items-center justify-center shrink-0 w-[84px] p-2 bg-slate-50 border-r border-zinc-150 select-none">
        <span className="text-[11px] text-zinc-400 font-sans mb-1.5 font-bold">Whatsapp</span>
        <svg className="h-[24px] w-[24px]" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 0C6.27 0 0 6.27 0 14C0 17.07 1 19.92 2.68 22.3L0.9 27.9L6.7 26.2C8.98 27.53 11.4 28 14 28C21.73 28 28 21.73 28 14C28 6.27 21.73 0 14 0Z" fill="#25D366" />
          <path d="M21.5 19.1C21.1 20.2 19.6 21 18.3 21C17.3 21 16 20.7 14.5 20.1C11.5 18.8 8.9 16 8.3 15.3C7.6 14.4 6 12.3 6 9.8C6 7.3 7.3 6.1 7.8 5.6C8.3 5.1 9.1 4.9 9.6 4.9C9.8 4.9 10 4.9 10.2 5C10.5 5.1 10.7 5.1 11 5.8C11.3 6.6 12 8.3 12.1 8.5C12.2 8.7 12.3 9 12.1 9.3C12 9.6 11.9 9.8 11.6 10.1C11.4 10.3 11.1 10.7 10.9 10.9C10.7 11.1 10.4 11.3 10.7 11.8C11 12.3 11.7 13.5 12.8 14.4C14.2 15.6 15.3 16 15.8 16.2C16.3 16.4 16.6 16.4 16.9 16.1C17.2 15.8 17.7 15.2 18.1 14.6C18.4 14.1 18.8 14.2 19.3 14.4C19.8 14.6 21.3 15.3 21.6 15.5C21.9 15.6 22.1 15.8 22.2 16.1C22.2 16.4 22.2 17.6 21.5 19.1Z" fill="white" />
        </svg>
      </div>
    );
  }
  if (type === 'Tiktok') {
    return (
      <div className="flex flex-col items-center justify-center shrink-0 w-[84px] p-2 bg-slate-50 border-r border-zinc-150 select-none">
        <span className="text-[11px] text-zinc-400 font-sans mb-1.5 font-bold">Tik tok</span>
        <svg className="h-[24px] w-[24px]" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C16 2 16.5 6 22 6V10C19 10 16 8.5 16 8.5V18.5C16 22.6 12.6 26 8.5 26C4.4 26 1 22.6 1 18.5C1 14.4 4.4 11 8.5 11C9.2 11 9.8 11.1 10.4 11.3V15.5C9.8 15.2 9.2 15 8.5 15C6.6 15 5 16.6 5 18.5C5 20.4 6.6 22 8.5 22C10.4 22 12 20.4 12 18.5V2H16Z" fill="#000000" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center shrink-0 w-[84px] p-2 bg-slate-50 border-r border-zinc-150 select-none">
      <span className="text-[11px] text-zinc-400 font-sans mb-1.5 font-bold">Facebook</span>
      <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#1877F2" />
        <path d="M16 8.5H14.5C13.8 8.5 13.5 8.9 13.5 9.6V11H16L15.5 13H13.5V19.5H11V13H9.5V11H11V9.5C11 7.6 12.1 6.5 14 6.5C14.9 6.5 15.6 6.6 16 6.7V8.5Z" fill="white" />
      </svg>
    </div>
  );
};

// ─── Calculate remaining profit for a shop item ───
function calcLucroRestante(item: ShopItem): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataCompra = new Date(item.data_compra);
  dataCompra.setHours(0, 0, 0, 0);

  const diffMs = hoje.getTime() - dataCompra.getTime();
  const diasPassados = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const diasRestantes = Math.max(0, item.duracao_dias - diasPassados);
  return Number((item.rendimento_diario * diasRestantes).toFixed(2));
}

// ─── localStorage helpers for claimed tasks (global across all 3 tabs) ───
const CLAIMED_TASKS_KEY = 'tasktab_claimed_tasks';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// Record<shopId, claimedAtTimestamp>
function loadClaimedTasks(): Record<number, number> {
  try {
    const raw = localStorage.getItem(CLAIMED_TASKS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<number, number>;
  } catch {
    return {};
  }
}

function saveClaimedTasks(data: Record<number, number>): void {
  localStorage.setItem(CLAIMED_TASKS_KEY, JSON.stringify(data));
}

// Purge entries older than 24h and return clean record
function getPurgedClaimedTasks(): Record<number, number> {
  const now = Date.now();
  const data = loadClaimedTasks();
  const purged: Record<number, number> = {};
  for (const [key, ts] of Object.entries(data)) {
    if (now - ts < TWENTY_FOUR_HOURS_MS) {
      purged[Number(key)] = ts;
    }
  }
  saveClaimedTasks(purged);
  return purged;
}

export const TaskTab: React.FC<TaskTabProps> = ({ selectedCategory, setSelectedCategory, setActiveTab }) => {
  const { user, isSessionExpired, showLoading, hideLoading, ensureInternetConnectivity, addToast } = useApp();

  // Shop items fetched from the database (op 601)
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Map of shopId -> claimedAt timestamp (persisted in localStorage, global across all tabs)
  const [claimedTasks, setClaimedTasks] = useState<Record<number, number>>(() => getPurgedClaimedTasks());

  // Fetch user's active shop items from gateway
  useEffect(() => {
    if (isSessionExpired) return;

    const loadShopItems = async () => {
      if (!(await ensureInternetConnectivity())) { setLoading(false); return; }
      setLoading(true);
      showLoading('Carregando itens da loja...');
      try {
        const token = await getAccessToken();
        if (!token) { setLoading(false); hideLoading(); return; }

        const resp = await fetch(GATEWAY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ op: 601, data: {} })
        });

        // Intercept 401/force_logout
        if (resp.status === 401) {
          const errData = await resp.json().catch(() => ({}));
          const msg = errData?.error || 'Sessão inválida. Faça login novamente.';
          window.dispatchEvent(new CustomEvent('force-logout', { detail: { message: msg } }));
          setLoading(false);
          return;
        }

        if (resp.ok) {
          const res = await resp.json();
          if (res?.success && Array.isArray(res.result)) {
            setShopItems(res.result);
          }
        }
      } catch (err) {
        console.error('Error loading shop items:', err);
      } finally {
        hideLoading();
        setLoading(false);
      }
    };
    loadShopItems();
  }, [isSessionExpired]);

  // Re-sync claimed state from localStorage when window regains focus
  useEffect(() => {
    const onFocus = () => {
      setClaimedTasks(getPurgedClaimedTasks());
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const [claimingId, setClaimingId] = useState<number | null>(null);

  // Returns true if this shopId was claimed less than 24h ago
  const isClaimed = (shopId: number): boolean => {
    const ts = claimedTasks[shopId];
    if (!ts) return false;
    return Date.now() - ts < TWENTY_FOUR_HOURS_MS;
  };

  const handleClaimTask = async (shopId: number) => {
    if (isSessionExpired || claimingId !== null) return;
    if (isClaimed(shopId)) return; // already claimed — guard
    if (!(await ensureInternetConnectivity())) { return; }
    setClaimingId(shopId);
    showLoading('Requisitando tarefa...');
    
    try {
      const token = await getAccessToken();
      if (!token) { hideLoading(); setClaimingId(null); return; }

      const resp = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ op: 602, data: { shop_id: shopId } })
      });

      if (resp.status === 401) {
        const errData = await resp.json().catch(() => ({}));
        window.dispatchEvent(new CustomEvent('force-logout', { detail: { message: errData?.error || 'Sessão inválida.' } }));
        hideLoading();
        setClaimingId(null);
        return;
      }

      let res;
      try {
        res = await resp.json();
      } catch (e) {
        res = {};
      }

      if (resp.ok && res?.success) {
        addToast('Tarefa reivindicada com sucesso!', 'success');
        const updatedClaimedTasks = { ...claimedTasks, [shopId]: Date.now() };
        setClaimedTasks(updatedClaimedTasks);
        saveClaimedTasks(updatedClaimedTasks);
      } else {
        addToast(res?.error || res?.message || `Erro no servidor (Status ${resp.status})`, 'error');
      }
    } catch (err: any) {
      console.error('Error claiming task:', err);
      addToast(err?.message || String(err), 'error');
    } finally {
      hideLoading();
      setClaimingId(null);
    }
  };

  // All 3 tabs show the same shop data
  const displayItems = shopItems;

  return (
    <div id="tasks-screen-wrapper" className="min-h-screen bg-stone-100/60 pb-20 relative font-sans">
      
      {/* 1. Header Channel Selector Category from Image */}
      <div className="bg-white grid grid-cols-3 border-b border-zinc-200 shadow-xs px-3 py-3 gap-2" id="tasks-filter-selection-grid">
        
        {/* Whatsapp Selector */}
        <div 
          onClick={() => setSelectedCategory('Whatsapp')}
          className={`cursor-pointer pb-2 flex flex-col items-center justify-center transition-all ${
            selectedCategory === 'Whatsapp' ? 'border-b-[3px] border-green-500 scale-[1.02]' : 'opacity-65 hover:opacity-100'
          }`}
          id="tab-btn-whatsapp"
        >
          <WhatsappWordmark />
        </div>

        {/* Tiktok Selector */}
        <div 
          onClick={() => setSelectedCategory('Tiktok')}
          className={`cursor-pointer pb-2 flex flex-col items-center justify-center transition-all ${
            selectedCategory === 'Tiktok' ? 'border-b-[3px] border-black scale-[1.02]' : 'opacity-65 hover:opacity-100'
          }`}
          id="tab-btn-tiktok"
        >
          <TiktokLogo />
        </div>

        {/* Facebook Selector */}
        <div 
          onClick={() => setSelectedCategory('Facebook')}
          className={`cursor-pointer pb-2 flex flex-col items-center justify-center transition-all ${
            selectedCategory === 'Facebook' ? 'border-b-[3px] border-blue-600 scale-[1.02]' : 'opacity-65 hover:opacity-100'
          }`}
          id="tab-btn-facebook"
        >
          <FacebookLogo />
        </div>

      </div>

      {/* 2. Tasks Grid List — data from shop table */}
      <div className="p-3.5 space-y-3" id="tasks-list-cards-viewport">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
          </div>
        ) : displayItems.length === 0 ? (
          <EmptyState
            className="bg-white rounded-lg border border-zinc-200 p-12"
            message="Sem dados"
            description="Nenhuma tarefa disponível nesta categoria no momento. Adquira um produto para começar a receber tarefas."
          />
        ) : (
          displayItems.map((item) => {
            const lucroRestante = calcLucroRestante(item);
            const claimed = isClaimed(item.id);
            const isProcessing = claimingId === item.id;

            return (
              <div 
                key={item.id}
                className="bg-white rounded-sm border border-zinc-200/85 shadow-xs overflow-hidden flex min-h-[105px]"
                id={`task-card-item-${item.id}`}
              >
                {/* Left side logo column */}
                <CardLeftLogo type={selectedCategory} />

                {/* Central meta information column */}
                <div className="flex-1 p-3 flex flex-col justify-between text-left select-none pr-1">
                  
                  {/* Row 1: demander = nome_produto + PAGO badge */}
                  <div className="text-[12.5px] text-zinc-500 font-sans tracking-tight leading-none">
                    demander: <span className="font-semibold text-zinc-700">{item.nome_produto}</span>{' '}
                    {item.status === 'ativo' && (
                      <span className="text-[#d97706] font-extrabold text-[11px] ml-1 uppercase">PAGO</span>
                    )}
                  </div>

                  {/* Row 2: preco from shop table */}
                  <div className="text-[13px] font-black text-[#27272a] font-sans tracking-wide leading-tight mt-1">
                    {Number(item.preco).toFixed(2)} KZ
                  </div>

                  {/* Row 3: restante = lucro restante calculado */}
                  <div className="text-[11px] text-zinc-400 font-sans mt-0.5">
                    restante: <span className="text-zinc-900 font-extrabold text-[12px]">{lucroRestante}</span>
                  </div>

                  {/* Row 4: Objectivo da tarefa = nome_produto */}
                  <div className="text-[11.5px] text-zinc-500 font-sans mt-1">
                    Objectivo da tarefa: <span className="text-zinc-700 font-medium">{item.nome_produto}</span>
                  </div>

                </div>

                {/* Right actions column */}
                <div className="p-3 flex items-center justify-center shrink-0">
                  {claimed ? (
                    /* ── CLAIMED STATE: neutral, disabled — same across all 3 tabs ── */
                    <button
                      disabled
                      id={`get-task-btn-${item.id}`}
                      className="h-[28px] px-3 text-[11.5px] font-black text-zinc-400 bg-zinc-100 border border-zinc-200 rounded-xs shadow-none cursor-not-allowed select-none outline-none"
                    >
                      Reivindicado
                    </button>
                  ) : (
                    /* ── AVAILABLE STATE: orange gradient ── */
                    <button
                      onClick={() => handleClaimTask(item.id)}
                      disabled={isProcessing}
                      id={`get-task-btn-${item.id}`}
                      className={`h-[28px] px-3 text-[11.5px] font-black text-slate-800 bg-gradient-to-b from-[#f97316] to-[#ea580c] hover:brightness-[1.05] active:brightness-[0.95] rounded-xs shadow-sm cursor-pointer select-none transition-all outline-none border-none border-orange-600/25 ${
                        isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isProcessing ? 'Processando...' : 'Obter a tarefa'}
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
