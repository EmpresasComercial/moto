export type VehicleCategory = 'todas' | 'economica' | 'scooter' | 'trail' | 'eletrica' | 'touring';

export type FuelType = 'Gasolina' | 'Flex' | 'Elétrica';
export type TransmissionType = 'Manual (5 marchas)' | 'Manual (6 marchas)' | 'Automática CVT';

export interface Motorcycle {
  id: string;
  name: string;
  brand: string;
  category: VehicleCategory;
  year: number;
  engineCc: number | string; // e.g., 160 or 'Elétrica 3000W'
  powerHp: string;
  transmission: TransmissionType;
  fuelType: FuelType;
  consumptionKmPerL: string;
  tankCapacityL: string;
  brakeSystem: string;
  dailyRate: number; // in BRL
  weeklyRateDailyEquivalent: number; // e.g., discount rate for 7+ days
  securityDeposit: number; // caução in BRL
  insuranceIncluded: string;
  plateMask: string; // e.g., ABC-***1
  image: string;
  popularFor: string;
  availableUnits: number;
  locations: string[];
  features: string[];
  maintenanceStatus: 'em_dia' | 'revisao_agendada';
}

export type ReservationStatus = 
  | 'confirmed'             // Reserva confirmada, aguardando data de retirada
  | 'ready_for_pickup'      // Pronta para retirada no pátio
  | 'active_rental'         // Em uso pelo cliente
  | 'in_return_inspection'  // Devolvida, aguardando vistoria e estorno
  | 'completed'             // Vistoria aprovada e caução liberada
  | 'cancelled';            // Cancelada

export type CaucaoStatus = 
  | 'held'                 // Retida preventivamente
  | 'refund_in_progress'   // Estorno em processamento (após devolução)
  | 'released'             // Totalmente devolvida
  | 'partially_deducted';  // Parte deduzida por avaria/multa justificada

export interface InspectionRecord {
  date: string;
  time: string;
  odometerKm: number;
  fuelLevel: 'Cheio (100%)' | '3/4 (75%)' | '1/2 (50%)' | '1/4 (25%)' | 'Bateria 100%';
  conditionNotes: string;
  helmetProvided: boolean;
  documentsPresent: boolean;
  signatureName: string;
  inspectorName: string;
}

export interface RentalReservation {
  id: string;
  code: string; // e.g. LM-84920
  motoId: string;
  moto: Motorcycle;
  userId: string;
  userName: string;
  userCnh: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string;
  endTime: string;
  pickupLocation: string;
  returnLocation: string;
  days: number;
  dailyRateApplied: number;
  rentalSubtotal: number;
  optionalHelmet: boolean;
  optionalHelmetCost: number;
  optionalPhoneMount: boolean;
  optionalPhoneMountCost: number;
  optionalTopBox: boolean;
  optionalTopBoxCost: number;
  protectionPlan: 'basic' | 'complete';
  protectionCost: number;
  totalRentAndAddons: number;
  securityDepositAmount: number;
  grandTotalCharged: number; // Rental + Deposit
  securityDepositStatus: CaucaoStatus;
  status: ReservationStatus;
  paymentMethod: 'pix' | 'credit_card';
  paymentStatus: 'paid' | 'pending';
  paidAt: string;
  createdAt: string;
  pickupInspection?: InspectionRecord;
  returnInspection?: InspectionRecord;
  notes?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  cnhNumber: string;
  cnhCategory: 'A' | 'AB' | 'B' | 'Não informada';
  cnhExpiryDate: string;
  cnhStatus: 'verified' | 'pending' | 'rejected';
  cnhImageUrl?: string;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  totalRentalsCompleted: number;
  referralCode: string;
  referralLink: string;
  walletBalance: number;
  totalCommissionsEarned: number;
  teamCount: number;
  bankName?: string;
  bankAccount?: string;
  holderName?: string;
  bankId?: string;
  paymentPin?: string;
  hasPin?: boolean;
  digitalWallet?: {
    rede: string;
    nome: string;
    endereco: string;
  };
}

export interface TeamMember {
  id: string;
  name: string;
  phoneMask: string;
  joinedDate: string;
  level: 1 | 2 | 3;
  status: 'Ativo' | 'Em Locação' | 'Pendente';
  rentalsCount: number;
  commissionGenerated: number;
}

export type MainTab = 'home' | 'aluguel' | 'deposito' | 'faturas' | 'equipe' | 'perfil';
export type AuthView = 'authenticated' | 'login' | 'register';

export type IbanDepositType = 'caucao' | 'aluguel' | 'recarga_carteira';
export type IbanDepositStatus = 'aprovado' | 'em_analise' | 'pendente' | 'rejeitado';

export interface IbanDepositRecord {
  id: string;
  protocolNumber: string; // e.g. IBAN-2026-9041
  depositType: IbanDepositType;
  reservationCode?: string;
  amount: number;
  currency: 'BRL' | 'EUR';
  sourceIban?: string;
  sourceHolderName: string;
  sourceBankName?: string;
  transferDate: string;
  transferTime?: string;
  bankTransactionRef: string;
  receiptFileName?: string;
  receiptFileSize?: string;
  receiptUrl?: string;
  status: IbanDepositStatus;
  submittedAt: string;
  verifiedAt?: string;
  notes?: string;
}

export interface BankAccountDetails {
  bankName: string;
  companyName: string;
  iban: string;
  bicSwift: string;
  bankAddress: string;
  taxId: string;
  referenceRule: string;
  instantPaymentSupported: boolean;
}

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  operatingHours: string;
  phone: string;
  availableBikesCount: number;
}

export interface ContractRule {
  id: string;
  category: 'caucao' | 'devolucao' | 'multas' | 'seguro' | 'manutencao';
  title: string;
  description: string;
  valueOrPenalty?: string;
  importantTag?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'support';
  text: string;
  timestamp: string;
}
