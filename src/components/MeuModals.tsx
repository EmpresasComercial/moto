import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Copy, Check, QrCode, ClipboardList, Wallet, Sparkles, Building, Landmark, Users, ArrowUpRight, ArrowDownLeft, ShieldCheck, Heart } from 'lucide-react';
import { LogRecord } from '../types';
import { EmptyState } from './EmptyState';
import { GATEWAY_URL, getAccessToken, supabase } from '../lib/supabase';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

// 1. General Modal Wrapper — Full Screen
const ModalBase: React.FC<ModalProps & { children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  const { setIsFullScreenActive } = useApp();
  React.useEffect(() => {
    if (isOpen) {
      setIsFullScreenActive(true);
    }
    return () => {
      setIsFullScreenActive(false);
    };
  }, [isOpen, setIsFullScreenActive]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[50] bg-[#f5f5f5] flex flex-col font-sans animate-fadeIn" id={`modal-container-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 select-none" style={{ height: '48px' }}>
        <button 
          id="modal-close-btn"
          onClick={onClose} 
          className="text-neutral-500 hover:text-neutral-800 select-none cursor-pointer focus:outline-none flex items-center p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px] text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[15px] font-semibold text-neutral-800 tracking-tight text-center flex-1 translate-x-[-10px]">{title}</span>
        <div className="w-6"></div>
      </div>
      {/* Dynamic scrollable body */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 bg-white">
        {children}
      </div>
    </div>
  );
};

// 2. BANK MODAL ("Gravar cartão")
export const BankModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { user, updateBankInfo, showLoading, hideLoading, setIsFullScreenActive } = useApp();

  React.useEffect(() => {
    if (isOpen) {
      setIsFullScreenActive(true);
    }
    return () => {
      setIsFullScreenActive(false);
    };
  }, [isOpen, setIsFullScreenActive]);
  const [bank, setBank] = useState('Banco BAI');
  const [account, setAccount] = useState('');
  const [holder, setHolder] = useState('');

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    showLoading('A processar e gravar os dados bancários...');
    
    try {
      const res = await updateBankInfo(bank, account, holder);
      hideLoading();
      alert(res.message);
      onClose();
    } catch (err: any) {
      hideLoading();
      alert(err.message);
    }
  };

  const banksList = [
    'Banco BAI',
    'Banco BFA',
    'Banco BIC',
    'Banco BCI',
    'Banco Sol',
    'Banco ATL',
    'Standard Bank Angola'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[50] bg-[#f5f5f5] flex flex-col font-sans animate-fadeIn">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 select-none" style={{ height: '48px' }}>
        <button 
          onClick={onClose} 
          className="text-neutral-500 hover:text-neutral-800 select-none cursor-pointer focus:outline-none flex items-center p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px] text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[15px] font-bold text-neutral-850 tracking-tight text-center flex-1 translate-x-[-10px]">Gravar cartão</span>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 p-3 space-y-4 bg-white overflow-y-auto">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="border border-gray-200 bg-white rounded-sm overflow-hidden">
            {/* Instituição Bancária */}
            <div className="border-b border-gray-200">
              <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Instituição Bancária</div>
              <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200">
                <select 
                  value={bank} 
                  onChange={(e) => setBank(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-neutral-800 text-[12px] font-sans font-bold"
                >
                  {banksList.map((b, idx) => (
                    <option key={idx} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* IBAN */}
            <div className="border-b border-gray-200">
              <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">IBAN de Angola (AO06...)</div>
              <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200">
                <input 
                  type="text"
                  placeholder="AO06 0000 0000 0000 0000 0000 0"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-neutral-800 text-[12px] font-sans font-bold"
                />
              </div>
            </div>

            {/* Titular */}
            <div className="border-b border-gray-200">
              <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Nome Completo do Titular</div>
              <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200">
                <input 
                  type="text"
                  placeholder="Como consta na conta bancária"
                  value={holder}
                  onChange={(e) => setHolder(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-neutral-800 text-[12px] font-sans font-bold"
                />
              </div>
            </div>
          </div>

          <div className="border border-gray-200 bg-white rounded-sm overflow-hidden">
            <div>
              <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Instruções</div>
              <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] font-sans border-t border-gray-200">
                Certifique-se de que os dados estão totalmente corretos. Pagamentos de tarefas aprovadas da Asiaray são encaminhados via compensação direta em até 24 horas úteis.
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center pt-2 select-none">
            <button
              type="submit"
              className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white font-bold text-[12px] py-2 px-6 rounded-sm cursor-pointer transition-colors w-full text-center uppercase tracking-wide"
            >
              Gravar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Custom high-fidelity credit card SVG resembling a standard bank card with golden chip
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

// Custom high-fidelity Tether/USDT gold coin icon resembling the cryptocurrency symbol from the screenshot
const GoldCoinIcon: React.FC = () => (
  <svg className="w-[26px] h-[26px] select-none shrink-0" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="13" cy="13" r="11.5" fill="#fffbeb" stroke="#f59e0b" strokeWidth="2.2" />
    <circle cx="13" cy="13" r="8.2" fill="#fef08a" stroke="#d97706" strokeWidth="1.2" />
    <text x="13.2" y="16.5" fill="#a16207" fontSize="10.5" fontWeight="950" textAnchor="middle" fontFamily="sans-serif">B</text>
    <line x1="11.5" y1="3.5" x2="11.5" y2="5" stroke="#d97706" strokeWidth="0.8" />
    <line x1="14.5" y1="3.5" x2="14.5" y2="5" stroke="#d97706" strokeWidth="0.8" />
  </svg>
);

// 3-A. CURRENCY CONVERTER MODAL (USD → KZ at fixed rate 805 KZ/USD)
export const CurrencyConverterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { stats, convertUsdToKz, setIsFullScreenActive } = useApp();
  const [usdInput, setUsdInput] = useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      setIsFullScreenActive(true);
      setUsdInput('');
    }
    return () => setIsFullScreenActive(false);
  }, [isOpen, setIsFullScreenActive]);

  if (!isOpen) return null;

  const RATE = 805;
  const usdVal = parseFloat(usdInput) || 0;
  const kzPreview = usdVal * RATE;

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await convertUsdToKz(usdVal);
    alert(result.message);
    if (result.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[50] bg-[#f5f5f5] flex flex-col font-sans animate-fadeIn" id="currency-converter-modal">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 select-none" style={{ height: '48px' }}>
        <button
          id="converter-back-btn"
          onClick={onClose}
          className="text-neutral-500 hover:text-neutral-800 select-none cursor-pointer focus:outline-none flex items-center p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px] text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[15px] font-bold text-neutral-850 tracking-tight text-center flex-1 translate-x-[-10px]">Carteira</span>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 p-3 space-y-4 bg-white overflow-y-auto">
        <form onSubmit={handleConvert} className="space-y-4">

          <div className="border border-gray-200 bg-white rounded-sm overflow-hidden">

            {/* Saldo USDT */}
            <div className="border-b border-gray-200">
              <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Saldo disponível (USDT)</div>
              <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200 font-bold font-mono">
                {stats.balanceUSDT.toFixed(2)} USD
              </div>
            </div>

            {/* Input USD */}
            <div className="border-b border-gray-200">
              <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Valor a converter (USD)</div>
              <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200">
                <input
                  id="usd-convert-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={usdInput}
                  onChange={e => setUsdInput(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-neutral-800 text-[12px] font-sans font-bold"
                />
              </div>
            </div>

            {/* KZ Preview */}
            <div>
              <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Receberá em Kwanza (KZ)</div>
              <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200 font-bold font-mono">
                {usdVal > 0 ? kzPreview.toLocaleString('pt-AO') : '0'} KZ
              </div>
            </div>
          </div>

          {/* Taxa info */}
          <div className="border border-gray-200 bg-white rounded-sm overflow-hidden">
            <div className="bg-white py-2.5 px-2 border-b border-gray-200 text-center text-[#e1251b] font-bold text-[12px]">
              Taxa de Intercâmbio
            </div>
            <div>
              <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Taxa fixa aplicada</div>
              <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] font-sans border-t border-gray-200">
                1 USD = 805 KZ. A conversão é creditada imediatamente na sua Moeda de Ouro após confirmação.
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center pt-2 select-none">
            <button
              id="converter-confirm-btn"
              type="submit"
              className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white font-bold text-[12px] py-2 px-6 rounded-sm cursor-pointer transition-colors w-full text-center uppercase tracking-wide"
            >
              Confirmar Conversão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. RECHARGE AND WITHDRAWAL MODAL ("Carteira" / Transações)
interface WalletModalProps extends ModalProps {
  initialTab?: 'recharge' | 'withdraw';
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, initialTab = 'recharge' }) => {
  const { stats, user, showLoading, hideLoading, setIsFullScreenActive } = useApp();
  
  const [rechargeStep, setRechargeStep] = useState<'amount' | 'method' | 'instructions'>('amount');
  const [rechargeAmt, setRechargeAmt] = useState<number>(0);
  const [selectedMethod, setSelectedMethod] = useState<'BIC' | 'BFA' | 'Atlântico' | 'BCI' | 'BAI' | 'USDT-TRC20'>('BFA');
  const [comprovativo, setComprovativo] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [fileLabel, setFileLabel] = useState<string>('Nenhum arquivo escolhido');
  const [ibanCopied, setIbanCopied] = useState(false);
  const [usdtCopied, setUsdtCopied] = useState(false);

  const [dbBanks, setDbBanks] = useState<{ id: string; nome_do_banco: string; iban: string; nome_favorecido: string }[]>([]);
  const [banksLoaded, setBanksLoaded] = useState(false);
  const [policies, setPolicies] = useState<any>(null);

  React.useEffect(() => {
    if (isOpen) {
      setIsFullScreenActive(true);
      
      const fetchDbBanksAndPolicies = async () => {
        try {
          // Fire both fetches at the same time
          const policiesPromise = (async () => {
            try {
              const { data, error } = await supabase.rpc('get_company_policies');
              if (!error && data) {
                setPolicies(data);
              } else {
                console.error("Erro policies:", error);
                setPolicies({ suggested_recharge_kz: [8000, 25000, 150000, 500000, 1500000] });
              }
            } catch (err) {
              console.error("Erro promise policies:", err);
              setPolicies({ suggested_recharge_kz: [8000, 25000, 150000, 500000, 1500000] });
            }
          })();

          const banksPromise = (async () => {
            const token = await getAccessToken();
            if (token) {
              const resp = await fetch(GATEWAY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ op: 207, data: {} })
              });
              const res = await resp.json();
              if (res.success && Array.isArray(res.result)) {
                setDbBanks(res.result);
              }
            }
          })();

          await Promise.all([policiesPromise, banksPromise]);
        } catch (error) {
          console.error("Erro geral inicial:", error);
          if (!policies) setPolicies({ suggested_recharge_kz: [8000, 25000, 150000, 500000, 1500000] });
        } finally {
          setBanksLoaded(true);
        }
      };
      
      setBanksLoaded(false);
      fetchDbBanksAndPolicies();
    }
    return () => {
      setIsFullScreenActive(false);
    };
  }, [isOpen, setIsFullScreenActive]);

  const USDT_ADDR = 'TQdoJo3s13AtTPY1NZsnxrnLdLwJFSCqT1';

  React.useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const ibanMap: Record<string, string> = {
    BIC: 'AO06 0005 0622 9312 4210 1785 4',
    BFA: 'AO06 0006 1145 9312 4224 5013 7',
    Atlântico: 'AO06 0055 3514 9312 4211 4058 9',
    BCI: 'AO06 0009 0081 9312 4235 1251 2',
    BAI: 'AO06 0005 0000 1579 1775 1010 5',
  };

  const selectedBankInfo = dbBanks.find(b => b.nome_do_banco === selectedMethod);

  const currentAddress = selectedBankInfo ? selectedBankInfo.iban : (selectedMethod === 'USDT-TRC20' ? USDT_ADDR : ibanMap[selectedMethod]);
  const currentFavorecido = selectedBankInfo ? selectedBankInfo.nome_favorecido : (selectedMethod === 'USDT-TRC20' ? 'USDT Wallet' : 'Asiarays grupo mídia lda');
  const tipoValue = selectedMethod === 'USDT-TRC20' ? 'USDT' : 'BANCO';
  const walletLabel = selectedMethod === 'USDT-TRC20' ? 'Número da carteira' : 'Número do IBAN';
  const exchangeRate = (policies?.min_recharge_kz && policies?.min_recharge_usdt) 
    ? (policies.min_recharge_kz / policies.min_recharge_usdt) 
    : 1000;
  const requisitoValue = selectedMethod === 'USDT-TRC20' ? (rechargeAmt / exchangeRate).toFixed(2) : `${rechargeAmt.toLocaleString('pt-AO')} KZ`;

  const copyCurrentAddress = () => {
    navigator.clipboard.writeText(currentAddress);
    setIbanCopied(true);
    setTimeout(() => setIbanCopied(false), 2000);
  };
  const copyUSDT = () => { navigator.clipboard.writeText(USDT_ADDR); setUsdtCopied(true); setTimeout(() => setUsdtCopied(false), 2000); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setSelectedFile(file);
    setFileLabel(file.name);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Por favor, carregue o comprovativo de transferência antes de submeter.');
      return;
    }

    showLoading('A submeter pedido de depósito...');

    try {
      const token = await getAccessToken();
      if (!token) {
        hideLoading();
        alert('Sessão expirada. Faça login novamente.');
        return;
      }

      // Converter o arquivo selecionado para base64
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      };
      
      const base64Image = await fileToBase64(selectedFile);

      const isUSDT = selectedMethod === 'USDT-TRC20';

      const opCode = isUSDT ? 206 : 205;
      const payload = isUSDT
        ? { amount_usdt: parseFloat((rechargeAmt / exchangeRate).toFixed(2)), exchange_rate: exchangeRate }
        : { amount: rechargeAmt, bank_name: selectedMethod, iban: currentAddress, comprovante_url: base64Image };

      const resp = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ op: opCode, data: payload })
      });

      const res = await resp.json();
      hideLoading();

      if (res.success && res.result?.success) {
        alert(res.result.message || 'Depósito solicitado com sucesso. Por favor, conclua a transferência e envie o comprovativo ao suporte.');
        setRechargeStep('amount');
        setRechargeAmt(0);
        setSelectedFile(null);
        setFilePreview('');
        setFileLabel('Nenhum arquivo escolhido');
        setComprovativo('');
        onClose();
      } else {
        alert(res.result?.message || res.error || 'Erro ao submeter pedido de depósito.');
      }
    } catch (error) {
      hideLoading();
      console.error('Erro ao submeter depósito:', error);
      alert('Erro de rede. Tente novamente mais tarde.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#f1f4f8] overflow-y-auto font-sans" id="wallet-fullscreen">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center sticky top-0 z-10 select-none h-12">
        <button 
          onClick={() => {
            if (rechargeStep === 'instructions') setRechargeStep('method');
            else if (rechargeStep === 'method') setRechargeStep('amount');
            else onClose();
          }} 
          className="mr-3 text-slate-700 cursor-pointer focus:outline-none" 
          id="wallet-back-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px] text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-bold text-[15px] text-slate-800 tracking-tight text-center flex-1 translate-x-[-10px]">
          {rechargeStep === 'instructions' ? 'Detalhes de Gateway' : rechargeStep === 'method' ? 'Metódos pagamentos' : 'Recarregar'}
        </span>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full p-4 space-y-3 bg-[#f1f4f8]">
        <div className="space-y-3">
          {rechargeStep === 'amount' && (
            <div className="space-y-4">
              <div className="border border-gray-200 bg-white rounded-sm overflow-hidden">
                <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Montante a Recarregar (KZ)</div>
                <div className="bg-[#f5f5f5] px-3 py-3 border-t border-gray-200">
                  <input 
                    type="number" 
                    placeholder="Introduza o valor da recarga"
                    value={rechargeAmt === 0 ? '' : rechargeAmt}
                    onChange={(e) => setRechargeAmt(Number(e.target.value))}
                    className="bg-transparent border-none outline-none w-full text-neutral-800 text-[12px] font-sans font-bold placeholder-neutral-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {!policies ? (
                  <div className="col-span-3 text-center text-xs text-gray-500 py-4">A carregar valores...</div>
                ) : (
                  (policies.suggested_recharge_kz || []).map((val: number) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRechargeAmt(val)}
                      className={`py-2.5 px-1 text-center font-bold rounded-sm border text-[11px] cursor-pointer transition-all ${rechargeAmt === val ? 'bg-[#1e88e5] border-[#1e88e5] text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                    >
                      {val.toLocaleString('pt-AO')}
                    </button>
                  ))
                )}
              </div>

              <div className="flex flex-col items-center justify-center pt-2 select-none">
                <button
                  type="button"
                  onClick={() => {
                    const minKz = policies?.min_recharge_kz || 8000;
                    const maxKz = policies?.max_recharge_kz || 3000000;
                    if (rechargeAmt <= 0) {
                      alert('Por favor, introduza um valor de recarga válido.');
                      return;
                    }
                    if (rechargeAmt < minKz) {
                      alert(`O valor mínimo de depósito é ${minKz.toLocaleString('pt-AO')} KZ.`);
                      return;
                    }
                    if (rechargeAmt > maxKz) {
                      alert(`O valor máximo permitido é ${maxKz.toLocaleString('pt-AO')} KZ.`);
                      return;
                    }
                    setRechargeStep('method');
                  }}
                  className="w-full bg-[#60a5fa] hover:bg-[#3b82f6] text-white font-bold text-[12px] py-3 rounded-sm uppercase tracking-wide transition-colors cursor-pointer border-none outline-none"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {rechargeStep === 'method' && (
            <div className="space-y-3 bg-white rounded-xl shadow-xs p-3">
              <p className="text-center text-[14px] text-[#6d28d9] font-semibold py-2 select-none tracking-wide">
                Seleccione por favor o método de pagamento
              </p>

              {!banksLoaded ? (
                <div className="py-8 flex justify-center"><div className="w-6 h-6 border-2 border-[#1e88e5] border-t-transparent rounded-full animate-spin"></div></div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-hidden">
                  {(() => {
                    const methods = dbBanks.map(b => b.nome_do_banco);
                    if (!methods.includes('USDT-TRC20')) {
                      methods.push('USDT-TRC20');
                    }
                    return methods;
                  })().map((methodName, idx) => {
                    const isUSDT = methodName === 'USDT-TRC20';
                  return (
                    <button
                      key={methodName}
                      type="button"
                      onClick={() => {
                        setSelectedMethod(methodName as any);
                        setRechargeStep('instructions');
                      }}
                      className="w-full text-left py-3.5 flex items-center justify-between hover:bg-neutral-50/50 cursor-pointer transition-colors"
                      id={`payment-method-row-${idx}`}
                    >
                      <div className="flex items-center gap-4 select-none">
                        {isUSDT ? (
                          <GoldCoinIcon />
                        ) : (
                          <BlueCardIcon />
                        )}
                        <span className="text-[13px] font-semibold text-stone-700 tracking-wide">{methodName}</span>
                      </div>
                      <div className="flex items-center text-neutral-400 text-xs font-semibold">
                        <span className="text-[12px] font-semibold text-neutral-400 pr-1 tracking-tight">&gt;</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            </div>
          )}

          {rechargeStep === 'instructions' && (
            <form onSubmit={handleRecharge} className="space-y-3">
              <div className="border border-gray-200 bg-white rounded-sm overflow-hidden">
                <div className="bg-white py-2.5 px-2 border-b border-gray-200 text-center text-[#e1251b] font-bold text-[12px]">
                  Por favor, transfira fundos manualmente para a seguinte conta
                </div>

                <div className="border-b border-gray-200">
                  <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Tipo</div>
                  <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] font-mono border-t border-gray-200">
                    {tipoValue}
                  </div>
                </div>

                <div className="border-b border-gray-200">
                  <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Nome do banco</div>
                  <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] font-mono border-t border-gray-200">
                    {selectedMethod}
                  </div>
                </div>

                <div className="border-b border-gray-200">
                  <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Nome de conta de fundos</div>
                  <div className="bg-[#f5f5f5] text-gray-600 px-3 py-1.5 text-[11px] font-mono border-t border-gray-200 break-all select-all">
                    {currentFavorecido}
                  </div>
                </div>

                <div>
                  <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">{walletLabel}</div>
                  <div className="bg-[#f5f5f5] border-t border-gray-200 flex items-center justify-between">
                    <div className="flex-1 text-gray-600 px-3 py-1.5 text-[11px] font-mono break-all select-all">
                      {currentAddress}
                    </div>
                    <button 
                      type="button"
                      onClick={copyCurrentAddress}
                      className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white px-4 py-1.5 text-[11px] font-bold cursor-pointer transition-all active:scale-95 shrink-0 select-none border-l border-gray-200"
                    >
                      {ibanCopied ? 'COPIADO' : 'cópia'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 bg-white rounded-sm overflow-hidden">
                <div className="bg-white py-2.5 px-2 border-b border-gray-200 text-center text-[#e1251b] font-bold text-[12px]">
                  Informação sobre a procura
                </div>

                <div className="border-b border-gray-200">
                  <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Número do pedido</div>
                  <div className="bg-[#f5f5f5] text-gray-600 px-3 py-1.5 text-[11px] font-mono border-t border-gray-200 select-all">
                    202308060508708470
                  </div>
                </div>

                <div className="border-b border-gray-200">
                  <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">número da conta</div>
                  <div className="bg-[#f5f5f5] text-gray-600 px-3 py-1.5 text-[11px] font-mono border-t border-gray-200 select-all font-bold">
                    {user.phone || '244922342885'}
                  </div>
                </div>

                <div>
                  <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">requisito</div>
                  <div className="bg-[#f5f5f5] text-gray-600 px-3 py-1.5 text-[11px] font-mono border-t border-gray-200 select-all">
                    {requisitoValue}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center pt-2 gap-1 text-center select-none">
                <div className="flex justify-center items-center gap-3 w-full">
                  <label className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white font-bold text-[12px] py-1.5 px-4 rounded-sm cursor-pointer transition-colors flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    <span>Credenciais</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>

                  <button
                    type="submit"
                    className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white font-bold text-[12px] py-1.5 px-6 rounded-sm cursor-pointer transition-colors"
                  >
                    Confirmar
                  </button>
                </div>

                <div className="text-[10px] text-neutral-500 font-sans mt-0.5">
                  {fileLabel ? (
                    <span className="text-[#3b82f6] font-bold">{fileLabel}</span>
                  ) : (
                    'Nenhum arquivo escolhido'
                  )}
                </div>

                {filePreview && (
                  <div className="rounded-sm overflow-hidden border border-slate-200 w-full">
                    <img src={filePreview} alt="Comprovativo" className="w-full object-cover" />
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};


// 4. INVITE MODAL ("Convidar amigos")
export const InviteModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { user, setIsFullScreenActive, showLoading, hideLoading, ensureInternetConnectivity } = useApp();
  const [copied, setCopied] = useState(false);
  const [domain, setDomain] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setIsFullScreenActive(true);
      showLoading('Carregando dados de convite...');

      const loadInviteData = async () => {
        if (!(await ensureInternetConnectivity())) {
          hideLoading();
          return;
        }

        const token = await getAccessToken();
        if (!token) {
          hideLoading();
          return;
        }

        try {
          const res = await fetch(GATEWAY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ op: 901, data: {} })
          });
          const data = await res.json();
          if (data.success && data.result?.dominio_publicidad) {
            setDomain(data.result.dominio_publicidad);
          }
        } catch (error) {
          console.error(error);
        } finally {
          hideLoading();
        }
      };

      loadInviteData();
    }
    return () => {
      setIsFullScreenActive(false);
      setDomain(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const cleanDomain = domain ? domain.replace(/\/$/, '') : '';
  const inviteUrl = domain && user?.inviteCode ? `${cleanDomain}/Public/reg/smid/${user.inviteCode}` : '';

  const copyLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQrCode = async () => {
    if (!inviteUrl) return;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteUrl)}`;
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `asiaray-qr-${user?.inviteCode || 'code'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      // Fallback: open in new window
      window.open(qrUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-white flex flex-col font-sans animate-fadeIn">
      {/* Header bar */}
      <div 
        className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-150 select-none relative" 
        style={{ height: '48px' }}
      >
        <button 
          onClick={onClose} 
          className="text-neutral-500 hover:text-neutral-800 select-none cursor-pointer focus:outline-none flex items-center p-1 z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px] text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="absolute inset-x-0 text-center text-[15px] font-bold text-neutral-800 tracking-tight leading-[48px] pointer-events-none">
          convidar amigos
        </span>
        <div className="w-6"></div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-8 pb-10 flex flex-col items-center">
        
        {/* Title */}
        <span className="text-[12px] text-neutral-500 font-sans tracking-wide">Partilhar ligação</span>
        
        {/* Link */}
        <span className="text-[12px] text-neutral-700 font-sans font-medium mt-2.5 break-all text-center max-w-xs select-all">
          {inviteUrl ? inviteUrl : 'Ligação de convite indisponível'}
        </span>

        {/* Buttons */}
        <div className="w-full max-w-[280px] mt-4 space-y-3 select-none">
          <button
            onClick={copyLink}
            disabled={!inviteUrl}
            className={`w-full text-white text-[13px] font-bold py-2.5 rounded-[5px] transition-all block text-center border-none outline-none shadow-sm ${inviteUrl ? 'bg-[#ff0000] hover:bg-[#cc0000] active:scale-95 cursor-pointer' : 'bg-neutral-300 cursor-not-allowed'}`}
          >
            {copied ? 'Copiado!' : 'cópia'}
          </button>
          
          <button
            onClick={downloadQrCode}
            disabled={!inviteUrl}
            className={`w-full text-white text-[13px] font-bold py-2.5 rounded-[5px] transition-all block text-center border-none outline-none shadow-sm ${inviteUrl ? 'bg-[#ff0000] hover:bg-[#cc0000] active:scale-95 cursor-pointer' : 'bg-neutral-300 cursor-not-allowed'}`}
          >
            Gravar a imagem
          </button>
        </div>

        {/* Promotional QR Code */}
        {inviteUrl && (
          <div className="w-full max-w-[200px] mt-8 bg-white p-3 border border-gray-200 rounded-lg shadow-sm flex flex-col items-center">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteUrl)}`}
              alt="QR Code Convite" 
              className="w-full h-auto object-contain bg-white"
            />
            <span className="text-[10px] text-gray-500 mt-2 font-medium">Digitalize para se registar</span>
          </div>
        )}

      </div>
    </div>
  );
};

// 5. TEAM REPORT MODAL ("relatório da equipa")
export const TeamReportModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { team, setIsFullScreenActive, showLoading, hideLoading, ensureInternetConnectivity } = useApp();
  const [activeTab, setActiveTab] = useState<'nivel_um' | 'secundario' | 'nivel_tres'>('nivel_um');
  const [teamData, setTeamData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsFullScreenActive(true);
      showLoading('Carregando relatório da equipa...');
      setLoading(true);

      const loadTeamData = async () => {
        if (!(await ensureInternetConnectivity())) {
          setLoading(false);
          hideLoading();
          return;
        }

        const token = await getAccessToken();
        if (!token) {
          setLoading(false);
          hideLoading();
          return;
        }

        try {
          const res = await fetch(GATEWAY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ op: 801, data: {} })
          });
          const data = await res.json();
          if (data.success) {
            setTeamData(data.result || {});
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
          hideLoading();
        }
      };

      loadTeamData();
    }
    return () => {
      setIsFullScreenActive(false);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Process the raw array from get_my_team
  const rawTeam = Array.isArray(teamData) 
    ? teamData 
    : (teamData?.team && Array.isArray(teamData.team) ? teamData.team : []);
  
  const levelUm = rawTeam.filter((m: any) => m.level === 1).map((m: any) => ({
    phone: m.phone,
    date: m.created_at ? new Date(m.created_at).toISOString().split('T')[0] : '',
    amount: Number(m.reloaded_amount || 0).toFixed(2)
  }));
  const secundario = rawTeam.filter((m: any) => m.level === 2).map((m: any) => ({
    phone: m.phone,
    date: m.created_at ? new Date(m.created_at).toISOString().split('T')[0] : '',
    amount: Number(m.reloaded_amount || 0).toFixed(2)
  }));
  const nivelTres = rawTeam.filter((m: any) => m.level === 3).map((m: any) => ({
    phone: m.phone,
    date: m.created_at ? new Date(m.created_at).toISOString().split('T')[0] : '',
    amount: Number(m.reloaded_amount || 0).toFixed(2)
  }));

  const getMemberList = () => {
    switch (activeTab) {
      case 'nivel_um': return levelUm;
      case 'secundario': return secundario;
      case 'nivel_tres': return nivelTres;
      default: return levelUm;
    }
  };

  const recargaTotal = rawTeam.reduce((sum: number, m: any) => sum + Number(m.reloaded_amount || 0), 0);
  const primCarga = rawTeam.filter((m: any) => Number(m.reloaded_amount) > 0).length;
  const empurroes = levelUm.length;
  const tamEquipa = rawTeam.length;
  const novoNum = rawTeam.filter((m: any) => {
    if (!m.created_at) return false;
    const isToday = new Date(m.created_at).toDateString() === new Date().toDateString();
    return isToday;
  }).length;
  
  // We don't have direct DB access for these two from this endpoint yet, but we provide realistic fallbacks/placeholders
  const saldoTotal = teamData?.stats?.saldoTotal || 0;
  const fluxoTotal = teamData?.stats?.fluxoTotal || 0;
  const retiradaTotal = teamData?.stats?.retiradaTotal || 0;

  return (
    <div className="fixed inset-0 z-[150] bg-[#f8f9fa] flex flex-col font-sans animate-fadeIn">
      {/* Header bar */}
      <div 
        className="bg-[#dbeafe]/40 px-4 py-3 flex items-center justify-between border-b border-gray-200 select-none relative" 
        style={{ height: '48px' }}
      >
        <button 
          onClick={onClose} 
          className="text-neutral-500 hover:text-neutral-800 select-none cursor-pointer focus:outline-none flex items-center p-1 z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px] text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="absolute inset-x-0 text-center text-[15px] font-bold text-neutral-800 tracking-tight leading-[48px] pointer-events-none">
          Relatório da equipa
        </span>
        <div className="w-6"></div>
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        
        {/* Metric Grid Table */}
        <div className="bg-white border-b border-gray-150 text-[11px] text-neutral-500 font-sans">
          
          {/* Row 1 */}
          <div className="grid grid-cols-2 border-b border-gray-100">
            <div className="p-3 border-r border-gray-100 flex flex-col justify-between min-h-[56px]">
              <span className="text-[10px] text-neutral-400 block scale-95 origin-left">saldo total da equipa (KZ)</span>
              <span className="text-[13px] font-semibold text-neutral-800 mt-1 font-mono">{Number(saldoTotal).toFixed(2)}</span>
            </div>
            <div className="p-3 flex flex-col justify-between min-h-[56px] text-right">
              <span className="text-[10px] text-neutral-400 block scale-95 origin-right">fluxo total da equipa (KZ)</span>
              <span className="text-[13px] font-semibold text-neutral-800 mt-1 font-mono">{Number(fluxoTotal).toFixed(2)}</span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 border-b border-gray-100">
            <div className="p-3 border-r border-gray-100 flex flex-col justify-between min-h-[56px]">
              <span className="text-[10px] text-neutral-400 block scale-95 origin-left">Recarga total da equipa (KZ)</span>
              <span className="text-[13px] font-semibold text-neutral-800 mt-1 font-mono">{Number(recargaTotal).toFixed(2)}</span>
            </div>
            <div className="p-3 flex flex-col justify-between min-h-[56px] text-right">
              <span className="text-[10px] text-neutral-400 block scale-95 origin-right">retirada total da equipa (KZ)</span>
              <span className="text-[13px] font-semibold text-neutral-800 mt-1 font-mono">{Number(retiradaTotal).toFixed(2)}</span>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-2 border-b border-gray-100">
            <div className="p-3 border-r border-gray-100 flex flex-col justify-between min-h-[56px]">
              <span className="text-[10px] text-neutral-400 block scale-95 origin-left">número de primeira carga</span>
              <span className="text-[12px] font-medium text-red-500 mt-1">
                <span className="font-bold">{primCarga}</span> Pessoas
              </span>
            </div>
            <div className="p-3 flex flex-col justify-between min-h-[56px] text-right">
              <span className="text-[10px] text-neutral-400 block scale-95 origin-right">número de empurrões directos</span>
              <span className="text-[12px] font-medium text-red-500 mt-1">
                <span className="font-bold">{empurroes}</span> Pessoas
              </span>
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-2">
            <div className="p-3 border-r border-gray-100 flex flex-col justify-between min-h-[56px]">
              <span className="text-[10px] text-neutral-400 block scale-95 origin-left">tamanho da equipa</span>
              <span className="text-[12px] font-medium text-red-500 mt-1">
                <span className="font-bold">{tamEquipa}</span> Pessoas
              </span>
            </div>
            <div className="p-3 flex flex-col justify-between min-h-[56px] text-right">
              <span className="text-[10px] text-neutral-400 block scale-95 origin-right">Novo número</span>
              <span className="text-[12px] font-medium text-red-500 mt-1">
                <span className="font-bold">{novoNum}</span> Pessoas
              </span>
            </div>
          </div>

        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-250 bg-white select-none mt-4">
          <button 
            onClick={() => setActiveTab('nivel_um')}
            className={`flex-1 py-3 text-center text-[12px] font-bold transition-all relative ${
              activeTab === 'nivel_um' ? 'text-[#d24c3c]' : 'text-neutral-500'
            }`}
          >
            nível um ({levelUm.length})
            {activeTab === 'nivel_um' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d24c3c]" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('secundario')}
            className={`flex-1 py-3 text-center text-[12px] font-bold transition-all relative ${
              activeTab === 'secundario' ? 'text-[#d24c3c]' : 'text-neutral-500'
            }`}
          >
            secundário ({secundario.length})
            {activeTab === 'secundario' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d24c3c]" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('nivel_tres')}
            className={`flex-1 py-3 text-center text-[12px] font-bold transition-all relative ${
              activeTab === 'nivel_tres' ? 'text-[#d24c3c]' : 'text-neutral-500'
            }`}
          >
            nível três ({nivelTres.length})
            {activeTab === 'nivel_tres' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d24c3c]" />
            )}
          </button>
        </div>

        {/* Members List Table */}
        <div className="bg-white divide-y divide-gray-100 relative min-h-[100px]">
          {loading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
              <div className="animate-spin h-5 w-5 border-2 border-[#10b981] border-t-transparent rounded-full"></div>
            </div>
          )}
          {getMemberList().length === 0 && !loading && (
            <div className="py-10 text-center text-neutral-400 text-[11px]">Nenhum membro encontrado.</div>
          )}
          {getMemberList().map((mbr: any, idx) => (
            <div key={idx} className="flex justify-between items-center px-6 py-3.5 text-[12px] text-neutral-600 font-sans">
              <span className="font-mono text-neutral-800 font-medium flex-1 text-left">{mbr.phone || mbr.telefone}</span>
              <span className="text-neutral-400 font-mono flex-1 text-center">{mbr.date || mbr.data}</span>
              <span className="font-mono text-neutral-800 font-medium flex-1 text-right">{mbr.amount || mbr.valor}</span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

// 6. RULES / "DEVE LER" MODAL
export const RulesModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Guia Deve Ler">
      <div className="space-y-4 text-xs text-neutral-600 leading-relaxed font-sans pb-4">
        
        <h2 className="font-extrabold text-neutral-800 text-sm">Sobre a Asiaray Media Group Limited</h2>
        
        <p>
          A Asiaray Media Group Limited (código de ações na Bolsa de Valores de Hong Kong: 1993) é uma empresa de mídia exterior na região da Grande China, com foco estratégico na gestão de publicidade em grandes meios de transporte, como aeroportos, linhas de metrô e trens de alta velocidade.
        </p>

        <p className="italic pl-3 border-l-2 border-neutral-300 py-0.5 text-neutral-700">
          “Estabelecemos uma extensa rede em quase 40 grandes cidades da região da Grande China, baseada em mais de 30 anos de experiência e reputação.”
        </p>

        <p>
          A empresa possui direitos exclusivos de concessão em 22 aeroportos e em 15 linhas de metrô, incluindo a linha Thomson-East Coast do MRT de Singapura (TEL). Também administra direitos exclusivos de mídia em 16 estações ferroviárias, entre elas a Estação Ferroviária de Alta Velocidade Hong Kong West Kowloon e a Linha Ferroviária China–Laos–Yumo.
        </p>

        <p>
          Além disso, a Asiaray detém direitos exclusivos de concessão da Hong Kong–Zhuhai–Macau Bridge (Porto de Zhuhai), de mais de 500 pontos de ônibus da KMB em Hong Kong e da Travessia do Porto Leste de Hong Kong. A empresa também oferece mais de 350 soluções de publicidade de alta qualidade para outdoors e edifios.
        </p>

        <p>
          Com mais de 30 anos de experiência e um profundo conhecimento em gestão de espaços publicitários, a Asiaray tem fornecido soluções integradas e criativas de mídia exterior, desenvolvendo campanhas de grande impacto em locais estratégicos e de alta circulação.
        </p>

        <h2 className="font-extrabold text-neutral-800 text-sm pt-2">Nossa Visão</h2>
        
        <p>
          Ser uma empresa de comunicação exterior de classe mundial com origem asiática.
        </p>

        <h2 className="font-extrabold text-neutral-800 text-sm pt-2">Nossa Missão</h2>
        
        <p>
          Fornecer soluções ideais de comunicação Out-Of-Home (OOH), garantindo o mais alto retorno sobre investimento (ROI) e máxima eficácia. Promover excelência profissional na mídia publicitária exterior, desenvolver uma equipe harmoniosa, eficiente e produtiva e atuar como uma empresa consciente e comprometida com a comunidade.
        </p>

        <h2 className="font-extrabold text-neutral-800 text-sm pt-2">Nossos Valores</h2>

        <p>
          <strong>Integridade</strong><br />
          Agir com honestidade e transparência em todas as relações.
        </p>

        <p>
          <strong>Excelência</strong><br />
          Buscar melhoria contínua e excelência em cada projeto.
        </p>

        <p>
          <strong>Benevolência</strong><br />
          Assumir responsabilidades sociais e cuidar da comunidade.
        </p>

        <h2 className="font-extrabold text-neutral-800 text-sm pt-2">Reconhecimento e Conquistas</h2>

        <p>
          Em 2024, a Asiaray continuou se destacando em mais de 10 competições internacionais e nacionais de publicidade altamente reconhecidas, conquistando um total de 50 prêmios, incluindo ouro, prata, bronze e mérito.
        </p>

        <p>
          Todas essas conquistas foram alcançadas através do esforço conjunto entre a Asiaray, anunciantes, agências de publicidade e proprietários de mídia. A empresa continuará fortalecendo essa colaboração, juntamente com sua filosofia de “Gestão de Espaços”, criando experiências extraordinárias para passageiros e públicos, promovendo benefícios mútuos para todas as partes envolvidas.
        </p>

      </div>
    </ModalBase>
  );
};

// 7. DECLARAÇÃO DIÁRIA MODAL (Real data from get_weekly_income via gateway op 802)
// 7. PRIVACY MODAL
export const PrivacyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Termos e Privacidade">
      <div className="space-y-4 text-xs text-neutral-600 leading-relaxed font-sans pb-4">
        
        <h2 className="font-extrabold text-neutral-800 text-sm">Proteção de Dados Pessoais</h2>
        
        <p>
          Na Asiaray Media Group, levamos a sua privacidade e a segurança dos seus dados muito a sério. Todas as suas informações sensíveis, como o seu <strong>Telefone, Nome e IBAN</strong>, são rigorosamente protegidas.
        </p>

        <p className="italic pl-3 border-l-2 border-neutral-300 py-0.5 text-neutral-700">
          “Nenhum dado pessoal é partilhado com terceiros e todas as informações financeiras e de contacto são encriptadas nos nossos servidores seguros.”
        </p>

        <h2 className="font-extrabold text-neutral-800 text-sm pt-2">A Sua Responsabilidade</h2>
        
        <p>
          Apesar da nossa encriptação de ponta a ponta, a segurança também depende de si. Como proprietário da conta, <strong>não deve divulgar os seus dados pessoais</strong> em grupos públicos ou partilhar com pessoas que se apresentem como "técnicos".
        </p>

        <p>
          Se precisar de enviar capturas de ecrã (screenshots) para o nosso suporte ou se for partilhar resultados num grupo de WhatsApp, <strong>por favor, esconda ou desfoque a parte onde os seus dados pessoais (Nome, Telefone, IBAN) aparecem</strong>.
        </p>

        <p>
          Lembre-se: O Suporte Oficial da Asiaray <strong>nunca</strong> lhe pedirá a sua palavra-passe de acesso ou o seu PIN de levantamento. Mantenha os seus dados seguros!
        </p>
      </div>
    </ModalBase>
  );
};

