import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { gatewayCall } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export const SupportScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert, showLoading, hideLoading } = useApp();
  
  const [gerenteUrl, setGerenteUrl] = useState<string | null>(() => localStorage.getItem('asiaray_support_gerente'));
  const [grupoUrl, setGrupoUrl] = useState<string | null>(() => localStorage.getItem('asiaray_support_grupo'));
  const [mensagemIndisponibilidade, setMensagemIndisponibilidade] = useState<string | null>(() => localStorage.getItem('asiaray_support_msg'));

  useEffect(() => {
    const fetchSupportLinks = async () => {
      showLoading('Wait...');
      try {
        const response = await gatewayCall(901);
        if (response && response.success && response.result) {
          const newGerente = response.result.whatsapp_gerente_url || '';
          const newGrupo = response.result.whatsapp_grupo || '';
          const newMsg = response.result.mensagem_indisponibilidade || '';

          setGerenteUrl(newGerente);
          setGrupoUrl(newGrupo);
          setMensagemIndisponibilidade(newMsg);

          localStorage.setItem('asiaray_support_gerente', newGerente);
          localStorage.setItem('asiaray_support_grupo', newGrupo);
          localStorage.setItem('asiaray_support_msg', newMsg);
        }
      } catch {
        // silent
      } finally {
        hideLoading();
      }
    };

    fetchSupportLinks();
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/meu');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) return 'bom dia';
    if (hour >= 12 && hour < 18) return 'boa tarde';
    return 'boa noite';
  };

  const handleLinkClick = (e: React.MouseEvent, url: string | null) => {
    e.preventDefault();
    if (!url || url.trim() === '') {
      const saudacao = getGreeting();
      const msgBase = mensagemIndisponibilidade || 'Lamentamos que no momento não seja possível entrar em contacto conosco. Por favor, volte novamente mais tarde.';
      showAlert(`Olá, ${saudacao}. ${msgBase}`, undefined, 'warning');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="pb-24 bg-[#f4f6f9] min-h-screen animate-fadeIn font-sans select-none">
      
      {/* Header */}
      <div className="bg-white flex items-center px-2 py-3 border-b border-neutral-200">
        <button 
          type="button" 
          onClick={handleBack} 
          className="w-10 h-10 flex items-center justify-center text-[#475569] active:bg-gray-100 rounded-full"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <div className="flex-1 text-center pr-10 text-[17px] font-normal text-[#111827]">
          Suporte
        </div>
      </div>

      {/* Support Links Section */}
      <div className="bg-white mt-3">
        {/* Title Bar */}
        <div className="bg-[#edf2f7] px-4 py-2 border-b border-gray-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Canais de Atendimento
          </span>
        </div>

        <div className="flex flex-col">
          
          {/* Link 1: Grupo */}
          <div className="bg-white border-b border-gray-100 last:border-b-0">
            <a 
              href="#" 
              onClick={(e) => handleLinkClick(e, grupoUrl)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <span className="text-[13px] font-normal text-[#2d3748] pr-2 flex-1">
                Grupo de venda Asiaray
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Link 2: Gerente */}
          <div className="bg-white border-b border-gray-100 last:border-b-0">
            <a 
              href="#" 
              onClick={(e) => handleLinkClick(e, gerenteUrl)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <span className="text-[13px] font-normal text-[#2d3748] pr-2 flex-1">
                Gerente Regional
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

        </div>
      </div>

    </div>
  );
};


