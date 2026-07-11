import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Check, User } from 'lucide-react';
import { GATEWAY_URL, getAccessToken, gatewayCall } from '../lib/supabase';

const BlueCardIcon: React.FC = () => (
  <svg className="w-[30px] h-[21px] rounded-[3px] shadow-xs select-none shrink-0" viewBox="0 0 30 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="30" height="21" rx="2.5" fill="#1b4d89" />
    <path d="M2 13C8 16 14 10.5 17 12.5C21 14.5 25.5 17 28 15.5" stroke="#4a86cf" strokeWidth="0.8" strokeLinecap="round" />
    <path d="M1 16C10 20 18 15 29 17.5" stroke="#71a9ee" strokeWidth="0.6" strokeLinecap="round" />
    <rect x="3.5" y="6.5" width="5" height="4" rx="0.5" fill="#fbbf24" />
    <line x1="6" y1="6.5" x2="6" y2="10.5" stroke="#92400e" strokeWidth="0.4" />
    <line x1="3.5" y1="8.5" x2="8.5" y2="8.5" stroke="#92400e" strokeWidth="0.4" />
    <circle cx="23" cy="14" r="2" fill="white" fillOpacity="0.4" />
    <circle cx="25" cy="14" r="2" fill="white" fillOpacity="0.2" />
  </svg>
);

const GoldCoinIcon: React.FC = () => (
  <svg className="w-[26px] h-[26px] select-none shrink-0" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="13" cy="13" r="11.5" fill="#fffbeb" stroke="#f59e0b" strokeWidth="2.2" />
    <circle cx="13" cy="13" r="8.2" fill="#fef08a" stroke="#d97706" strokeWidth="1.2" />
    <text x="13.2" y="16.5" fill="#a16207" fontSize="10.5" fontWeight="950" textAnchor="middle" fontFamily="sans-serif">B</text>
    <line x1="11.5" y1="3.5" x2="11.5" y2="5" stroke="#d97706" strokeWidth="0.8" />
    <line x1="14.5" y1="3.5" x2="14.5" y2="5" stroke="#d97706" strokeWidth="0.8" />
  </svg>
);

