import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getAccessToken, GATEWAY_URL } from '../lib/supabase';
import { 
  Bell, Settings, User, Copy, ClipboardList, Wallet, Sparkles, 
  Gift, Layers, HelpCircle, UserCheck, Receipt, 
  Coins, Wallet2, Download, Landmark, LogOut, Check, Headphones, Award
} from 'lucide-react';
import { MinhasFinancasModal } from './MinhasFinancasTab';
import { 
  BankModal, WalletModal, InviteModal, TeamReportModal, 
  RulesModal, DailyDeclarationModal, LedgerLogsModal, CurrencyConverterModal,
  PrivacyModal, CompanyPoliciesModal
} from './MeuModals';
import { MyInfoModal } from './MyInfoModal';
import { CuponsPage } from './CuponsPage';

import inviteIcon from '../../assets/icons8-invite-48.png';
import teamIcon from '../../assets/icons8-relatorio-equipet-48.png';
import bankIcon from '../../assets/icons8-adicionar-banco-58.png';
import rechargeIcon from '../../assets/icons8-registro-de-deposito-48.png';
import withdrawIcon from '../../assets/icons8-withdrawal record-100.png';
import receiptsIcon from '../../assets/icons8-card-withdrawal-48.png';
import infoIcon from '../../assets/icons8-password-login-48.png';
import deveLerIcon from '../../assets/icons8-deve-ler-64.png';
import downloadAppIcon from '../../assets/icons8-download-da-aplicacao-64.png';
import terminarSessaoIcon from '../../assets/icons8-terminar-sessao-64.png';
import dailyDeclarationIcon from '../../assets/icons8-tether-64.png';
import settingsIcon from '../../assets/icons8-settings-48.png';
import financasIcon from '../../assets/icons8-financas-48.png';
import couponIcon from '../../assets/icons8-couper-le-coupon-46.png';
import termosIcon from '../../assets/icons8-politique-de-confidentialité-48.png';
import politicasIcon from '../../assets/icons8-sécurité-vérifiée-48.png';