// 8. COMPANY POLICIES MODAL
export const CompanyPoliciesModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [policies, setPolicies] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchPolicies();
    }
  }, [isOpen]);

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase.rpc('get_company_policies');
      if (error) throw error;
      setPolicies(data);
    } catch (error) {
      console.error('Failed to load company policies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ModalBase isOpen={isOpen} onClose={onClose} title="Políticas da Empresa">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e88e5]"></div>
        </div>
      </ModalBase>
    );
  }

  const p = policies || {
    min_recharge_kz: 8000,
    min_recharge_usdt: 8,
    max_recharge_kz: 3000000,
    min_withdrawal_kz: 2000,
    withdrawal_fee_pct: 50,
    refund_days: 180,
    refund_min_subordinates: 50,
    products: []
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Políticas da Empresa">
      <div className="space-y-6 text-xs text-neutral-600 leading-relaxed font-sans pb-4">
        
        <div>
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Nossas Diretrizes e Políticas</h1>
          <p className="mt-2">
            A Asiaray estabelece diretrizes operacionais com foco em segurança, estabilidade financeira, transparência administrativa e continuidade dos serviços disponibilizados pela empresa. As políticas abaixo definem os critérios aplicáveis às operações de depósitos, aquisição de produtos, retiradas, funcionamento das equipas e utilização dos serviços WS.
          </p>
        </div>

        <hr className="border-neutral-200" />

        <div>
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Produtos WS e Ativação de Serviços</h1>
          <p className="mt-2">
            A Asiaray disponibiliza diferentes categorias de produtos e serviços digitais identificados por níveis WS (WS1, WS2, WS3, entre outros). Cada nível corresponde a um plano operacional específico dentro da estrutura operacional da empresa.
          </p>
          <p className="mt-2">
            Após a ativação de um produto WS, o utilizador passa a ter acesso às tarefas, funcionalidades e benefícios associados ao plano adquirido, podendo receber bonificações e comissões conforme as regras internas e o desempenho operacional da conta.
          </p>
          <p className="mt-2">
            Os valores aplicados pelos utilizadores destinam-se à ativação dos serviços, manutenção operacional, processamento tecnológico, gestão administrativa, publicidade digital e sustentabilidade das operações da empresa.
          </p>
          
          {p.products && p.products.length > 0 && (
            <div className="mt-3 space-y-2">
              <h3 className="font-bold text-neutral-700">Pacotes Disponíveis:</h3>
              <div className="grid grid-cols-1 gap-2">
                {p.products.sort((a: any, b: any) => Number(a.price) - Number(b.price)).map((prod: any) => (
                  <div key={prod.id} className="bg-slate-50 border border-slate-200 p-2 rounded flex justify-between items-center">
                    <span className="font-bold text-neutral-800">{prod.name}</span>
                    <div className="text-right">
                      <div className="text-[11px] font-bold text-[#1e88e5]">KZ {Number(prod.price).toLocaleString('pt-AO')}</div>
                      <div className="text-[10px] text-neutral-500">Renda Diária: KZ {Number(prod.daily_income).toLocaleString('pt-AO')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <hr className="border-neutral-200" />

        <div>
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Política de Reembolso Programado</h1>
          <p className="mt-2">
            A Asiaray poderá disponibilizar programas internos de reembolso promocional ou retorno programado, sujeitos ao cumprimento integral das condições estabelecidas pela empresa.
          </p>
          <p className="mt-2">
            O reembolso do valor investido poderá ocorrer após um período mínimo de até <strong>{p.refund_days} dias corridos</strong>, desde que:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>a conta permaneça ativa e regular;</li>
            <li>não existam violações das políticas internas;</li>
            <li>o utilizador mantenha os requisitos operacionais definidos pela empresa;</li>
            <li>a equipa vinculada atinja os critérios mínimos de atividade exigidos, incluindo o número mínimo de investidores ativos.</li>
          </ul>
          <p className="mt-2">
            A empresa reserva-se o direito de analisar, validar ou recusar qualquer solicitação de reembolso caso identifique irregularidades operacionais, inconsistências cadastrais ou incumprimento das diretrizes internas.
          </p>
        </div>

        <hr className="border-neutral-200" />

        <div>
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Políticas de Recarga e Depósito</h1>
          <p className="mt-2">
            Para ativação dos produtos e serviços WS, os utilizadores poderão efetuar depósitos através dos métodos oficialmente disponibilizados pela empresa.
          </p>
          <h2 className="font-bold text-neutral-700 mt-2 mb-1">Métodos Aceites</h2>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Moeda Local (AOA/KZ);</li>
            <li>USDT (Rede TRC20).</li>
          </ul>
          <h2 className="font-bold text-neutral-700 mt-2 mb-1">Limites Operacionais</h2>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li><strong>Depósito mínimo:</strong> {p.min_recharge_kz.toLocaleString('pt-AO')} AOA (Kwanzas);</li>
            <li><strong>Depósito máximo:</strong> {p.max_recharge_kz.toLocaleString('pt-AO')} AOA (Kwanzas).</li>
          </ul>
          <p className="mt-2">
            Todos os depósitos estão sujeitos à verificação interna, validação de segurança e confirmação financeira antes da disponibilização do saldo na conta do utilizador.
          </p>
          <p className="mt-2">
            A empresa poderá solicitar comprovativos adicionais sempre que necessário para fins de conformidade e segurança financeira.
          </p>
        </div>

        <hr className="border-neutral-200" />

        <div>
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Políticas de Retirada</h1>
          <p className="mt-2">
            A Asiaray processa retiradas através das informações bancárias registadas pelo utilizador junto da empresa.
          </p>
          <h2 className="font-bold text-neutral-700 mt-2 mb-1">Limites de Retirada</h2>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li><strong>Valor mínimo por retirada:</strong> {p.min_withdrawal_kz.toLocaleString('pt-AO')} AOA (Kwanzas);</li>
            <li><strong>Limite máximo por operação:</strong> 100.000 AOA (Kwanzas).</li>
          </ul>
          <p className="mt-2">
            O prazo de processamento poderá variar conforme:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>validação de segurança;</li>
            <li>horários bancários;</li>
            <li>volume operacional;</li>
            <li>processamento das instituições financeiras.</li>
          </ul>
          <p className="mt-2">
            O crédito poderá ocorrer entre 24 e 72 horas úteis, dependendo das condições operacionais e bancárias.
          </p>
        </div>

        <hr className="border-neutral-200" />

        <div>
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Taxas Operacionais</h1>
          <p className="mt-2">
            A Asiaray aplica políticas de sustentabilidade financeira destinadas à manutenção da infraestrutura tecnológica, segurança operacional, processamento de pagamentos, gestão administrativa, publicidade digital e estabilidade contínua dos seus serviços.
          </p>
          <h2 className="font-bold text-neutral-700 mt-2 mb-1">Taxa de Retirada</h2>
          <p className="mt-2">
            As retiradas realizadas pelos utilizadores estão sujeitas a uma taxa operacional de <strong>{p.withdrawal_fee_pct}%</strong> sobre o valor solicitado.
          </p>
          <p className="mt-2">
            As taxas operacionais cobradas sobre determinadas operações têm como objetivo:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>garantir a sustentabilidade financeira da empresa;</li>
            <li>assegurar a continuidade dos serviços e operações digitais;</li>
            <li>reforçar os sistemas internos de segurança e proteção financeira;</li>
            <li>suportar custos administrativos, tecnológicos e operacionais;</li>
            <li>manter a estabilidade do sistema de pagamentos e processamento;</li>
            <li>fortalecer os programas de publicidade e expansão da empresa;</li>
            <li>reduzir riscos operacionais e atividades irregulares;</li>
            <li>contribuir para a manutenção e crescimento da estrutura empresarial a longo prazo.</li>
          </ul>
          <p className="mt-2">
            A empresa declara que parte significativa da sua sustentabilidade provém das atividades publicitárias, serviços digitais e mecanismos operacionais internos.
          </p>
        </div>

        <hr className="border-neutral-200" />

        <div>
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Política de Equipas e Expansão de Rede</h1>
          <p className="mt-2">
            A Asiaray disponibiliza um sistema estruturado de expansão de equipa através de códigos de convite personalizados, permitindo aos utilizadores desenvolver a sua rede de forma organizada e transparente.
          </p>
          <p className="mt-2">
            Sempre que um novo membro realiza o registo utilizando um código de convite válido e efetua a ativação de um produto WS, o sistema poderá gerar bonificações automáticas ao utilizador responsável pela indicação, de acordo com os níveis de comissão definidos pela empresa.
          </p>
          <h2 className="font-bold text-neutral-700 mt-2 mb-1">Estrutura de Bonificações por Nível</h2>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li><strong>Nível 1 (Convidados Diretos):</strong> 10% de bonificação;</li>
            <li><strong>Nível 2:</strong> 5% de bonificação;</li>
            <li><strong>Nível 3:</strong> 2% de bonificação.</li>
          </ul>
          <p className="mt-2">
            As bonificações são calculadas conforme as operações elegíveis realizadas pelos membros da rede e estão sujeitas às regras internas, validações de segurança e conformidade operacional da empresa.
          </p>
          <p className="mt-2">
            O crescimento e desempenho da equipa poderão influenciar:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>níveis de recompensa;</li>
            <li>bonificações residuais;</li>
            <li>classificação interna da conta;</li>
            <li>acesso a campanhas promocionais;</li>
            <li>benefícios operacionais e programas internos de incentivo.</li>
          </ul>
          <p className="mt-2">
            A empresa reserva-se o direito de limitar, suspender ou cancelar bonificações em casos de atividades suspeitas, manipulação de rede, fraude, utilização de múltiplas contas ou qualquer violação das políticas internas.
          </p>
        </div>

        <hr className="border-neutral-200" />

        <div>
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Conformidade e Segurança</h1>
          <p className="mt-2">
            A Asiaray mantém políticas internas rigorosas de conformidade, segurança digital e monitorização operacional, com o objetivo de proteger os utilizadores e garantir estabilidade contínua dos seus serviços.
          </p>
          <p className="mt-2">
            A empresa reserva-se o direito de:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>analisar atividades suspeitas;</li>
            <li>solicitar verificação adicional de identidade;</li>
            <li>bloquear operações consideradas irregulares;</li>
            <li>suspender ou encerrar contas que violem os termos internos;</li>
            <li>alterar limites operacionais, políticas financeiras ou critérios de elegibilidade sempre que necessário para garantir segurança e sustentabilidade dos serviços.</li>
          </ul>
          <div className="mt-4 p-3 bg-slate-100 border-l-4 border-[#1e88e5] rounded-lg">
            <p className="text-[11px] font-semibold text-slate-700 italic">
              Ao utilizar os serviços da Asiaray, o utilizador declara concordar integralmente com todas as políticas, diretrizes e termos operacionais estabelecidos pela empresa.
            </p>
          </div>
        </div>

      </div>
    </ModalBase>
  );
};

export const DailyDeclarationModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { stats, showLoading, hideLoading, ensureInternetConnectivity, user } = useApp();

  type WeekDay = { dia: string; day_date: string; total: number };
  const [weekData, setWeekData] = useState<WeekDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    showLoading('Carregando estatísticas...');
    setLoading(true);

    const loadAll = async () => {
      if (!(await ensureInternetConnectivity())) {
        setLoading(false);
        hideLoading();
        return;
      }

      const token = await getAccessToken();
      if (!token) {
        setLoading(false);
        hideLoading();
        return;
      }

      try {
        const [weekRes, prodRes] = await Promise.all([
          fetch(GATEWAY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ op: 802, data: {} })
          }),
          fetch(GATEWAY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ op: 512, data: {} })
          })
        ]);

        const weekJson = await weekRes.json();
        if (weekJson.success && Array.isArray(weekJson.result)) {
          setWeekData(weekJson.result.map((r: any) => ({
            dia: r.dia,
            day_date: r.day_date,
            total: Number(r.total) || 0
          })));
        }

        const prodJson = await prodRes.json();
        if (prodJson.success && Array.isArray(prodJson.result)) {
          setProducts(prodJson.result);
        }
      } catch (err) {
        console.error('DailyDeclaration fetch error:', err);
      } finally {
        setLoading(false);
        hideLoading();
      }
    };

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Use real week data or fallback to 7 zeros while loading
  const dataPoints: WeekDay[] = weekData.length === 7
    ? weekData
    : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => ({ dia: d, day_date: '', total: 0 }));

  const maxVal = Math.max(...dataPoints.map(d => d.total), 1);

  // Real calculations based on actual data
  const totalSemana = weekData.reduce((s, d) => s + d.total, 0);
  const mediaDiaria = weekData.length > 0 ? totalSemana / 7 : 0;
  const daysWithIncome = weekData.filter(d => d.total > 0).length;

  // Find current WS product for the user
  const currentProduct = products.find((p: any) => p.name === user.level);
  const dailyIncomeCapacity = currentProduct ? Number(currentProduct.daily_income) : 0;
  const weeklyCapacity = dailyIncomeCapacity * 7;
  const realizationRate = weeklyCapacity > 0 ? Math.min(100, (totalSemana / weeklyCapacity) * 100) : 0;

  // Monthly projection based on actual daily average
  const projecaoMensal = mediaDiaria * 30;

  // Today's date for highlighting
  const todayStr = new Date().toISOString().split('T')[0];

  // SVG chart dimensions
  const chartWidth = 300;
  const chartHeight = 100;
  const barWidth = 28;
  const barGap = 14;
  const totalBarsWidth = dataPoints.length * barWidth + (dataPoints.length - 1) * barGap;
  const startX = (chartWidth - totalBarsWidth) / 2;

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Declaração Diária">
      <div className="space-y-4">

        {/* === HEADER: Rendimento Semanal Real === */}
        <div className="relative bg-gradient-to-br from-[#0f4c35] to-[#1a7a56] rounded-2xl p-4 overflow-hidden">
          {/* Background grid pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" viewBox="0 0 200 80">
              <defs>
                <pattern id="bgGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="200" height="80" fill="url(#bgGrid)" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-green-300 tracking-widest">Rendimento Semanal Real</span>
              {loading && <span className="text-[9px] text-green-300 animate-pulse">A carregar...</span>}
            </div>
            <h3 className="text-2xl font-mono font-extrabold text-white mt-1">
              KZ {Math.round(totalSemana).toLocaleString('pt-AO')}
            </h3>
            <p className="text-[10px] text-green-200 mt-1">
              Estatística real dos últimos 7 dias • Nível {user.level}
            </p>

            {/* Progress bar: realização vs capacidade */}
            {weeklyCapacity > 0 && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] text-green-300">Taxa de realização</span>
                  <span className="text-[10px] font-bold text-white">{realizationRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-green-300 to-emerald-400 h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${realizationRate}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <span className="text-[8px] text-green-300/70">KZ 0</span>
                  <span className="text-[8px] text-green-300/70">Cap. semanal: KZ {Math.round(weeklyCapacity).toLocaleString('pt-AO')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* === GRÁFICO SVG REAL === */}
        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-3">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Curva de Ganhos Semanais (KZ)</h4>
            <span className="text-[9px] text-neutral-400 font-mono">últimos 7 dias</span>
          </div>

          <div style={{ width: '100%', overflowX: 'hidden' }}>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight + 24}`}
              width="100%"
              preserveAspectRatio="xMidYMid meet"
              className="select-none"
            >
              {/* Horizontal grid lines */}
              {[0, 25, 50, 75, 100].map(pct => {
                const y = chartHeight - (pct / 100) * chartHeight;
                return (
                  <line
                    key={pct}
                    x1={0} y1={y}
                    x2={chartWidth} y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                    strokeDasharray={pct === 0 ? 'none' : '3,3'}
                  />
                );
              })}

              {/* Y-axis max label */}
              {maxVal > 1 && (
                <text x="2" y="8" fontSize="6" fill="#9ca3af" fontFamily="monospace">
                  {maxVal >= 1000 ? `${(maxVal / 1000).toFixed(1)}k` : Math.round(maxVal)}
                </text>
              )}

              {/* Bars */}
              {dataPoints.map((dp, idx) => {
                const heightPct = Math.max(3, Math.min(100, (dp.total / maxVal) * 100));
                const barH = (heightPct / 100) * chartHeight;
                const x = startX + idx * (barWidth + barGap);
                const y = chartHeight - barH;
                const isToday = dp.day_date === todayStr;
                const hasValue = dp.total > 0;

                return (
                  <g key={idx}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barH}
                      rx="4"
                      ry="4"
                      fill={isToday ? 'url(#todayGrad)' : hasValue ? 'url(#barGrad)' : '#e5e7eb'}
                      opacity={hasValue ? 1 : 0.5}
                    />
                    {hasValue && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 2}
                        textAnchor="middle"
                        fontSize="5.5"
                        fill={isToday ? '#059669' : '#6b7280'}
                        fontFamily="monospace"
                        fontWeight={isToday ? '700' : '400'}
                      >
                        {dp.total >= 1000 ? `${(dp.total / 1000).toFixed(1)}k` : Math.round(dp.total)}
                      </text>
                    )}
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight + 14}
                      textAnchor="middle"
                      fontSize="7"
                      fill={isToday ? '#059669' : '#9ca3af'}
                      fontFamily="sans-serif"
                      fontWeight={isToday ? '700' : '400'}
                    >
                      {dp.dia}
                    </text>
                    {isToday && (
                      <circle cx={x + barWidth / 2} cy={chartHeight + 21} r="2" fill="#059669" />
                    )}
                  </g>
                );
              })}

              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#0d7377" />
                </linearGradient>
                <linearGradient id="todayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 mt-1 px-1">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-b from-[#10b981] to-[#0d7377]" />
              <span className="text-[8px] text-neutral-400">Ganho do dia</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-b from-[#34d399] to-[#059669]" />
              <span className="text-[8px] text-neutral-400">Hoje</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-neutral-200" />
              <span className="text-[8px] text-neutral-400">Sem registo</span>
            </div>
          </div>
        </div>

        {/* === ESTATÍSTICAS REAIS === */}
        <div className="space-y-2">
          <p className="font-bold text-neutral-700 text-xs">Estatísticas Reais de Rendimento:</p>
          <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
            <div className="bg-neutral-50 border border-neutral-100 p-2.5 rounded-xl">
              <span className="text-[9px] text-neutral-400 block uppercase tracking-wide mb-1">Média Diária</span>
              <strong className="font-mono text-neutral-800 text-xs block">
                KZ {Math.round(mediaDiaria).toLocaleString('pt-AO')}
              </strong>
              {daysWithIncome > 0 && (
                <span className="text-[8px] text-neutral-400">{daysWithIncome} dia{daysWithIncome > 1 ? 's' : ''} activo{daysWithIncome > 1 ? 's' : ''}</span>
              )}
            </div>

            <div className="bg-neutral-50 border border-neutral-100 p-2.5 rounded-xl">
              <span className="text-[9px] text-neutral-400 block uppercase tracking-wide mb-1">Total Semana</span>
              <strong className="font-mono text-neutral-800 text-xs block">
                KZ {Math.round(totalSemana).toLocaleString('pt-AO')}
              </strong>
              {weeklyCapacity > 0 && (
                <span className="text-[8px] text-neutral-400">{realizationRate.toFixed(0)}% realizado</span>
              )}
            </div>

            <div className="bg-neutral-50 border border-neutral-100 p-2.5 rounded-xl">
              <span className="text-[9px] text-neutral-400 block uppercase tracking-wide mb-1">Este Mês</span>
              <strong className="font-mono text-neutral-800 text-xs block">
                KZ {Math.round(stats.incomeThisMonth).toLocaleString('pt-AO')}
              </strong>
              <span className="text-[8px] text-neutral-400">acumulado real</span>
            </div>

            <div className="bg-neutral-50 border border-neutral-100 p-2.5 rounded-xl">
              <span className="text-[9px] text-neutral-400 block uppercase tracking-wide mb-1">Projecção Mensal</span>
              <strong className="font-mono text-emerald-700 text-xs block">
                KZ {Math.round(projecaoMensal).toLocaleString('pt-AO')}
              </strong>
              <span className="text-[8px] text-neutral-400">média diária × 30</span>
            </div>
          </div>
        </div>


      </div>
    </ModalBase>
  );
};


// 8. GENERAL DATA LIST MODALS (Receitas / Depósitos / Retiradas)
interface ListModalProps extends ModalProps {
  type: 'receita' | 'recarga' | 'retirada';
}

export const LedgerLogsModal: React.FC<ListModalProps> = ({ isOpen, onClose, type }) => {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const { logs: contextLogs, user, setIsFullScreenActive, fetchWithdrawalRecords, showLoading, hideLoading, ensureInternetConnectivity } = useApp();
  const [withdrawalLogs, setWithdrawalLogs] = useState<LogRecord[]>([]);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [depositLogs, setDepositLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch withdrawal records when modal opens for retirada
  useEffect(() => {
    if (isOpen && type === 'retirada') {
      setLoading(true);
      fetchWithdrawalRecords()
        .then((data) => {
          // Expected shape: array of records matching LogRecord fields
          setWithdrawalLogs(data);
        })
        .catch((err) => {
          console.error('Error fetching withdrawal records:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, type]);

  // Set fullscreen status when modal is open to hide bottom tabbar
  useEffect(() => {
    if (isOpen) {
      setIsFullScreenActive(true);
    }
    return () => {
      setIsFullScreenActive(false);
    };
  }, [isOpen, setIsFullScreenActive]);

  // Fetch completed tasks when modal opens for receita
  useEffect(() => {
    if (isOpen && type === 'receita') {
      showLoading('Carregando histórico de receitas...');
      setLoading(true);

      const loadReceitaData = async () => {
        if (!(await ensureInternetConnectivity())) {
          setLoading(false);
          hideLoading();
          return;
        }

        const token = await getAccessToken();
        if (!token) {
          setLoading(false);
          hideLoading();
          return;
        }

        try {
          const res = await fetch(GATEWAY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ op: 605, data: {} })
          });
          const data = await res.json();
          if (data.success) {
            setCompletedTasks(data.result || []);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
          hideLoading();
        }
      };

      loadReceitaData();
    }
  }, [isOpen, type]);

  // Fetch deposit records when modal opens for recarga
  useEffect(() => {
    if (isOpen && type === 'recarga') {
      showLoading('Carregando histórico de recargas...');
      setLoading(true);

      const loadRecargaData = async () => {
        if (!(await ensureInternetConnectivity())) {
          setLoading(false);
          hideLoading();
          return;
        }

        const token = await getAccessToken();
        if (!token) {
          setLoading(false);
          hideLoading();
          return;
        }

        try {
          const res = await fetch(GATEWAY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ op: 208, data: {} })
          });
          const data = await res.json();
          if (data.success && data.result) {
            const rawKzs = data.result.kzs || [];
            const rawUsdt = data.result.usdt || [];

            const kzsLogs = rawKzs.map((rec: any) => ({
              id: rec.id || 'rec_kz_' + String(Math.floor(10000 + Math.random() * 90000)),
              type: 'recarga',
              currency: 'KZ',
              amount: Number(rec.valor_deposito || 0),
              date: rec.created_at ? new Date(rec.created_at).toISOString().replace('T', ' ').slice(0, 16) : new Date().toISOString().replace('T', ' ').slice(0, 16),
              status: rec.estado_de_pagamento?.toLowerCase().includes('processando') || rec.estado_de_pagamento?.toLowerCase().includes('pendente') ? 'pendente' : (rec.estado_de_pagamento?.toLowerCase() === 'rejeitado' ? 'rejeitado' : 'aprovado'),
              details: rec.nome_do_banco ? `Banco ${rec.nome_do_banco}` : 'Depósito Bancário'
            }));

            const usdtLogs = rawUsdt.map((rec: any) => ({
              id: rec.id || 'rec_usdt_' + String(Math.floor(10000 + Math.random() * 90000)),
              type: 'recarga',
              currency: 'USDT',
              amount: Number(rec.amount || rec.amount_usdt || 0),
              date: rec.created_at ? new Date(rec.created_at).toISOString().replace('T', ' ').slice(0, 16) : new Date().toISOString().replace('T', ' ').slice(0, 16),
              status: rec.status?.toLowerCase().includes('processando') || rec.status?.toLowerCase().includes('pendente') ? 'pendente' : (rec.status?.toLowerCase() === 'rejeitado' ? 'rejeitado' : 'aprovado'),
              details: 'Depósito USDT'
            }));

            // Merge and sort by date descending
            const mergedLogs = [...kzsLogs, ...usdtLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            setDepositLogs(mergedLogs);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
          hideLoading();
        }
      };

      loadRecargaData();
    }
  }, [isOpen, type]);

  // Use fetched data if available, otherwise fallback to context logs
  let filtered: any[] = [];
  if (type === 'retirada') {
    filtered = withdrawalLogs.length ? withdrawalLogs : [];
  } else if (type === 'recarga') {
    filtered = depositLogs.length ? depositLogs : [];
  } else if (type === 'receita') {
    filtered = completedTasks.map(task => {
      let formattedDate = 'N/A';
      if (task.data_recebimento) {
        try {
          formattedDate = new Date(task.data_recebimento).toLocaleString('pt-AO').replace(',', '');
        } catch (e) {
          formattedDate = String(task.data_recebimento);
        }
      }
      return {
        id: task.id.toString(),
        type: 'recompensa',
        amount: Number(task.valor_recebido || 0),
        date: formattedDate,
        status: task.status === 'success' || task.status === 'aprovado' ? 'aprovado' : task.status || 'aprovado',
        details: task.origem_bonus || 'Recompensa de Bónus'
      };
    });
  } else {
    filtered = contextLogs.filter(l => l.type === type);
  }

  const getStatusBadge = (status: 'pendente' | 'aprovado' | 'rejeitado') => {
    switch (status) {
      case 'aprovado':
        return <span className="bg-[#ccfbf1] text-[#0f766e] text-[10px] font-bold px-2.5 py-0.5 rounded-full">Aprovado</span>;
      case 'rejeitado':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Rejeitado</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Pendente</span>;
    }
  };

  const getStatusText = (status: 'pendente' | 'aprovado' | 'rejeitado') => {
    switch (status) {
      case 'aprovado':
        return 'Sucesso';
      case 'rejeitado':
        return 'Rejeitado';
      default:
        return 'Pendente';
    }
  };

  const getStatusTextColorClass = (status: 'pendente' | 'aprovado' | 'rejeitado') => {
    switch (status) {
      case 'aprovado':
        return 'text-[#5cb85c]';
      case 'rejeitado':
        return 'text-red-500';
      default:
        return 'text-amber-500';
    }
  };


  if (type === 'retirada') {
    const selectedLog = filtered.find(l => l.id === selectedLogId);

    const handleBackClick = () => {
      if (selectedLogId) {
        setSelectedLogId(null);
      } else {
        onClose();
      }
    };

    return (
      <div className="fixed inset-0 bg-[#f5f5f5] flex flex-col z-[50] animate-fadeIn font-sans" id="retirada-modal-fullscreen">
        {/* Header with back button and Title on neutral slate-gray background */}
        <div className="bg-[#cbd5e1]/45 px-4 py-3 border-b border-neutral-200 flex items-center relative select-none shrink-0" style={{ height: '48px' }}>
          <button 
            id="retirada-back-arrow"
            onClick={handleBackClick}
            className="p-1 text-neutral-600 hover:text-neutral-900 bg-transparent hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer flex items-center z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px] stroke-neutral-700" fill="none" viewBox="0 0 24 24" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="absolute inset-x-0 mx-auto w-max text-center font-bold text-neutral-800 text-[15px] tracking-wide select-none">
            Registo de retirada
          </div>
        </div>

        {/* Dynamic content container */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
          {!selectedLog ? (
            filtered.length === 0 ? (
              <div className="flex items-center justify-center p-10 min-h-[220px]">
                <EmptyState
                  className="py-10"
                  message="Sem dados"
                  description="Nenhum registo de retirada localizado no momento."
                />
              </div>
            ) : (
              /* LIST VIEW: Exact mockup match */
              <div className="divide-y divide-neutral-150">
                {filtered.map((log) => {
                  // Generate a stable numeric orderId based on log ID
                  const orderId = log.id === 'ret_default' ? '260' : 
                    (Math.abs(log.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 900 + 100);
                  
                  const dateOnly = log.date.split(' ')[0] || '2023-06-26';

                  return (
                    <div 
                      key={log.id} 
                      onClick={() => setSelectedLogId(log.id)}
                      className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
                    >
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-[12px] text-neutral-400">ID da encomenda: {orderId}</span>
                        <span className="text-[14px] font-bold text-neutral-800">Pedido {log.amount.toFixed(2)} KZ</span>
                        <span className="text-[12px] text-neutral-400">{dateOnly}</span>
                      </div>
                      <div className="flex items-center gap-1.5 select-none shrink-0">
                        <span className={`text-[13px] font-bold ${getStatusTextColorClass(log.status)}`}>
                          {getStatusText(log.status)}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-[14px] w-[14px] text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* DETAILED VIEW: Exact mockup match */
            (() => {
              // Formatting bank initials
              let bankDisplay = 'BAI';
              if (user.bankName) {
                const match = user.bankName.match(/^([A-Za-z0-9]+)/);
                if (match) {
                  bankDisplay = match[1].toUpperCase();
                }
              }

              // Normalise the account display
              const acctDisplay = user.bankAccount 
                ? user.bankAccount.replace(/\s+/g, '') 
                : 'RI0004000009570177510185';

              const dateOnly = selectedLog.date.split(' ')[0] || '2023-06-26';

              return (
                <div className="bg-white px-5 pt-5 pb-8 animate-fadeIn" id={`ret_record_wrapper_${selectedLog.id}`}>
                  
                  {/* Row 1: Retirada do saldo | Date */}
                  <div className="flex justify-between items-center py-3.5">
                    <span className="text-neutral-500 text-sm select-none font-medium">Retirada do saldo</span>
                    <span className="text-neutral-400 font-mono text-sm select-none">{dateOnly}</span>
                  </div>
                  <div className="border-t border-neutral-100 w-full"></div>

                  {/* Row 2: Banco beneficiário | Initials */}
                  <div className="flex justify-between items-center py-3.5">
                    <span className="text-neutral-500 text-sm select-none font-medium">Banco beneficiário</span>
                    <span className="text-neutral-400 font-sans tracking-wide font-medium text-sm select-none">{bankDisplay}</span>
                  </div>
                  <div className="border-t border-neutral-100 w-full"></div>

                  {/* Row 3: Conta bancária | Value */}
                  <div className="flex justify-between items-start py-3.5">
                    <div className="flex flex-col text-neutral-500 text-sm leading-tight select-none font-medium">
                      <span>Conta</span>
                      <span>bancária</span>
                    </div>
                    <span className="text-neutral-400 font-mono text-sm break-all max-w-[70%] text-right font-medium">
                      {acctDisplay}
                    </span>
                  </div>
                  <div className="border-t border-neutral-100 w-full"></div>

                  {/* Row 4: Montante label and large flat text value */}
                  <div className="pt-5 pb-2 space-y-1">
                    <span className="text-[12px] text-neutral-400 select-none block font-semibold uppercase tracking-wider">Montante</span>
                    <div className="text-3xl font-display font-extrabold text-neutral-900 tracking-wide select-all">
                      KZ {selectedLog.amount.toFixed(2)}
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="h-12"></div>

                  {/* Process Tracker */}
                  <div className="relative px-2">
                    {/* Step connection bar */}
                    <div className="absolute top-[11.5px] left-[15%] right-[15%] h-[2.5px] bg-[#5cb85c]" style={{ zIndex: 0 }}></div>

                    <div className="flex justify-between w-full relative" style={{ zIndex: 1 }}>
                      {/* Status Check Unit 1 */}
                      <div className="flex flex-col items-center flex-1">
                        <div className="h-[23px] w-[23px] rounded-full bg-[#5cb85c] text-white flex items-center justify-center font-bold text-xs ring-[3px] ring-white">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={4.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-neutral-800 mt-2 select-none">Pedido</span>
                        <span className="text-[10px] text-neutral-400 font-mono mt-0.5 select-none">{dateOnly}</span>
                      </div>

                      {/* Status Check Unit 2 */}
                      <div className="flex flex-col items-center flex-1">
                        <div className="h-[23px] w-[23px] rounded-full bg-[#5cb85c] text-white flex items-center justify-center font-bold text-xs ring-[3px] ring-white">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={4.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-neutral-800 mt-2 select-none">Transformação</span>
                        <span className="text-[10px] text-neutral-400 font-mono mt-0.5 select-none">{dateOnly}</span>
                      </div>

                      {/* Status Check Unit 3 */}
                      <div className="flex flex-col items-center flex-1">
                        <div className={`h-[23px] w-[23px] rounded-full ${selectedLog.status === 'aprovado' ? 'bg-[#5cb85c]' : selectedLog.status === 'rejeitado' ? 'bg-red-500' : 'bg-amber-500'} text-white flex items-center justify-center font-bold text-xs ring-[3px] ring-white`}>
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={4.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-neutral-800 mt-2 select-none">
                          {getStatusText(selectedLog.status)}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono mt-0.5 select-none">{dateOnly}</span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })()
          )}
        </div>
      </div>
    );
  }

  // Otherwise, render normal logs ledger content
  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={type === 'receita' ? 'Registo de receitas' : type === 'recarga' ? 'Registo de recargas' : 'Registo de retirada'}>
      <div className="space-y-3">
        {type === 'receita' ? (
          completedTasks.length === 0 ? (
            <EmptyState
              className="py-10"
              message="Sem dados"
              description="Nenhum registo de receitas registrado sob este separador."
            />
          ) : (
            <div className="space-y-0 max-h-[70vh] overflow-y-auto no-scrollbar bg-[#f4f6f9] -mx-4 -mb-4 pt-2">
              {completedTasks.map((task: any) => {
                const dataRow = new Date(task.data_atribuicao).toLocaleString('pt-AO');
                const rewardAmount = Number(task.renda_coletada).toFixed(2);
                
                return (
                  <div 
                    key={task.id}
                    className="bg-white flex flex-col relative w-full border-b-[10px] border-[#f4f6f9]"
                  >
                    <div className="bg-[#dbe4f0] px-3.5 py-1.5 flex items-center justify-between border-b border-neutral-200 select-none w-full">
                      <span className="text-[11.5px] text-[#4a5568] font-medium tracking-wide">outros</span>
                      <span className="text-[11.5px] text-[#a0aec0] select-none hover:text-[#4a5568] font-semibold">X</span>
                    </div>

                    <div className="p-4 text-[#4a5568] text-[11.5px] font-sans relative pr-[84px] bg-white flex flex-col gap-1 w-full">
                      <div className="flex items-start leading-tight">
                        <span className="text-gray-400 font-medium min-w-[124px] select-none">Objectivo da tarefa:</span>
                        <span className="text-neutral-850 font-medium">Rendimento Produto</span>
                      </div>
                      
                      <div className="flex items-start leading-tight mt-0.5">
                        <span className="text-gray-400 font-medium min-w-[124px] select-none">Criar:</span>
                        <span className="text-gray-600 font-mono ml-0.5 select-all">{dataRow}</span>
                      </div>

                      <div className="flex items-start leading-tight mt-0.5">
                        <span className="text-gray-400 font-medium min-w-[124px] select-none">revisão:</span>
                        <span className="text-neutral-850 font-medium select-none">Terminado</span>
                      </div>

                      <div className="pt-2">
                        <span className="bg-emerald-50 text-emerald-700 text-[9.5px] py-0.5 px-2 rounded inline-block border border-emerald-100 font-medium">
                          Tarefa Confirmada e Liquidada
                        </span>
                      </div>

                      <div className="absolute right-4 top-[50%] -translate-y-1/2 flex items-center select-none">
                        <div className="relative">
                          <div 
                            className="h-[62px] w-[62px] rounded-full border border-white/80 shadow-xs flex flex-col items-center justify-center shrink-0" 
                            style={{ backgroundColor: '#9aaec4' }}
                          >
                            <span className="text-white text-[10px] font-bold tracking-tight select-all text-center flex flex-col leading-none gap-1">
                              <span>{rewardAmount}</span>
                              <span className="text-[8px] font-medium opacity-85">KZ</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          filtered.length === 0 ? (
            <EmptyState
              className="py-10"
              message="Sem dados"
              description={`Nenhum registo de ${type === 'recarga' ? 'recargas' : 'retiradas'} registrado sob este separador.`}
            />
          ) : (
            <div className="divide-y divide-gray-150">
              {filtered.map((log) => (
                <div key={log.id} className="py-4 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-neutral-900 text-[14px]">{log.details || 'Transação Asiaray'}</div>
                    <div className="text-[11.5px] text-neutral-400 font-mono tracking-wider">{log.date}</div>
                  </div>
                  <div className="text-right space-y-1.5 shrink-0 ml-3">
                    <div className="font-mono font-bold text-neutral-900 text-[14px]">
                      {log.type === 'retirada' ? '-' : '+'}
                      {log.currency === 'USDT' ? 'USDT ' : 'KZ '}
                      {log.amount.toLocaleString('pt-AO').replace(',', ' ')}
                    </div>
                    <div>{getStatusBadge(log.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </ModalBase>
  );
};
