import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  PhoneCall, 
  Send, 
  ShieldAlert, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  MapPin,
  FileQuestion,
  Headphones
} from 'lucide-react';
import { ChatMessage } from '../types';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'chat' | 'sos' | 'faq'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'support',
      text: 'Olá! Sou o assistente virtual da Asiary Moto. Como posso ajudar com sua reserva, vistoria, estorno de caução ou assistência na via?',
      timestamp: '10:00',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [sosTriggered, setSosTriggered] = useState(false);

  const quickQuestions = [
    'Quando recebo minha caução de volta?',
    'Como funciona a vistoria de devolução?',
    'Posso prorrogar meu período de aluguel?',
    'Onde encontro uma oficina credenciada?',
  ];

  const handleSendQuestion = (question: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      let reply = 'Nossa equipe de atendimento registrou sua dúvida. Se precisar de auxílio imediato, ligue para 0800 770 2026.';

      if (question.includes('caução')) {
        reply = 'O estorno do depósito de caução é realizado automaticamente em até 24h a 48h úteis após a vistoria final de devolução da moto no pátio, caso não haja pendências de combustível ou avarias.';
      } else if (question.includes('vistoria')) {
        reply = 'A vistoria é realizada presencialmente no pátio com registro fotográfico do odômetro, nível de combustível e lataria. Você recebe o laudo pericial assinado digitalmente na hora.';
      } else if (question.includes('prorrogar')) {
        reply = 'Sim! Você pode prorrogar as diárias diretamente na aba Minhas Reservas ou solicitando aqui no chat até 4 horas antes do término previsto da locação.';
      } else if (question.includes('oficina')) {
        reply = 'A Asiary Moto possui mais de 25 oficinas parceiras em toda a região metropolitana. Revisões periódicas e troca de óleo a cada 3.000km são 100% gratuitas para você.';
      }

      const supportMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'support',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, supportMsg]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Suporte & Central SOS 24 Horas
              </span>
              <h2 className="text-base font-bold text-white">Atendimento ao Cliente Asiary Moto</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'chat'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Chat com Suporte
          </button>
          <button
            onClick={() => setActiveTab('sos')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sos'
                ? 'border-red-600 text-red-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            SOS Emergência / Guincho
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'faq'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Perguntas Frequentes
          </button>
        </div>

        {/* TAB 1: Chat */}
        {activeTab === 'chat' && (
          <div className="flex flex-col flex-1 overflow-hidden min-h-[380px]">
            {/* Quick topics chips */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuestion(q)}
                  className="whitespace-nowrap px-3 py-1.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-lg text-[11px] font-medium transition-colors cursor-pointer shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Messages area */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`block text-[10px] mt-1 ${
                        msg.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inputText.trim()) handleSendQuestion(inputText);
              }}
              className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Digite sua dúvida ou mensagem para a equipe..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Emergency SOS */}
        {activeTab === 'sos' && (
          <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs text-slate-800">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-2 text-red-900">
              <div className="flex items-center gap-2 font-bold text-sm text-red-700">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                <span>Central de Socorro e Resgate 24 Horas</span>
              </div>
              <p className="leading-relaxed">
                Em caso de colisão, pane mecânica ou pneu furado em via pública, nosso serviço de guincho com plataforma própria é acionado em tempo real com raio de atendimento em toda a Grande São Paulo e principais rodovias.
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block text-sm">Disque Emergência Gratuito:</span>
                  <span className="text-xs text-slate-500">Ligação direta 24 horas por dia</span>
                </div>
                <a
                  href="tel:08007702026"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>0800 770 2026</span>
                </a>
              </div>

              {!sosTriggered ? (
                <div className="bg-white border-2 border-dashed border-red-300 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-slate-900 text-sm">Precisa de reboque no local agora?</div>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Nosso sistema obtém as coordenadas do seu veículo via telemetria embarcada e envia o socorrista mais próximo.
                  </p>
                  <button
                    onClick={() => setSosTriggered(true)}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    Simular Acionamento de Guincho SOS
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 text-emerald-950 space-y-2 text-center animate-fade-in">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-bold text-sm">Chamado de Resgate #SOS-9821 Aberto!</div>
                  <p className="text-xs text-emerald-800">
                    O guincho de base mais próxima (Plataforma 04 - Pinheiros) foi despachado. Previsão de chegada estimada: <strong className="text-emerald-950">25 a 35 minutos</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: FAQ */}
        {activeTab === 'faq' && (
          <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs text-slate-700">
            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs mb-1">Qual o tempo para desbloqueio da caução?</h4>
                <p className="text-slate-600 leading-relaxed">
                  Para pagamentos feitos via PIX, o estorno ocorre em até 24h a 48h úteis após a vistoria final. Para cartões de crédito, o cancelamento da pré-autorização é transmitido imediatamente.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs mb-1">Quem pode pilotar a moto alugada?</h4>
                <p className="text-slate-600 leading-relaxed">
                  Apenas o titular com CNH Categoria A devidamente cadastrado e validado no momento da locação. É expressamente proibido repassar o veículo a terceiros.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs mb-1">O que acontece se eu atrasar a devolução?</h4>
                <p className="text-slate-600 leading-relaxed">
                  Oferecemos 29 minutos de tolerância de cortesia. Após este prazo, é cobrada taxa de R$ 15,00 por hora até o limite de 3 horas. Acima de 3 horas, é faturada uma nova diária regular.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs mb-1">A quilometragem é livre?</h4>
                <p className="text-slate-600 leading-relaxed">
                  Sim! Nossas diárias já incluem quilometragem livre para você rodar com tranquilidade pela cidade e rodovias credenciadas.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
