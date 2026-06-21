export type TaskType = 'Tiktok' | 'Facebook' | 'Whatsapp' | 'Amazon' | 'outros';

export type TaskStatus = 'disponivel' | 'andamento' | 'revisao' | 'concluido' | 'falhado';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  reward: number; // in KZ
  requiredLevel: string; // 'WS0', 'WS1', 'WS2' ...
  desc: string;
  status: TaskStatus;
  joinedAt?: string;
  proofUrl?: string;
  submittedAt?: string;
}

export interface UserProfile {
  phone: string;
  id: string;
  level: string; // 'WS0', 'WS1', 'WS2', 'WS3', 'WS4' | 'WS5'
  creditScore: number; // 0 - 100
  inviteCode: string;
  bankName: string;
  bankAccount: string;
  holderName: string;
  paymentPin?: string;
  name?: string; // Real name of the user
  idChaveUnica?: number; // Unique 4-digit identifier
  bankId?: string;
  createdAt?: string;
}

export interface FinancialStats {
  balance: number; // in KZ
  balanceUSDT: number; // in USDT_TRC
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
