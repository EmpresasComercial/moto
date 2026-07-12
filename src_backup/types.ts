export type TaskType = 'Tiktok' | 'Facebook' | 'Whatsapp' | 'Amazon' | 'outros';

export type TaskStatus = 'disponivel' | 'andamento' | 'revisao' | 'concluido' | 'falhado';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  reward: number; 
  requiredLevel: string; 
  desc: string;
  status: TaskStatus;
  joinedAt?: string;
  proofUrl?: string;
  submittedAt?: string;
}

export interface UserProfile {
  phone: string;
  id: string;
  level: string; 
  creditScore: number; 
  inviteCode: string;
  bankName: string;
  bankAccount: string;
  holderName: string;
  paymentPin?: string;
  name?: string; 
  idChaveUnica?: number; 
  bankId?: string;
  createdAt?: string;
}

export interface FinancialStats {
  balance: number; 
  balanceUSDT: number; 
  incomeYesterday: number;
  incomeToday: number;
  incomeThisWeek: number;
  incomeThisMonth: number;
  incomeLastMonth: number;
  incomeTotal: number;
  completedTodayCount: number;
  unfinishedCount: number;
}

export interface LogRecord {
  id: string;
  type: 'recarga' | 'retirada' | 'recompensa' | 'unidade';
  amount: number;
  date: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  details?: string;
}

export interface TeamReferral {
  phone: string;
  level: string;
  joinDate: string;
  contribution: number;
}
