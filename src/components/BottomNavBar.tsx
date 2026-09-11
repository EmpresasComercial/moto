import React from 'react';
import { Home, Bike, Landmark, FileText, Users, User } from 'lucide-react';
import { MainTab } from '../types';

interface BottomNavBarProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  activeReservationsCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  activeReservationsCount,
}) => {
  const tabs = [
    {
      id: 'home' as MainTab,
      label: 'Home',
      icon: Home,
      badge: null,
    },
    {
      id: 'aluguel' as MainTab,
      label: 'Aluguel',
      icon: Bike,
      badge: null,
    },
    {
      id: 'deposito' as MainTab,
      label: 'Depósito',
      icon: Landmark,
      badge: 'IBAN',
    },
    {
      id: 'faturas' as MainTab,
      label: 'Faturas',
      icon: FileText,
      badge: 'NF',
    },
    {
      id: 'equipe' as MainTab,
      label: 'Equipe',
      icon: Users,
      badge: 'Bônus',
    },
    {
      id: 'perfil' as MainTab,
      label: 'Perfil',
      icon: User,
      badge: activeReservationsCount > 0 ? activeReservationsCount : null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-xl px-2 py-1.5 sm:py-2">
      <div className="max-w-md sm:max-w-lg mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-2xl transition-all cursor-pointer relative min-h-[48px] ${
                isActive
                  ? 'text-[#00a840] font-black'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              {/* Active subtle background pill */}
              {isActive && (
                <span className="absolute inset-x-2 inset-y-1 bg-[#eafff2] border border-[#9bf6c4]/60 rounded-xl -z-10 animate-fade-in" />
              )}

              {/* Icon with potential badge */}
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#00c853]' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-3 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#00c853] text-white leading-tight shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-black text-[#009935]' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
