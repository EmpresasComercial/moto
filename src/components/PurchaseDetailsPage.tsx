import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { gatewayCall } from '../lib/supabase';

const formatDate = (date: Date) => {
  return date.toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const PurchaseDetailsPage: React.FC = () => {
  const { refreshUserProfile, addToast, setIsFullScreenActive, showLoading, hideLoading, isSessionExpired } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { tierLevel } = useParams<{ tierLevel: string }>();

  const [tier, setTier] = useState<any | null>((location.state as any)?.tier || null);
  const [loading, setLoading] = useState<boolean>(tier === null);
  const [error, setError] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    setIsFullScreenActive(true);
    return () => setIsFullScreenActive(false);
  }, [setIsFullScreenActive]);

  useEffect(() => {
    if (tier || !tierLevel || isSessionExpired) return;

    const loadProducts = async () => {
      setLoading(true);
      showLoading('Carregando dados do produto...');
      try {
        const res = await gatewayCall(512);
        if (!res?.success || !Array.isArray(res.result)) {
          setError('Erro ao carregar os detalhes do produto.');
          setLoading(false);
          return;
        }

        const product = res.result.find((item: any) => item.name === tierLevel);
        if (!product) {
          setError('Nível de compra não encontrado.');
          setLoading(false);
          return;
        }

        setTier({
          level: product.name,
          dbId: product.id,
          price: Number(product.price),
          dailyTasks: Number(product.tarefa_por_dia) || 1,
          payPerTask: Number(product.daily_income) || 0,
          durationDays: Number(product.duration_days) || 30
        });
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar os detalhes do produto.');
      } finally {
        setLoading(false);
        hideLoading();
      }
    };

    loadProducts();
  }, [tier, tierLevel, isSessionExpired]);

  const handleBack = () => {
    navigate('/ws');
  };

  const handleFinalizePurchase = async () => {
    if (!tier || !tier.dbId) {
      addToast('Não foi possível identificar o produto para compra.', 'error');
      return;
    }
    setProcessing(true);

    try {
      showLoading('Finalizando compra...');
      const res = await gatewayCall(511, { product_id: tier.dbId });
      if (res?.success && res.result?.success) {
        addToast(res.result?.message || 'Compra concluída com sucesso!', 'success');
        await refreshUserProfile();
        navigate('/ws');
      } else {
        addToast(res?.error || res?.result?.message || 'Não foi possível finalizar a compra.', 'error');
      }
    } catch (err: any) {
      console.error('Erro ao finalizar compra via gateway:', err);
      addToast(err.message || 'Erro ao processar a compra. Tente novamente ou contate o suporte.', 'error');
    } finally {
      hideLoading();
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-700 font-semibold">
        Carregando detalhes da compra...
      </div>
    );
  }

  if (error || !tier) {
    return (
      <div className="min-h-screen bg-white p-5 flex flex-col items-center justify-center text-slate-700 gap-4">
        <div className="text-center text-lg font-semibold">Não foi possível carregar a página de compra.</div>
        <div className="text-sm text-slate-500 max-w-sm">{error || 'O nível selecionado não existe mais ou não está disponível.'}</div>
        <button
          type="button"
          onClick={() => navigate('/ws')}
          className="mt-3 bg-[#60a5fa] hover:bg-[#3b82f6] text-white px-4 py-2 rounded-md"
        >
          Voltar para WS
        </button>
      </div>
    );
  }

  const startDate = new Date();
  const durationDays = tier?.durationDays || 30;
  const endDate = new Date(startDate.getTime());
  endDate.setDate(endDate.getDate() + durationDays);

  const dailyIncome = tier.dailyTasks * tier.payPerTask;

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans">
      <div className="bg-white px-3 py-2 relative flex items-center gap-2 border-b border-gray-200 select-none" style={{ height: '44px' }}>
        <button
          onClick={handleBack}
          className="text-neutral-500 hover:text-neutral-800 select-none cursor-pointer focus:outline-none flex items-center p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[14px] font-semibold text-neutral-850 tracking-tight">Detalhes do produto</span>
        <div className="w-4"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-white">
        <div className="border border-gray-200 rounded-sm overflow-hidden bg-white">
          <div className="border-b border-gray-200 px-3 py-2">
            <div className="text-[#0a52a3] font-semibold text-[11px]">Produto</div>
            <div className="bg-[#f5f5f5] text-slate-900 px-3 py-2 text-[13px] font-semibold rounded-sm mt-1">{tier.level}</div>
          </div>
          <div className="border-b border-gray-200 px-3 py-2">
            <div className="text-[#0a52a3] font-semibold text-[11px]">Preço</div>
            <div className="bg-[#f5f5f5] text-slate-900 px-3 py-2 text-[13px] font-semibold rounded-sm mt-1">KZ {tier.price.toLocaleString('pt-AO')}</div>
          </div>
          <div className="border-b border-gray-200 px-3 py-2">
            <div className="text-[#0a52a3] font-semibold text-[11px]">Rendimento diário</div>
            <div className="bg-[#f5f5f5] text-slate-900 px-3 py-2 text-[13px] font-semibold rounded-sm mt-1">KZ {dailyIncome.toLocaleString('pt-AO')}</div>
          </div>
          <div className="border-b border-gray-200 px-3 py-2">
            <div className="text-[#0a52a3] font-semibold text-[11px]">Duração</div>
            <div className="bg-[#f5f5f5] text-slate-900 px-3 py-2 text-[13px] font-semibold rounded-sm mt-1">{durationDays} dias</div>
          </div>
          <div className="border-b border-gray-200 px-3 py-2">
            <div className="text-[#0a52a3] font-semibold text-[11px]">Término</div>
            <div className="bg-[#f5f5f5] text-slate-900 px-3 py-2 text-[13px] font-semibold rounded-sm mt-1">{formatDate(endDate)}</div>
          </div>
          <div className="px-3 py-2">
            <div className="text-[#0a52a3] font-semibold text-[11px]">Instruções</div>
            <div className="bg-[#f5f5f5] text-slate-600 px-3 py-2 text-[11px] font-sans rounded-sm mt-1">
              Confira todos os dados antes de finalizar a compra.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFinalizePurchase}
          disabled={processing}
          className="w-full rounded-sm bg-gradient-to-r from-[#1b4d89] to-[#2563eb] hover:from-[#1d5aa3] hover:to-[#3b82f6] text-white font-bold text-[12px] py-2.5 uppercase tracking-[0.08em] transition-all duration-300 transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(37,99,235,0.2)] flex items-center justify-center gap-2 cursor-pointer"
        >
          {processing && <span className="h-3.5 w-3.5 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />}
          {processing ? 'Finalizando compra...' : 'Finalizar compra'}
        </button>
      </div>
    </div>
  );
};
