import React, { useState, useEffect } from 'react';
import { useApp, MinhaFinanca } from '../context/AppContext';
import { Eye, EyeOff } from 'lucide-react';

import totalDepositadoIcon from '../../assets/icons8-registro-de-deposito-48.png';
import totalRetiradaIcon from '../../assets/icons8-total-retirada-48.png';
import deRendaIcon from '../../assets/icons8-currency-exchange-48.png';
import ganhoConviteIcon from '../../assets/icons8-invite-48.png';

interface MinhasFinancasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MinhasFinancasModal: React.FC<MinhasFinancasModalProps> = ({ isOpen, onClose }) => {
  const { fetchMinhaFinanca, setIsFullScreenActive } = useApp();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MinhaFinanca | null>(null);
  const [showValues, setShowValues] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsFullScreenActive(true);
      loadFinances();
    }
    return () => {
      setIsFullScreenActive(false);
    };
  }, [isOpen, setIsFullScreenActive]);

  const loadFinances = async () => {
    setLoading(true);
    const result = await fetchMinhaFinanca();
    if (result) {
      setData(result);
    }
    setLoading(false);
  };

  const maskValue = (val: number | undefined | null) => {
    if (!showValues) return '*****';
    if (val === undefined || val === null) return '0,00';
    return Math.max(0, val).toLocaleString('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const maskInt = (val: number | undefined | null) => {
    if (!showValues) return '***';
    if (val === undefined || val === null) return '0';
    return val.toString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[50] bg-[#f4f6f9] flex flex-col font-sans animate-fadeIn" id="modal-container-minha-financa">
      {/* Header */}
      <div className="bg-white flex items-center px-2 py-3 border-b border-neutral-200 select-none">
        <button 
          id="financa-modal-close-btn"
          onClick={onClose} 
          className="w-10 h-10 flex items-center justify-center text-[#475569] active:bg-gray-100 rounded-full focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 text-center text-[17px] font-normal text-[#111827]">
          Minha Finança
        </div>
        <button
          onClick={() => setShowValues(!showValues)}
          className="w-10 h-10 flex items-center justify-center text-neutral-500 active:bg-gray-100 rounded-full focus:outline-none"
        >
          {showValues ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-[#f4f6f9] pb-10">
        
        <div className="bg-[#edf2f7] px-4 py-2 border-b border-gray-100 select-none mt-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Resumo Financeiro
          </span>
        </div>

        <div className="flex flex-col bg-white border-b border-gray-150">

          {/* Total Depositado */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center gap-3">
              <img src={totalDepositadoIcon} className="w-[20px] h-[20px] object-contain opacity-70" alt="Total Depositado" />
              <span className="text-[13px] font-normal text-[#2d3748]">Total Depositado</span>
            </div>
            {loading ? (
              <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse"></div>
            ) : (
              <span className="text-[13px] font-normal text-[#2d3748]">KZ {maskValue(data?.total_depositado)}</span>
            )}
          </div>

          {/* Total Retirado */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center gap-3">
              <img src={totalRetiradaIcon} className="w-[20px] h-[20px] object-contain opacity-70" alt="Total Retirado" />
              <span className="text-[13px] font-normal text-[#2d3748]">Total Retirado</span>
            </div>
            {loading ? (
              <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse"></div>
            ) : (
              <span className="text-[13px] font-normal text-[#2d3748]">KZ {maskValue(data?.total_retirado)}</span>
            )}
          </div>

          {/* Renda de Tarefas */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center gap-3">
              <img src={deRendaIcon} className="w-[20px] h-[20px] object-contain opacity-70" alt="Renda Tarefas" />
              <div className="flex flex-col">
                <span className="text-[13px] font-normal text-[#2d3748]">Renda Tarefas</span>
                {!loading && (
                  <span className="text-[10px] text-neutral-400 mt-0.5">{maskInt(data?.quantidade_tarefas)} tarefas</span>
                )}
              </div>
            </div>
            {loading ? (
              <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse"></div>
            ) : (
              <span className="text-[13px] font-normal text-[#2d3748]">KZ {maskValue(data?.ganho_tarefas)}</span>
            )}
          </div>

          {/* Bónus Convite */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center gap-3">
              <img src={ganhoConviteIcon} className="w-[20px] h-[20px] object-contain opacity-70" alt="Bónus Convite" />
              <div className="flex flex-col">
                <span className="text-[13px] font-normal text-[#2d3748]">Bónus Convite</span>
                {!loading && (
                  <span className="text-[10px] text-neutral-400 mt-0.5">{maskInt(data?.quantidade_convidados)} convidados</span>
                )}
              </div>
            </div>
            {loading ? (
              <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse"></div>
            ) : (
              <span className="text-[13px] font-normal text-[#2d3748]">KZ {maskValue(data?.bonus_convite)}</span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
