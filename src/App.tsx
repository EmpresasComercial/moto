import React, { useState } from 'react';
import { Header } from './components/Header';
import { NoticeBanner } from './components/NoticeBanner';
import { BottomNavBar } from './components/BottomNavBar';
import { HomeView } from './components/HomeView';
import { ProductsRentView } from './components/ProductsRentView';
import { TeamShareView } from './components/TeamShareView';
import { ProfileView } from './components/ProfileView';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { ActiveReservationsView } from './components/ActiveReservationsView';
import { CnhVerificationView } from './components/CnhVerificationView';
import { ContractRulesView } from './components/ContractRulesView';
import { DepositIbanView } from './components/DepositIbanView';
import { FaturasView } from './components/FaturasView';
import { MotorcycleDetailModal } from './components/MotorcycleDetailModal';
import { BookingWizardModal } from './components/BookingWizardModal';
import { SupportModal } from './components/SupportModal';
import { Footer } from './components/Footer';
import { useApp } from './context/AppContext';
import { 
  INITIAL_LOCATIONS, 
  INITIAL_USER 
} from './data/initialData';
import { Motorcycle, UserProfile, RentalReservation, MainTab, AuthView, IbanDepositRecord } from './types';

export default function App() {
  // Authentication View State ('authenticated' | 'login' | 'register')
  const [authView, setAuthView] = useState<AuthView>('authenticated');

  // Main Page Tabs ('home' | 'aluguel' | 'deposito' | 'faturas' | 'equipe' | 'perfil')
  const [currentTab, setCurrentTab] = useState<MainTab>('home');

  // Sub-view overlays when navigating from Perfil or Quick Links
  const [activeSubView, setActiveSubView] = useState<'none' | 'reservas' | 'cnh' | 'regras'>('none');

  // Reserva selecionada para refaturar diretamente
  const [selectedReservaForRefatura, setSelectedReservaForRefatura] = useState<string | null>(null);

  // Application Data States do Contexto Global Supabase / Local
  const {
    user,
    setUser,
    reservations,
    setReservations,
    ibanDeposits,
    setIbanDeposits,
    teamMembers,
    motorcycles,
    createReservation,
    updateReservation,
    updateWalletBalance,
    addIbanDeposit,
    logout: appLogout
  } = useApp();

  const [locations] = useState(INITIAL_LOCATIONS);

  // Modals
  const [selectedMotoForDetail, setSelectedMotoForDetail] = useState<Motorcycle | null>(null);
  const [selectedMotoForBooking, setSelectedMotoForBooking] = useState<Motorcycle | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Active reservations count
  const activeCount = reservations.filter(
    (r) => r.status === 'confirmed' || r.status === 'ready_for_pickup' || r.status === 'active_rental' || r.status === 'in_return_inspection'
  ).length;

  // Handlers
  const handleConfirmNewBooking = (newReservation: RentalReservation) => {
    createReservation(newReservation);
  };

  const handleUpdateReservation = (updated: RentalReservation) => {
    updateReservation(updated);
  };

  const handleAddIbanDeposit = (newDeposit: IbanDepositRecord) => {
    addIbanDeposit(newDeposit);
  };

  const handleOpenBooking = (moto: Motorcycle) => {
    if (authView !== 'authenticated') {
      setAuthView('login');
      return;
    }
    setSelectedMotoForBooking(moto);
  };

  const handleSelectTab = (tab: MainTab) => {
    setActiveSubView('none');
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setAuthView('authenticated');
    setCurrentTab('home');
    setActiveSubView('none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterSuccess = (registeredUser: UserProfile) => {
    setUser(registeredUser);
    setAuthView('authenticated');
    setCurrentTab('home');
    setActiveSubView('none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRefaturaForReserva = (reservaId: string) => {
    setSelectedReservaForRefatura(reservaId);
    setActiveSubView('none');
    setCurrentTab('faturas');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    appLogout();
    setAuthView('login');
    setActiveSubView('none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateWallet = (newBalance: number) => {
    setUser((prev) => ({
      ...prev,
      walletBalance: newBalance,
    }));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-[#00c853] selection:text-white">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={handleSelectTab}
        authView={authView}
        setAuthView={setAuthView}
        user={user}
        activeReservationsCount={activeCount}
        onOpenCnh={() => {
          setActiveSubView('cnh');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenReservations={() => {
          setActiveSubView('reservas');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenRules={() => {
          setActiveSubView('regras');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSupport={() => setIsSupportModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Transparency & Regulatory Compliance Banner (when authenticated - hidden on Home to let carousel touch top) */}
      {authView === 'authenticated' && activeSubView === 'none' && currentTab !== 'home' && currentTab !== 'equipe' && (
        <NoticeBanner onLearnMoreRules={() => setActiveSubView('regras')} />
      )}

      {/* Main Content Area - 8px margins on Home and flush at top */}
      <main className={`flex-1 w-full mx-auto ${
        currentTab === 'home' && activeSubView === 'none'
          ? 'max-w-7xl px-[8px] pt-0 sm:pt-0'
          : 'max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6'
      }`}>
        {/* 1. AUTHENTICATION PAGES */}
        {authView === 'login' && (
          <LoginView
            defaultUser={user}
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setAuthView('register')}
          />
        )}

        {authView === 'register' && (
          <RegisterView
            defaultUserTemplate={INITIAL_USER}
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateToLogin={() => setAuthView('login')}
          />
        )}

        {/* 2. AUTHENTICATED APP PAGES */}
        {authView === 'authenticated' && (
          <>
            {/* Sub-view Overlays (Reservas, CNH, Regras) */}
            {activeSubView === 'reservas' && (
              <div className="space-y-4 pb-24">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSubView('none')}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                  >
                    ← Voltar para {currentTab.toUpperCase()}
                  </button>
                </div>
                <ActiveReservationsView
                  reservations={reservations}
                  onUpdateReservation={handleUpdateReservation}
                  onNavigateToCatalog={() => handleSelectTab('aluguel')}
                  onOpenSupport={() => setIsSupportModalOpen(true)}
                  onNavigateToRefaturar={handleOpenRefaturaForReserva}
                />
              </div>
            )}

            {activeSubView === 'cnh' && (
              <div className="space-y-4 pb-24">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSubView('none')}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                  >
                    ← Voltar para {currentTab.toUpperCase()}
                  </button>
                </div>
                <CnhVerificationView
                  user={user}
                  onUpdateUser={setUser}
                  onNavigateToCatalog={() => handleSelectTab('aluguel')}
                />
              </div>
            )}

            {activeSubView === 'regras' && (
              <div className="space-y-4 pb-24">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSubView('none')}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                  >
                    ← Voltar para {currentTab.toUpperCase()}
                  </button>
                </div>
                <ContractRulesView
                  onOpenSupport={() => setIsSupportModalOpen(true)}
                  onNavigateToCatalog={() => handleSelectTab('aluguel')}
                />
              </div>
            )}

            {/* Main Tabs when no sub-view is active */}
            {activeSubView === 'none' && (
              <>
                {/* PAGE 1: HOME (with continuous marquee carousel at top) */}
                {currentTab === 'home' && (
                  <HomeView
                    user={user}
                    motorcycles={motorcycles}
                    activeReservationsCount={activeCount}
                    onNavigateToRent={() => handleSelectTab('aluguel')}
                    onNavigateToTeam={() => handleSelectTab('equipe')}
                    onNavigateToReservations={() => {
                      setActiveSubView('reservas');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onNavigateToRules={() => {
                      setActiveSubView('regras');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onNavigateToDeposit={() => handleSelectTab('deposito')}
                    onNavigateToFaturas={() => handleSelectTab('faturas')}
                    onOpenSupport={() => setIsSupportModalOpen(true)}
                    onSelectMotorcycleForBooking={handleOpenBooking}
                    onViewDetails={(moto) => setSelectedMotoForDetail(moto)}
                  />
                )}

                {/* PAGE 2: ALUGUEL (Products / Rental motorcycle catalog) */}
                {currentTab === 'aluguel' && (
                  <ProductsRentView
                    motorcycles={motorcycles}
                    locations={locations}
                    onSelectMotorcycleForBooking={handleOpenBooking}
                    onViewDetails={(moto) => setSelectedMotoForDetail(moto)}
                    onNavigateToRules={() => {
                      setActiveSubView('regras');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                )}

                {/* PAGE 3: DEPÓSITO & PAGAMENTO IBAN */}
                {currentTab === 'deposito' && (
                  <DepositIbanView
                    user={user}
                    reservations={reservations}
                    ibanDeposits={ibanDeposits}
                    onAddIbanDeposit={handleAddIbanDeposit}
                    onUpdateWalletBalance={(amount) => updateWalletBalance(amount)}
                    onOpenSupport={() => setIsSupportModalOpen(true)}
                    onNavigateToReservations={() => {
                      setActiveSubView('reservas');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                )}

                {/* PAGE 3.1: FATURAS & REFATURAS */}
                {currentTab === 'faturas' && (
                  <FaturasView
                    initialReservaIdToRefaturar={selectedReservaForRefatura}
                    onClearInitialReserva={() => setSelectedReservaForRefatura(null)}
                  />
                )}

                {/* PAGE 4: EQUIPE (Team where user copies share link) */}
                {currentTab === 'equipe' && (
                  <TeamShareView
                    user={user}
                    teamMembers={teamMembers}
                    onUpdateWallet={(newBalance) => updateWalletBalance(newBalance - user.walletBalance)}
                  />
                )}

                {/* PAGE 5: PERFIL (Profile page) */}
                {currentTab === 'perfil' && (
                  <ProfileView
                    user={user}
                    activeReservationsCount={activeCount}
                    onLogout={handleLogout}
                    onNavigateToCnh={() => {
                      setActiveSubView('cnh');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onNavigateToReservations={() => {
                      setActiveSubView('reservas');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onNavigateToRules={() => {
                      setActiveSubView('regras');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onNavigateToTeam={() => handleSelectTab('equipe')}
                    onNavigateToDeposit={() => handleSelectTab('deposito')}
                    onNavigateToFaturas={() => handleSelectTab('faturas')}
                    onOpenSupport={() => setIsSupportModalOpen(true)}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {/* 1. Technical Specs & Details Modal */}
      <MotorcycleDetailModal
        motorcycle={selectedMotoForDetail}
        onClose={() => setSelectedMotoForDetail(null)}
        onBookNow={(moto) => {
          setSelectedMotoForDetail(null);
          handleOpenBooking(moto);
        }}
      />

      {/* 2. Step-by-Step Booking Wizard */}
      <BookingWizardModal
        motorcycle={selectedMotoForBooking}
        locations={locations}
        user={user}
        isOpen={Boolean(selectedMotoForBooking)}
        onClose={() => {
          setSelectedMotoForBooking(null);
          if (reservations.length > INITIAL_RESERVATIONS.length) {
            setActiveSubView('reservas');
          }
        }}
        onConfirmBooking={handleConfirmNewBooking}
        onNavigateToCnh={() => {
          setSelectedMotoForBooking(null);
          setActiveSubView('cnh');
        }}
      />

      {/* 3. 24h Support & Roadside Assistance Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      {/* Bottom Navigation Bar (Shown when authenticated) */}
      {authView === 'authenticated' && (
        <BottomNavBar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          activeReservationsCount={activeCount}
        />
      )}

      {/* Footer */}
      <Footer
        onNavigate={(target) => {
          if (target === 'suporte') {
            setIsSupportModalOpen(true);
          } else if (target === 'catalogo') {
            handleSelectTab('aluguel');
          } else if (target === 'reservas') {
            setActiveSubView('reservas');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (target === 'cnh') {
            setActiveSubView('cnh');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (target === 'regras') {
            setActiveSubView('regras');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />
    </div>
  );
}
