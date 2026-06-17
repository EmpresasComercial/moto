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
    <div className="fixed inset-0 z-[50] bg-[#f5f5f5] flex flex-col font-sans animate-fadeIn" id="modal-container-minha-financa">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 select-none" style={{ height: '48px' }}>
        <button 
          id="financa-modal-close-btn"
          onClick={onClose} 
          className="text-neutral-500 hover:text-neutral-800 select-none cursor-pointer focus:outline-none flex items-center p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px] text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[15px] font-semibold text-neutral-800 tracking-tight text-center flex-1 translate-x-[-10px]">Minha Finança</span>
        <button
          onClick={() => setShowValues(!showValues)}
          className="text-neutral-500 p-1 cursor-pointer"
        >
          {showValues ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
        <div className="grid grid-cols-2 divide-x divide-y divide-neutral-100 border-b border-neutral-100">

          {/* Total Depositado */}
          <div className="py-5 px-3 text-center flex flex-col justify-center items-center gap-1.5 h-[100px] select-none">
            <div className="h-[30px] flex items-center justify-center">
              <img src={totalDepositadoIcon} className="w-[26px] h-[26px] object-contain" alt="Total Depositado" />
            </div>
            <span className="text-[11px] font-normal text-neutral-500">Total Depositado</span>
            {loading ? (
              <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse"></div>
            ) : (
              <span className="text-[13px] font-bold text-green-600">KZ {maskValue(data?.total_depositado)}</span>
            )}
          </div>

          {/* Total Retirado */}
          <div className="py-5 px-3 text-center flex flex-col justify-center items-center gap-1.5 h-[100px] select-none">
            <div className="h-[30px] flex items-center justify-center">
              <img src={totalRetiradaIcon} className="w-[26px] h-[26px] object-contain" alt="Total Retirado" />
            </div>
            <span className="text-[11px] font-normal text-neutral-500">Total Retirado</span>
            {loading ? (
              <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse"></div>
            ) : (
              <span className="text-[13px] font-bold text-red-500">KZ {maskValue(data?.total_retirado)}</span>
            )}
          </div>

          {/* Renda de Tarefas */}
          <div className="py-5 px-3 text-center flex flex-col justify-center items-center gap-1.5 h-[100px] select-none">
            <div className="h-[30px] flex items-center justify-center">
              <img src={deRendaIcon} className="w-[26px] h-[26px] object-contain" alt="Renda Tarefas" />
            </div>
            <span className="text-[11px] font-normal text-neutral-500">Renda Tarefas</span>
            {loading ? (
              <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse"></div>
            ) : (
              <span className="text-[13px] font-bold text-blue-600">KZ {maskValue(data?.ganho_tarefas)}</span>
            )}
            {!loading && (
              <span className="text-[9px] text-neutral-400">{maskInt(data?.quantidade_tarefas)} tarefas</span>
            )}
          </div>

          {/* Bónus Convite */}
          <div className="py-5 px-3 text-center flex flex-col justify-center items-center gap-1.5 h-[100px] select-none">
            <div className="h-[30px] flex items-center justify-center">
              <img src={ganhoConviteIcon} className="w-[26px] h-[26px] object-contain" alt="Bónus Convite" />
            </div>
            <span className="text-[11px] font-normal text-neutral-500">Bónus Convite</span>
            {loading ? (
              <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse"></div>
            ) : (
              <span className="text-[13px] font-bold text-orange-500">KZ {maskValue(data?.bonus_convite)}</span>
            )}
            {!loading && (
              <span className="text-[9px] text-neutral-400">{maskInt(data?.quantidade_convidados)} convidados</span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
