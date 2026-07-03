import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import logoImg from '../../assets/logo.asiaarys.png';

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
        await registerUser(cleanPhone, senha, convite.trim());
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
        const ok = await login(phone, senha);
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
        <img src={logoImg} alt="Asiaray Group" className="h-[80px] object-contain" />
      </div>

      {/* Content */}
      <div className="flex-1 p-3 space-y-4 bg-white overflow-y-auto">

        {currentView === 'cadastro' ? (
          <form onSubmit={handleSubmitCadastro} className="space-y-4" id="form-cadastro-asiaray">
            
            {/* Input fields box */}
            <div className="border border-gray-200 bg-white rounded-sm overflow-hidden">
              
              {/* Phone */}
              <div className="border-b border-gray-200">
                <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Número de Telefone</div>
                <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200">
                  <input 
                    id="cadastro-phone-field"
                    type="tel" 
                    placeholder="9XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\s+/g, ''))}
                    className="bg-transparent border-none outline-none w-full text-neutral-800 text-[12px] font-sans"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="border-b border-gray-200">
                <div className="text-[#0a52a3] font-bold text-[12px] px-3 py-1 bg-white">Senha <span className="text-gray-400 font-normal">(mín. 6 caracteres)</span></div>
                <div className="bg-[#f5f5f5] text-gray-700 px-3 py-1.5 text-[12px] border-t border-gray-200 flex items-center gap-1">
                  <input 
                    id="cadastro-senha-field"
                    type={showSenha ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
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
            <div className="flex items-center gap-2 px-1 select-none cursor-pointer" onClick={() => setTermosAceitos(!termosAceitos)}>
              <div 
                className={`w-[18px] h-[18px] flex shrink-0 items-center justify-center rounded-[3px] transition-colors border ${termosAceitos ? 'bg-[#3b82f6] border-[#3b82f6]' : 'bg-[#eab308] border-[#eab308]'}`}
              >
                {termosAceitos && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <span className="text-[12px] text-gray-600">
                Concordo com os Termos de Uso e a Política de Privacidade
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
    </div>
  );
};
