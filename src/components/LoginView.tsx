import React, { useState } from 'react';
import { 
  Bike, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { UserProfile } from '../types';
import { useApp } from '../context/AppContext';

interface LoginViewProps {
  onLoginSuccess: (userProfile: UserProfile) => void;
  onNavigateToRegister: () => void;
  defaultUser: UserProfile;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  defaultUser,
}) => {
  const { login, user: currentUser } = useApp();
  const [emailOrPhone, setEmailOrPhone] = useState(defaultUser.phone || defaultUser.email);
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailOrPhone.trim()) {
      setErrorMessage('Por favor, informe seu telefone celular ou e-mail.');
      return;
    }
    if (password.length < 4) {
      setErrorMessage('A senha informada deve ter pelo menos 4 caracteres.');
      return;
    }

    setIsLoading(true);
    const res = await login(emailOrPhone, password);
    setIsLoading(false);

    if (res.success) {
      onLoginSuccess({
        ...defaultUser,
        email: emailOrPhone.includes('@') ? emailOrPhone : defaultUser.email,
        phone: !emailOrPhone.includes('@') ? emailOrPhone : defaultUser.phone,
      });
    } else if (res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    await login(defaultUser.phone || defaultUser.email, '123456');
    setIsLoading(false);
    onLoginSuccess(defaultUser);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00c853] text-white shadow-md mb-1">
            <Bike className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Asiary <span className="text-[#00c853]">Moto</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
            Acesse sua conta para alugar motocicletas, gerenciar sua equipe e consultar contratos.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Entrar na Plataforma</h2>
            <p className="text-xs text-slate-500">Informe suas credenciais de acesso cadastradas.</p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">E-mail ou Celular:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="exemplo@email.com ou (11) 98765-4321"
                  required
                  className="w-full pl-10 pr-3.5 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#00c853] transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Senha de Acesso:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha secreta"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#00c853] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#00c853] focus:ring-[#00c853] w-3.5 h-3.5"
                />
                <span>Lembrar meus dados</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Para redefinir sua senha, um código será enviado ao seu e-mail cadastrado.')}
                className="text-[#009935] hover:text-[#007a2a] font-semibold cursor-pointer"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#00c853] hover:bg-[#00b341] text-white rounded-xl font-black shadow-md shadow-[#00c853]/25 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              {isLoading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>Entrar na Minha Conta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Access Button */}
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isLoading}
              className="w-full py-2.5 bg-[#eafff2] hover:bg-[#cbfae0] text-[#007a2a] rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer border border-[#00c853] shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00c853]" />
              <span>Acesso Rápido de Demonstração</span>
            </button>
          </form>

          {/* Switch to Register */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            <span>Ainda não possui uma conta? </span>
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="font-bold text-[#009935] hover:text-[#007a2a] underline cursor-pointer"
            >
              Cadastre-se Gratuitamente
            </button>
          </div>
        </div>

        {/* Legal & Security Note */}
        <div className="bg-white border border-slate-200 shadow-2xs rounded-2xl p-4 text-[11px] text-slate-600 space-y-1 text-center">
          <div className="flex items-center justify-center gap-1 font-semibold text-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00c853]" />
            <span>Aluguel 100% Regulamentado & Seguro</span>
          </div>
          <p className="text-slate-500">
            Exigência de CNH Categoria A e caução reembolsável após vistoria.
          </p>
        </div>
      </div>
    </div>
  );
};
