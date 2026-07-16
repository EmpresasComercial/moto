import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Copy, Check, QrCode, ClipboardList, Wallet, Sparkles, Building, Landmark, Users, ArrowUpRight, ArrowDownLeft, ShieldCheck, Heart } from 'lucide-react';
import { LogRecord } from '../types';
import { EmptyState } from './EmptyState';
import { supabase, gatewayCall } from '../lib/supabase';

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
              try {
                const res = await gatewayCall(512, {});
                if (res?.success && Array.isArray(res.result)) {
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
                  setPolicies({ suggested_recharge_kz: [] });
                }
              } catch {
                setPolicies({ suggested_recharge_kz: [] });
              }
          })();

          const banksPromise = (async () => {
            try {
              const res = await gatewayCall(207, {});
              if (res?.success && Array.isArray(res.result)) {
                setDbBanks(res.result);
              }
            } catch {
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

      const res = await gatewayCall(opCode, payload);
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
                      return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${suffix}`;
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

        try {
          const data = await gatewayCall(901, {});
          if (data?.success && data.result?.dominio_publicidad) {
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

        try {
          const data = await gatewayCall(801, {});
          if (data?.success) {
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

  const levelUm = rawTeam.filter((m: any) => Number(m.level) === 1).map(mapMember);
  const secundario = rawTeam.filter((m: any) => Number(m.level) === 2).map(mapMember);
  const nivelTres = rawTeam.filter((m: any) => Number(m.level) === 3).map(mapMember);

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
            className={`flex-1 py-3 text-center text-[12px] font-bold transition-all relative ${activeTab === 'nivel_um' ? 'text-[#d24c3c]' : 'text-neutral-500'
              }`}
          >
            nível um ({levelUm.length})
            {activeTab === 'nivel_um' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d24c3c]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('secundario')}
            className={`flex-1 py-3 text-center text-[12px] font-bold transition-all relative ${activeTab === 'secundario' ? 'text-[#d24c3c]' : 'text-neutral-500'
              }`}
          >
            secundário ({secundario.length})
            {activeTab === 'secundario' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d24c3c]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('nivel_tres')}
            className={`flex-1 py-3 text-center text-[12px] font-bold transition-all relative ${activeTab === 'nivel_tres' ? 'text-[#d24c3c]' : 'text-neutral-500'
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

// 6. RULES / "PERGUNTAS FREQUENTES" MODAL
const FaqItem: React.FC<{ question: string; answer: React.ReactNode }> = ({ question, answer }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="bg-white border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <span className="text-[13px] font-normal text-[#2d3748] pr-2 flex-1">{question}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-neutral-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 text-[12px] text-neutral-600 leading-relaxed bg-[#f7f8fa]">
          {answer}
        </div>
      )}
    </div>
  );
};

const FaqSection: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-[#edf2f7] px-4 py-2 border-b border-gray-100">
    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">{title}</span>
  </div>
);

// ─── Helper: highlight numbers in blue ────────────────────────────────────────
const hn = (text: string): React.ReactNode => {
  const parts = text.split(/(\d[\d.,:/]*(?:\s*(?:Kz|h\d{2}|%))?|\d+(?:\/\d+)+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\d/.test(part)
          ? <span key={i} className="text-[#2563eb] font-semibold">{part}</span>
          : part
      )}
    </>
  );
};

// ─── FAQ DATA ─────────────────────────────────────────────────────────────────
const faqData: { section: string; question: string; answerText: string; answerNode: React.ReactNode }[] = [
  // Sobre retiradas
  { section: 'Sobre retiradas', question: 'Qual é o valor mínimo para realizar uma retirada?', answerText: 'O valor mínimo permitido para retirada é de 2.000 Kz.', answerNode: <p>O valor mínimo permitido para retirada é de {hn('2.000 Kz')}.</p> },
  { section: 'Sobre retiradas', question: 'Qual é o valor máximo permitido para retirada?', answerText: 'O valor máximo de retirada é de 100.000 Kz.', answerNode: <p>O valor máximo de retirada é de {hn('100.000 Kz')}.</p> },
  { section: 'Sobre retiradas', question: 'Qual é o horário disponível para realizar retiradas?', answerText: 'As retiradas são processadas diariamente das 10h00 às 16h00 (horário de Angola).', answerNode: <p>As retiradas são processadas diariamente das {hn('10h00')} às {hn('16h00')} (horário de Angola).</p> },
  { section: 'Sobre retiradas', question: 'O que é necessário para realizar uma retirada?', answerText: 'Para efetuar uma retirada, o utilizador deve possuir uma compra pelo menos de um WS1 e ativo, uma conta bancária gravada e PIN de retirada gravada.', answerNode: <p>Para efetuar uma retirada, o utilizador deve possuir uma compra pelo menos de um {hn('WS1')} e ativo, uma conta bancária gravada e PIN de retirada gravada.</p> },
  { section: 'Sobre retiradas', question: 'Existe alguma taxa aplicada nas retiradas?', answerText: 'Sim. Cada retirada possui uma taxa de 50%. O utilizador recebe 50% do valor solicitado, enquanto os outros 50% são destinados à cobertura de taxas operacionais e manutenção da estabilidade do projeto.', answerNode: <p>Sim. Cada retirada possui uma taxa de {hn('50%')}. O utilizador recebe {hn('50%')} do valor solicitado, enquanto os outros {hn('50%')} são destinados à cobertura de taxas operacionais e manutenção da estabilidade do projeto.</p> },
  { section: 'Sobre retiradas', question: 'Quanto tempo demora uma retirada?', answerText: 'Cada retirada passa por três etapas: Pendente, Transformação, Sucesso. Caso a retirada não seja concluída dentro de 0 - 72 horas, contacte o suporte.', answerNode: <><p className="mb-2">Cada retirada passa por três etapas:</p><ol className="list-decimal pl-4 space-y-1"><li>Pendente – solicitação recebida e em análise;</li><li>Transformação – transferência em andamento;</li><li>Sucesso – retirada concluída.</li></ol><p className="mt-2">Caso a retirada não seja concluída dentro de {hn('0')} - {hn('72')} horas, contacte o suporte.</p></> },
  { section: 'Sobre retiradas', question: 'O que acontece se uma retirada for rejeitada?', answerText: 'O valor será automaticamente devolvido à conta do utilizador, aplicando-se uma taxa de 4% sobre o valor devolvido.', answerNode: <p>O valor será automaticamente devolvido à conta do utilizador, aplicando-se uma taxa de {hn('4%')} sobre o valor devolvido.</p> },
  { section: 'Sobre retiradas', question: 'A empresa responsabiliza-se por transferências para contas erradas?', answerText: 'Não. A empresa não se responsabiliza pela perda de fundos enviados para contas incorretas. É responsabilidade do utilizador confirmar corretamente os dados antes de concluir uma operação.', answerNode: <p>Não. A empresa não se responsabiliza pela perda de fundos enviados para contas incorretas. É responsabilidade do utilizador confirmar corretamente os dados antes de concluir uma operação.</p> },
  // Sobre recargas e depósitos
  { section: 'Sobre recargas e depósitos', question: 'Qual é o horário para realizar recargas?', answerText: 'As recargas são realizadas diariamente das 10h00 às 22h00 (horário de Angola).', answerNode: <p>As recargas são realizadas diariamente das {hn('10h00')} às {hn('22h00')} (horário de Angola).</p> },
  { section: 'Sobre recargas e depósitos', question: 'Como enviar o comprovativo de pagamento?', answerText: 'Após efetuar o pagamento, envie o comprovativo ao gerente responsável através do WhatsApp para validação.', answerNode: <p>Após efetuar o pagamento, envie o comprovativo ao gerente responsável através do WhatsApp para validação.</p> },
  { section: 'Sobre recargas e depósitos', question: 'Quais métodos de depósito são aceites?', answerText: 'Criptomoedas - USDT. Depósitos em conta bancária - Kwanzas.', answerNode: <ul className="list-disc pl-4 space-y-1"><li>Criptomoedas - USDT</li><li>Depósitos em conta bancária - Kwanzas</li></ul> },
  { section: 'Sobre recargas e depósitos', question: 'Qual é o valor mínimo de depósito?', answerText: 'O valor mínimo de depósito para USDT ou AOA é de 8.000 Kz.', answerNode: <p>O valor mínimo de depósito para USDT ou AOA é de {hn('8.000 Kz')}.</p> },
  { section: 'Sobre recargas e depósitos', question: 'Qual é o valor máximo de depósito?', answerText: 'O valor máximo permitido para depósito para USDT ou AOA é de 3.000.000 Kz.', answerNode: <p>O valor máximo permitido para depósito para USDT ou AOA é de {hn('3.000.000 Kz')}.</p> },
  // Sobre a equipa e convites
  { section: 'Sobre a equipa e convites', question: 'Como funciona o sistema de equipa?', answerText: 'Ao convidar novos utilizadores através do seu link exclusivo, constrói uma equipa em três níveis: Primeiro nível, Segundo nível, Terceiro nível.', answerNode: <><p className="mb-2">Ao convidar novos utilizadores através do seu link exclusivo, constrói uma equipa em três níveis:</p><ul className="list-disc pl-4 space-y-1"><li>Primeiro nível</li><li>Segundo nível</li><li>Terceiro nível</li></ul></> },
  { section: 'Sobre a equipa e convites', question: 'Qual é a recompensa por convidar novos utilizadores?', answerText: 'Recebe 25Kz por cadastro direto bem-sucedido. Válido para os primeiros 10 cadastros diretos.', answerNode: <><p>Recebe {hn('25Kz')} por cadastro direto bem-sucedido.</p><p className="mt-1">Válido para os primeiros {hn('10')} cadastros diretos.</p></> },
  { section: 'Sobre a equipa e convites', question: 'Como funcionam as recompensas dos três níveis?', answerText: '1.º nível: 10% sobre os investimentos dos subordinados diretos. 2.º nível: 5% sobre os investimentos deste nível. 3.º nível: 2% sobre os investimentos deste nível.', answerNode: <ul className="list-disc pl-4 space-y-1"><li>{hn('1')}.º nível: {hn('10%')} sobre os investimentos dos subordinados diretos.</li><li>{hn('2')}.º nível: {hn('5%')} sobre os investimentos deste nível.</li><li>{hn('3')}.º nível: {hn('2%')} sobre os investimentos deste nível.</li></ul> },
  // Sobre compras de WS
  { section: 'Sobre compras de WS', question: 'Preciso comprar os produtos numa ordem específica?', answerText: 'Não. Pode adquirir qualquer WS disponível, independentemente de já ter comprado outros anteriormente.', answerNode: <p>Não. Pode adquirir qualquer WS disponível, independentemente de já ter comprado outros anteriormente.</p> },
  { section: 'Sobre compras de WS', question: 'Quantas vezes posso comprar o mesmo produto?', answerText: 'Cada produto só pode ser adquirido uma vez por utilizador.', answerNode: <p>Cada produto só pode ser adquirido uma vez por utilizador.</p> },
  { section: 'Sobre compras de WS', question: 'Como funciona o rendimento dos WS?', answerText: 'Os lucros gerados pelos produtos WS são creditados automaticamente na sua conta todos os dias (a cada 24 horas após a compra), não sendo necessário esperar que o prazo de validade termine para ver o seu saldo aumentar.', answerNode: <p>Os lucros gerados pelos produtos WS são creditados automaticamente na sua conta todos os dias (a cada {hn('24')} horas após a compra), não sendo necessário esperar que o prazo de validade termine para ver o seu saldo aumentar.</p> },
  { section: 'Sobre compras de WS', question: 'É possível cancelar a compra de um WS e receber o valor de volta?', answerText: 'Não. Uma vez confirmada a aquisição de um WS, a transação torna-se irreversível e o valor não poderá ser reembolsado. Pedimos que tenha a certeza da compra antes de prosseguir.', answerNode: <p>Não. Uma vez confirmada a aquisição de um WS, a transação torna-se irreversível e o valor não poderá ser reembolsado. Pedimos que tenha a certeza da compra antes de prosseguir.</p> },
  { section: 'Sobre compras de WS', question: 'O que acontece após o WS expirar?', answerText: 'Após a expiração, pode adquirir outro WS para continuar a participar e receber os respetivos benefícios.', answerNode: <p>Após a expiração, pode adquirir outro WS para continuar a participar e receber os respetivos benefícios.</p> },
  // Sobre suporte
  { section: 'Sobre suporte', question: 'Como entrar em contacto com o suporte?', answerText: 'Na aplicação: Definições → Suporte → Contactar. Na página de login: clicar em Entrar pelo WhatsApp.', answerNode: <ol className="list-decimal pl-4 space-y-1"><li>Na aplicação: Definições → Suporte → Contactar.</li><li>Na página de login: clicar em Entrar pelo WhatsApp.</li></ol> },
  // Sobre a empresa
  { section: 'Sobre a empresa', question: 'Quando a empresa foi lançada?', answerText: 'A empresa Asiaray Group Midia, Lda, em Angola foi lançada aos 01/07/2026.', answerNode: <p>A empresa Asiaray Group Midia, Lda, em Angola foi lançada aos {hn('01/07/2026')}.</p> },
  // Outras dúvidas
  { section: 'Outras dúvidas', question: 'Esqueci-me da minha senha ou PIN. Como posso recuperar?', answerText: 'Para recuperar a sua senha ou o PIN de pagamento, deve entrar em contacto direto com o nosso suporte através do WhatsApp. O nosso atendimento irá orientar no processo seguro de recuperação.', answerNode: <p>Para recuperar a sua senha ou o PIN de pagamento, deve entrar em contacto direto com o nosso suporte através do WhatsApp. O nosso atendimento irá orientar no processo seguro de recuperação.</p> },
  { section: 'Outras dúvidas', question: 'Posso criar mais do que uma conta no mesmo telemóvel?', answerText: 'Não. É estritamente proibido criar múltiplas contas utilizando o mesmo dispositivo. A violação desta regra resulta no bloqueio imediato de todas as contas envolvidas e no congelamento dos fundos.', answerNode: <p>Não. É estritamente proibido criar múltiplas contas utilizando o mesmo dispositivo. A violação desta regra resulta no bloqueio imediato de todas as contas envolvidas e no congelamento dos fundos.</p> },
  { section: 'Outras dúvidas', question: 'Posso associar a mesma conta bancária ou USDT a mais de um perfil Asiaray?', answerText: 'Não é possível. Para garantir a segurança de todos e evitar fraudes, cada conta bancária ou carteira USDT só pode ser vinculada a um único perfil de utilizador na nossa plataforma.', answerNode: <p>Não é possível. Para garantir a segurança de todos e evitar fraudes, cada conta bancária ou carteira USDT só pode ser vinculada a um único perfil de utilizador na nossa plataforma.</p> },
  { section: 'Outras dúvidas', question: 'Existem outras formas de ganhar dinheiro além de convidar e comprar WS?', answerText: 'Sim! Além de convidar novos membros e adquirir produtos WS, poderá participar em eventos, receber bónus diários ou de check-in, completar tarefas da plataforma e resgatar códigos promocionais (Cupons) disponibilizados pela empresa no canal oficial.', answerNode: <p>Sim! Além de convidar novos membros e adquirir produtos WS, poderá participar em eventos, receber bónus diários ou de check-in, completar tarefas da plataforma e resgatar códigos promocionais (Cupons) disponibilizados pela empresa no canal oficial.</p> },
  { section: 'Outras dúvidas', question: 'Preciso obrigatoriamente começar pelo primeiro WS?', answerText: 'Não. Pode escolher qualquer WS disponível conforme a sua preferência.', answerNode: <p>Não. Pode escolher qualquer WS disponível conforme a sua preferência.</p> },
  { section: 'Outras dúvidas', question: 'Posso continuar a utilizar a plataforma depois que um WS expirar?', answerText: 'Sim. Após a expiração, adquira um novo WS para continuar a utilizar os serviços.', answerNode: <p>Sim. Após a expiração, adquira um novo WS para continuar a utilizar os serviços.</p> },
];

export const RulesModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const { setIsFullScreenActive } = useApp();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [showNoResultsModal, setShowNoResultsModal] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) setIsFullScreenActive(true);
    return () => setIsFullScreenActive(false);
  }, [isOpen, setIsFullScreenActive]);

  // Focus input when search opens
  React.useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Derived: filtered FAQ items
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredItems = normalizedQuery.length < 2
    ? null
    : faqData.filter(item =>
      item.question.toLowerCase().includes(normalizedQuery) ||
      item.answerText.toLowerCase().includes(normalizedQuery)
    );

  // When filter has results=0, show WhatsApp modal
  React.useEffect(() => {
    if (filteredItems !== null && filteredItems.length === 0) {
      setShowNoResultsModal(true);
    } else {
      setShowNoResultsModal(false);
    }
  }, [filteredItems]);

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    setSearchQuery('');
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setShowNoResultsModal(false);
  };

  // Group items by section (only used when not searching)
  const sections = Array.from(new Set(faqData.map(item => item.section)));

  return (
    <div className="fixed inset-0 z-[50] flex flex-col font-sans animate-fadeIn bg-[#f4f6f9]">
      {/* Header */}
      <div className="bg-white flex items-center px-2 py-3 border-b border-neutral-200 select-none">
        <button
          type="button"
          onClick={isSearchOpen ? handleCloseSearch : onClose}
          className="w-10 h-10 flex items-center justify-center text-[#475569] active:bg-gray-100 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Title or Search Input */}
        <div className="flex-1 flex items-center">
          {isSearchOpen ? (
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pesquisar pergunta ou palavra-chave..."
              className="flex-1 text-[14px] text-neutral-800 bg-transparent outline-none placeholder:text-neutral-400 px-1"
            />
          ) : (
            <div className="flex-1 text-center pr-10 text-[17px] font-normal text-[#111827]">
              Perguntas Frequentes
            </div>
          )}
        </div>

        {/* Search icon / Close X */}
        {isSearchOpen ? (
          <button
            type="button"
            onClick={handleCloseSearch}
            className="w-10 h-10 flex items-center justify-center text-[#475569] active:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleOpenSearch}
            className="w-10 h-10 flex items-center justify-center text-[#475569] active:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto pb-10 select-text">

        {/* SEARCH RESULTS MODE */}
        {filteredItems !== null ? (
          <div className="bg-white mt-3">
            <div className="bg-[#edf2f7] px-4 py-2 border-b border-gray-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                {filteredItems.length} resultado{filteredItems.length !== 1 ? 's' : ''} encontrado{filteredItems.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-col">
              {filteredItems.map((item, idx) => (
                <FaqItem key={idx} question={item.question} answer={item.answerNode} />
              ))}
            </div>
          </div>
        ) : (
          /* NORMAL MODE — grouped by section */
          sections.map(section => (
            <div key={section} className="bg-white mt-3">
              <FaqSection title={section} />
              <div className="flex flex-col">
                {faqData.filter(item => item.section === section).map((item, idx) => (
                  <FaqItem key={idx} question={item.question} answer={item.answerNode} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* No Results WhatsApp Modal */}
      {showNoResultsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => { setShowNoResultsModal(false); handleCloseSearch(); }}
          />
          <div className="relative z-10 bg-white rounded-2xl w-full max-w-[270px] overflow-hidden flex flex-col shadow-xl border border-neutral-100/50 animate-scaleIn">
            <div className="px-5 py-6 text-center">
              <p className="text-[14px] font-bold text-neutral-800 leading-snug mb-1">
                Não encontrámos a sua resposta.
              </p>
              <p className="text-[12px] text-neutral-500 leading-snug">
                Entre no grupo de WhatsApp do <span className="text-[#2563eb] font-semibold">grupo de venda</span> para obter ajuda do suporte.
              </p>
            </div>
            <div className="border-t border-neutral-100 flex">
              <button
                type="button"
                onClick={() => { setShowNoResultsModal(false); handleCloseSearch(); }}
                className="flex-1 py-3 text-[14px] font-normal text-neutral-500 hover:bg-neutral-50 active:bg-neutral-100 border-r border-neutral-100 focus:outline-none transition-colors cursor-pointer"
              >
                Entendi
              </button>
              <a
                href="https://chat.whatsapp.com/KuvqmnwRitGIJi5PsYqt4W"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 text-[14px] font-bold text-[#2563eb] hover:bg-neutral-50 active:bg-neutral-100 focus:outline-none transition-colors cursor-pointer text-center"
              >
                Ir para WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 7. DECLARAÇÃO DIÁRIA MODAL (Real data from get_weekly_income via gateway op 802)
// 7. PRIVACY MODAL
export const PrivacyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Política de Privacidade">
      <div className="space-y-6 text-xs text-neutral-600 leading-relaxed font-sans pb-6 select-text">
        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">1. Introdução</h2>
          <p className="mb-2">Na Asiaray, respeitamos a privacidade dos nossos utilizadores e comprometemo-nos a proteger todas as informações pessoais que nos sejam confiadas. A presente Política de Privacidade explica de forma clara como recolhemos, utilizamos, armazenamos, protegemos e tratamos os Dados Pessoais dos utilizadores que utilizam os nossos serviços, aplicações, websites e demais plataformas digitais (coletivamente designados por "Serviços").</p>
          <p className="mb-2">A nossa missão é disponibilizar uma plataforma segura, transparente e eficiente, garantindo que todas as informações pessoais sejam tratadas com responsabilidade, confidencialidade e em conformidade com os princípios da proteção de dados.</p>
          <p className="mb-2">Ao criar uma conta ou utilizar qualquer serviço disponibilizado pela Asiaray, o utilizador reconhece que leu, compreendeu e aceita a presente Política de Privacidade.</p>
          <p>Esta Política aplica-se exclusivamente ao tratamento dos Dados Pessoais efetuado pela Asiaray relativamente aos utilizadores da plataforma.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">2. Dados Pessoais que Recolhemos</h2>
          <p className="mb-2">A Asiaray recolhe apenas os Dados Pessoais estritamente necessários para disponibilizar os seus serviços, garantir a segurança das operações e permitir o correto funcionamento da plataforma.</p>
          <p className="mb-4">Os dados poderão ser fornecidos diretamente pelo utilizador durante a utilização dos nossos serviços.</p>

          <h3 className="font-bold text-neutral-700 mt-2">2.1 Informações da Conta</h3>
          <p className="mb-2">Quando o utilizador cria uma conta na Asiaray, recolhemos apenas:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1 mb-4">
            <li>Número de telefone;</li>
            <li>Dados bancários, incluindo o IBAN, exclusivamente para o processamento dos levantamentos.</li>
          </ul>

          <h3 className="font-bold text-neutral-700 mt-2">2.2 Comprovativos de Depósito</h3>
          <p className="mb-2">Sempre que necessário para validação financeira, poderemos solicitar:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1 mb-2">
            <li>Capturas de ecrã dos comprovativos de depósito;</li>
            <li>Comprovativos de transferência bancária;</li>
            <li>Outros documentos que comprovem a realização da operação.</li>
          </ul>
          <p className="mb-4">Estas informações destinam-se exclusivamente à validação das operações financeiras.</p>

          <h3 className="font-bold text-neutral-700 mt-2">2.3 Informações Técnicas</h3>
          <p className="mb-2">Durante a utilização da plataforma poderão ser registadas automaticamente determinadas informações técnicas, incluindo:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1 mb-2">
            <li>Data e hora de acesso;</li>
            <li>Endereço IP;</li>
            <li>Tipo de dispositivo;</li>
            <li>Sistema operativo;</li>
            <li>Versão da aplicação;</li>
            <li>Registos técnicos necessários para garantir a estabilidade, segurança e funcionamento da plataforma.</li>
          </ul>
          <p>Estas informações são utilizadas exclusivamente para fins técnicos e de segurança.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">3. Como Utilizamos os Dados Pessoais</h2>
          <p className="mb-2">A Asiaray utiliza os Dados Pessoais apenas para finalidades legítimas relacionadas com a prestação dos seus serviços.</p>
          <p className="mb-2">Os Dados Pessoais poderão ser utilizados para:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1 mb-2">
            <li>Criar e gerir a conta do utilizador;</li>
            <li>Permitir o acesso aos serviços disponibilizados pela plataforma;</li>
            <li>Processar depósitos e levantamentos;</li>
            <li>Validar comprovativos de pagamento;</li>
            <li>Confirmar operações financeiras;</li>
            <li>Prevenir fraude, atividades ilegais, utilizações abusivas da plataforma e outras situações que possam comprometer a segurança dos nossos serviços;</li>
            <li>Verificar a autenticidade das operações realizadas;</li>
            <li>Melhorar a qualidade dos serviços;</li>
            <li>Responder a pedidos de apoio ao cliente;</li>
            <li>Comunicar informações importantes relacionadas com a conta;</li>
            <li>Resolver reclamações e litígios;</li>
            <li>Cumprir obrigações legais;</li>
            <li>Proteger os direitos, a privacidade, a segurança e a propriedade da Asiaray, dos seus utilizadores e de terceiros;</li>
            <li>Garantir a segurança dos sistemas informáticos e da infraestrutura tecnológica.</li>
          </ul>
          <p>A Asiaray não utiliza os Dados Pessoais para finalidades incompatíveis com as descritas na presente Política.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">4. Base Legal para o Tratamento dos Dados</h2>
          <p className="mb-2">Sempre que aplicável, o tratamento dos Dados Pessoais baseia-se numa ou mais das seguintes situações:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Consentimento do utilizador;</li>
            <li>Execução dos serviços solicitados;</li>
            <li>Cumprimento de obrigações legais;</li>
            <li>Proteção dos interesses legítimos da Asiaray;</li>
            <li>Prevenção de fraude e garantia da segurança operacional.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">5. Verificação de Identidade e Prevenção de Fraude</h2>
          <p className="mb-2">Para proteger os utilizadores e preservar a integridade da plataforma, a Asiaray poderá realizar verificações adicionais sempre que existam indícios de utilização irregular.</p>
          <p className="mb-2">Poderemos solicitar documentos ou informações adicionais destinados a confirmar:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1 mb-2">
            <li>A identidade do utilizador;</li>
            <li>A titularidade da conta bancária;</li>
            <li>A legitimidade das operações financeiras;</li>
            <li>A autenticidade dos comprovativos apresentados.</li>
          </ul>
          <p>Estas verificações destinam-se exclusivamente à prevenção de fraude, proteção dos utilizadores e garantia da segurança da plataforma.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">6. Divulgação de Dados Pessoais</h2>
          <p className="mb-2">A Asiaray respeita a confidencialidade dos Dados Pessoais dos seus utilizadores.</p>
          <p>Os Dados Pessoais não serão vendidos, alugados ou divulgados a terceiros para fins comerciais.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">7. Conservação dos Dados</h2>
          <p className="mb-2">Os Dados Pessoais serão conservados apenas durante o período necessário para:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1 mb-2">
            <li>Prestar os serviços ao utilizador;</li>
            <li>Processar operações financeiras;</li>
            <li>Cumprir obrigações legais;</li>
            <li>Resolver litígios;</li>
            <li>Prevenir fraude;</li>
            <li>Garantir a segurança da plataforma.</li>
          </ul>
          <p>Quando deixarem de ser necessários, os Dados Pessoais serão eliminados ou anonimizados de forma segura.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">8. Segurança dos Dados</h2>
          <p className="mb-2">A Asiaray implementa medidas técnicas, administrativas e organizativas destinadas a proteger os Dados Pessoais contra:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1 mb-4">
            <li>Acesso não autorizado;</li>
            <li>Utilização indevida;</li>
            <li>Perda;</li>
            <li>Destruição;</li>
            <li>Divulgação não autorizada;</li>
            <li>Alteração;</li>
            <li>Fraude.</li>
          </ul>
          <p className="mb-2">Entre estas medidas incluem-se:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1 mb-2">
            <li>Controlo de acessos;</li>
            <li>Sistemas de autenticação;</li>
            <li>Monitorização contínua das operações;</li>
            <li>Mecanismos de verificação de segurança;</li>
            <li>Proteção da infraestrutura tecnológica.</li>
          </ul>
          <p>Embora adotemos medidas rigorosas de segurança, nenhum sistema de transmissão ou armazenamento eletrónico pode garantir proteção absoluta.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">9. Controlo dos Dados</h2>
          <p className="mb-2">Os nossos serviços oferecem ao utilizador um conjunto de controlos sobre os respetivos Dados Pessoais e sobre a forma como são utilizados e conservados.</p>
          <p className="mb-2">Sempre que disponível, o utilizador poderá gerir determinadas informações diretamente através da sua conta.</p>
          <p>O utilizador poderá solicitar a atualização, correção ou eliminação de determinados Dados Pessoais, sem prejuízo das obrigações legais de conservação que recaem sobre a Asiaray.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">10. Direitos do Titular dos Dados</h2>
          <p className="mb-2">Dependendo da legislação aplicável, o utilizador poderá exercer os seguintes direitos relativamente aos seus Dados Pessoais:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1 mb-2">
            <li>Direito de acesso;</li>
            <li>Direito de retificação;</li>
            <li>Direito de atualização;</li>
            <li>Direito de eliminação;</li>
            <li>Direito de limitação do tratamento;</li>
            <li>Direito de oposição;</li>
            <li>Direito de portabilidade dos dados, quando aplicável.</li>
          </ul>
          <p>Os pedidos poderão ser enviados através dos canais oficiais de apoio ao cliente ou para o endereço de correio eletrónico: <a href="mailto:asiaraygrupo@asiary.it.com" className="text-blue-600 hover:underline">asiaraygrupo@asiary.it.com</a></p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">11. Crianças</h2>
          <p className="mb-2">Os serviços da Asiaray não são dirigidos nem se destinam a menores de 18 anos.</p>
          <p className="mb-2">A Asiaray não recolhe conscientemente Dados Pessoais de crianças ou menores de idade.</p>
          <p>Caso existam motivos para acreditar que um menor de 18 anos forneceu Dados Pessoais à Asiaray, deverá ser enviado um pedido para o endereço <a href="mailto:asiaraygrupo@asiary.it.com" className="text-blue-600 hover:underline">asiaraygrupo@asiary.it.com</a>, para que sejam tomadas as medidas adequadas.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">12. Alterações à Política de Privacidade</h2>
          <p className="mb-2">A Asiaray poderá atualizar periodicamente a presente Política de Privacidade para refletir alterações legais, técnicas ou operacionais.</p>
          <p className="mb-2">Sempre que forem efetuadas alterações relevantes, será publicada uma nova versão desta Política, indicando a respetiva data de entrada em vigor.</p>
          <p>A continuação da utilização dos serviços após a publicação das alterações constitui a aceitação da versão atualizada da presente Política de Privacidade.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">13. Controlador do Tratamento dos Dados</h2>
          <p>A Asiaray Angola e a Asiaray Group são as entidades responsáveis pelo tratamento dos Dados Pessoais dos utilizadores, nos termos descritos na presente Política de Privacidade.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">14. Como Entrar em Contacto Connosco</h2>
          <p className="mb-2">Caso tenha dúvidas, pretenda exercer os seus direitos ou necessite de qualquer esclarecimento relativamente à presente Política de Privacidade, poderá contactar o apoio ao cliente oficial da Asiaray através dos canais oficiais ou do seguinte endereço de correio eletrónico:</p>
          <p className="mb-2"><a href="mailto:asiaraygrupo@asiary.it.com" className="text-blue-600 hover:underline">asiaraygrupo@asiary.it.com</a></p>
          <p>A nossa equipa procurará responder aos pedidos com a maior brevidade possível.</p>
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
      const res = await gatewayCall(512, {});
      if (res?.success && Array.isArray(res.result)) {
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
          <h2 className="font-bold text-neutral-800 text-sm mb-2">1. Introdução</h2>
          <p className="mb-2">Bem-vindo à Asiaray. Estes Termos de Utilização (“Termos”) regulam a utilização dos nossos serviços, aplicações, website e plataformas digitais (coletivamente designados por “Serviços”).</p>
          <p>Ao criar uma conta ou utilizar qualquer Serviço da Asiaray, o utilizador declara ter lido, compreendido e aceitado estes Termos na íntegra, bem como a nossa Política de Privacidade. Caso não concorde com qualquer disposição, não deve criar conta nem utilizar os Serviços.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">2. Definições</h2>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li><strong>Asiaray / Nós / Nosso:</strong> refere-se à Asiaray Angola e Asiaray Group, suas afiliadas e operadores da plataforma.</li>
            <li><strong>Utilizador:</strong> qualquer pessoa física maior de 18 anos que cria conta e utiliza os Serviços.</li>
            <li><strong>Conta:</strong> perfil criado pelo utilizador na plataforma.</li>
            <li><strong>WS:</strong> produtos/serviços de rede, investimento ou programas de expansão mencionados na plataforma.</li>
            <li><strong>Levantamento:</strong> pedido de transferência de fundos da conta Asiaray para conta bancária do utilizador.</li>
            <li><strong>Depósito:</strong> transferência de fundos para a conta Asiaray.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">3. Quem Somos</h2>
          <p>Sobre a Asiaray Media Group Limited<br />A Asiaray Media Group Limited (código de ações na Bolsa de Valores de Hong Kong: 1993) é uma empresa de mídia exterior na região da Grande China, com foco estratégico na gestão de publicidade em grandes meios de transporte, como aeroportos, linhas de metrô e trens de alta velocidade.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">4. Elegibilidade</h2>
          <p>Os Serviços são destinados exclusivamente a pessoas com idade igual ou superior a 18 anos, residentes em jurisdições onde a utilização seja legal. É proibida a utilização por menores, pessoas sancionadas ou em jurisdições restritas.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">5. Registo e Acesso à Conta</h2>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Para aceder aos Serviços é obrigatório criar uma conta fornecendo número de telefone válido.</li>
            <li>O utilizador é responsável por manter a confidencialidade da sua palavra-passe e de todas as atividades realizadas na sua conta.</li>
            <li>A Asiaray reserva-se o direito de recusar ou encerrar contas a qualquer momento, sem aviso prévio, por violação destes Termos.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">6. Utilização dos Serviços</h2>
          <p className="mb-2">O utilizador compromete-se a utilizar os Serviços apenas para fins lícitos e em conformidade com estes Termos. É proibido:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Usar a plataforma para atividades ilegais, fraude, branqueamento de capitais ou spam;</li>
            <li>Tentar obter acesso não autorizado a sistemas da Asiaray;</li>
            <li>Interferir no funcionamento normal da plataforma;</li>
            <li>Fornecer informações falsas ou enganosas.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">7. Produtos e Serviços WS</h2>
          <p>Os produtos e serviços WS seguem regras específicas detalhadas na plataforma. O utilizador deve ler atentamente as condições de cada produto antes de participar. A Asiaray não garante rendimentos ou resultados específicos.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">8. Conteúdo do Utilizador</h2>
          <p>O utilizador é o único responsável pelo conteúdo que publica ou envia (incluindo capturas de comprovativos de depósito). Ao submeter conteúdo, concede à Asiaray licença mundial, não exclusiva e gratuita para usar, armazenar e exibir esse conteúdo na prestação dos Serviços.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">9. Direitos e Responsabilidades do Utilizador</h2>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Manter os dados da conta atualizados;</li>
            <li>Cumprir todas as leis aplicáveis;</li>
            <li>Reportar imediatamente qualquer uso não autorizado da sua conta;</li>
            <li>Abster-se de comportamentos abusivos ou que prejudiquem outros utilizadores ou a plataforma.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">10. Direitos da Asiaray</h2>
          <p className="mb-2">Reservamo-nos o direito de:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Modificar, suspender ou interromper qualquer parte dos Serviços;</li>
            <li>Remover conteúdo que viole estes Termos;</li>
            <li>Realizar verificações de identidade e anti-fraude;</li>
            <li>Cooperar com autoridades competentes quando exigido por lei.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">11. Política de Depósitos</h2>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Os depósitos devem ser realizados através dos canais oficiais indicados na plataforma.</li>
            <li>O utilizador deve enviar comprovativos claros (capturas de ecrã) para validação.</li>
            <li>A Asiaray não se responsabiliza por depósitos efetuados em contas erradas ou fora dos canais oficiais.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">12. Política de Levantamentos</h2>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Os pedidos de levantamento são processados mediante verificação de dados bancários (IBAN válido em nome do titular da conta).</li>
            <li>A Asiaray pode solicitar documentos adicionais para prevenir fraude.</li>
            <li>Os prazos de processamento dependem do método escolhido e de verificações internas.</li>
            <li>Levantamentos só são permitidos para fundos disponíveis e não bloqueados por regras operacionais.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">13. Taxas Operacionais</h2>
          <p>As taxas aplicáveis a depósitos, levantamentos, serviços WS e outras operações estão claramente indicadas na plataforma e podem ser atualizadas periodicamente. O utilizador é responsável pelo pagamento das taxas devidas.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">14. Política de Equipas e Expansão da Rede</h2>
          <p>A expansão de rede (quando aplicável) deve respeitar as regras de recrutamento ético e legal. É proibida a utilização de práticas enganosas, pressão indevida ou falsas promessas de ganhos.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">15. Contas Pagas e Faturação</h2>
          <p>Quando aplicável, as contas pagas ou subscrições são renovadas automaticamente até serem canceladas pelo utilizador, respeitando os prazos de cancelamento indicados.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">16. Suspensão e Encerramento de Contas</h2>
          <p className="mb-2">A Asiaray pode suspender ou encerrar contas imediatamente, sem aviso prévio, em caso de:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Violação destes Termos;</li>
            <li>Suspeita de fraude ou atividade ilegal;</li>
            <li>Inatividade prolongada;</li>
            <li>Exigência legal ou regulatória.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">17. Exclusão de Garantias</h2>
          <p>Os Serviços são fornecidos “no estado em que se encontram”. A Asiaray não oferece quaisquer garantias, expressas ou implícitas, quanto à continuidade, precisão, fiabilidade ou ausência de erros na plataforma.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">18. Limitação da Responsabilidade</h2>
          <p>Na medida máxima permitida por lei, a Asiaray não será responsável por danos indiretos, incidentais, consequenciais, perda de lucros ou danos resultantes da utilização ou impossibilidade de utilização dos Serviços.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">19. Resolução de Litígios</h2>
          <p>Qualquer disputa será resolvida preferencialmente por via amigável. Na impossibilidade, os litígios serão submetidos aos tribunais competentes de Angola.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">20. Propriedade Intelectual</h2>
          <p>Todo o conteúdo, marcas, logos, software e materiais da Asiaray são propriedade exclusiva da Asiaray ou dos seus licenciadores. É proibida a cópia, modificação ou utilização não autorizada.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">21. Conformidade e Segurança</h2>
          <p>O utilizador compromete-se a cumprir todas as leis anti-branqueamento, contra-terrorismo e proteção de dados aplicáveis. A Asiaray implementa medidas de segurança, mas não garante proteção absoluta contra todas as ameaças.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">22. Alterações aos Termos</h2>
          <p>Podemos atualizar estes Termos periodicamente. A versão atualizada será publicada com a data de entrada em vigor. A continuação da utilização dos Serviços após a publicação constitui aceitação dos novos Termos.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">23. Lei Aplicável</h2>
          <p>Estes Termos regem-se pela legislação de Angola.</p>
        </div>

        <div>
          <h2 className="font-bold text-neutral-800 text-sm mb-2">24. Disposições Gerais</h2>
          <ul className="list-disc pl-5 mt-1 space-y-1 mb-2">
            <li>Se qualquer disposição for considerada inválida, as restantes permanecem em vigor.</li>
            <li>Estes Termos constituem o acordo integral entre o utilizador e a Asiaray.</li>
            <li>Qualquer notificação será enviada para o e-mail ou telefone registado na conta.</li>
            <li>Contacto: <a href="mailto:asiaraygrupo@asiary.it.com" className="text-blue-600 hover:underline">asiaraygrupo@asiary.it.com</a></li>
          </ul>
          <p className="mt-4 font-semibold text-neutral-800">Ao utilizar a Asiaray, o utilizador confirma que leu e aceita estes Termos de Utilização e a Política de Privacidade.</p>
        </div>

        <div className="pt-10 pb-4 text-center text-neutral-400 italic">Fim do documento.</div>

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

      try {
        const [weekRes, prodRes] = await Promise.all([
          gatewayCall(802, {}),
          gatewayCall(512, {})
        ]);

        if (weekRes?.success && Array.isArray(weekRes.result)) {
          setWeekData(weekRes.result.map((r: any) => ({
            dia: r.dia,
            day_date: r.day_date,
            total: Number(r.total) || 0
          })));
        }

        if (prodRes?.success && Array.isArray(prodRes.result)) {
          setProducts(prodRes.result);
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
          const res = await gatewayCall(416);
          if (res?.success && res.result?.iban) {
            setUserIban(res.result.iban);
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

        try {
          const data = await gatewayCall(605, {});
          if (data?.success) {
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

        try {
          const data = await gatewayCall(208, {});
          if (data?.success && data.result) {
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
