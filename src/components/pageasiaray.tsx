import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const RegistrationPolicyModal: React.FC<{ isOpen: boolean, onClose: () => void, onAccept: () => void }> = ({ isOpen, onClose, onAccept }) => {
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      setIsScrolledToBottom(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[400px] max-h-[90vh] bg-white rounded-[16px] shadow-2xl flex flex-col font-sans overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between py-3.5 px-4 border-b border-neutral-100">
          <span className="text-[16px] font-bold text-neutral-800 tracking-tight">Políticas da Empresa</span>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 focus:outline-none p-0.5 cursor-pointer"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div 
          className="px-5 py-5 overflow-y-auto"
          onScroll={handleScroll}
        >
          <div className="space-y-6 text-[13px] text-neutral-600 leading-relaxed font-sans pb-4 select-text">
            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">1. Introdução</h2>
              <p className="mb-2">Bem-vindo à Asiaray. Estes Termos de Utilização (“Termos”) regulam a utilização dos nossos serviços, aplicações, website e plataformas digitais (coletivamente designados por “Serviços”).</p>
              <p>Ao criar uma conta ou utilizar qualquer Serviço da Asiaray, o utilizador declara ter lido, compreendido e aceitado estes Termos na íntegra, bem como a nossa Política de Privacidade. Caso não concorde com qualquer disposição, não deve criar conta nem utilizar os Serviços.</p>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">2. Definições</h2>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li><strong>Asiaray / Nós / Nosso:</strong> refere-se à Asiaray Angola e Asiaray Group, suas afiliadas e operadores da plataforma.</li>
                <li><strong>Utilizador:</strong> qualquer pessoa física maior de 18 anos que cria conta e utiliza os Serviços.</li>
                <li><strong>Conta:</strong> perfil criado pelo utilizador na plataforma.</li>
                <li><strong>WS:</strong> produtos/serviços de rede, investimento ou programas de expansão mencionados na plataforma.</li>
                <li><strong>Levantamento:</strong> pedido de transferência de fundos da conta Asiaray para conta bancária do utilizador.</li>
                <li><strong>Depósito:</strong> transferência de fundos para a conta Asiaray.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">3. Quem Somos</h2>
              <p>Sobre a Asiaray Media Group Limited<br />A Asiaray Media Group Limited (código de ações na Bolsa de Valores de Hong Kong: 1993) é uma empresa de mídia exterior na região da Grande China, com foco estratégico na gestão de publicidade em grandes meios de transporte, como aeroportos, linhas de metrô e trens de alta velocidade.</p>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">4. Elegibilidade</h2>
              <p>Os Serviços são destinados exclusivamente a pessoas com idade igual ou superior a 18 anos, residentes em jurisdições onde a utilização seja legal. É proibida a utilização por menores, pessoas sancionadas ou em jurisdições restritas.</p>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">5. Registo e Acesso à Conta</h2>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Para aceder aos Serviços é obrigatório criar uma conta fornecendo número de telefone válido.</li>
                <li>O utilizador é responsável por manter a confidencialidade da sua palavra-passe e de todas as atividades realizadas na sua conta.</li>
                <li>A Asiaray reserva-se o direito de recusar ou encerrar contas a qualquer momento, sem aviso prévio, por violação destes Termos.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">6. Utilização dos Serviços</h2>
              <p className="mb-2">O utilizador compromete-se a utilizar os Serviços apenas para fins lícitos e em conformidade com estes Termos. É proibido:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Usar a plataforma para atividades ilegais, fraude, branqueamento de capitais ou spam;</li>
                <li>Tentar obter acesso não autorizado a sistemas da Asiaray;</li>
                <li>Interferir no funcionamento normal da plataforma;</li>
                <li>Fornecer informações falsas ou enganosas.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">7. Produtos e Serviços WS</h2>
              <p>Os produtos e serviços WS seguem regras específicas detalhadas na plataforma. O utilizador deve ler atentamente as condições de cada produto antes de participar. A Asiaray não garante rendimentos ou resultados específicos.</p>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">8. Conteúdo do Utilizador</h2>
              <p>O utilizador é o único responsável pelo conteúdo que publica ou envia (incluindo capturas de comprovativos de depósito). Ao submeter conteúdo, concede à Asiaray licença mundial, não exclusiva e gratuita para usar, armazenar e exibir esse conteúdo na prestação dos Serviços.</p>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">9. Direitos e Responsabilidades do Utilizador</h2>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Manter os dados da conta atualizados;</li>
                <li>Cumprir todas as leis aplicáveis;</li>
                <li>Reportar imediatamente qualquer uso não autorizado da sua conta;</li>
                <li>Abster-se de comportamentos abusivos ou que prejudiquem outros utilizadores ou a plataforma.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">10. Direitos da Asiaray</h2>
              <p className="mb-2">Reservamo-nos o direito de:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Modificar, suspender ou interromper qualquer parte dos Serviços;</li>
                <li>Remover conteúdo que viole estes Termos;</li>
                <li>Realizar verificações de identidade e anti-fraude;</li>
                <li>Cooperar com autoridades competentes quando exigido por lei.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">11. Política de Depósitos</h2>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Os depósitos devem ser realizados através dos canais oficiais indicados na plataforma.</li>
                <li>O utilizador deve enviar comprovativos claros (capturas de ecrã) para validação.</li>
                <li>A Asiaray não se responsabiliza por depósitos efetuados em contas erradas ou fora dos canais oficiais.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">12. Política de Levantamentos</h2>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Os pedidos de levantamento são processados mediante verificação de dados bancários (IBAN válido em nome do titular da conta).</li>
                <li>A Asiaray pode solicitar documentos adicionais para prevenir fraude.</li>
                <li>Os prazos de processamento dependem do método escolhido e de verificações internas.</li>
                <li>Levantamentos só são permitidos para fundos disponíveis e não bloqueados por regras operacionais.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">13. Taxas Operacionais</h2>
              <p>As taxas aplicáveis a depósitos, levantamentos, serviços WS e outras operações estão claramente indicadas na plataforma e podem ser atualizadas periodicamente. O utilizador é responsável pelo pagamento das taxas devidas.</p>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">14. Política de Equipas e Expansão da Rede</h2>
              <p>A expansão de rede (quando aplicável) deve respeitar as regras de recrutamento ético e legal. É proibida a utilização de práticas enganosas, pressão indevida ou falsas promessas de ganhos.</p>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">15. Contas Pagas e Faturação</h2>
              <p>Quando aplicável, as contas pagas ou subscrições são renovadas automaticamente até serem canceladas pelo utilizador, respeitando os prazos de cancelamento indicados.</p>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">16. Suspensão e Encerramento de Contas</h2>
              <p className="mb-2">A Asiaray pode suspender ou encerrar contas imediatamente, sem aviso prévio, em caso de:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Violação destes Termos;</li>
                <li>Suspeita de fraude ou atividade ilegal;</li>
                <li>Inatividade prolongada;</li>
                <li>Exigência legal ou regulatória.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">17. Exclusão de Garantias</h2>
              <p>Os Serviços são fornecidos “no estado em que se encontram”. A Asiaray não oferece quaisquer garantias, expressas ou implícitas, quanto à continuidade, precisão, fiabilidade ou ausência de erros na plataforma.</p>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">18. Limitação da Responsabilidade</h2>
              <p>Na medida máxima permitida por lei, a Asiaray não será responsável por danos indiretos, incidentais, consequenciais, perda de lucros ou danos resultantes da utilização ou impossibilidade de utilização dos Serviços.</p>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">19. Resolução de Litígios</h2>
              <p>Qualquer disputa será resolvida preferencialmente por via amigável. Na impossibilidade, os litígios serão submetidos aos tribunais competentes de Angola.</p>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">20. Propriedade Intelectual</h2>
              <p>Todo o conteúdo, marcas, logos, software e materiais da Asiaray são propriedade exclusiva da Asiaray ou dos seus licenciadores. É proibida a cópia, modificação ou utilização não autorizada.</p>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">21. Conformidade e Segurança</h2>
              <p>O utilizador compromete-se a cumprir todas as leis anti-branqueamento, contra-terrorismo e proteção de dados aplicáveis. A Asiaray implementa medidas de segurança, mas não garante proteção absoluta contra todas as ameaças.</p>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">22. Alterações aos Termos</h2>
              <p>Podemos atualizar estes Termos periodicamente. A versão atualizada será publicada com a data de entrada em vigor. A continuação da utilização dos Serviços após a publicação constitui aceitação dos novos Termos.</p>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">23. Lei Aplicável</h2>
              <p>Estes Termos regem-se pela legislação de Angola.</p>
            </div>

            <div>
              <h2 className="font-bold text-neutral-800 text-sm mb-2">24. Disposições Gerais</h2>
              <ul className="list-disc pl-5 mt-1 space-y-1 mb-2">
                <li>Se qualquer disposição for considerada inválida, as restantes permanecem em vigor.</li>
                <li>Estes Termos constituem o acordo integral entre o utilizador e a Asiaray.</li>
                <li>Qualquer notificação será enviada para o e-mail ou telefone registado na conta.</li>
                <li>Contacto: <a href="mailto:asiaraygrupo@asiary.it.com" className="text-blue-600 hover:underline">asiaraygrupo@asiary.it.com</a></li>
              </ul>
              <p className="mt-4 font-semibold text-neutral-800">Ao utilizar a Asiaray, o utilizador confirma que leu e aceita estes Termos de Utilização e a Política de Privacidade.</p>
            </div>
            
            <div className="pt-10 pb-4 text-center text-neutral-400 italic">Fim do documento.</div>
          </div>
        </div>

        {/* Footer with disabled/enabled button */}
        <div className="px-5 py-4 border-t border-neutral-100 bg-neutral-50/50">
          <button
            type="button"
            disabled={!isScrolledToBottom}
            onClick={() => {
              if (isScrolledToBottom) {
                onAccept();
                onClose();
              }
            }}
            className={`w-full h-10 font-bold text-[13px] rounded-[8px] transition-all flex items-center justify-center cursor-pointer select-none ${
              isScrolledToBottom 
                ? 'bg-[#1e88e5] hover:bg-[#1565c0] text-white shadow-sm' 
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            Concordar com os Termos
          </button>
        </div>
      </div>
    </div>
  );
};

export const LoginScreen: React.FC = () => {
  const { login, registerUser, showLoading, hideLoading, addToast } = useApp();
  
  const location = useLocation();
  const navigate = useNavigate();
  const { inviteCode } = useParams();
  
  // Força o modo 'cadastro' sempre que houver código de convite na URL,
  // ou se o caminho não for estritamente '/login'
  const isLoginRoute = location.pathname.toLowerCase() === '/login';
  const currentView = (isLoginRoute && !inviteCode) ? 'login' : 'cadastro';
  
  const [phone, setPhone] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [convite, setConvite] = useState<string>('');
  const [verificacao, setVerificacao] = useState<string>('');
  const [showSenha, setShowSenha] = useState<boolean>(false);
  const [termosAceitos, setTermosAceitos] = useState<boolean>(false);
  const [showLoginPopup, setShowLoginPopup] = useState<boolean>(false);
  const [popupCountdown, setPopupCountdown] = useState<number>(6);
  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(false);
  
  const [captchaText, setCaptchaText] = useState<string>('FyPAE');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let text = '';
    for (let i = 0; i < 5; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
  };

  useEffect(() => {
    generateCaptcha();
  }, [currentView]);

  useEffect(() => {
    let timer: number;
    if (currentView === 'login') {
      setShowLoginPopup(true);
      setPopupCountdown(6);
      timer = window.setInterval(() => {
        setPopupCountdown((prev) => {
          if (prev <= 1) {
            setShowLoginPopup(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setShowLoginPopup(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentView]);

  // Auto-preenche código de convite se vier pela URL /reg/smid/:inviteCode
  useEffect(() => {
    if (inviteCode) {
      setConvite(inviteCode);
    }
  }, [inviteCode]);

  const handleSubmitCadastro = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone) {
      addToast('Por favor, informe seu número de telefone.', 'warning');
      return;
    }

    // Validação: telefone deve ter pelo menos 9 dígitos
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9) {
      addToast('Número de telefone inválido. Deve ter pelo menos 9 dígitos.', 'warning');
      return;
    }

    if (!senha) {
      addToast('Por favor, digite sua senha de segurança.', 'warning');
      return;
    }

    // Validação CRÍTICA: Supabase exige senha com mínimo 6 caracteres
    if (senha.length < 6) {
      addToast('A senha deve ter pelo menos 6 caracteres.', 'warning');
      return;
    }

    if (!convite) {
      addToast('Por favor, informe o código de convite obrigatório.', 'warning');
      return;
    }

    // Validação do formato do código de convite: AS + 5 dígitos + S (ex: AS09030S)
    const invitePattern = /^AS\d{5}S$/;
    if (!invitePattern.test(convite.trim())) {
      addToast('Código de convite inválido. Formato esperado: AS + 5 números + S (ex: AS09030S).', 'error');
      return;
    }

    if (verificacao.toLowerCase() !== captchaText.toLowerCase()) {
      addToast('Código de verificação incorreto.', 'error');
      generateCaptcha();
      setVerificacao('');
      return;
    }

    showLoading('Criando e registando a sua conta Asiaray...');

    (async () => {
      try {
        await registerUser(cleanPhone.trim(), senha.trim(), convite.trim());
      } catch (err) {
        // O próprio registerUser já mostra toast de erro com a mensagem do banco
      } finally {
        hideLoading();
      }
    })();
  };

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone) {
      addToast('Por favor, informe seu número de telefone.', 'warning');
      return;
    }
    if (!senha) {
      addToast('Por favor, digite sua senha.', 'warning');
      return;
    }

    showLoading('A validar credenciais de conta...');

    (async () => {
      try {
        const ok = await login(phone.trim(), senha.trim());
        // O próprio login já trata a exibição de toasts de erro ou sucesso baseados no banco/Supabase.
      } catch (err) {
        // Tratado no AppContext
      } finally {
        hideLoading();
      }
    })();
  };

  return (
    <div 
      className="min-h-screen w-full bg-white flex flex-col font-sans animate-fadeIn"
      id="auth-screen-root"
    >
      {/* Logo */}
      <div className="flex items-center justify-center py-6 bg-white border-b border-gray-100 select-none">
        <img src="/asiaray-logo-leve.webp" alt="Asiaray Group" className="h-[160px] object-contain" />
      </div>


      <div className="flex-1 p-3 space-y-4 bg-white overflow-y-auto">

        {currentView === 'cadastro' ? (
          <form onSubmit={handleSubmitCadastro} className="space-y-4" id="form-cadastro-asiaray">
            

            <div className="border border-gray-200 bg-white rounded-sm overflow-hidden">
              

              <div className="border-b border-gray-200">
                <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Número de Telefone</div>
                <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200">
                  <input 
                    id="cadastro-phone-field"
                    type="tel" 
                    placeholder="Por favor inser nº celular"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\s+/g, ''))}
                    className="bg-transparent border-none outline-none w-full text-neutral-800 text-[12px] font-sans"
                  />
                </div>
              </div>


              <div className="border-b border-gray-200">
                <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Senha <span className="text-gray-400 font-normal">(mín. 6 caracteres)</span></div>
                <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200 flex items-center gap-1">
                  <input 
                    id="cadastro-senha-field"
                    type={showSenha ? 'text' : 'password'}
                    placeholder="Introduza a sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    minLength={6}
                    className="bg-transparent border-none outline-none flex-1 text-neutral-800 text-[12px] font-sans"
                  />
                  <button
                    id="toggle-senha-visibility-cadastro"
                    type="button"
                    onClick={() => setShowSenha(prev => !prev)}
                    className="shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showSenha ? (
                      /* Eye-off icon */
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      /* Eye icon */
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Código do convite */}
              <div className="border-b border-gray-200">
                <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Código do Convite</div>
                <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200">
                  <input 
                    id="cadastro-invitation-field"
                    type="text" 
                    placeholder="Ex: AS09030S"
                    value={convite}
                    onChange={(e) => setConvite(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-neutral-800 text-[12px] font-sans"
                  />
                </div>
              </div>

              {/* Código de verificação */}
              <div>
                <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Código de Verificação</div>
                <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200 flex items-center gap-2">
                  <input 
                    id="cadastro-verificacao-field"
                    type="text" 
                    placeholder="Código de verificação"
                    value={verificacao}
                    onChange={(e) => setVerificacao(e.target.value.replace(/\s+/g, ''))}
                    className="bg-transparent border-none outline-none flex-1 text-neutral-800 text-[12px] font-sans"
                  />
                  <div 
                    onClick={generateCaptcha}
                    className="w-[90px] shrink-0 bg-white rounded-[3px] border border-gray-300 h-[28px] relative overflow-hidden flex items-center justify-center cursor-pointer select-none"
                    title="Toque para reconfigurar código"
                    id="cadastro-verification-captcha-box"
                  >
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100%" height="100%" fill="#f9fafb" />
                      <path d="M-10,20 Q30,8 60,24 T130,10" stroke="#4caf50" strokeWidth="1" fill="none" opacity="0.4" />
                      <path d="M-20,10 Q25,30 70,12 T140,25" stroke="#2e7d32" strokeWidth="1.2" fill="none" opacity="0.5" />
                    </svg>
                    <div className="relative font-mono text-[13px] font-bold text-[#2e7d32] tracking-wider flex items-center justify-center gap-[2px] select-none uppercase">
                      {captchaText.split('').map((char, index) => {
                        const rot = (index % 2 === 0 ? 1 : -1) * (10 + index * 3);
                        return (
                          <span 
                            key={index}
                            style={{ 
                              display: 'inline-block',
                              transform: `rotate(${rot}deg)` 
                            }}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Termos de Uso */}
            <div className="flex items-start gap-2 px-1 select-none mt-2">
              <div 
                className={`w-[18px] h-[18px] mt-0.5 flex shrink-0 items-center justify-center rounded-[3px] transition-colors border-2 cursor-pointer ${termosAceitos ? 'bg-[#3b82f6] border-[#3b82f6]' : 'bg-transparent border-[#eab308]'}`}
                onClick={() => setTermosAceitos(!termosAceitos)}
              >
                {termosAceitos && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <span className="text-[12px] text-gray-600 leading-tight">
                Concordo com os{' '}
                <span className="text-blue-600 underline cursor-pointer hover:text-blue-800 font-medium" onClick={() => setShowPolicyModal(true)}>Termos de Uso</span>
                {' '}e a{' '}
                <span className="text-blue-600 underline cursor-pointer hover:text-blue-800 font-medium" onClick={() => setShowPolicyModal(true)}>Política de Privacidade</span>
              </span>
            </div>

            {/* Buttons */}
            <div className="flex flex-col items-center justify-center gap-3 select-none">
              <button
                id="submit-register-action-btn"
                type="submit"
                disabled={!termosAceitos}
                className={`${termosAceitos ? 'bg-[#60a5fa] hover:bg-[#3b82f6] cursor-pointer' : 'bg-gray-400 cursor-not-allowed'} text-white font-bold text-[12px] py-2.5 px-6 rounded-sm transition-colors w-full text-center uppercase tracking-wide`}
              >
                Registar
              </button>
              <button 
                id="toggle-to-login-view-btn"
                type="button"
                onClick={() => navigate('/login')}
                className="bg-white hover:bg-gray-50 text-[#0a52a3] font-bold text-[12px] py-2.5 px-6 rounded-sm cursor-pointer transition-colors w-full text-center border border-gray-200"
              >
                Já tenho conta — Login
              </button>
            </div>


          </form>
        ) : (
          <form onSubmit={handleSubmitLogin} className="space-y-4" id="form-login-asiaray">
            
            {/* Input fields box */}
            <div className="border border-gray-200 bg-white rounded-sm overflow-hidden">

              {/* Phone */}
              <div className="border-b border-gray-200">
                <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Número de Telefone</div>
                <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200">
                  <input 
                    id="login-phone-field"
                    type="tel" 
                    placeholder="Seu telemóvel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\s+/g, ''))}
                    className="bg-transparent border-none outline-none w-full text-neutral-800 text-[12px] font-sans"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Senha</div>
                <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200 flex items-center gap-1">
                  <input 
                    id="login-senha-field"
                    type={showSenha ? 'text' : 'password'}
                    placeholder="Sua senha de acesso"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="bg-transparent border-none outline-none flex-1 text-neutral-800 text-[12px] font-sans"
                  />
                  <button
                    id="toggle-senha-visibility-login"
                    type="button"
                    onClick={() => setShowSenha(prev => !prev)}
                    className="shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showSenha ? (
                      /* Eye-off icon */
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      /* Eye icon */
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col items-center justify-center gap-3 select-none">
              <button 
                id="submit-login-action-btn"
                type="submit"
                className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white font-bold text-[12px] py-2.5 px-6 rounded-sm cursor-pointer transition-colors w-full text-center uppercase tracking-wide"
              >
                Login
              </button>
              <button 
                id="toggle-to-cadastro-view-btn"
                type="button"
                onClick={() => navigate('/register')}
                className="bg-white hover:bg-gray-50 text-[#0a52a3] font-bold text-[12px] py-2.5 px-6 rounded-sm cursor-pointer transition-colors w-full text-center border border-gray-200"
              >
                Não tem conta? Registar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Pop-up WhatsApp for Login */}
      {showLoginPopup && currentView === 'login' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            aria-hidden="true"
          />
          <div className="relative z-10 bg-white rounded-2xl w-full max-w-[270px] overflow-hidden flex flex-col shadow-xl border border-neutral-100/50 animate-scaleIn">
            <div className="px-5 py-6 text-center">
              <p className="text-[14px] font-normal text-neutral-800 leading-snug">
                Entre no grupo de WhatsApp do <span className="text-[#2563eb] font-semibold">grupo de venda</span>
              </p>
            </div>
            
            <div className="border-t border-neutral-100 flex">
              <button
                type="button"
                onClick={() => setShowLoginPopup(false)}
                className="flex-1 py-3 text-[14px] font-normal text-neutral-500 hover:bg-neutral-50 active:bg-neutral-100 border-r border-neutral-100 focus:outline-none transition-colors cursor-pointer"
              >
                Entendi ({popupCountdown}s)
              </button>
              <a
                href="https://chat.whatsapp.com/KuvqmnwRitGIJi5PsYqt4W"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowLoginPopup(false)}
                className="flex-1 py-3 text-[14px] font-bold text-[#2563eb] hover:bg-neutral-50 active:bg-neutral-100 focus:outline-none transition-colors cursor-pointer text-center block"
              >
                Entrar
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Registration Policies Modal */}
      <RegistrationPolicyModal 
        isOpen={showPolicyModal} 
        onClose={() => setShowPolicyModal(false)} 
        onAccept={() => setTermosAceitos(true)} 
      />
    </div>
  );
};
