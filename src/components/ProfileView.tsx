import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  LogOut, 
  Phone, 
  Mail, 
  MapPin, 
  HelpCircle, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Settings,
  Bell,
  Wallet,
  Users,
  Landmark,
  ArrowDownLeft,
  Building2
} from 'lucide-react';
import { UserProfile, RentalReservation } from '../types';
import { BankManagementModal } from './BankManagementModal';

interface ProfileViewProps {
  user: UserProfile;
  activeReservationsCount: number;
  onLogout: () => void;
  onNavigateToCnh: () => void;
  onNavigateToReservations: () => void;
  onNavigateToRules: () => void;
  onNavigateToTeam: () => void;
  onNavigateToDeposit: () => void;
  onNavigateToFaturas?: () => void;
  onOpenSupport: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  activeReservationsCount,
  onLogout,
  onNavigateToCnh,
  onNavigateToReservations,
  onNavigateToRules,
  onNavigateToTeam,
  onNavigateToDeposit,
  onNavigateToFaturas,
  onOpenSupport,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankModalMode, setBankModalMode] = useState<'bank' | 'withdraw' | 'pin'>('bank');

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Meu Perfil</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Gerencie seus dados pessoais, status de habilitação, carteira e preferências.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair da Conta</span>
        </button>
      </div>

      {/* User Info Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#00c853] text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-md shadow-[#00c853]/25">
            {user.fullName.charAt(0)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">{user.fullName}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                user.cnhStatus === 'verified'
                  ? 'bg-[#eafff2] text-[#009935] border border-[#9bf6c4]'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {user.cnhStatus === 'verified' ? 'CNH Homologada' : 'Aguardando CNH'}
              </span>
            </div>

            <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user.email}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {user.phone}
              </span>
              <span className="flex items-center gap-1 font-mono">
                CPF: {user.cpf}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-2xs rounded-2xl p-4 shrink-0 w-full sm:w-auto text-center sm:text-right flex flex-col items-center sm:items-end justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Saldo na Carteira</span>
          <span className="text-xl font-black text-[#009935]">R$ {user.walletBalance.toFixed(2)}</span>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 mt-2">
            <button
              onClick={onNavigateToDeposit}
              className="px-2.5 py-1 rounded-lg bg-[#eafff2] hover:bg-[#d5fae6] text-[#007a2a] text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer border border-[#9bf6c4]"
            >
              <Landmark className="w-3 h-3" />
              <span>Depositar</span>
            </button>
            <button
              onClick={() => {
                setBankModalMode('withdraw');
                setIsBankModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <ArrowDownLeft className="w-3 h-3" />
              <span>Sacar</span>
            </button>
            <button
              onClick={() => {
                setBankModalMode('bank');
                setIsBankModalOpen(true);
              }}
              className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
            >
              Banco
            </button>
          </div>
        </div>
      </div>

      {/* CNH Status Highlight Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${
            user.cnhStatus === 'verified'
              ? 'bg-[#00c853] text-white shadow-md shadow-[#00c853]/25'
              : 'bg-amber-500 text-white'
          }`}>
            {user.cnhCategory}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">
                {user.cnhStatus === 'verified'
                  ? `CNH Categoria ${user.cnhCategory} - Regular e Aprovada`
                  : 'Documento CNH em Análise Documental'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {user.cnhStatus === 'verified'
                ? `Validade até ${user.cnhExpiryDate} • Liberado para condução de motocicletas.`
                : 'Envie foto legível frente e verso para aprovação da sua CNH.'}
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToCnh}
          className="px-4 py-2 bg-[#00c853] hover:bg-[#00b341] text-white text-xs font-black rounded-xl transition-all shadow-md shadow-[#00c853]/25 cursor-pointer shrink-0"
        >
          {user.cnhStatus === 'verified' ? 'Ver Documento CNH' : 'Enviar CNH Agora'}
        </button>
      </div>

      {/* Navigation Options List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100 text-xs">
        {/* Minhas Reservas */}
        <button
          onClick={onNavigateToReservations}
          className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Minhas Reservas & Vistorias</h4>
              <p className="text-slate-500 text-xs">Acompanhe retiradas, laudos de devolução e estornos de caução</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeReservationsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {activeReservationsCount} ativa{activeReservationsCount > 1 ? 's' : ''}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>

        {/* Depósito IBAN */}
        <button
          onClick={onNavigateToDeposit}
          className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Depósito & Pagamento IBAN</h4>
              <p className="text-slate-500 text-xs">Dados bancários oficiais para caução, aluguel e envio de comprovantes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
              SEPA / SWIFT
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>

        {/* Faturas & Refaturas */}
        <button
          onClick={onNavigateToFaturas}
          className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Faturas & Refaturas de Locação</h4>
              <p className="text-slate-500 text-xs">Consulte suas faturas, comprovantes fiscais e solicite refaturamento</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              NFS-e
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>

        {/* Minha Equipe */}
        <button
          onClick={onNavigateToTeam}
          className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Minha Equipe & Link de Partilha</h4>
              <p className="text-slate-500 text-xs">Copie seu link de indicação e veja suas comissões acumuladas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              {user.teamCount} membros
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>

        {/* Regras Contratuais */}
        <button
          onClick={onNavigateToRules}
          className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Regras Contratuais, Caução & Multas</h4>
              <p className="text-slate-500 text-xs">Prazos de estorno da caução, combustível e política de tolerância</p>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Suporte & Guincho */}
        <button
          onClick={onOpenSupport}
          className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Central de Ajuda & SOS Guincho 24 Horas</h4>
              <p className="text-slate-500 text-xs">Atendimento telefônico 0800, chat e emergência na via</p>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Quick Settings */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-500" />
          Preferências do Aplicativo
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div>
            <span className="font-bold text-slate-800 block">Notificações por WhatsApp e SMS</span>
            <span className="text-slate-500 text-[11px]">Receba avisos de vencimento de diária e estorno de caução</span>
          </div>
          <button
            type="button"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              notificationsEnabled ? 'bg-[#00c853]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              } top-1 absolute`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <span className="font-bold text-slate-800 block">Versão do Aplicativo</span>
            <span className="text-slate-500 text-[11px]">Asiary Moto v2.4.0 • Sistema Homologado</span>
          </div>
          <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Atualizado
          </span>
        </div>
      </div>

      {/* Modal de Gestão Bancária & Saque Transplantado */}
      <BankManagementModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        initialMode={bankModalMode}
      />
    </div>
  );
};
