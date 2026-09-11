import React, { useState } from 'react';
import { 
  Users, 
  Share2, 
  Copy, 
  Check, 
  Send, 
  QrCode, 
  DollarSign, 
  Gift, 
  TrendingUp, 
  Award, 
  ArrowUpRight, 
  ShieldCheck, 
  UserCheck, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Wallet
} from 'lucide-react';
import { UserProfile, TeamMember } from '../types';

interface TeamShareViewProps {
  user: UserProfile;
  teamMembers: TeamMember[];
  onUpdateWallet: (newBalance: number) => void;
}

export const TeamShareView: React.FC<TeamShareViewProps> = ({
  user,
  teamMembers,
  onUpdateWallet,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [pixKey, setPixKey] = useState(user.cpf);
  const [withdrawAmount, setWithdrawAmount] = useState(user.walletBalance.toString());
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<'all' | '1' | '2' | '3'>('all');

  const shareText = `Olá! Conheça a Asiary Moto, a plataforma de aluguel de motocicletas sem burocracia com seguro incluso e caução reembolsável. Use meu link exclusivo para se cadastrar e ganhar R$ 25,00 em créditos: ${user.referralLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(user.referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleExecuteWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0 || amount > user.walletBalance) {
      alert('Valor de saque inválido ou superior ao saldo disponível.');
      return;
    }

    onUpdateWallet(user.walletBalance - amount);
    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setShowWithdrawModal(false);
    }, 2000);
  };

  const filteredMembers = selectedLevelFilter === 'all'
    ? teamMembers
    : teamMembers.filter((m) => m.level.toString() === selectedLevelFilter);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 animate-fade-in">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-1">
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>Rede de Indicação & Partilha</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Minha Equipe & Programa de Partilha
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Compartilhe seu link exclusivo e ganhe comissões a cada locação realizada pelos seus indicados.
          </p>
        </div>

        <button
          onClick={() => setShowWithdrawModal(true)}
          className="px-4 py-2.5 bg-[#00c853] hover:bg-[#00b341] text-white rounded-2xl font-black text-xs shadow-md shadow-[#00c853]/25 flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-all"
        >
          <Wallet className="w-4 h-4" />
          <span>Solicitar Saque PIX</span>
        </button>
      </div>

      {/* Main Referral Card - HIGHLIGHT FOR USER TO COPY SHARE LINK */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700 relative overflow-hidden">
        {/* Glow background accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00c853]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00c853] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Link de Partilha Exclusivo
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Convide amigos e forme sua equipe
              </h2>
              <p className="text-xs text-slate-300 max-w-lg mt-1">
                Copie seu link de partilha abaixo. Cada condutor que se cadastrar através do seu link entra para a sua equipe e você recebe comissões automáticas.
              </p>
            </div>

            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3 flex items-center gap-3 shrink-0">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Seu Código:</span>
                <span className="font-mono text-lg font-black text-[#00c853] tracking-wider">
                  {user.referralCode}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-1.5 bg-[#00c853] hover:bg-[#00b341] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Large Copy Link Input Bar */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Seu Link Pessoal de Convite:
            </label>
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="flex-1 bg-slate-950/80 border border-slate-700 rounded-2xl px-4 py-3 flex items-center justify-between gap-2">
                <span className="font-mono text-xs sm:text-sm text-[#00c853] truncate select-all">
                  {user.referralLink}
                </span>
                <span className="text-[10px] bg-[#00c853]/20 text-[#00c853] px-2 py-0.5 rounded font-bold shrink-0 border border-[#00c853]/40">
                  Link Oficial
                </span>
              </div>

              {/* Botão de Copiar Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                  copiedLink
                    ? 'bg-[#00b341] text-white ring-2 ring-white'
                    : 'bg-[#00c853] hover:bg-[#00b341] text-white shadow-[#00c853]/30'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Link Copiado com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Link de Partilha</span>
                  </>
                )}
              </button>

              {/* Botão de Compartilhar no WhatsApp */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-[#00c853] hover:bg-[#00b341] text-white transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-md shadow-[#00c853]/20"
              >
                <Send className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              {/* Botão QR Code */}
              <button
                type="button"
                onClick={() => setShowQrCode(!showQrCode)}
                className="px-4 py-3 rounded-2xl font-bold text-xs bg-[#eafff2] hover:bg-[#cbfae0] text-[#007a2a] border border-[#00c853] transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
              >
                <QrCode className="w-4 h-4 text-[#00c853]" />
                <span>QR Code</span>
              </button>
            </div>
          </div>

          {/* QR Code toggle box */}
          {showQrCode && (
            <div className="p-4 bg-slate-950 border border-slate-700 rounded-2xl flex flex-col sm:flex-row items-center gap-4 animate-fade-in">
              <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center shrink-0">
                {/* Visual Representation of QR Code */}
                <div className="w-full h-full border-4 border-slate-900 border-dashed flex flex-col items-center justify-center text-slate-900 p-1">
                  <QrCode className="w-12 h-12 text-slate-900" />
                  <span className="text-[8px] font-black uppercase tracking-tighter">Asiary Moto</span>
                </div>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-bold text-white text-xs sm:text-sm">QR Code para Leitura Presencial</h4>
                <p className="text-[11px] text-slate-400">
                  Mostre a tela do seu celular para um amigo escanear com a câmera e abrir diretamente a página de cadastro com o seu código de equipe.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Saldo Disponível */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo Disponível</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            R$ {user.walletBalance.toFixed(2)}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-emerald-700 font-semibold">Liberado para Saque PIX</span>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
            >
              Resgatar
            </button>
          </div>
        </div>

        {/* Card 2: Total Ganho em Comissões */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total em Comissões</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            R$ {user.totalCommissionsEarned.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500">
            Acumulado em todas as locações da equipe
          </p>
        </div>

        {/* Card 3: Tamanho da Equipe */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Membros na Equipe</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {user.teamCount} condutores
          </div>
          <p className="text-[11px] text-slate-500">
            Rede ativa nos níveis 1, 2 e 3
          </p>
        </div>
      </div>

      {/* Como Funciona o Comissionamento em 3 Níveis */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Award className="w-4 h-4 text-emerald-600" />
          Como Funciona o Programa de Bônus por Partilha
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-900 text-sm">Nível 1 (Diretos)</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">8% Bônus</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Você recebe 8% de comissão calculada sobre a locação concluída dos amigos que você indicou diretamente pelo seu link de partilha.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-blue-900 text-sm">Nível 2 (Indiretos)</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">4% Bônus</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Quando os membros da sua equipe indicam outros condutores, você recebe 4% sobre cada contrato assinado por eles.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-purple-900 text-sm">Nível 3 (Rede)</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-600 text-white">2% Bônus</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Expansão contínua da sua equipe: 2% adicionais sobre locações realizadas no terceiro nível da sua rede.
            </p>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Membros Recentes da Sua Equipe
            </h3>
            <p className="text-xs text-slate-500">
              Acompanhe os condutores que entraram pelo seu link e as comissões geradas.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'Todos' },
              { id: '1', label: 'Nível 1' },
              { id: '2', label: 'Nível 2' },
              { id: '3', label: 'Nível 3' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedLevelFilter(tab.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedLevelFilter === tab.id
                    ? 'bg-[#00c853] text-white shadow-xs'
                    : 'bg-[#eafff2] text-[#007a2a] hover:bg-[#cbfae0] border border-[#9bf6c4]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3 px-4">Condutor / Membro</th>
                <th className="py-3 px-4">Telefone</th>
                <th className="py-3 px-4">Nível</th>
                <th className="py-3 px-4">Data Adesão</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Comissão Gerada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-[#eafff2]/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#00c853] flex items-center justify-center text-white font-black text-[11px] shadow-xs">
                      {member.name.charAt(0)}
                    </div>
                    <span>{member.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{member.phoneMask}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-[#eafff2] text-[#007a2a] border border-[#9bf6c4]">
                      Nível {member.level}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{member.joinedDate}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      member.status === 'Em Locação'
                        ? 'bg-[#eafff2] text-[#009935] border border-[#9bf6c4]'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-[#009935]">
                    + R$ {member.commissionGenerated.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Saque PIX */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#00c853]" />
                Resgate de Comissões via PIX
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="py-6 text-center space-y-2 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-[#eafff2] text-[#00c853] mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Transferência Solicitada com Sucesso!</h4>
                <p className="text-xs text-slate-500">
                  O valor será creditado na sua chave PIX em até 30 minutos úteis.
                </p>
              </div>
            ) : (
              <form onSubmit={handleExecuteWithdraw} className="space-y-4 text-xs">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 flex justify-between items-center shadow-2xs">
                  <span className="text-slate-600">Saldo Disponível:</span>
                  <span className="text-[#009935] font-extrabold text-sm">
                    R$ {user.walletBalance.toFixed(2)}
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chave PIX (CPF / Celular / E-mail):</label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-[#00c853]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Valor do Saque (R$):</label>
                  <input
                    type="number"
                    min="10"
                    max={user.walletBalance}
                    step="0.01"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-[#00c853]"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Valor mínimo para saque: R$ 10,00</span>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 py-2.5 bg-[#eafff2] hover:bg-[#cbfae0] border border-[#00c853] text-[#007a2a] rounded-xl font-bold cursor-pointer transition-all shadow-2xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#00c853] hover:bg-[#00b341] text-white rounded-xl font-bold cursor-pointer transition-all shadow-md shadow-[#00c853]/25"
                  >
                    Confirmar PIX
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
