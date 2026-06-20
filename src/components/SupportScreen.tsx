import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { gatewayCall } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export const SupportScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert } = useApp();
  const [gerenteUrl, setGerenteUrl] = useState<string | null>(null);
  const [grupoUrl, setGrupoUrl] = useState<string | null>(null);
  const [mensagemIndisponibilidade, setMensagemIndisponibilidade] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupportLinks = async () => {
      try {
        const response = await gatewayCall(901);
        if (response && response.success && response.result) {
          setGerenteUrl(response.result.whatsapp_gerente_url);
          setGrupoUrl(response.result.whatsapp_grupo);
          setMensagemIndisponibilidade(response.result.mensagem_indisponibilidade);
        }
      } catch (err) {
        console.error('Error in fetchSupportLinks:', err);
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
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <div className="flex-1 text-center pr-10 text-[17px] font-normal text-[#111827]">
          Suporte
        </div>
      </div>

      {/* Support Links Section */}
      <div className="bg-white mt-3">
        {/* Title Bar matching HomeTab style */}
        <div className="bg-[#dbe4f0] px-4 py-2 border-b border-neutral-200 select-none">
          <h2 className="text-[12.5px] text-neutral-600 tracking-wide font-medium">
            Canais de Atendimento
          </h2>
        </div>

        <div className="px-4 py-2 flex flex-col">
          
          {/* Link 1: Grupo */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <a 
              href="#" 
              onClick={(e) => handleLinkClick(e, grupoUrl)}
              className="text-[#2563eb] text-[14px] leading-snug flex-1 pr-4"
            >
              Grupo de venda Asiaray
            </a>
            <span 
              className="text-[#059669] font-bold text-[12px] underline whitespace-nowrap cursor-pointer active:opacity-70"
              onClick={(e) => handleLinkClick(e, grupoUrl)}
            >
              Abrir
            </span>
          </div>

          {/* Link 2: Gerente */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <a 
              href="#" 
              onClick={(e) => handleLinkClick(e, gerenteUrl)}
              className="text-[#2563eb] text-[14px] leading-snug flex-1 pr-4"
            >
              Gerente Regional
            </a>
            <span 
              className="text-[#059669] font-bold text-[12px] underline whitespace-nowrap cursor-pointer active:opacity-70"
              onClick={(e) => handleLinkClick(e, gerenteUrl)}
            >
              Abrir
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};


