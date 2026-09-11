import React from 'react';
import { 
  Bike, 
  ShieldCheck, 
  Home, 
  Users, 
  User, 
  FileText, 
  HelpCircle, 
  LogOut, 
  LogIn, 
  UserPlus,
  Landmark
} from 'lucide-react';
import { UserProfile, MainTab, AuthView } from '../types';

interface HeaderProps {
  currentTab: MainTab;
  setCurrentTab: (tab: MainTab) => void;
  authView: AuthView;
  setAuthView: (view: AuthView) => void;
  user: UserProfile;
  activeReservationsCount: number;
  onOpenCnh: () => void;
  onOpenReservations: () => void;
  onOpenRules: () => void;
  onOpenSupport: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  authView,
  setAuthView,
  user,
  activeReservationsCount,
  onOpenCnh,
  onOpenReservations,
  onOpenRules,
  onOpenSupport,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 transition-all shadow-xs">
      {/* Top micro-bar with vibrant green */}
      <div className="bg-[#00c853] text-white text-xs py-1.5 px-4 font-medium shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-white shrink-0 drop-shadow-xs" />
            <span className="truncate font-semibold">
              Locação transparente de motos • Caução 100% estornável pós-vistoria • Sem taxas ocultas
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-white/95 text-[11px]">
            <span>Central SOS 24h: 0800 770 2026</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-md text-white font-extrabold backdrop-blur-xs">
              Frota 100% Revisada
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <div 
            id="brand-logo"
            onClick={() => {
              if (authView === 'authenticated') {
                setCurrentTab('home');
              } else {
                setAuthView('login');
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#00c853] hover:bg-[#00b341] flex items-center justify-center text-white shadow-md transition-colors">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Asiary <span className="text-[#00c853]">Moto</span>
                </span>
                <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-[#eafff2] text-[#009935] border border-[#9bf6c4]">
                  Aluguel
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Plataforma oficial de locação
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (when authenticated) */}
          {authView === 'authenticated' && (
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              <button
                id="nav-home"
                onClick={() => setCurrentTab('home')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'home'
                    ? 'bg-[#00c853] text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Home className={`w-4 h-4 ${currentTab === 'home' ? 'text-white' : 'text-[#00c853]'}`} />
                <span>Home</span>
              </button>

              <button
                id="nav-aluguel"
                onClick={() => setCurrentTab('aluguel')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'aluguel'
                    ? 'bg-[#00c853] text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Bike className={`w-4 h-4 ${currentTab === 'aluguel' ? 'text-white' : 'text-[#00c853]'}`} />
                <span>Aluguel</span>
              </button>

              <button
                id="nav-deposito"
                onClick={() => setCurrentTab('deposito')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'deposito'
                    ? 'bg-[#00c853] text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Landmark className={`w-4 h-4 ${currentTab === 'deposito' ? 'text-white' : 'text-[#00c853]'}`} />
                <span>Depósito IBAN</span>
              </button>

              <button
                id="nav-faturas"
                onClick={() => setCurrentTab('faturas')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'faturas'
                    ? 'bg-[#00c853] text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className={`w-4 h-4 ${currentTab === 'faturas' ? 'text-white' : 'text-[#00c853]'}`} />
                <span>Faturas</span>
              </button>

              <button
                id="nav-equipe"
                onClick={() => setCurrentTab('equipe')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'equipe'
                    ? 'bg-[#00c853] text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className={`w-4 h-4 ${currentTab === 'equipe' ? 'text-white' : 'text-[#00c853]'}`} />
                <span>Equipe & Partilha</span>
              </button>

              <button
                id="nav-perfil"
                onClick={() => setCurrentTab('perfil')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'perfil'
                    ? 'bg-[#00c853] text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <User className={`w-4 h-4 ${currentTab === 'perfil' ? 'text-white' : 'text-[#00c853]'}`} />
                <span>Perfil</span>
              </button>

              {/* Utility shortcuts */}
              <div className="h-4 w-px bg-slate-200 mx-1" />

              <button
                onClick={onOpenReservations}
                className="px-2.5 py-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all text-[11px] flex items-center gap-1 cursor-pointer font-medium"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Reservas</span>
                {activeReservationsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#00c853]"></span>
                )}
              </button>

              <button
                onClick={onOpenRules}
                className="px-2.5 py-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all text-[11px] cursor-pointer font-medium"
              >
                Regras & Caução
              </button>

              <button
                onClick={onOpenSupport}
                className="px-2.5 py-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all text-[11px] flex items-center gap-1 cursor-pointer font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>SOS 24h</span>
              </button>
            </nav>
          )}

          {/* Right Area: Profile / Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {authView === 'authenticated' ? (
              <div className="flex items-center gap-2">
                <button
                  id="header-user-status-btn"
                  onClick={() => setCurrentTab('perfil')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-slate-200 hover:border-[#00c853] hover:bg-[#eafff2]/50 transition-all text-left cursor-pointer shadow-2xs"
                  title="Acessar Minha Página de Perfil"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#00c853] text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                    {user.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {user.fullName.split(' ')[0]}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#009935] font-bold">
                      <span>R$ {user.walletBalance.toFixed(2)}</span>
                      <span>•</span>
                      <span>Cat. {user.cnhCategory}</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={onLogout}
                  className="hidden sm:flex items-center justify-center p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                  title="Sair da Conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold">
                <button
                  onClick={() => setAuthView('login')}
                  className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                    authView === 'login'
                      ? 'bg-[#00c853] text-white font-bold shadow-xs'
                      : 'bg-[#eafff2] text-[#009935] border border-[#9bf6c4] hover:bg-[#cbfae0]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Entrar</span>
                  </span>
                </button>

                <button
                  onClick={() => setAuthView('register')}
                  className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                    authView === 'register'
                      ? 'bg-[#00c853] text-white font-bold shadow-xs ring-2 ring-[#00c853]/40'
                      : 'bg-[#00c853] text-white hover:bg-[#00b341] shadow-xs'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Cadastre-se</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
