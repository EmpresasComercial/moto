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
  const [bank, setBank] = useState('');
  const [account, setAccount] = useState('');
  const [holder, setHolder] = useState('');
  const [ibanError, setIbanError] = useState<string | null>(null);
  const accountInputRef = React.useRef<HTMLInputElement>(null);

  const bankCodes: Record<string, string> = {
    'Banco BAI': '0040',
    'Banco BFA': '0006',
    'Banco BIC': '0051',
    'Banco BCI': '0005',
    'Banco Sol': '0044',
    'Banco ATL': '0055'
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBank = e.target.value;
    setBank(selectedBank);
    const code = bankCodes[selectedBank] || '';
    setAccount(code);
    if (code) {
      setTimeout(() => {
        if (accountInputRef.current) {
          accountInputRef.current.focus();
          accountInputRef.current.setSelectionRange(code.length, code.length);
        }
      }, 0);
    }
  };

  const IBAN_REGEX = /^[0-9]{21}$/;

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '').slice(0, 21);
    setAccount(val);
    if (ibanError) setIbanError(null);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!bank) {
      setIbanError('Por favor, selecione a instituição bancária.');
      return;
    }

    const cleanIban = account.replace(/\s/g, '');
    if (!IBAN_REGEX.test(cleanIban)) {
      setIbanError('IBAN incompleto, deve ter exatamente 21 dígitos numéricos.');
      return;
    }

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
    'Banco ATL'
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
                  onChange={handleBankChange}
                  className="bg-transparent border-none outline-none w-full text-neutral-800 text-[12px] font-sans font-bold"
                >
                  <option value="" disabled>Selecione o banco</option>
                  {banksList.map((b, idx) => (
                    <option key={idx} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* IBAN */}
            <div className={`border-b ${ibanError ? 'border-red-400' : 'border-gray-200'}`}>
              <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">IBAN de Angola (AO06...)</div>
              <div className={`bg-[#f5f5f5] px-3 py-1.5 text-[12px] border-t ${ibanError ? 'border-red-400' : 'border-gray-200'}`}>
                <input 
                  ref={accountInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={21}
                  placeholder="0040 0000 0000 0000 0000 0"
                  value={account}
                  onChange={handleAccountChange}
                  className="bg-transparent border-none outline-none w-full text-neutral-800 text-[12px] font-sans font-bold"
                />
              </div>
              {ibanError && (
                <div className="px-3 py-1.5 text-[11px] text-red-600 bg-red-50 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {ibanError}
                </div>
              )}
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
  const { stats, user, convertUsdToKz, setIsFullScreenActive } = useApp();
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

    if (usdVal < 1 || stats.balanceUSDT < 1 || stats.balanceUSDT < usdVal) {
      alert("Balance insufiente, mínimo 1usdt");
      return;
    }

    if (usdVal > 50) {
      alert("Balance, máximo para conversão 50usdt");
      return;
    }

    // Days and Hours validation in Luanda timezone (UTC+1)
    const nowLuanda = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Luanda" }));
    const dow = nowLuanda.getDay(); // 0=Domingo, 1=Segunda, ..., 6=Sábado
    if (dow === 0 || dow === 5 || dow === 6) {
      alert("Sem câmbio aos fins de semana");
      return;
    }

    const hour = nowLuanda.getHours();
    if (hour < 10 || hour >= 16) {
      alert("as conversões só são permitidas entre as 10:00 e 16:00 (horário de Luanda)");
      return;
    }

    // Purchase check (VIP level must be >= WS1)
    if (!user.level || user.level === 'WS0') {
      alert("Recarregue para converter seus USDT");
      return;
    }

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
  const [selectedMethod, setSelectedMethod] = useState<string>('BFA');
  const [comprovativo, setComprovativo] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [fileLabel, setFileLabel] = useState<string>('Nenhum arquivo escolhido');
  const [ibanCopied, setIbanCopied] = useState(false);

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
            const token = await getAccessToken();
            if (token) {
              try {
                const resp = await fetch(GATEWAY_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ op: 512, data: {} })
                });
                const res = await resp.json();
                if (res.success && Array.isArray(res.result)) {
                  const prods = res.result;
                  const suggested = Array.from(new Set(prods.filter((p: any) => Number(p.price) > 0).map((p: any) => Number(p.price)))).sort((a: any, b: any) => a - b);
                  setPolicies({
                    min_recharge_kz: res.min_recharge_kz || 0,
                    min_recharge_usdt: res.min_recharge_usdt || 0,
                    max_recharge_kz: res.max_recharge_kz || 0,
                    min_withdrawal_kz: res.min_withdrawal_kz || 0,
                    withdrawal_fee_pct: res.withdrawal_fee_pct || 0,
                    refund_days: res.refund_days || 0,
                    refund_min_subordinates: res.refund_min_subordinates || 0,
                    suggested_recharge_kz: suggested.length > 0 ? suggested : (res.suggested_recharge_kz || []),
                    products: prods
                  });
                } else {
                  // Gateway did not return products — silent fallback
                  setPolicies({ suggested_recharge_kz: [] });
                }
              } catch {
                setPolicies({ suggested_recharge_kz: [] });
              }
            } else {
              setPolicies({ suggested_recharge_kz: [] });
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
        } catch {
          if (!policies) setPolicies({ suggested_recharge_kz: [] });
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

  React.useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const selectedBankInfo = dbBanks.find(b => b.nome_do_banco === selectedMethod);

  const currentAddress = selectedBankInfo?.iban || '';
  const currentFavorecido = selectedBankInfo?.nome_favorecido || '';
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
    } catch {
      hideLoading();
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
          {rechargeStep === 'instructions' ? 'Detalhes de Pagamento' : rechargeStep === 'method' ? 'Métodos de pagamento' : 'Recarregar'}
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
                <div className="py-8 flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-[2px] border-t-blue-500 animate-spin"></div></div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-hidden">
                  {dbBanks.map((bank, idx) => {
                    const methodName = bank.nome_do_banco;
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
                    {(() => {
                      const now = new Date();
                      const pad = (n: number) => String(n).padStart(2, '0');
                      const suffix = user.phone ? user.phone.slice(-4) : String(Math.floor(1000 + Math.random() * 9000));
                      return `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${suffix}`;
                    })()}
                  </div>
                </div>

                <div className="border-b border-gray-200">
                  <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">número da conta</div>
                  <div className="bg-[#f5f5f5] text-gray-600 px-3 py-1.5 text-[11px] font-mono border-t border-gray-200 select-all font-bold">
                    {user.phone || 'N/A'}
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
        } catch {
          // silent — invite domain unavailable
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
    } catch {
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
        } catch {
          // silent — team data unavailable
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
  // Note: Use Number() for level comparison - Supabase RPC may return level as string or number
  const rawTeam: any[] = Array.isArray(teamData)
    ? teamData
    : (teamData?.team && Array.isArray(teamData.team) ? teamData.team : []);

  const mapMember = (m: any) => ({
    phone: m.phone,
    date: m.created_at ? new Date(m.created_at).toISOString().split('T')[0] : '',
    amount: Number(m.reloaded_amount || 0).toFixed(2)
  });

  const levelUm   = rawTeam.filter((m: any) => Number(m.level) === 1).map(mapMember);
  const secundario = rawTeam.filter((m: any) => Number(m.level) === 2).map(mapMember);
  const nivelTres  = rawTeam.filter((m: any) => Number(m.level) === 3).map(mapMember);

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
    <ModalBase isOpen={isOpen} onClose={onClose} title="Asiaray Política de Privacidade">
      <div className="space-y-6 text-xs text-neutral-600 leading-relaxed font-sans pb-6">
        <div>
          <h1 className="font-extrabold text-neutral-800 text-base mb-2">Asiaray Política de Privacidade</h1>
          <p className="text-neutral-500 text-[10px] mb-4">Última atualização: Junho de 2026</p>
          <p className="font-semibold text-neutral-700 mb-2">Índice</p>
          <ol className="list-decimal pl-5 space-y-1 text-neutral-500">
            <li>Dados Pessoais que Recolhemos</li>
            <li>Como utilizamos os Dados Pessoais</li>
            <li>Divulgação de Dados Pessoais</li>
            <li>Retenção</li>
            <li>Controlo de dados</li>
            <li>Os seus direitos</li>
            <li>Crianças</li>
            <li>Segurança</li>
            <li>Divulgações estatais adicionais dos EUA</li>
            <li>Alterações à política de privacidade</li>
            <li>Controlador de dados</li>
            <li>Como entrar em contacto connosco</li>
            <li>Recursos úteis</li>
          </ol>
        </div>

        <hr className="border-neutral-200" />

        <p>
          Na Asiaray, a nossa missão é garantir que os nossos serviços beneficiem todos os utilizadores. Criámos as nossas ferramentas operacionais e sistemas de suporte para ajudar as pessoas a gerenciar, investir e acompanhar as suas atividades de rede de forma transparente. Na Asiaray (juntamente com as nossas afiliadas, "Asiaray", "nós", "nosso" ou "nos") estamos comprometidos a respeitar a sua privacidade e estamos fortemente empenhados em manter seguras todas as informações que obtemos de si ou sobre si. Esta Política de Privacidade descreve as nossas práticas relativamente aos Dados Pessoais que recolhemos de si ou sobre si, e como os utilizamos quando usa o nosso website, aplicações e serviços (coletivamente, "Serviços").
        </p>

        <p>
          Esta Política de Privacidade não se aplica ao conteúdo que tratamos em nome dos clientes das nossas ofertas comerciais. A nossa utilização desses dados é regida pelos nossos acordos correspondentes que abrangem o acesso e a utilização dessas ofertas.
        </p>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">1. Dados Pessoais que Recolhemos</h2>
          <p className="mb-2">Recolhemos dados pessoais relacionados contigo ("Dados Pessoais") da seguinte forma:</p>
          
          <h3 className="font-bold text-neutral-700 mt-2">Dados Pessoais que Forneces:</h3>
          <ul className="list-disc pl-5 mt-1 space-y-2">
            <li><strong>Informações da Conta:</strong> quando cria uma conta connosco, recolhemos informações associadas à sua conta, apenas o seu número de celular telefónico e informações de pagamento  (como o seu IBAN para processarmos suas retiradas/levantamento).</li>
            <li><strong>Conteúdo do utilizador:</strong> Recolhemos os Dados que fornece ao realizar um deposito nos nossos Serviços ("Conteúdo"), incluindo os suas capturas de talão ecrã de deposito.</li>
            <li><strong>Informações de Comunicação:</strong> se comunicares connosco, por exemplo, através de e-mail ou das nossas páginas em sites de suporte (como WhatsApp), poderemos recolher Dados como informações de contacto e o conteúdo da mensagem.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">2. Como utilizamos os Dados Pessoais</h2>
          <p className="mb-2">Utilizamos dados pessoais para os seguintes fins:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Para identificar os seus contactos que utilizam os nossos Serviços, quando opta por associar os seus contactos;</li>
            <li>Para processar seus pedidos de levantamentos e prevenir fraude, atividades ilegais ou utilizações indevidas dos nossos Serviços, e para proteger a segurança dos nossos sistemas;</li>
            <li>Para cumprir obrigações legais e proteger os direitos, a privacidade, a segurança ou a propriedade dos nossos utilizadores, da Asiaray ou de terceiros.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">3. Divulgação de Dados Pessoais</h2>
          <p className="mb-2">Não divulgaremos os seus Dados Pessoais:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Nenhum:</strong> Não divulgaremos os seus Dados Pessoas com terceiros.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">4. Retenção</h2>
          <p>
            Conservaremos os seus Dados Pessoais apenas durante o tempo necessário para lhe prestarmos os nossos Serviços comerciais legítimos, como a resolução de litígios, razões de segurança e proteção ou o cumprimento das nossas obrigações legais.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">5. Controlo de dados</h2>
          <p>
            Os nossos Serviços oferecem ao utilizador um conjunto de controlos sobre os respetivos Dados Pessoais e sobre a forma como são utilizados e retidos. O utilizador pode sempre gerir estas preferências nas definições da própria conta.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">6. Os seus direitos</h2>
          <p>
            Dependendo do local onde vives, podes ter determinados direitos legais em relação aos teus Dados Pessoais, como o direito de aceder, retificar, excluir, restringir ou transferir os teus Dados Pessoais. Podes enviar os teus pedidos para asiaraysasiarays188@gmail.com.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">7. Crianças</h2>
          <p>
            Os nossos serviços não são dirigidos nem se destinam a crianças com menos de 18 anos. Se tiver motivos para acreditar que uma criança com menos de 18 anos nos forneceu Dados Pessoais, envie-nos um e-mail para asiaraysasiarays188@gmail.com.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">8. Segurança</h2>
          <p>
            Implementamos medidas técnicas, administrativas e organizativas concebidas para proteger os Dados Pessoais contra perda, utilização indevida e acesso, divulgação ou alteração não autorizados.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">9. Alterações à política de privacidade</h2>
          <p>
            Poderemos atualizar esta política periodicamente. Quando o fizermos, publicaremos uma versão atualizada e a data de entrada em vigor nesta página.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">10. Controlador de dados</h2>
          <p>
            A Asiaray Angola e a Asiaray Group são as responsáveis pelo tratamento dos seus Dados Pessoais, tal como descrito na presente política.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">11. Como entrar em contacto connosco</h2>
          <p>
            Contacte o nosso apoio ao cliente oficial caso tenha dúvidas ou questões que não tenham sido abordadas na presente Política de Privacidade.
          </p>
        </div>
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
      const token = await getAccessToken();
      if (!token) throw new Error("No token");
      const resp = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ op: 512, data: {} })
      });
      const res = await resp.json();
      if (res.success && Array.isArray(res.result)) {
        const prods = res.result;
        const suggested = Array.from(new Set(prods.filter((p: any) => Number(p.price) > 0).map((p: any) => Number(p.price)))).sort((a: any, b: any) => a - b);
        setPolicies({
          min_recharge_kz: res.min_recharge_kz || 0,
          min_recharge_usdt: res.min_recharge_usdt || 0,
          max_recharge_kz: res.max_recharge_kz || 0,
          min_withdrawal_kz: res.min_withdrawal_kz || 0,
          withdrawal_fee_pct: res.withdrawal_fee_pct || 0,
          refund_days: res.refund_days || 0,
          refund_min_subordinates: res.refund_min_subordinates || 0,
          suggested_recharge_kz: suggested.length > 0 ? suggested : (res.suggested_recharge_kz || []),
          products: prods
        });
      } else {
        throw new Error(res.error || "Failed to load products from gateway");
      }
    } catch {
      // silent — policies unavailable
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ModalBase isOpen={isOpen} onClose={onClose} title="Políticas da Empresa">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-slate-200 border-t-blue-500"></div>
        </div>
      </ModalBase>
    );
  }

  const p = policies || {
    min_recharge_kz: 0,
    min_recharge_usdt: 0,
    max_recharge_kz: 0,
    min_withdrawal_kz: 0,
    withdrawal_fee_pct: 0,
    refund_days: 0,
    refund_min_subordinates: 0,
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
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Termos de Utilização Gerais</h1>
          <p className="mt-2">
            Estes Termos de Utilização aplicam-se ao seu uso da plataforma Asiaray, serviços WS e outras ferramentas da Asiaray para indivíduos, juntamente com quaisquer aplicações de software e websites associados (coletivamente, "Serviços"). Estes Termos constituem um acordo entre o utilizador e a Asiaray, e incluem os nossos Termos de Serviço e disposições importantes para a resolução de litígios através de arbitragem. Ao utilizar os nossos Serviços, o utilizador concorda com estes Termos.
          </p>
          <p className="mt-2">
            Os nossos Termos Comerciais regem a utilização dos nossos serviços WS. A nossa Política de Privacidade explica como recolhemos e utilizamos os dados pessoais. Embora não faça parte dos presentes Termos, é um documento importante que o utilizador deve ler.
          </p>
        </div>

        <hr className="border-neutral-200" />

        <div>
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Quem somos</h1>
          <p className="mt-2">
            A Asiaray Mídia Grupo, Lda é uma empresa de publicidade, gestão de espaços de mídia e soluções tecnológicas digitais. A nossa missão é garantir que os nossos serviços beneficiem a comunidade global através de sistemas estáveis de comissões, publicidade integrada e parcerias estratégicas.
          </p>
        </div>

        <hr className="border-neutral-200" />

        <div>
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Registo e Acesso</h1>
          <p className="mt-2">
            <strong>Idade mínima:</strong> O utilizador deve ter pelo menos 18 anos de idade ou a idade mínima exigida no seu país para consentir a utilização dos Serviços. Se o utilizador tiver menos de 18 anos, deve ter a autorização dos pais ou do tutor legal para utilizar os Serviços.
          </p>
          <p className="mt-2">
            <strong>Registo:</strong> O utilizador deve fornecer informações exatas e completas para se registar numa conta e utilizar os nossos Serviços. O utilizador não pode partilhar as credenciais da sua conta nem disponibilizá-las a terceiros e é responsável por todas as atividades que ocorram na sua conta. Se o utilizador criar uma conta ou utilizar os Serviços em nome de outra pessoa ou entidade, deve ter poderes para aceitar estes Termos em seu nome.
          </p>
        </div>

        <hr className="border-neutral-200" />

        <div>
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Utilização dos nossos Serviços</h1>
          <p className="mt-2">
            <strong>O que pode fazer:</strong> Sujeito à conformidade com estes Termos, o utilizador pode aceder e utilizar os nossos Serviços. Ao utilizar os nossos Serviços, o utilizador deve cumprir todas as leis aplicáveis, bem como qualquer outra documentação, diretrizes ou políticas que lhe disponibilizemos.
          </p>
          <p className="mt-2">
            <strong>O que não pode fazer:</strong> O utilizador não pode utilizar os nossos Serviços para qualquer atividade ilegal, prejudicial ou abusiva. Por exemplo, o utilizador não pode:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Utilizar os nossos Serviços de uma forma que infrinja, se aproprie indevidamente ou viole os direitos de alguém.</li>
            <li>Modificar, copiar, alugar, vender ou distribuir qualquer um dos nossos Serviços sem autorização expressa.</li>
            <li>Tentar ou ajudar alguém a fazer engenharia reversa, descompilar ou descobrir o código fonte ou componentes subjacentes dos nossos Serviços, incluindo os nossos modelos, algoritmos ou sistemas de processamento.</li>
            <li>Extrair automática ou programaticamente dados ou Resultados dos nossos sistemas.</li>
            <li>Interferir com ou perturbar os nossos Serviços, incluindo contornar quaisquer limites ou restrições de taxas ou contornar quaisquer medidas de proteção ou mitigações de segurança que colocamos nos nossos Serviços.</li>
            <li>Utilizar os nossos dados ou infraestrutura para desenvolver modelos que concorram com a Asiaray.</li>
          </ul>
          <p className="mt-2">
            <strong>Software:</strong> Os nossos Serviços podem permitir-lhe transferir software, como aplicações móveis (APK), que podem ser atualizadas automaticamente para garantir que está a utilizar a versão mais recente. O nosso software pode incluir software de código aberto regido pelas suas próprias licenças.
          </p>
          <p className="mt-2">
            <strong>Domínios empresariais:</strong> Se o utilizador criar uma conta utilizando um endereço de e-mail pertencente a uma organização (por exemplo, a sua entidade patronal), essa conta pode ser adicionada à conta empresarial que a organização tem connosco, caso em que o administrador poderá monitorizar e controlar a sua conta.
          </p>
          <p className="mt-2">
            <strong>Serviços de terceiros:</strong> Os nossos serviços podem incluir software, produtos ou serviços de terceiros ("Serviços de Terceiros") e algumas partes dos nossos Serviços podem incluir resultados desses serviços. Os Serviços de Terceiros e os Resultados de Terceiros estão sujeitos aos seus próprios termos e não somos responsáveis por eles.
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
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Conteúdo</h1>
          <p className="mt-2">
            <strong>O seu conteúdo:</strong> O utilizador pode fornecer dados aos Serviços ("Contribuições") e receber resultados dos Serviços com base nas Contribuições ("Resultados"). As Contribuições e os Resultados são coletivamente "Conteúdo". O utilizador é responsável pelo Conteúdo, incluindo a garantia de que este não viola qualquer lei aplicável ou estes Termos.
          </p>
          <p className="mt-2">
            <strong>Propriedade do conteúdo:</strong> Na medida do permitido pela lei aplicável, o utilizador mantém os seus direitos de propriedade sobre as Contribuições e é proprietário dos Resultados. Por meio destes Termos, cedemos ao utilizador todos os nossos direitos, títulos e interesses, se os houver, no e sobre os Resultados.
          </p>
          <p className="mt-2">
            <strong>Similaridade de conteúdo:</strong> Devido à natureza dos nossos Serviços e das redes de processamento de informações em geral, os resultados podem não ser únicos e outros utilizadores podem receber resultados semelhantes dos nossos Serviços.
          </p>
          <p className="mt-2">
            <strong>A nossa utilização do conteúdo:</strong> Podemos utilizar o Conteúdo para fornecer, manter, desenvolver e melhorar os nossos Serviços, cumprir a legislação aplicável, aplicar os nossos termos e políticas e manter os nossos Serviços seguros.
          </p>
          <p className="mt-2">
            <strong>Exatidão:</strong> A tecnologia e os sistemas de transações digitais são campos em constante evolução. Dada a natureza probabilística e operacional, a utilização dos nossos Serviços pode, em algumas situações específicas de rede, resultar em atrasos ou Resultados que não refletem de imediato as operações. O utilizador deve avaliar a exatidão e adequação dos Resultados para o seu caso de utilização antes de partilhar informações no suporte ou nas redes da empresa.
          </p>
        </div>

        <hr className="border-neutral-200" />

        <div>
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Política de Reembolso Programado</h1>
          <p className="mt-2">
            A Asiaray poderá disponibilizar programas internos de reembolso promocional ou retorno programado, sujeitos ao cumprimento integral das condições estabelecidas pela empresa.
          </p>
          <p className="mt-2">
            O reembolso do valor investido poderá ocorrer após um período mínimo de até <strong>210 dias corridos</strong>, desde que:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>a conta permaneça ativa e regular;</li>
            <li>não existam violações das políticas internas;</li>
            <li>o utilizador mantenha os requisitos operacionais definidos pela empresa;</li>
            <li>a equipa vinculada atinjiu 100 subordinados vips os critérios mínimos de atividade exigidos, incluindo o número mínimo de investidores ativos.</li>
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
            <li><strong>Depósito mínimo:</strong> 8000 AOA (Kwanzas);</li>
            <li><strong>Depósito máximo:</strong> 3.000.000 AOA (Kwanzas).</li>
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
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Contas Pagas e Faturação</h1>
          <p className="mt-2">
            <strong>Faturação:</strong> Se o utilizador adquirir quaisquer Serviços pagando pela ativação de pacotes WS, fornecerá informações de transações completas e precisas, incluindo um método de pagamento válido. O utilizador é responsável por todos os custos bancários e processamento. Se o pagamento não puder ser verificado, poderemos suspender o seu acesso aos nossos Serviços até que a validação seja concluída.
          </p>
          <p className="mt-2">
            <strong>Cancelamento:</strong> O utilizador pode optar por desativar o plano ou deixar de efetuar tarefas a qualquer momento. Os valores aplicados para ativação de planos não são reembolsáveis, exceto de acordo com a nossa Política de Reembolso Programado ou quando exigido por lei.
          </p>
          <p className="mt-2">
            <strong>Alterações:</strong> Podemos alterar os preços e rendimentos dos nossos pacotes WS ocasionalmente. Se alterarmos as taxas das nossas subscrições ou pacotes, avisaremos o utilizador através da nossa aplicação ou canais oficiais.
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
            <li><strong>Valor mínimo por retirada:</strong> 2000 AOA (Kwanzas);</li>
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
            As retiradas realizadas pelos utilizadores estão sujeitas a uma taxa operacional de 50% sobre o valor solicitado.
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
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Cessação e Suspensão</h1>
          <p className="mt-2">
            <strong>Cessação:</strong> O utilizador é livre de deixar de utilizar os nossos Serviços em qualquer altura. Reservamo-nos o direito de suspender ou terminar o seu acesso aos nossos Serviços ou de desativar a sua conta se determinarmos que:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>O utilizador violou estes Termos ou as nossas Diretrizes de Utilização.</li>
            <li>Temos de o fazer para cumprir a lei.</li>
            <li>A sua utilização dos nossos Serviços pode causar riscos ou danos à Asiaray, aos nossos utilizadores ou a qualquer outra pessoa.</li>
          </ul>
          <p className="mt-2">
            <strong>Interrupção dos Serviços:</strong> Podemos decidir descontinuar ou suspender temporariamente os nossos Serviços por motivos de atualização do sistema ou manutenção técnica, garantindo a aviso prévio sempre que possível.
          </p>
        </div>

        <hr className="border-neutral-200" />

        <div>
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Exclusão de Garantias</h1>
          <p className="mt-2 uppercase font-semibold text-neutral-700">
            Os nossos serviços são fornecidos "tal como estão". Exceto na medida em que seja proibido por lei, nós e as nossas empresas associadas não damos quaisquer garantias (expressas, implícitas ou estatutárias) relativamente aos serviços e exoneramo-nos de todas as garantias, incluindo garantias de comercialização, adequação a um determinado fim, qualidade satisfatória ou segurança das operações contra interrupções. O utilizador aceita que qualquer utilização dos nossos serviços é feita por sua conta e risco.
          </p>
        </div>

        <hr className="border-neutral-200" />

        <div>
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Limitação da Responsabilidade</h1>
          <p className="mt-2 uppercase font-semibold text-neutral-700">
            Nem nós nem nenhuma das nossas afiliadas ou parceiros será responsável por quaisquer danos indiretos, acidentais ou consequenciais, incluindo danos por perda de lucros, interrupção de negócios ou perda de dados. A nossa responsabilidade agregada ao abrigo destes termos não excederá o maior valor entre o montante pago pelo utilizador pelo serviço que deu origem à reclamação durante os 12 meses anteriores ou cem dólares ($100).
          </p>
        </div>

        <hr className="border-neutral-200" />

        <div>
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Resolução de Litígios</h1>
          <p className="mt-2">
            <strong>Arbitragem Obrigatória:</strong> O utilizador e a Asiaray concordam em resolver quaisquer reclamações decorrentes ou relacionadas com estes Termos ou com os nossos Serviços através de arbitragem final e vinculativa perante um árbitro neutro.
          </p>
          <p className="mt-2">
            <strong>Resolução amigável de litígios:</strong> Gostaríamos de compreender e tentar resolver as suas preocupações antes de uma ação judicial formal. Antes de apresentar uma reclamação formal, ambos concordamos em tentar resolver o litígio de forma amigável no prazo de 60 dias através de negociação direta ou canais de apoio oficiais.
          </p>
          <p className="mt-2">
            <strong>Renúncia a Ações Coletivas:</strong> O utilizador e a Asiaray concordam que os litígios devem ser apresentados apenas numa base individual e não podem ser apresentados como queixosos ou membros de um grupo em qualquer ação coletiva ou representativa.
          </p>
        </div>

        <hr className="border-neutral-200" />

        <div>
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Reclamações sobre Propriedade Intelectual</h1>
          <p className="mt-2">
            Se considerar que os seus direitos de propriedade intelectual foram violados, envie uma notificação por escrito para a administração ou canais de apoio do grupo Asiaray para que possamos analisar e remover conteúdos infratores de imediato.
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
        </div>

        <hr className="border-neutral-200" />

        <div>
          <h1 className="font-extrabold text-neutral-800 text-sm mb-1">Condições Gerais</h1>
          <p className="mt-2">
            <strong>Cessão:</strong> O utilizador não pode ceder ou transferir quaisquer direitos ou obrigações ao abrigo dos presentes Termos. Nós podemos transferir os nossos direitos ou obrigações a qualquer sucessor ou empresa associada ao nosso grupo operacional.
          </p>
          <p className="mt-2">
            <strong>Alterações a estes Termos:</strong> Estamos a trabalhar continuamente para desenvolver e melhorar os nossos Serviços. Poderemos atualizar estes Termos ou os nossos Serviços em conformidade. Se as alterações tiverem um impacto adverso substancial, notificá-lo-emos com antecedência. A utilização continuada dos Serviços significa a aceitação dos novos termos.
          </p>
          <p className="mt-2">
            <strong>Acordo integral:</strong> Estes termos contêm o acordo integral entre o utilizador e a Asiaray relativamente à utilização da plataforma e substituem quaisquer acordos anteriores.
          </p>
          <p className="mt-2">
            <strong>Lei aplicável:</strong> A lei da República de Angola e/ou a lei local da sede do grupo regerá estes Termos, com exceção de conflitos de leis.
          </p>
          
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
      } catch {
        // silent — week data unavailable
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
  const [userIban, setUserIban] = useState<string>('');

  // Fetch real IBAN from bnking_saques to decrypt fallback
  useEffect(() => {
    if (isOpen && type === 'retirada' && user?.id) {
      const getRealIban = async () => {
        try {
          const { data, error } = await supabase
            .from('bnking_saques')
            .select('iban')
            .eq('user_id', user.id)
            .maybeSingle();
          if (data?.iban) {
            setUserIban(data.iban);
          }
        } catch (e) {
          // silent fallback
        }
      };
      getRealIban();
    }
  }, [isOpen, type, user?.id]);

  // Fetch withdrawal records when modal opens for retirada
  useEffect(() => {
    if (isOpen && type === 'retirada') {
      setLoading(true);
      fetchWithdrawalRecords()
        .then((data) => {
          // Expected shape: array of records matching LogRecord fields
          const mappedLogs = data.map((rec: any) => ({
            id: rec.id || 'ret_' + String(Math.floor(10000 + Math.random() * 90000)),
            type: 'retirada',
            currency: 'KZ',
            amount: Number(rec.amount || rec.valor_solicitado || 0),
            date: rec.created_at ? new Date(rec.created_at).toISOString().replace('T', ' ').slice(0, 16) : new Date().toISOString().replace('T', ' ').slice(0, 16),
            status: rec.status?.toLowerCase().includes('pendente') || rec.status?.toLowerCase().includes('processando') ? 'pendente' : (rec.status?.toLowerCase() === 'rejeitado' ? 'rejeitado' : 'aprovado'),
            bank_name: rec.bank_name,
            iban: rec.iban
          }));
          setWithdrawalLogs(mappedLogs as LogRecord[]);
        })
        .catch(() => {
          // silent — withdrawal records unavailable
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
        } catch {
          // silent — receita data unavailable
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
        } catch {
          // silent — deposit records unavailable
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


  if (type === 'retirada' || type === 'recarga') {
    const selectedLog = filtered.find(l => l.id === selectedLogId);

    const handleBackClick = () => {
      if (selectedLogId) {
        setSelectedLogId(null);
      } else {
        onClose();
      }
    };

    const headerTitle = type === 'retirada' ? 'Registo de retirada' : 'Registo de recargas';
    const modalId = type === 'retirada' ? 'retirada-modal-fullscreen' : 'recarga-modal-fullscreen';
    const backArrowId = type === 'retirada' ? 'retirada-back-arrow' : 'recarga-back-arrow';

    return (
      <div className="fixed inset-0 bg-[#f5f5f5] flex flex-col z-[50] animate-fadeIn font-sans" id={modalId}>
        {/* Header with back button and Title on neutral slate-gray background */}
        <div className="bg-[#cbd5e1]/45 px-4 py-3 border-b border-neutral-200 flex items-center relative select-none shrink-0" style={{ height: '48px' }}>
          <button 
            id={backArrowId}
            onClick={handleBackClick}
            className="p-1 text-neutral-600 hover:text-neutral-900 bg-transparent hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer flex items-center z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px] stroke-neutral-700" fill="none" viewBox="0 0 24 24" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="absolute inset-x-0 mx-auto w-max text-center font-bold text-neutral-800 text-[15px] tracking-wide select-none">
            {headerTitle}
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
                  description={`Nenhum registo de ${type === 'retirada' ? 'retirada' : 'recarga'} localizado no momento.`}
                />
              </div>
            ) : (
              /* LIST VIEW: Exact mockup match */
              <div className="divide-y divide-neutral-100">
                {filtered.map((log) => {
                  // Generate a stable numeric orderId based on log ID
                  const orderId = log.id === 'ret_default' ? '260' : 
                    (Math.abs(log.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % 900 + 100);
                  
                  const dateOnly = log.date ? log.date.split(' ')[0] : 'N/A';
                  const currencySymbol = log.currency === 'USDT' ? 'USDT' : 'KZ';
                  const labelType = log.type === 'retirada' ? 'Pedido' : 'Recarga';

                  return (
                    <div 
                      key={log.id} 
                      onClick={() => setSelectedLogId(log.id)}
                      className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
                    >
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-[12px] text-neutral-400">ID da encomenda: {orderId}</span>
                        <span className="text-[14px] font-bold text-neutral-800">{labelType} {log.amount.toFixed(2)} {currencySymbol}</span>
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
              const isRetirada = selectedLog.type === 'retirada';
              
              // Formatting bank initials or channel name
              let bankDisplay = isRetirada ? (selectedLog.bank_name || 'N/A') : (selectedLog.details || 'Depósito');
              if (isRetirada && bankDisplay && bankDisplay !== 'N/A') {
                const match = bankDisplay.match(/^([A-Za-z0-9]+)/);
                if (match) {
                  bankDisplay = match[1].toUpperCase();
                }
              }

              // Mask IBAN: if encrypted (long base64 string), detect and show masked version
              const maskIban = (raw: string): string => {
                const cleaned = raw ? raw.replace(/\s+/g, '') : '';
                // Detect encrypted string: too long (>34 chars) or contains base64 chars like +/=
                const isEncrypted = cleaned.length > 34 || /[+/=]/.test(cleaned);
                
                let displayIban = cleaned;
                if (isEncrypted) {
                  const plainFallback = userIban || user?.bankAccount || '';
                  const cleanFallback = plainFallback.replace(/\s+/g, '');
                  const fallbackEncrypted = cleanFallback.length > 34 || /[+/=]/.test(cleanFallback);
                  if (cleanFallback && !fallbackEncrypted) {
                    displayIban = cleanFallback;
                  } else {
                    return '•••• ••••• ••••';
                  }
                }

                if (!displayIban) return 'N/A';
                if (displayIban.length <= 8) return displayIban;

                // Out of 21 digits, mask 12 numbers in the middle (5 visible at start, 4 visible at end)
                if (displayIban.startsWith('AO') && displayIban.length >= 25) {
                  const first = displayIban.slice(0, 9);
                  const last = displayIban.slice(-4);
                  return `${first}••••••••••••${last}`;
                } else if (displayIban.length >= 21) {
                  const first = displayIban.slice(0, 5);
                  const last = displayIban.slice(-4);
                  return `${first}••••••••••••${last}`;
                }

                // Standard masking fallback for shorter strings
                const visibleStart = Math.ceil(displayIban.length / 3);
                const visibleEnd = Math.floor(displayIban.length / 4);
                const startStr = displayIban.slice(0, visibleStart);
                const endStr = displayIban.slice(-visibleEnd);
                return `${startStr}••••${endStr}`;
              };

              // Normalise the account display
              const acctDisplay = maskIban(selectedLog.iban || '');

              const dateOnly = selectedLog.date ? selectedLog.date.split(' ')[0] : 'N/A';

              return (
                <div className="bg-white px-5 pt-5 pb-8 animate-fadeIn" id={`${selectedLog.type}_record_wrapper_${selectedLog.id}`}>
                  
                  {/* Row 1: Retirada / Recarga do saldo | Date */}
                  <div className="flex justify-between items-center py-3.5">
                    <span className="text-neutral-500 text-sm select-none font-medium">
                      {isRetirada ? 'Retirada do saldo' : 'Recarga do saldo'}
                    </span>
                    <span className="text-neutral-400 font-mono text-sm select-none">{dateOnly}</span>
                  </div>
                  <div className="border-t border-neutral-100 w-full"></div>

                  {/* Row 2: Banco beneficiário / Canal de depósito | Initials */}
                  <div className="flex justify-between items-center py-3.5">
                    <span className="text-neutral-500 text-sm select-none font-medium">
                      {isRetirada ? 'Banco beneficiário' : 'Canal de depósito'}
                    </span>
                    <span className="text-neutral-400 font-sans tracking-wide font-medium text-sm select-none">{bankDisplay}</span>
                  </div>
                  <div className="border-t border-neutral-100 w-full"></div>

                  {/* Row 3: Conta bancária (Only for Retirada) */}
                  {isRetirada && (
                    <>
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
                    </>
                  )}

                  {/* Row 4: Montante label and large flat text value */}
                  <div className="pt-5 pb-2 space-y-1">
                    <span className="text-[12px] text-neutral-400 select-none block font-semibold uppercase tracking-wider">Montante</span>
                    <div className="text-3xl font-display font-extrabold text-neutral-900 tracking-wide select-all">
                      {selectedLog.currency === 'USDT' ? 'USDT ' : 'KZ '}
                      {selectedLog.amount.toFixed(2)}
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