export const WSTab: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSessionExpired, showLoading, hideLoading, ensureInternetConnectivity, refreshUserProfile, addToast } = useApp();

  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [purchasedNames, setPurchasedNames] = useState<Set<string>>(new Set());
  const [confirmTier, setConfirmTier] = useState<any | null>(null);
  const [purchaseProcessing, setPurchaseProcessing] = useState<boolean>(false);

  const loadProducts = async () => {
    showLoading('Carregando níveis WS...');
    if (!(await ensureInternetConnectivity())) { hideLoading(); return; }
    try {
      const token = await getAccessToken();
      if (!token) return;

      const [respProducts, respShop] = await Promise.all([
        fetch(GATEWAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ op: 512, data: {} })
        }),
        fetch(GATEWAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ op: 601, data: {} })
        })
      ]);

      if (respProducts.status === 401) {
        const errData = await respProducts.json().catch(() => ({}));
        window.dispatchEvent(new CustomEvent('force-logout', { detail: { message: errData?.error || 'Sessão inválida.' } }));
        return;
      }

      if (respProducts.ok) {
        const res = await respProducts.json();
        if (res?.success && Array.isArray(res.result)) {
          setDbProducts(res.result);
        }
      }

      if (respShop.ok) {
        const shopRes = await respShop.json();
        if (shopRes?.success && Array.isArray(shopRes.result)) {
          const names = new Set<string>(shopRes.result.map((s: any) => String(s.nome_produto || '').toUpperCase()));
          setPurchasedNames(names);
        }
      }
    } catch {
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    if (isSessionExpired) return;
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSessionExpired]);

  const visualMap: Record<string, { dailyTasks: number; bgStyle: string; btnColor: string }> = {
    WS0: { dailyTasks: 1, bgStyle: 'linear-gradient(135deg, #a1a1aa 0%, #e4e4e7 15%, #a1a1aa 30%, #d4d4d8 45%, #f4f4f5 60%, #a1a1aa 75%, #d4d4d8 90%, #e4e4e7 100%)', btnColor: 'text-zinc-600' },
    WS1: { dailyTasks: 1, bgStyle: 'linear-gradient(135deg, #3b608c 0%, #c0d1e5 15%, #3b608c 30%, #517ca8 45%, #e1ecf7 60%, #3b608c 75%, #517ca8 90%, #5d8dc2 100%)', btnColor: 'text-blue-900' },
    WS2: { dailyTasks: 1, bgStyle: 'linear-gradient(135deg, #5c6773 0%, #d1dbe5 15%, #5c6773 30%, #7d8b9c 45%, #eef3f7 60%, #5c6773 75%, #7d8b9c 90%, #8b99a6 100%)', btnColor: 'text-slate-800' },
    WS3: { dailyTasks: 1, bgStyle: 'linear-gradient(135deg, #4c2254 0%, #dab5dc 15%, #4c2254 30%, #7b4382 45%, #f6eff7 60%, #4c2254 75%, #7b4382 90%, #8c5294 100%)', btnColor: 'text-fuchsia-900' },
    WS4: { dailyTasks: 1, bgStyle: 'linear-gradient(135deg, #946916 0%, #f6e3bd 15%, #946916 30%, #ca9b3b 45%, #fffbf2 60%, #946916 75%, #ca9b3b 90%, #dbac4d 100%)', btnColor: 'text-amber-800' },
    WS5: { dailyTasks: 1, bgStyle: 'linear-gradient(135deg, #a82424 0%, #fcdcdd 15%, #a82424 30%, #d44848 45%, #fff5f5 60%, #a82424 75%, #d44848 90%, #e05e5e 100%)', btnColor: 'text-red-800' }
  };

  const defaultStyle = 'linear-gradient(135deg, #5c6773 0%, #d1dbe5 15%, #5c6773 30%, #7d8b9c 45%, #eef3f7 60%, #5c6773 75%, #7d8b9c 90%, #8b99a6 100%)';

  const tiers = dbProducts.map(dbP => {
    const vis = visualMap[dbP.name] || { dailyTasks: 1, bgStyle: defaultStyle, btnColor: 'text-slate-800' };
    return {
      level: dbP.name,
      dbId: dbP.id,
      price: Number(dbP.price),
      dailyTasks: Number(dbP.tarefa_por_dia) || vis.dailyTasks,
      payPerTask: Number(dbP.daily_income),
      durationDays: Number(dbP.duration_days) || 30,
      bgStyle: vis.bgStyle,
      btnColor: vis.btnColor
    };
  }).sort((a, b) => a.price - b.price);

  const currentTier = tiers.find(t => t.level === user.level) || tiers[0] || { dailyTasks: 0 };

  const handleUpgradeClick = (tier: any) => {
    setConfirmTier(tier);
  };

  const handleConfirmPurchase = async () => {
    if (!confirmTier || purchaseProcessing) return;
    const productId = confirmTier.dbId;
    setConfirmTier(null); // Close modal immediately
    setPurchaseProcessing(true);
    showLoading('Finalizando compra...');
    try {
      const res = await gatewayCall(511, { product_id: productId });
      if (res?.success && res.result?.success) {
        addToast(res.result?.message || 'Compra concluída com sucesso!', 'success');
        await refreshUserProfile();
        await loadProducts();
      } else {
        addToast(res?.error || res?.result?.message || 'Não foi possível finalizar a compra.', 'error');
      }
    } catch (err: any) {
      addToast(err.message || 'Erro ao processar a compra. Tente novamente ou contate o suporte.', 'error');
    } finally {
      hideLoading();
      setPurchaseProcessing(false);
    }
  };

  return (
    <div id="member-tab-container" className="pb-24 bg-neutral-50 min-h-screen">
      
      {/* 1. Yellow convex dome header background */}
      <div className="relative w-full h-[160px] bg-gradient-to-b from-[#ffea30] to-[#f5cb14] flex flex-col items-center justify-center pt-2">
        
        {/* User Info positioned inside the yellow zone */}
        <div className="text-center space-y-1.5 z-10 -mt-4">
          <div className="text-[16px] font-black tracking-widest text-[#1c1c1a]/95 select-all uppercase drop-shadow-sm">
            {user.level}
          </div>

          <div className="inline-block bg-black/10 text-slate-800 text-xs font-extrabold px-3 py-0.5 rounded-sm select-none shadow-sm">
            {currentTier.dailyTasks} tarefas por dia
          </div>

          <div className="text-[11px] text-slate-800/80 font-bold select-all mt-1">
            Código de convite: {user.inviteCode || '931242'}
          </div>
        </div>

        {/* The arched white wave clipping of the yellow area */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-neutral-50 rounded-t-[140%]" />
      </div>

      {/* 2. Motivational Headings block */}
      <div className="relative px-4 flex flex-col items-center text-center pb-6">
        <div className="mt-2 select-none space-y-1">
          <h2 className="text-lg font-black text-neutral-800 tracking-wide">
            Junte-se a nós
          </h2>
          <p className="text-xs font-bold text-neutral-600 tracking-wider">
            Obter mais tarefas
          </p>
        </div>
      </div>

      {/* 3. Horizontal wavy reflection list of tiers (WS1, WS2, WS3...) */}
      <div className="px-4 space-y-4" id="member-tiers-list">
        {tiers.map((tier) => {
          const isPurchased = purchasedNames.has(tier.level.toUpperCase());
          return (
            <div 
              key={tier.level}
              onClick={() => !isPurchased && handleUpgradeClick(tier)}
              style={{ backgroundImage: tier.bgStyle }}
              className={`relative w-full h-[120px] rounded-[24px] border-2 border-white/95 overflow-hidden flex flex-col justify-between p-4 text-slate-800 shadow-none transition-all ${isPurchased ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'}`}
              id={`tier-card-${tier.level}`}
            >
              {/* Top Row: VIP name and target price badge */}
              <div className="flex justify-between items-start">
                <div className="pl-2">
                  <h3 className="text-3xl font-display font-black tracking-widest leading-none">
                    {tier.level}
                  </h3>
                  <p className="text-[15px] font-bold tracking-wider mt-1 text-slate-800/95">
                    {tier.price.toLocaleString('pt-AO')} KZ
                  </p>
                </div>

                {/* Right side: check icon if purchased, buy button if not */}
                <div className="pr-1 pt-1">
                  {isPurchased ? (
                    <div
                      id={`buy-button-${tier.level}`}
                      className="h-[32px] w-[32px] rounded-full bg-green-500 flex items-center justify-center shadow-md border-2 border-white/80"
                    >
                      <Check className="text-white h-[18px] w-[18px]" strokeWidth={3} />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpgradeClick(tier);
                      }}
                      id={`buy-button-${tier.level}`}
                      className={`h-[32px] rounded-full px-4 text-[12px] font-bold transition-all focus:outline-none bg-white/95 hover:bg-white border border-white/50 shadow-sm ${tier.btnColor}`}
                    >
                      Comprar
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Row: Darkened translucent footer strip inside card */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/15 py-1.5 px-6 flex justify-between items-center text-[11px] font-bold select-none border-t border-white/5">
                <span className="tracking-wide">
                  {tier.dailyTasks} tarefa por dia
                </span>
                
                <span className="text-slate-800/80 font-mono text-[10px] font-normal">
                  Rendimento p/ tarefa: KZ {tier.payPerTask.toLocaleString('pt-AO')}
                </span>
              </div>
              
            </div>
          );
        })}
      </div>

      {confirmTier && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[9999] p-6 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-[270px] overflow-hidden flex flex-col shadow-xl border border-neutral-100/50">
            <div className="px-5 py-6 text-center">
              <p className="text-[14px] font-normal text-neutral-800 leading-snug">
                Deseja realmente comprar o produto {confirmTier.level} por {confirmTier.price.toLocaleString('pt-AO')} KZ?
              </p>
            </div>
            
            <div className="border-t border-neutral-100 flex">
              <button
                type="button"
                onClick={() => setConfirmTier(null)}
                className="flex-1 py-3 text-[14px] font-normal text-neutral-500 hover:bg-neutral-50 active:bg-neutral-100 border-r border-neutral-100 focus:outline-none transition-colors cursor-pointer"
              >
                Canc
              </button>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                className="flex-1 py-3 text-[14px] font-bold text-[#2563eb] hover:bg-neutral-50 active:bg-neutral-100 focus:outline-none transition-colors cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
