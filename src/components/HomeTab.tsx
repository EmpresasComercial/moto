import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TaskType } from '../types';
import { getAccessToken, GATEWAY_URL } from '../lib/supabase';

interface HomeTabProps {
  setActiveTab: (tab: string) => void;
  setSelectedTaskCategory: (category: TaskType) => void;
  onOpenTeamReport: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ setActiveTab, setSelectedTaskCategory, onOpenTeamReport }) => {
  const { stats } = useApp();
  
  const handleTaskRoomClick = (category: TaskType) => {
    setSelectedTaskCategory(category);
    setActiveTab('tarefa');
  };

  const [teamList, setTeamList] = useState<any[]>([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const resp = await fetch(GATEWAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ op: 801, data: {} })
        });
        const res = await resp.json();
        if (res.success) {
          const arr = Array.isArray(res.result) 
            ? res.result 
            : (res.result?.team && Array.isArray(res.result.team) ? res.result.team : []);
          setTeamList(arr);
        }
      } catch (err) {
        console.error('Erro ao buscar equipa para a Home:', err);
      }
    };
    fetchTeam();
  }, []);

  const AVATAR_POOL = [
    { isReal: true, pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120' },
    { isReal: false },
    { isReal: true, pic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120' },
    { isReal: false },
    { isReal: false },
    { isReal: true, pic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' },
    { isReal: true, pic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120' }
  ];

  // If team is empty, fall back to mock members so screen layout stays robust
  const getRenderedMembers = () => {
    if (teamList.length === 0) {
      return AVATAR_POOL.map((avatar, idx) => ({
        id: `mock-${idx}`,
        phone: `244922***${10 + idx}`,
        ...avatar
      }));
    }

    return teamList.map((mbr, index) => {
      const strToHash = mbr.phone || mbr.id || String(index);
      let hash = 0;
      for (let i = 0; i < strToHash.length; i++) {
        hash = strToHash.charCodeAt(i) + ((hash << 5) - hash);
      }
      const poolIndex = Math.abs(hash) % AVATAR_POOL.length;
      const avatar = AVATAR_POOL[poolIndex];
      return {
        id: mbr.id || index,
        phone: mbr.phone,
        ...avatar
      };
    });
  };

  const renderedMembers = getRenderedMembers();

  return (
    <div id="home-tab-container" className="pb-24 bg-[#f4f6f9] min-h-screen animate-fadeIn font-sans select-none">
      
      {/* 1. Header Media Trailer Widget (Keep exact positioning) */}
      <div className="w-full bg-black" id="home-video-wrapper">
        <video
          src="https://weboss.asiaray.com/2025/06/Greater-Bay-Area-Video.mp4"
          autoPlay
          loop
          controls
          className="w-full"
          style={{ display: 'block' }}
        />
      </div>

      {/* 2. Horizontal Scrolling Marquee Notification */}
      <div className="bg-[#fffde7] text-xs py-2 px-3 overflow-hidden flex items-center gap-2 border-b border-neutral-200" id="marquee-banner">
        <svg className="w-4 h-4 text-orange-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <div className="flex-1 w-full overflow-hidden relative">
          <div className="animate-marquee whitespace-nowrap font-normal text-neutral-600">
            congratulations to new users:594****529 join 📣📣📣 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; congratulations to new users:244922****85 join 📣📣📣 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; congratulations to template tester join 📣📣📣
          </div>
        </div>
      </div>

      {/* 3. Income View dashboard layout */}
      <div className="bg-white border-b-[8px] border-[#f4f6f9]" id="income-view-board">
        {/* Full width flat grey-blue title bar (Edge to Edge) */}
        <div className="bg-[#dbe4f0] px-4 py-2 border-b border-neutral-200 select-none">
          <h2 className="text-[12.5px] text-neutral-600 tracking-wide font-medium">
            Income view ( It's not instant data)
          </h2>
        </div>

        {/* 3x3 Metrics layout exactly matching colors and values in the screenshot */}
        <div className="grid grid-cols-3 py-4 px-4 text-left bg-white select-none gap-x-2 gap-y-4">
          
          {/* Column 1 */}
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium leading-tight">Balance (KZ)</span>
            <span className="text-[14px] font-medium text-[#f35a5a] mt-0.5 font-sans leading-none">
              {stats.balance.toFixed(2)}
            </span>
          </div>
          
          {/* Column 2 */}
          <div className="flex flex-col border-l border-neutral-100 pl-3">
            <span className="text-[10px] text-gray-400 font-medium leading-tight">Ontem (KZ)</span>
            <span className="text-[14px] font-medium text-[#f35a5a] mt-0.5 font-sans leading-none">
              +{stats.incomeYesterday.toFixed(2)}
            </span>
          </div>
          
          {/* Column 3 */}
          <div className="flex flex-col border-l border-neutral-100 pl-3">
            <span className="text-[10px] text-gray-400 font-medium leading-tight">Hoje (KZ)</span>
            <span className="text-[14px] font-medium text-[#f35a5a] mt-0.5 font-sans leading-none">
              {stats.incomeToday.toFixed(2)}
            </span>
          </div>

          {/* Row 2 - Column 1 */}
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium leading-tight">Esta semana (KZ)</span>
            <span className="text-[14px] font-medium text-[#f35a5a] mt-0.5 font-sans leading-none">
              {stats.incomeThisWeek.toFixed(2)}
            </span>
          </div>
          
          {/* Row 2 - Column 2 */}
          <div className="flex flex-col border-l border-neutral-100 pl-3">
            <span className="text-[10px] text-gray-400 font-medium leading-tight">Este mês (KZ)</span>
            <span className="text-[14px] font-medium text-[#f35a5a] mt-0.5 font-sans leading-none">
              +{stats.incomeThisMonth.toFixed(2)}
            </span>
          </div>
          
          {/* Row 2 - Column 3 */}
          <div className="flex flex-col border-l border-neutral-100 pl-3">
            <span className="text-[10px] text-gray-400 font-medium leading-tight">No mês passado (KZ)</span>
            <span className="text-[14px] font-medium text-[#f35a5a] mt-0.5 font-sans leading-none">
              {stats.incomeLastMonth.toFixed(2)}
            </span>
          </div>

          {/* Row 3 - Column 1 */}
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium leading-tight">Total das receitas (KZ)</span>
            <span className="text-[14px] font-medium text-[#f35a5a] mt-0.5 font-sans leading-none">
              {stats.incomeTotal.toFixed(2)}
            </span>
          </div>
          
          {/* Row 3 - Column 2 */}
          <div className="flex flex-col border-l border-neutral-100 pl-3">
            <span className="text-[10px] text-gray-400 font-medium leading-tight">Terminado hoje</span>
            <span className="text-[14px] font-medium text-[#f35a5a] mt-0.5 font-sans leading-none">
              {stats.completedTodayCount}
            </span>
          </div>
          
          {/* Row 3 - Column 3 */}
          <div className="flex flex-col border-l border-neutral-100 pl-3">
            <span className="text-[10px] text-gray-400 font-medium leading-tight">Tarefa inacabada</span>
            <span className="text-[14px] font-medium text-[#f35a5a] mt-0.5 font-sans leading-none">
              {stats.unfinishedCount}
            </span>
          </div>

        </div>
      </div>

      {/* 4. Sala de Tarefas Layout (Edge to Edge) */}
      <div className="bg-white border-b-[8px] border-[#f4f6f9]" id="home-tasks-region">
        <div className="bg-[#dbe4f0] px-4 py-2 border-b border-neutral-200 select-none">
          <h3 className="text-[12.5px] text-neutral-600 tracking-wide font-medium">
            Sala de Tarefas
          </h3>
        </div>
        
        <div className="grid grid-cols-3 gap-2 px-3 py-4 select-none bg-white" id="task-room-grid">
          
          {/* Room 1: TikTok with yellow/orange bg */}
          <div 
            onClick={() => handleTaskRoomClick('Tiktok')}
            className="rounded-[4px] overflow-hidden cursor-pointer flex flex-col justify-between h-[84px] bg-[#ffe29b] relative shadow-none border border-amber-100/40 p-2"
          >
            {/* Top Left Pill Tag */}
            <div className="absolute left-2 top-1.5 w-8 h-2 bg-[#f97316] rounded-full select-none"></div>
            
            <div className="z-10 text-left flex flex-col justify-end h-full pt-4">
              <div className="text-[12px] font-bold text-gray-800 leading-tight">TikTok</div>
              <div className="text-[8.5px] text-gray-600 font-medium mt-0.5 leading-tight">(fazer tarefa)</div>
            </div>

            {/* Hanging Ribbon Medal on Right */}
            <div className="absolute right-2 top-0 pointer-events-none">
              <svg className="w-[26px] h-[38px] text-[#f59e0b]" viewBox="0 0 30 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 0h18v15l-9 6-9-6V0z" fill="currentColor" opacity="0.65" />
                <circle cx="15" cy="28" r="11" fill="currentColor" opacity="0.4" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="15" cy="28" r="8" fill="white" stroke="currentColor" strokeWidth="0.8" />
                <path d="M15 24.5l0.8 1.8 1.9.2-1.4 1.3 0.3 1.9-1.6-1.0-1.6 1.0 0.3-1.9-1.4-1.3 1.9-.2 0.8-1.8z" fill="#f59e0b" />
              </svg>
            </div>
          </div>

          {/* Room 2: Facebook with blue bg */}
          <div 
            onClick={() => handleTaskRoomClick('Facebook')}
            className="rounded-[4px] overflow-hidden cursor-pointer flex flex-col justify-between h-[84px] bg-[#adcbf7] relative shadow-none border border-blue-100/40 p-2"
          >
            {/* Top Left Pill Tag */}
            <div className="absolute left-2 top-1.5 w-8 h-2 bg-[#3b82f6] rounded-full select-none"></div>
            
            <div className="z-10 text-left flex flex-col justify-end h-full pt-4">
              <div className="text-[12px] font-bold text-gray-800 leading-tight">Facebook</div>
              <div className="text-[8.5px] text-gray-600 font-medium mt-0.5 leading-tight">(Anúncio de imagem)</div>
            </div>

            {/* Hanging Ribbon Medal on Right */}
            <div className="absolute right-2 top-0 pointer-events-none">
              <svg className="w-[26px] h-[38px] text-[#3b82f6]" viewBox="0 0 30 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 0h18v15l-9 6-9-6V0z" fill="currentColor" opacity="0.65" />
                <circle cx="15" cy="28" r="11" fill="currentColor" opacity="0.4" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="15" cy="28" r="8" fill="white" stroke="currentColor" strokeWidth="0.8" />
                <path d="M15 24.5l0.8 1.8 1.9.2-1.4 1.3 0.3 1.9-1.6-1.0-1.6 1.0 0.3-1.9-1.4-1.3 1.9-.2 0.8-1.8z" fill="#3b82f6" />
              </svg>
            </div>
          </div>

          {/* Room 3: Whatsapp with grey bg */}
          <div 
            onClick={() => handleTaskRoomClick('Whatsapp')}
            className="rounded-[4px] overflow-hidden cursor-pointer flex flex-col justify-between h-[84px] bg-[#e2e8f0] relative shadow-none border border-gray-200 p-2"
          >
            {/* Top Left Pill Tag */}
            <div className="absolute left-2 top-1.5 w-8 h-2 bg-[#f97316] rounded-full select-none"></div>
            
            <div className="z-10 text-left flex flex-col justify-end h-full pt-4">
              <div className="text-[12px] font-bold text-gray-800 leading-tight">Whatsapp</div>
              <div className="text-[8px] text-gray-500 font-medium mt-0.5 leading-tight">download app para ganhar recompensa</div>
            </div>

            {/* Hanging Ribbon Medal on Right */}
            <div className="absolute right-2 top-0 pointer-events-none">
              <svg className="w-[26px] h-[38px] text-gray-400" viewBox="0 0 30 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 0h18v15l-9 6-9-6V0z" fill="currentColor" opacity="0.65" />
                <circle cx="15" cy="28" r="11" fill="currentColor" opacity="0.4" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="15" cy="28" r="8" fill="white" stroke="currentColor" strokeWidth="0.8" />
                <path d="M15 24.5l0.8 1.8 1.9.2-1.4 1.3 0.3 1.9-1.6-1.0-1.6 1.0 0.3-1.9-1.4-1.3 1.9-.2 0.8-1.8z" fill="gray" />
              </svg>
            </div>
          </div>

        </div>
      </div>

      {/* 5. Lista de membros layout (Edge to Edge) */}
      <div className="bg-white border-b border-neutral-100 mb-24">
        <div className="bg-[#dbe4f0] px-4 py-2 border-b border-neutral-200 select-none">
          <h3 className="text-[12.5px] text-neutral-600 tracking-wide font-medium">
            Lista de membros
          </h3>
        </div>

        <div className="py-4 px-4 flex gap-3 overflow-x-auto no-scrollbar scroll-smooth bg-white" id="home-members-rail">
          {renderedMembers.map(mbr => (
            <div 
              key={mbr.id}
              className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
              onClick={onOpenTeamReport}
            >
              <div className="w-[54px] h-[54px] rounded-full flex items-center justify-center border border-neutral-100 select-none overflow-hidden bg-[#f8fafc]">
                {mbr.isReal ? (
                  <img 
                    referrerPolicy="no-referrer"
                    src={(mbr as any).pic} 
                    alt="avatar" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-[#f1f5f9] flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-[28px] w-[28px] text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {(mbr as any).phone && (
                <span className="text-[8px] text-neutral-400 font-sans text-center leading-tight max-w-[58px] truncate">
                  {(mbr as any).phone}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