export const MeuTab: React.FC = () => {
  const { user, stats, logout, resetAll, refreshUserProfile } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Removed refreshUserProfile(false) to prevent "saldo piscado" (balance flashing) 
    // and to improve performance since AppContext already handles state sync and polling.
  }, []);

  useEffect(() => {
    const state = location.state as any;
    if (state?.openMyInfoModal) {
      if (state?.selectBankSection) {
        // Coming from RetirarPage needing to link a bank — open BankModal directly
        setIsBankOpen(true);
      } else {
        setIsMyInfoOpen(true);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Modal open states
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletTab, setWalletTab] = useState<'recharge' | 'withdraw'>('recharge');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isMyInfoOpen, setIsMyInfoOpen] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  const [isFinancaOpen, setIsFinancaOpen] = useState(false);
  const [isCuponsOpen, setIsCuponsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const [ledgerType, setLedgerType] = useState<'receita' | 'recarga' | 'retirada'>('receita');

  // Bell and Credit Rating States
  const [teamStats, setTeamStats] = useState({ total: 0, investors: 0 });
  const [creditLevel, setCreditLevel] = useState<'titulo' | 'limite' | 'bom' | 'excelente'>('titulo');
  const [creditMsg, setCreditMsg] = useState('');
  const [bellPopupMsg, setBellPopupMsg] = useState('');
  const [showBellDot, setShowBellDot] = useState(false);

  const [dbNotificacoes, setDbNotificacoes] = useState<any[]>([]);

  useEffect(() => {
    const fetchTeamAndNotif = async () => {
      const token = await getAccessToken();
      if (!token) return;
      try {
        // Fetch Team Stats
        const respTeam = await fetch(GATEWAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ op: 801, data: {} })
        });
        const resTeam = await respTeam.json();
        if (resTeam.success) {
          const rawTeam = Array.isArray(resTeam.result) 
            ? resTeam.result 
            : (resTeam.result?.team && Array.isArray(resTeam.result.team) ? resTeam.result.team : []);
            
          const total = rawTeam.length;
          const investors = rawTeam.filter((m: any) => Number(m.reloaded_amount || 0) > 0).length;
          setTeamStats({ total, investors });
        }

        // Fetch Notifications Content
        const respNotif = await fetch(GATEWAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ op: 804, data: {} })
        });
        const resNotif = await respNotif.json();
        if (resNotif.success && Array.isArray(resNotif.result)) {
          setDbNotificacoes(resNotif.result);
        }
      } catch (err) {
        console.error('Error fetching team or notifications', err);
      }
    };
    fetchTeamAndNotif();
  }, []);

  useEffect(() => {
    const createdDate = user.createdAt ? new Date(user.createdAt) : new Date();
    const daysOld = Math.max(0, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));

    const total = teamStats.total;
    const inv = teamStats.investors;
    const noInv = total - inv;
    const missingInvBom = Math.max(0, 5 - inv);
    const missingInvExc = Math.max(0, 50 - inv);
    const missingDays = Math.max(0, 180 - daysOld);

    let level: 'titulo' | 'limite' | 'bom' | 'excelente' = 'titulo';
    let showDot = false;

    if (inv >= 50 && daysOld >= 180) {
      level = 'excelente';
      showDot = true;
    } else if (inv >= 5) {
      level = 'bom';
      showDot = true;
    } else if (noInv >= 50 && inv < 5) {
      level = 'limite';
      showDot = true;
    } else {
      level = 'titulo';
      showDot = false;
    }

    // Get notification from DB based on level
    const dbEntry = dbNotificacoes.find(n => n.nivel === level);
    
    // Default messages just in case DB fetch fails
    let msg = '';
    let popup = '';
    if (dbEntry) {
      msg = dbEntry.mensagem_popup
        .replace('{total}', String(total))
        .replace('{no_inv}', String(noInv))
        .replace('{inv}', String(inv))
        .replace('{missing_inv}', String(level === 'bom' ? missingInvExc : missingInvBom))
        .replace('{missing_days}', String(missingDays))
        .replace('{days}', String(daysOld));
        
      popup = `${dbEntry.titulo_popup}\\n\\n${msg}`;
    } else {
      // Fallback text
      if (level === 'excelente') {
        msg = `Excelente: 50+ investidores. Conta com ${daysOld} dias.`;
        popup = 'Parabéns! Atingiu o nível Excelente de notação de crédito.';
      } else if (level === 'bom') {
        msg = `Bom: ${inv} investidores. Faltam ${missingInvExc} investidores para Excelente + ${missingDays} dias de conta.`;
        popup = 'Parabéns! Atingiu o nível Bom com 5+ investidores na sua equipa.';
      } else if (level === 'limite') {
        msg = `Limite: ${noInv} membros sem investimento. Precisa de 5 investidores para subir a Bom.`;
        popup = 'Aviso: Tem muitos membros inativos. Convide investidores para melhorar a sua notação!';
      } else {
        msg = `Conta Nova: ${total} membros. Para alertas, atinja 50 membros sem investimento ou 5 investidores.`;
      }
    }

    setCreditLevel(level);
    setCreditMsg(msg);
    setBellPopupMsg(popup);
    
    // Check if the user already saw the bell for this exact state
    const lastSeenLevel = localStorage.getItem('asiaray_bell_seen_level');
    if (showDot && lastSeenLevel !== level) {
      setShowBellDot(true);
    } else {
      setShowBellDot(false);
    }
  }, [teamStats, user.createdAt]);

  const handleBellClick = () => {
    if (showBellDot) {
      alert(bellPopupMsg);
      setShowBellDot(false);
      localStorage.setItem('asiaray_bell_seen_level', creditLevel);
    } else if (bellPopupMsg) {
      alert(bellPopupMsg);
    } else {
      alert('Sino de Notificações: Nenhuma novidade no momento.');
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(user.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyId = () => {
    const idToDisplay = user.idChaveUnica !== undefined ? String(user.idChaveUnica) : user.id;
    navigator.clipboard.writeText(idToDisplay);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleGridOption = (key: string) => {
    switch (key) {
      case 'invite':
        setIsInviteOpen(true);
        break;
      case 'team':
        setIsTeamOpen(true);
        break;
      case 'rules':
        setIsRulesOpen(true);
        break;
      case 'info':
        setIsMyInfoOpen(true);
        break;
      case 'daily':
        setIsChartOpen(true);
        break;
      case 'receipts':
        setLedgerType('receita');
        setIsLedgerOpen(true);
        break;
      case 'recharge_log':
        setLedgerType('recarga');
        setIsLedgerOpen(true);
        break;
      case 'withdraw_log':
        setLedgerType('retirada');
        setIsLedgerOpen(true);
        break;
      case 'download':
        alert('PWA: Instale o aplicativo móvel a partir do menu do seu navegador.');
        break;
      case 'cupons':
        navigate('/cupons');
        break;
      case 'termos':
        setIsPrivacyOpen(true);
        break;
      case 'politicas':
        setIsPoliciesOpen(true);
        break;
      case 'bank':
        setIsBankOpen(true);
        break;
      case 'logout':
        logout();
        break;
      case 'financa':
        setIsFinancaOpen(true);
        break;
      case 'cupons':
        setIsCuponsOpen(true);
        break;
      case 'reset':
        resetAll();
        alert('Simulador: Base de dados reiniciada para os padrões de fábrica.');
        break;
    }
  };

  const formattedBalance = Math.max(0, stats.balance).toLocaleString('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div id="meu-tab-container" className="pb-24 bg-[#f8fafc] min-h-screen animate-fadeIn font-sans">
      
      {/* 2. User Stats Header row with avatar and details (Exact Image 1 illustration) */}
      <div 
        className="pb-6 pt-5 flex flex-col items-center text-center px-4 relative overflow-hidden" 
        id="meu-profile-row"
        style={{ background: '#f5f7fa' }}
      >
        {/* Wavy background mimicking the image closely */}
        <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none select-none">
          <svg viewBox="0 0 500 200" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,80 C150,150 350,20 500,100 L500,0 L0,0 Z" fill="#e2e8f0" />
            <path d="M0,120 C180,50 320,160 500,90 L500,0 L0,0 Z" fill="#cbd5e1" />
          </svg>
        </div>

        {/* Top bar with Notification bell and Settings cog inside the styled segment */}
        <div className="w-full max-w-lg flex justify-between items-center px-2 mb-2 z-10" id="meu-top-bar">
          <button 
            id="notif-btn"
            onClick={handleBellClick}
            className="text-neutral-500 p-2 cursor-pointer"
          >
            {/* Outline Bell icon with a notification dot */}
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[21px] w-[21px] text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {showBellDot && (
                <div className="absolute top-[2px] right-[2px] h-[7px] w-[7px] bg-red-500 rounded-full border border-white"></div>
              )}
            </div>
          </button>
          
          <button 
            id="settings-btn"
            onClick={() => handleGridOption('info')}
            className="p-2 cursor-pointer flex items-center justify-center"
          >
            <img src={settingsIcon} className="h-[21px] w-[21px] object-contain" alt="settings" />
          </button>
        </div>

        {/* User circular avatar icon with silhouette exactly matching the image */}
        <div 
          className="relative z-10 select-none cursor-pointer" 
          onClick={() => handleGridOption('info')}
          id="profile-avatar-trigger"
        >
          <div className="h-[60px] w-[60px] rounded-full bg-[#cbd5e1] overflow-hidden flex items-center justify-center text-slate-100 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[52px] w-[52px] translate-y-2 text-[#94a3b8]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* User mobile / numeric code */}
        <h3 className="font-sans text-[13px] font-normal text-neutral-800 mt-2 z-10 tracking-normal" id="profile-phone-txt">
          {user.phone || '244922342885'}
        </h3>
        
        {/* Member status title WS2 plain bold centered label */}
        <div className="text-[13px] font-normal text-neutral-600 uppercase mt-0.5 z-10 leading-none" id="profile-level-badge">
          {user.level || 'WS2'}
        </div>
        
        <div className="w-full max-w-[340px] mt-2 px-1.5 flex justify-between items-center gap-2 z-10 select-none text-[10px] text-neutral-600 font-sans" id="profile-codes-cue">
          <div className="text-left flex-shrink-0 flex items-center gap-1">
            <span className="font-normal text-neutral-500">
              ID: <strong className="text-neutral-700">{user.idChaveUnica !== undefined ? user.idChaveUnica : '-'}</strong>
            </span>
            <button
              id="id-chave-copy-btn"
              onClick={copyId}
              className="bg-[#dcd6cd] text-neutral-800 text-[10px] px-1.5 py-0.5 rounded-[4px] cursor-pointer"
            >
              {copiedId ? 'copiado' : 'cópia'}
            </button>
          </div>
          <div className="text-right flex-1 min-w-0 flex items-center justify-end gap-1">
            <span className="font-normal text-neutral-500 truncate">Convite: {user.inviteCode || '------'}</span>
            <button
              id="inv-code-copy-meu"
              onClick={copyInviteCode}
              className="bg-[#dcd6cd] text-neutral-800 text-[10px] px-1.5 py-0.5 rounded-[4px] cursor-pointer flex-shrink-0"
            >
              {copied ? 'copiado' : 'cópia'}
            </button>
          </div>
        </div>

        {/* Gold & USDT Wallet Card */}
        <div 
          className="w-full max-w-[340px] bg-[#242d38] text-slate-800 rounded-[14px] p-4 mt-4 relative flex items-center justify-between z-10 mx-auto"
          id="meu-gold-coin-box"
        >
          <div className="flex-1 grid grid-cols-2 text-left font-sans items-center">
            <div>
              <span className="text-[11px] text-neutral-400">Moeda de Ouro</span>
              <div className="text-[18px] font-bold text-white flex items-baseline mt-1">
                <span className="text-[10px] font-normal mr-0.5">KZ</span>
                <span>{formattedBalance}</span>
              </div>
            </div>
            <div className="pl-2">
              <span className="text-[11px] font-bold text-[#ff3b30]">USDT_TRC</span>
              <div className="text-[18px] font-bold text-[#ff3b30] mt-1">
                {Math.max(0, stats.balanceUSDT / 1000).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Carteira button → opens Currency Converter */}
          <button 
            id="carteira-click-wallet"
            onClick={() => setIsConverterOpen(true)}
            className="bg-[#3b4758] text-white py-1.5 px-4 rounded-full text-[11px] z-10 cursor-pointer font-sans h-8"
          >
            Carteira
          </button>
        </div>
      </div>

      {/* 4. Subnavigation banner options "convidar amigos" and "Ganhar mais dinheiro" */}
      <div className="flex max-w-full px-0 bg-[#e2e8f0] items-center border-b border-slate-300 h-10" id="meu-sub-links-bar">
        {/* Left Tab Folder style */}
        <button 
          id="sub-invite-friends"
          onClick={() => navigate('/retirar')}
          className="flex-1 text-center font-normal text-red-600 bg-transparent border-r border-white/50 text-[12px] h-full flex items-center justify-center relative"
        >
          {/* subtle background icon */}
          <div className="absolute left-6 text-white/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </div>
          <span className="relative z-10 text-red-600">Reivindicar</span>
        </button>

      {/* Right Tab Folder style */}
      <button 
        id="sub-make-money"
        onClick={() => { setWalletTab('recharge'); setIsWalletOpen(true); }}
        className="flex-1 text-center font-normal text-green-600 bg-transparent text-[12px] h-full flex items-center justify-center relative"
      >
        {/* subtle background icon */}
        <div className="absolute left-6 text-white/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.5 1.32c.563.643 1.485 1.076 2.343 1.24V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.5-1.32c-.563-.643-1.485-1.076-2.343-1.24V5z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="relative z-10 text-green-600">Recarregar</span>
      </button>
      </div>

      {/* 5. "notação de crédito" line */}
      <div className="bg-white border-b border-neutral-200 pt-3 pb-6 select-none relative" id="credit-meter-card">
        {/* Center Title */}
        <div className="text-center font-bold text-slate-700 text-[12px] mb-6">
          notação de crédito
        </div>

        {/* Ticks progression container */}
        <div className="relative w-full px-2">
          {/* Green line rail */}
          <div className="absolute top-[18px] left-[10%] right-[10%] h-[1px] bg-[#4ade80]" style={{ zIndex: 0 }}></div>

          {/* Labels & Nodes */}
          <div className="flex justify-between items-start relative z-1 font-sans text-[10px] text-neutral-500">
            {/* titulo node */}
            <div className={`flex flex-col items-center w-12 -ml-2 ${creditLevel === 'titulo' ? 'text-[#4ade80]' : ''}`}>
              <span className={`mb-1 text-[10px] tracking-tight ${creditLevel === 'titulo' ? 'font-bold' : ''}`}>titulo</span>
              {creditLevel === 'titulo' ? (
                <div className="h-3 w-3 bg-[#4ade80] rounded-full text-white font-bold text-[8px] flex items-center justify-center">✔</div>
              ) : (
                <div className="h-[3px] w-[3px] rounded-full bg-[#4ade80]"></div>
              )}
            </div>

            {/* limite node */}
            <div className={`flex flex-col items-center w-12 ${creditLevel === 'limite' ? 'text-[#4ade80]' : ''}`}>
              <span className={`mb-1 text-[10px] tracking-tight ${creditLevel === 'limite' ? 'font-bold' : ''}`}>limite</span>
              {creditLevel === 'limite' ? (
                <div className="h-3 w-3 bg-[#4ade80] rounded-full text-white font-bold text-[8px] flex items-center justify-center">✔</div>
              ) : (
                <div className="h-[3px] w-[3px] rounded-full bg-[#4ade80]"></div>
              )}
            </div>

            {/* bom node with checking badge */}
            <div className={`flex flex-col items-center w-12 ${creditLevel === 'bom' ? 'text-[#4ade80]' : ''}`}>
              <span className={`mb-1 text-[10px] tracking-tight ${creditLevel === 'bom' ? 'font-bold' : ''}`}>bom</span>
              {creditLevel === 'bom' ? (
                <div className="h-3 w-3 bg-[#4ade80] rounded-full text-white font-bold text-[8px] flex items-center justify-center">✔</div>
              ) : (
                <div className="h-[3px] w-[3px] rounded-full bg-[#4ade80]"></div>
              )}
            </div>

            {/* excelente node */}
            <div className={`flex flex-col items-center w-14 text-right ${creditLevel === 'excelente' ? 'text-[#4ade80]' : 'text-amber-500'}`}>
              <span className={`mb-1 text-[10px] tracking-tight ml-2 ${creditLevel === 'excelente' ? 'font-bold' : ''}`}>excelen...</span>
              {creditLevel === 'excelente' ? (
                <div className="h-3 w-3 bg-[#4ade80] rounded-full text-white font-bold text-[8px] flex items-center justify-center mr-2">✔</div>
              ) : (
                <div className="h-[3px] w-[3px] rounded-full bg-[#4ade80] mr-2"></div>
              )}
            </div>
          </div>
          

        </div>
      </div>

      {/* 6. Main Option grids: organised in 3 columns */}
      <div className="bg-white pb-6" id="meu-grid-options">
        <div className="grid grid-cols-3 divide-x divide-y divide-neutral-100 border-b border-neutral-100">
          
          {/* Tile 1: convidar amigos */}
          <div 
            onClick={() => handleGridOption('invite')}
            className="py-5 px-1 text-center cursor-pointer flex flex-col justify-center items-center gap-2 h-[100px] select-none"
          >
            <div className="h-[30px] flex items-center justify-center">
              <img src={inviteIcon} alt="convidar amigos" className="w-[26px] h-[26px] object-contain bg-white rounded-full" />
            </div>
            <span className="text-[11px] font-normal text-red-500">convidar amigos</span>
          </div>

          {/* Tile 2: relatório da equipa */}
          <div 
            onClick={() => handleGridOption('team')}
            className="py-5 px-1 text-center cursor-pointer flex flex-col justify-center items-center gap-2 h-[100px] select-none"
          >
            <div className="h-[30px] flex items-center justify-center">
              <img src={teamIcon} alt="relatório da equipa" className="w-[26px] h-[26px] object-contain" />
            </div>
            <span className="text-[11px] font-normal text-neutral-500">relatório da equipa</span>
          </div>

          {/* Tile 3: deve ler */}
          <div 
            onClick={() => handleGridOption('rules')}
            className="py-5 px-1 text-center cursor-pointer flex flex-col justify-center items-center gap-2 h-[100px] select-none"
          >
            <div className="h-[30px] flex items-center justify-center">
              <img src={deveLerIcon} alt="deve ler" className="w-[26px] h-[26px] object-contain" />
            </div>
            <span className="text-[11px] font-normal text-neutral-500">deve ler</span>
          </div>

          {/* Tile 4: configurações */}
          <div 
            onClick={() => handleGridOption('info')}
            className="py-5 px-1 text-center cursor-pointer flex flex-col justify-center items-center gap-2 h-[100px] select-none"
          >
            <div className="h-[30px] flex items-center justify-center">
              <img src={settingsIcon} alt="configurações" className="w-[26px] h-[26px] object-contain" />
            </div>
            <span className="text-[11px] font-normal text-neutral-500">configurações</span>
          </div>

          {/* Tile 5: declaração diária */}
          <div 
            onClick={() => handleGridOption('daily')}
            className="py-5 px-1 text-center cursor-pointer flex flex-col justify-center items-center gap-2 h-[100px] select-none"
          >
            <div className="h-[30px] flex items-center justify-center">
              <img src={dailyDeclarationIcon} alt="declaração diária" className="w-[26px] h-[26px] object-contain" />
            </div>
            <span className="text-[11px] font-normal text-neutral-500">declaração diária</span>
          </div>

          {/* Tile 6: registo de receitas */}
          <div 
            onClick={() => handleGridOption('receipts')}
            className="py-5 px-1 text-center cursor-pointer flex flex-col justify-center items-center gap-2 h-[100px] select-none"
          >
            <div className="h-[30px] flex items-center justify-center">
              <img src={receiptsIcon} alt="registo de receitas" className="w-[26px] h-[26px] object-contain" />
            </div>
            <span className="text-[11px] font-normal text-neutral-500">registo de receitas</span>
          </div>

          {/* Tile 7: recarregar o registo */}
          <div 
            onClick={() => handleGridOption('recharge_log')}
            className="py-5 px-1 text-center cursor-pointer flex flex-col justify-center items-center gap-2 h-[100px] select-none"
          >
            <div className="h-[30px] flex items-center justify-center">
              <img src={rechargeIcon} alt="recarregar o registo" className="w-[26px] h-[26px] object-contain" />
            </div>
            <span className="text-[11px] font-normal text-neutral-500">recarregar o registo</span>
          </div>

          {/* Tile 8: registo de retirada */}
          <div 
            onClick={() => handleGridOption('withdraw_log')}
            className="py-5 px-1 text-center cursor-pointer flex flex-col justify-center items-center gap-2 h-[100px] select-none"
          >
            <div className="h-[30px] flex items-center justify-center">
              <img src={withdrawIcon} alt="registo de retirada" className="w-[26px] h-[26px] object-contain" />
            </div>
            <span className="text-[11px] font-normal text-neutral-500">registo de retirada</span>
          </div>

          {/* Tile 9: download da aplicação */}
          <div 
            onClick={() => handleGridOption('download')}
            className="py-5 px-1 text-center cursor-pointer flex flex-col justify-center items-center gap-2 h-[100px] select-none"
          >
            <div className="h-[30px] flex items-center justify-center">
              <img src={downloadAppIcon} alt="download da aplicação" className="w-[26px] h-[26px] object-contain" />
            </div>
            <span className="text-[11px] font-normal text-neutral-500">download da aplicação</span>
          </div>

          {/* Tile 10: Gravar cartão (Adicionar conta / Associar conta) */}
          <div 
            onClick={() => handleGridOption('bank')}
            className="py-5 px-1 text-center cursor-pointer flex flex-col justify-center items-center gap-2 h-[100px] select-none"
          >
            <div className="h-[30px] flex items-center justify-center">
              <img src={bankIcon} alt="Associar conta" className="w-[26px] h-[26px] object-contain" />
            </div>
            <span className="text-[11px] font-normal text-neutral-500">Associar conta</span>
          </div>

          {/* Tile 11: Terminar sessão */}
          <div 
            onClick={() => handleGridOption('logout')}
            className="py-5 px-1 text-center cursor-pointer flex flex-col justify-center items-center gap-2 h-[100px] select-none"
          >
            <div className="h-[30px] flex items-center justify-center">
              <img src={terminarSessaoIcon} alt="Terminar sessão" className="w-[26px] h-[26px] object-contain" />
            </div>
            <span className="text-[11px] font-normal text-neutral-500">Terminar sessão</span>
          </div>

          {/* Tile 12: Minha Finança */}
          <div 
            onClick={() => handleGridOption('financa')}
            className="py-5 px-1 text-center cursor-pointer flex flex-col justify-center items-center gap-2 h-[100px] select-none"
          >
            <div className="h-[30px] flex items-center justify-center">
              <img src={financasIcon} className="w-[26px] h-[26px] object-contain" alt="Minha Finança" />
            </div>
            <span className="text-[11px] font-normal text-neutral-500">Minha Finança</span>
          </div>

          {/* Tile 13: Cupons */}
          <div 
            onClick={() => handleGridOption('cupons')}
            className="py-5 px-1 text-center cursor-pointer flex flex-col justify-center items-center gap-2 h-[100px] select-none"
          >
            <div className="h-[30px] flex items-center justify-center">
              <img src={couponIcon} alt="Cupons" className="w-[26px] h-[26px] object-contain" />
            </div>
            <span className="text-[11px] font-normal text-amber-500 font-medium">Cupons</span>
          </div>

          {/* Tile 14: Termos e Privacidade */}
          <div 
            onClick={() => handleGridOption('termos')}
            className="py-5 px-1 text-center cursor-pointer flex flex-col justify-center items-center gap-2 h-[100px] select-none"
          >
            <div className="h-[30px] flex items-center justify-center">
              <img src={termosIcon} alt="Termos e Privacidade" className="w-[26px] h-[26px] object-contain" />
            </div>
            <span className="text-[11px] font-normal text-neutral-500">Termos e Privacidade</span>
          </div>

          {/* Tile 15: Políticas da Empresa */}
          <div 
            onClick={() => handleGridOption('politicas')}
            className="py-5 px-1 text-center cursor-pointer flex flex-col justify-center items-center gap-2 h-[100px] select-none"
          >
            <div className="h-[30px] flex items-center justify-center">
              <img src={politicasIcon} alt="Políticas da Empresa" className="w-[26px] h-[26px] object-contain" />
            </div>
            <span className="text-[11px] font-normal text-neutral-500">Políticas da Empresa</span>
          </div>

        </div>
      </div>


      {/* Profile Modals portal section - conditionally rendered for performance */}
      {isBankOpen && <BankModal isOpen={isBankOpen} onClose={() => setIsBankOpen(false)} />}
      {isWalletOpen && <WalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} initialTab={walletTab} />}
      {isInviteOpen && <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />}
      {isTeamOpen && <TeamReportModal isOpen={isTeamOpen} onClose={() => setIsTeamOpen(false)} fill-current="currentColor" />}
      {isRulesOpen && <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />}
      {isPrivacyOpen && <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />}
      {isPoliciesOpen && <CompanyPoliciesModal isOpen={isPoliciesOpen} onClose={() => setIsPoliciesOpen(false)} />}
      {isChartOpen && <DailyDeclarationModal isOpen={isChartOpen} onClose={() => setIsChartOpen(false)} />}
      {isLedgerOpen && <LedgerLogsModal isOpen={isLedgerOpen} onClose={() => setIsLedgerOpen(false)} type={ledgerType} />}
      {isMyInfoOpen && <MyInfoModal isOpen={isMyInfoOpen} onClose={() => setIsMyInfoOpen(false)} onOpenBank={() => setIsBankOpen(true)} />}
      {isConverterOpen && <CurrencyConverterModal isOpen={isConverterOpen} onClose={() => setIsConverterOpen(false)} />}
      {isFinancaOpen && <MinhasFinancasModal isOpen={isFinancaOpen} onClose={() => setIsFinancaOpen(false)} />}
      {isCuponsOpen && <CuponsPage isOpen={isCuponsOpen} onClose={() => setIsCuponsOpen(false)} />}

    </div>
  );
};
