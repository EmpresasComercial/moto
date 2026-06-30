import React, { useState, useEffect } from 'react';
import { GATEWAY_URL, getAccessToken } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Task, TaskStatus } from '../types';
import { EmptyState } from './EmptyState';

import transformacaoIcon from '../../assets/task.transformacao.png';
import searchIcon from '../../assets/task-search.png';
import completedIcon from '../../assets/task-completed-64.png';
import failedIcon from '../../assets/icon-task-failed.png';

export const GravarTab: React.FC = () => {
  const { user, isSessionExpired, showLoading, hideLoading, ensureInternetConnectivity, refreshUserProfile } = useApp();
  const [activeSegment, setActiveSegment] = useState<TaskStatus>('andamento');
  
  // Track expanded task detail blocks
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // File upload states for task completion proof
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [fileLabel, setFileLabel] = useState<string>('Nenhum arquivo escolhido');

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setSelectedFile(file);
    setFileLabel(file.name);
    setFilePreview(URL.createObjectURL(file));
  };

  // New state for real DB tasks
  const [agdTasks, setAgdTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [failedTasks, setFailedTasks] = useState<any[]>([]);

  // State for summary counts & remaining tasks
  const [counts, setCounts] = useState({
    count_transformacao: 0,
    count_terminado: 0,
    count_falhado: 0,
    tarefas_restantes: 0
  });

  // Load counters & remaining tasks via OP 607
  const loadSummary = async () => {
    if (isSessionExpired) return;
    try {
      const token = await getAccessToken();
      if (!token) return;
      const resp = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ op: 607, data: {} })
      });
      if (resp.status === 401) return;
      const res = await resp.json();
      if (res.success && res.result) {
        setCounts(res.result);
      }
    } catch {}
  };

  const loadAgdTasks = async () => {
    if (isSessionExpired) return;
    if (!(await ensureInternetConnectivity())) return;
    showLoading('Carregando tarefas de transformação...');
    try {
      const token = await getAccessToken();
      if (!token) return;
      const resp = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ op: 604, data: {} })
      });
      if (resp.status === 401) {
        window.dispatchEvent(new CustomEvent('force-logout', { detail: { message: 'Sessão inválida' } }));
        return;
      }
      const res = await resp.json();
      if (res.success) setAgdTasks(res.result || []);
    } catch {
    } finally {
      hideLoading();
    }
  };

  const loadCompletedTasks = async () => {
    if (isSessionExpired) return;
    if (!(await ensureInternetConnectivity())) return;
    showLoading('Carregando tarefas concluídas...');
    try {
      const token = await getAccessToken();
      if (!token) return;
      const resp = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ op: 605, data: {} })
      });
      if (resp.status === 401) {
        window.dispatchEvent(new CustomEvent('force-logout', { detail: { message: 'Sessão inválida' } }));
        return;
      }
      const res = await resp.json();
      if (res.success) setCompletedTasks(res.result || []);
    } catch {
    } finally {
      hideLoading();
    }
  };

  const loadFailedTasks = async () => {
    if (isSessionExpired) return;
    if (!(await ensureInternetConnectivity())) return;
    showLoading('Carregando tarefas falhadas...');
    try {
      const token = await getAccessToken();
      if (!token) return;
      const resp = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ op: 606, data: {} })
      });
      if (resp.status === 401) return;
      const res = await resp.json();
      if (res.success) setFailedTasks(res.result || []);
    } catch {
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    loadSummary();
  }, [isSessionExpired]);

  useEffect(() => {
    if (activeSegment === 'andamento') loadAgdTasks();
    if (activeSegment === 'concluido') loadCompletedTasks();
    if (activeSegment === 'falhado') loadFailedTasks();
  }, [activeSegment, isSessionExpired]);

  const segments = [
    { status: 'andamento' as TaskStatus, label: 'Transformação', iconType: 'transformacao' },
    { status: 'concluido' as TaskStatus, label: 'Terminado', iconType: 'terminado' },
    { status: 'falhado' as TaskStatus, label: 'Falhou', iconType: 'falhou' }
  ];

  // Counters
  const countTransformacao = counts.count_transformacao;
  const countTerminado = counts.count_terminado;
  const countFalhou = counts.count_falhado;

  const toggleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setComment('');
    } else {
      setExpandedId(id);
      setComment('');
    }
  };

  const handleSubmit = async (taskId: number) => {
    if (!comment.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Comentário é obrigatório', type: 'error' } }));
      return;
    }
    if (!selectedFile) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Por favor, carregue a captura de tela da tarefa concluída', type: 'error' } }));
      return;
    }
    if (!(await ensureInternetConnectivity())) return;
    setSubmitting(true);
    showLoading('Enviando evidências...');
    try {
      const token = await getAccessToken();
      if (!token) return;
      const resp = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ op: 603, data: { tarefa_agd_id: taskId } })
      });
      
      const res = await resp.json();
      if (res.success) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Tarefa concluída e crédito adicionado!', type: 'success' } }));
        setExpandedId(null);
        setComment('');
        setSelectedFile(null);
        setFilePreview('');
        setFileLabel('Nenhum arquivo escolhido');
        // ── Refresh balance immediately after crediting ──
        // refreshUserProfile reads profiles.balance which complete_daily_task now updates correctly
        refreshUserProfile(false);
        loadAgdTasks(); // reload active tasks
        loadSummary(); // reload summary counts (remaining tasks, etc.)
      } else {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: res.error || 'Erro ao concluir tarefa', type: 'error' } }));
      }
    } catch {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Erro na conexão', type: 'error' } }));
    } finally {
      hideLoading();
      setSubmitting(false);
    }
  };

  const handleOpenLink = (link: string) => {
    if (link) {
      window.open(link, '_blank');
    } else {
      alert('Nenhum link social disponível.');
    }
  };

  const renderTaskForm = (task: any) => (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-white px-5 pb-6 pt-1 relative space-y-4"
      id={`task-form-panel-${task.id}`}
    >
      {/* Small grey X to close right above the message box */}
      <div className="flex justify-end pr-1">
        <button 
          onClick={() => {
            setExpandedId(null);
            setSelectedFile(null);
            setFilePreview('');
            setFileLabel('Nenhum arquivo escolhido');
          }} 
          className="text-neutral-400 hover:text-neutral-600 select-none cursor-pointer p-1"
          id={`close-form-btn-${task.id}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Message textarea box */}
      <div className="relative">
        <textarea
          rows={3}
          value={comment}
          maxLength={100}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Please write a message (If you have nothing to say, you don' t have to write anything.)"
          className="w-full text-[12px] p-3 border border-neutral-200 rounded-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-300 resize-none font-sans"
          id={`msg-textarea-${task.id}`}
        />
        <div className="absolute right-3 bottom-2 text-[10px] text-neutral-400 select-none font-sans">
          {comment.length}/100
        </div>
      </div>

      {/* Red dashed file upload square */}
      <div className="flex flex-col items-start pt-1 gap-2 select-none">
        <label className="w-14 h-14 border border-dashed border-[#ff3b30] rounded-[4px] flex items-center justify-center cursor-pointer hover:bg-red-50/40 transition-colors relative">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden" 
          />
          {filePreview ? (
            <img src={filePreview} alt="Preview" className="w-full h-full object-cover rounded-[3px]" />
          ) : (
            <span className="text-[#ff3b30] text-[28px] font-light leading-none">+</span>
          )}
        </label>
      </div>

      {/* Red salvar button */}
      <div className="pt-2">
        <button
          id={`submit-proof-btn-${task.id}`}
          onClick={() => handleSubmit(task.id)}
          disabled={submitting}
          className={`w-full max-w-[420px] h-[34px] bg-[#e1251b] hover:bg-[#c11f17] text-white font-semibold text-[12px] text-center rounded-[3px] transition-all flex items-center justify-center lowercase tracking-wider cursor-pointer shadow-none select-none border-none outline-none ${submitting ? 'opacity-50' : ''}`}
        >
          {submitting ? 'Enviando...' : 'salvar'}
        </button>
      </div>
    </motion.div>
  );

  return (
    <div id="gravar-tab-container" className="pb-24 bg-[#f4f6f9] min-h-screen animate-fadeIn font-sans">
      
      {/* 1. Page Header & Info block identical to image */}
      <div className="bg-[#f4f6f9] pt-4 pb-2 px-4 flex items-center justify-between select-none" id="gravar-header-area">
        <div className="flex items-center gap-2">
          <div className="space-y-0.5">
            <h2 className="text-[17px] font-bold text-neutral-800 tracking-tight leading-none">Registo de tarefas</h2>
            <p className="text-[9px] text-[#9ea3a9] font-medium select-none">
              Estes dados são criados porAsiarayOficialmente fornecido
            </p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end justify-center pr-2">
          <div className="text-[20px] font-semibold text-neutral-800 font-mono leading-none">{counts.tarefas_restantes}</div>
          <div className="text-[9px] text-[#9ea3a9] mt-0.5 tracking-tight font-semibold uppercase text-right">
            Tarefas restantes
          </div>
        </div>
      </div>

      {/* 2. Segments Row representing the exact layout/count icons in image */}
      <div className="bg-white border-b border-gray-200 grid grid-cols-3 py-2 select-none" id="gravar-segments-bar">
        {segments.map((seg) => {
          const isActive = activeSegment === seg.status;
          let countVal = 0;
          if (seg.status === 'andamento') {
            countVal = countTransformacao;
          } else if (seg.status === 'concluido') {
            countVal = countTerminado;
          } else if (seg.status === 'falhado') {
            countVal = countFalhou;
          }

          return (
            <button
              id={`segment-btn-${seg.status}`}
              key={seg.status}
              onClick={() => { setActiveSegment(seg.status); setExpandedId(null); }}
              className="flex flex-col items-center justify-center text-center focus:outline-none transition-all cursor-pointer relative"
            >
              <div className="mb-1">
                {seg.iconType === 'transformacao' && (
                  <img src={transformacaoIcon} alt={seg.label} className="w-[20px] h-[20px] object-contain" />
                )}

                {seg.iconType === 'naorevisto' && (
                  <img src={searchIcon} alt={seg.label} className="w-[20px] h-[20px] object-contain" />
                )}

                {seg.iconType === 'terminado' && (
                  <img src={completedIcon} alt={seg.label} className="w-[20px] h-[20px] object-contain" />
                )}

                {seg.iconType === 'falhou' && (
                  <img src={failedIcon} alt={seg.label} className="w-[20px] h-[20px] object-contain" />
                )}
              </div>
              <span className={`text-[9.5px] tracking-tight transition-colors leading-none ${isActive ? 'text-[#f35a5a] font-semibold' : 'text-gray-500 font-medium'}`}>
                {seg.label}
              </span>
              <span className={`text-[11px] font-semibold font-mono mt-1 leading-tight ${isActive ? 'text-[#f35a5a]' : 'text-gray-500'}`}>
                {countVal}
              </span>
            </button>
          );
        })}
      </div>

      {/* Segments logic removed instant audit */ }

      {/* 3. List of dynamic cards corresponding exactly to design image styling */}
      <div className="p-0 flex flex-col relative w-full" id="gravar-task-items-wrapper">
        {(activeSegment === 'andamento' ? agdTasks : activeSegment === 'concluido' ? completedTasks : failedTasks).length === 0 ? (
          <EmptyState
            className="py-20 bg-white"
            message="Sem dados"
            description="Nenhum registo de tarefa encontrado. Visite a aba 'tarefa' para aceitar e participar em missões diárias!"
          />
        ) : (
          (activeSegment === 'andamento' ? agdTasks : activeSegment === 'concluido' ? completedTasks : failedTasks).map((task: any, idx: number) => {
            const isExpanded = expandedId === task.id;
            const hasFloatingBadge = activeSegment === 'andamento' && idx === 0;

            // Map data depending on the table (tarefa_agd vs tarefas_diarias)
            const objNome = activeSegment === 'andamento' ? task.nome_produt_shop : 'Rendimento Produto';
            const dataRow = activeSegment === 'andamento' ? new Date(task.data_criada).toLocaleString() : new Date(task.data_atribuicao).toLocaleString();
            const rewardAmount = activeSegment === 'andamento' ? (task.rendimento ? Number(task.rendimento).toFixed(2) : '0.00') : Number(task.renda_coletada).toFixed(2);

            return (
              <div 
                key={task.id}
                className="bg-white flex flex-col relative w-full border-b-[10px] border-[#f4f6f9]"
                id={`gravar-card-${task.id}`}
              >
                {/* 3.1 Card Header bar (outros | X) */}
                <div className="bg-[#dbe4f0] px-3.5 py-1.5 flex items-center justify-between border-b border-neutral-200 select-none w-full">
                  <span className="text-[11.5px] text-[#4a5568] font-medium tracking-wide">outros</span>
                  <span className="text-[11.5px] text-[#a0aec0] select-none cursor-pointer hover:text-[#4a5568] font-semibold" onClick={() => setExpandedId(null)}>X</span>
                </div>

                {/* 3.2 Card body content with high-accuracy field names and values */}
                <div className="p-4 text-[#4a5568] text-[11.5px] font-sans relative pr-[84px] bg-white flex flex-col gap-1 w-full">
                  
                  <div className="flex items-start leading-tight">
                    <span className="text-gray-400 font-medium min-w-[124px] select-none">Objectivo da tarefa:</span>
                    <span className="text-neutral-850 font-medium">{objNome}</span>
                  </div>
                  
                  {activeSegment === 'andamento' && (
                    <div className="flex items-center leading-normal mt-0.5">
                      <span className="text-gray-400 font-medium min-w-[124px] select-none">ligação da tarefa:</span>
                      <button 
                        onClick={() => handleOpenLink(task.link_social)}
                        className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[10px] py-0.5 px-2 rounded-[3px] transition-colors cursor-pointer select-none border-none outline-none font-medium"
                      >
                        abrir a ligação de vídeo
                      </button>
                    </div>
                  )}

                  {!isExpanded && (
                    <>
                      <div className="flex items-start leading-tight mt-0.5">
                        <span className="text-gray-400 font-medium min-w-[124px] select-none">Criar:</span>
                        <span className="text-gray-600 font-mono ml-0.5 select-all">{dataRow}</span>
                      </div>

                      <div className="flex items-start leading-tight mt-0.5">
                        <span className="text-gray-400 font-medium min-w-[124px] select-none">revisão:</span>
                        <span className="text-neutral-850 font-medium select-none">
                          {activeSegment === 'andamento' ? 'Transformação' : activeSegment === 'concluido' ? 'Terminado' : 'Falhou'}
                        </span>
                      </div>

                      {activeSegment === 'andamento' && (
                        <div className="pt-2 select-none flex">
                          <button 
                            onClick={() => toggleExpand(task.id)}
                            className="bg-[#ff4c15] hover:bg-[#ea3a00] text-white font-medium text-[9.5px] py-1 px-4 rounded-full border border-dashed border-white/90 transition-all cursor-pointer select-none active:scale-95 shadow-none"
                          >
                            add a screenshot of done task
                          </button>
                        </div>
                      )}

                      {activeSegment === 'concluido' && (
                        <div className="pt-2">
                          <span className="bg-emerald-50 text-emerald-700 text-[9.5px] py-0.5 px-2 rounded inline-block border border-emerald-100 font-medium">
                            Tarefa Confirmada e Liquidada
                          </span>
                        </div>
                      )}

                      {activeSegment === 'falhado' && (
                        <div className="pt-2">
                          <span className="bg-red-50 text-red-700 text-[9.5px] py-0.5 px-2 rounded inline-block border border-red-100 font-medium">
                            Pendente / Falhada
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {!isExpanded && (
                    <div className="absolute right-4 top-[50%] -translate-y-1/2 flex items-center select-none">
                      <div className="relative">
                        <div 
                          className="h-[62px] w-[62px] rounded-full border border-white/80 shadow-xs flex flex-col items-center justify-center shrink-0" 
                          style={{ backgroundColor: '#9aaec4' }}
                        >
                          <span className="text-white text-[10px] font-bold tracking-tight select-all text-center flex flex-col leading-none gap-1">
                            <span>{rewardAmount}</span>
                            <span className="text-[8px] font-medium opacity-85">KZ</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                <AnimatePresence>
                  {isExpanded && activeSegment === 'andamento' && renderTaskForm(task)}
                </AnimatePresence>

              </div>
            );
          })
        )}
      </div>

{/* Posts Section Removed */}

    </div>
  );
};
