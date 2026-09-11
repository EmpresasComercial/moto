import React, { useState } from 'react';
import { 
  Bike, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  CreditCard, 
  Share2, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { UserProfile } from '../types';
import { useApp } from '../context/AppContext';

interface RegisterViewProps {
  onRegisterSuccess: (newUser: UserProfile) => void;
  onNavigateToLogin: () => void;
  defaultUserTemplate: UserProfile;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
  defaultUserTemplate,
}) => {
  const { register, user: currentUser } = useApp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('MOTO789');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !email.trim() || !phone.trim() || !cpf.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('A confirmação de senha não coincide com a senha digitada.');
      return;
    }

    if (!acceptTerms) {
      setErrorMessage('Você deve concordar com os termos de locação para prosseguir.');
      return;
    }

    setIsLoading(true);
    const res = await register({
      fullName,
      email,
      phone,
      cpf,
      password,
      inviteCode: referralCode
    });
    setIsLoading(false);

    if (res.success) {
      if (res.user) {
        onRegisterSuccess(res.user);
      } else {
        const randomCode = 'MOTO' + Math.floor(100 + Math.random() * 900);
        const createdUser: UserProfile = {
          ...defaultUserTemplate,
          id: `usr-${Date.now()}`,
          fullName,
          email,
          phone,
          cpf,
          cnhStatus: 'pending',
          cnhCategory: 'A',
          referralCode: randomCode,
          referralLink: `https://asiarymoto.com.br/convite?ref=${randomCode}`,
          walletBalance: 25.00,
          totalCommissionsEarned: 0,
          teamCount: 0,
        };
        onRegisterSuccess(createdUser);
      }
    } else if (res.error) {
      setErrorMessage(res.error);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00c853] text-white shadow-md mb-1">
            <Bike className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Criar Conta na <span className="text-[#00c853]">Asiary Moto</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Cadastre-se para alugar motocicletas revisadas, acumular bônus na equipe e pilotar com liberdade.
          </p>
        </div>

        {/* Register Box */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Formulário de Cadastro do Condutor</h2>
            <p className="text-xs text-slate-500">Preencha seus dados para abertura da sua conta.</p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nome Completo:</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nome e Sobrenome conforme documento"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#00c853]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">E-mail Principal:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#00c853]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Celular / WhatsApp:</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#00c853] font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">CPF (Cadastro de Pessoa Física):</label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#00c853] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Senha (Mínimo 6 dígitos):</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#00c853]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Confirmar Senha:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#00c853]"
                  />
                </div>
              </div>
            </div>

            {/* Código de Convite / Equipe */}
            <div className="p-3 bg-[#eafff2] border border-[#9bf6c4] rounded-2xl space-y-1.5 shadow-2xs">
              <label className="font-bold text-[#007a2a] flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#00c853]" />
                <span>Código de Convite / Link de Partilha (Opcional):</span>
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Ex: MOTO789"
                className="w-full px-3 py-2 bg-white border border-[#9bf6c4] rounded-xl text-[#007a2a] font-mono font-bold uppercase tracking-wider focus:outline-hidden focus:ring-2 focus:ring-[#00c853]"
              />
              <span className="text-[10px] text-[#009935] font-bold block">
                Com código de convite você ganha R$ 25,00 em créditos de boas-vindas na sua carteira.
              </span>
            </div>

            {/* Termos de Aceite */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-600">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded text-[#00c853] focus:ring-[#00c853] w-4 h-4 mt-0.5 shrink-0"
                />
                <span>
                  Li e concordo com os Termos de Locação de Veículos, Política de Caução Reembolsável e Exigência de CNH Categoria A Válida.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#00c853] hover:bg-[#00b341] text-white rounded-xl font-black shadow-md shadow-[#00c853]/25 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              {isLoading ? (
                <span>Criando sua conta...</span>
              ) : (
                <>
                  <span>Concluir Cadastro & Acessar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            <span>Já tem uma conta cadastrada? </span>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-bold text-[#009935] hover:text-[#007a2a] underline cursor-pointer"
            >
              Fazer Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
