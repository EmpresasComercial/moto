import React, { useState, useEffect } from 'react';
import { GATEWAY_URL, getAccessToken } from '../lib/supabase';
import { useApp } from '../context/AppContext';

interface CuponsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RedeemedCoupon {
  id: string;
  valor_recebido: number;
  origem_bonus: string;
  codigo_presente: string;
  data_recebimento: string;
  status: string;
}

// Masks 3 characters from the middle of a code, e.g. ASIA***AY
const maskCode = (code: string): string => {
  if (code.length <= 4) return code;
  const mid = Math.floor(code.length / 2);
  const start = mid - 1;
  return code.slice(0, start) + '***' + code.slice(start + 3);
};

export const CuponsPage: React.FC<CuponsPageProps> = ({ isOpen, onClose }) => {
  const { showLoading, hideLoading, ensureInternetConnectivity, setIsFullScreenActive, refreshUserProfile, addToast } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [redeemedList, setRedeemedList] = useState<RedeemedCoupon[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsFullScreenActive(true);
    }
    return () => {
      setIsFullScreenActive(false);
    };
  }, [isOpen, setIsFullScreenActive]);

  const loadHistory = async () => {
    if (!(await ensureInternetConnectivity())) return;
    setLoadingHistory(true);
    try {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ op: 803, data: {} }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.result)) {
        const couponEntries = data.result.filter((r: any) => r.codigo_presente && r.codigo_presente.trim() !== '');
        setRedeemedList(couponEntries);
      }
    } catch {
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleRedeem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedCode = couponCode.trim().toUpperCase();
    if (!trimmedCode) {
      addToast('Por favor insira um código de cupão.', 'error');
      return;
    }
    if (!(await ensureInternetConnectivity())) return;

    setSubmitting(true);
    showLoading('A gravar cupão...');
    try {
      const token = await getAccessToken();
      if (!token) {
        addToast('Sessão inválida. Faça login novamente.', 'error');
        return;
      }
      const res = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ op: 701, data: { code: trimmedCode } }),
      });
      const data = await res.json();

      // Unauthenticated or session expired
      if (res.status === 401 || data.force_logout) {
        addToast(data.error || 'Sessão expirada. Faça login novamente.', 'error');
        window.dispatchEvent(new CustomEvent('force-logout', { detail: { message: data.error } }));
        return;
      }

      if (data.success && data.result?.success) {
        addToast(data.result.message, 'success');
        setCouponCode('');
        loadHistory();
        refreshUserProfile(false);
      } else {
        const errMsg = data.result?.message || data.error || 'Erro ao gravar o cupão.';
        addToast(errMsg, 'error');
      }
    } catch {
      addToast('Erro de conexão. Tente novamente.', 'error');
    } finally {
      setSubmitting(false);
      hideLoading();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[50] bg-[#f5f5f5] flex flex-col font-sans animate-fadeIn" id="cupons-page-container">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 select-none" style={{ height: '48px' }}>
        <button
          id="cupons-back-btn"
          onClick={onClose}
          className="text-neutral-500 hover:text-neutral-800 select-none cursor-pointer focus:outline-none flex items-center p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px] text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[15px] font-bold text-neutral-850 tracking-tight text-center flex-1 translate-x-[-10px]">Cupons</span>
        <div className="w-6" />
      </div>

      {/* Body */}
      <div className="flex-1 p-3 space-y-4 bg-white overflow-y-auto no-scrollbar">
        <form onSubmit={handleRedeem} className="space-y-4">

          {/* Box 1: Code input */}
          <div className="border border-gray-200 bg-white rounded-sm overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Código do Cupão</div>
              <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200">
                <input
                  id="coupon-code-input"
                  type="text"
                  placeholder="Ex: ASIARAY2024"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  maxLength={32}
                  className="bg-transparent border-none outline-none w-full text-neutral-800 text-[12px] font-sans font-bold"
                />
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="flex flex-col items-center justify-center pt-2 select-none">
            <button
              id="coupon-redeem-btn"
              type="submit"
              disabled={submitting}
              className={`text-white font-bold text-[12px] py-2 px-6 rounded-sm transition-colors w-full text-center uppercase tracking-wide ${submitting ? 'bg-neutral-300 cursor-not-allowed' : 'bg-[#60a5fa] hover:bg-[#3b82f6] cursor-pointer'}`}
            >
              {submitting ? 'A processar...' : 'Gravar Cupão'}
            </button>
          </div>

          {/* Box 2: Info — below the button */}
          <div className="border border-gray-200 bg-white rounded-sm overflow-hidden">
            <div className="bg-white py-2.5 px-2 border-b border-gray-200 text-center text-[#e1251b] font-bold text-[12px]">
              Informações Importantes
            </div>
            <div>
              <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Instruções</div>
              <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] font-sans border-t border-gray-200">
                Cada código de cupão só pode ser resgatado uma única vez por conta. Os cupões têm uma duração de 5 minutos.
              </div>
            </div>
          </div>
        </form>

        {/* Redeemed coupons list */}
        {(redeemedList.length > 0 || loadingHistory) && (
          <div className="border border-gray-200 bg-white rounded-sm overflow-hidden">
            <div className="bg-white py-2.5 px-2 border-b border-gray-200 text-center text-[#0a52a3] font-bold text-[12px] flex items-center justify-center gap-2">
              Cupons Resgatados
              {loadingHistory && (
                <div className="h-3 w-3 border-2 border-[#60a5fa] border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            {redeemedList.map((item, idx) => {
              const dateStr = item.data_recebimento
                ? new Date(item.data_recebimento).toLocaleString('pt-AO').replace(',', '')
                : '—';
              const isSuccess = item.status === 'success' || item.status === 'aprovado';
              return (
                <div key={item.id} className={`px-3 py-2.5 ${idx < redeemedList.length - 1 ? 'border-b border-gray-200' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <div className="text-[12px] font-bold text-neutral-800 font-mono tracking-wide">{maskCode(item.codigo_presente)}</div>
                      <div className="text-[10.5px] text-neutral-400 font-mono">{dateStr}</div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <div className="text-[12px] font-bold text-neutral-800 font-mono">
                        +{Number(item.valor_recebido).toLocaleString('pt-AO')} KZ
                      </div>
                      <div className={`text-[12px] font-bold ${isSuccess ? 'text-green-600' : 'text-amber-500'}`}>
                        {isSuccess ? 'Aprovado' : 'Pendente'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
