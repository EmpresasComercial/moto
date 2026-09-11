import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Camera, 
  RefreshCw, 
  Calendar, 
  CreditCard,
  Check,
  Info
} from 'lucide-react';
import { UserProfile } from '../types';

interface CnhVerificationViewProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onNavigateToCatalog: () => void;
}

export const CnhVerificationView: React.FC<CnhVerificationViewProps> = ({
  user,
  onUpdateUser,
  onNavigateToCatalog,
}) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [cpf, setCpf] = useState(user.cpf);
  const [cnhNumber, setCnhNumber] = useState(user.cnhNumber);
  const [cnhCategory, setCnhCategory] = useState<'A' | 'AB' | 'B' | 'Não informada'>(user.cnhCategory);
  const [cnhExpiryDate, setCnhExpiryDate] = useState(user.cnhExpiryDate);
  const [cnhStatus, setCnhStatus] = useState(user.cnhStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(
    user.cnhStatus === 'verified' ? 'cnh_digital_titular_cat_a.pdf' : null
  );

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
      setCnhStatus('pending');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      const updated: UserProfile = {
        ...user,
        fullName,
        cpf,
        cnhNumber,
        cnhCategory,
        cnhExpiryDate,
        cnhStatus,
      };
      onUpdateUser(updated);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    }, 600);
  };

  const handleInstantApproval = () => {
    setCnhStatus('verified');
    setCnhCategory('A');
    setUploadedFileName('cnh_digital_validada_detran.pdf');
    const updated: UserProfile = {
      ...user,
      cnhStatus: 'verified',
      cnhCategory: 'A',
    };
    onUpdateUser(updated);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verificação de Identidade e CNH</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Para alugar uma motocicleta, a legislação de trânsito exige habilitação definitiva na Categoria A ou AB.
          </p>
        </div>

        <button
          onClick={onNavigateToCatalog}
          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer"
        >
          Voltar ao Catálogo
        </button>
      </div>

      {saveSuccessNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Dados cadastrais e status de CNH atualizados com sucesso!</span>
        </div>
      )}

      {/* Verification Status Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${
            cnhStatus === 'verified'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {cnhCategory}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {cnhStatus === 'verified' ? 'CNH Verificada e Homologada' : 'Aguardando Análise Documental'}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                cnhStatus === 'verified'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {cnhStatus === 'verified' ? 'Liberado para Alugar' : 'Pendente'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {cnhStatus === 'verified'
                ? 'Sua habilitação cumpre todas as exigências do Detran e Contran para locação de motocicletas.'
                : 'Envie a foto frente e verso ou arquivo digital da sua CNH para liberar as reservas.'}
            </p>
          </div>
        </div>

        {cnhStatus !== 'verified' && (
          <button
            type="button"
            onClick={handleInstantApproval}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Simular Aprovação Imediata
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Form: Condutor & CNH details */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            Dados Cadastrais do Titular
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nome Completo:</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">CPF:</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Data de Nascimento:</label>
                <input
                  type="date"
                  value={user.birthDate}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nº Registro CNH:</label>
                <input
                  type="text"
                  value={cnhNumber}
                  onChange={(e) => setCnhNumber(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Categoria de Habilitação:</label>
                <select
                  value={cnhCategory}
                  onChange={(e) => setCnhCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                >
                  <option value="A">Categoria A (Motos e Triciclos)</option>
                  <option value="AB">Categoria AB (Motos e Carros)</option>
                  <option value="B">Categoria B (Apenas Carro - Não Válida para Moto)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Data de Validade da CNH:</label>
              <input
                type="date"
                value={cnhExpiryDate}
                onChange={(e) => setCnhExpiryDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <span>Salvando dados...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Salvar Alterações do Condutor</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Upload Document Zone & Legal Rules */}
        <div className="md:col-span-5 space-y-4">
          {/* Upload Dropzone */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              Arquivo da CNH (Frente e Verso)
            </h3>

            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-5 text-center transition-colors bg-slate-50/50">
              <input
                type="file"
                id="cnh-upload-input"
                accept="image/*,.pdf"
                onChange={handleSimulateUpload}
                className="hidden"
              />
              <label htmlFor="cnh-upload-input" className="cursor-pointer space-y-2 block">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Clique para carregar foto ou PDF
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Aceitamos CNH Digital exportada pelo aplicativo Carteira Digital de Trânsito ou foto legível do documento aberto.
                </p>
              </label>
            </div>

            {uploadedFileName && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-950 truncate">{uploadedFileName}</span>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded shrink-0">
                  Enviado
                </span>
              </div>
            )}
          </div>

          {/* Legal Checklist */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5 space-y-3 text-xs text-slate-700">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Requisitos Obrigatórios para Aluguel:
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Ter 21 anos completos na data da locação</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>CNH definitiva válida (mínimo de 1 ano de habilitação)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Categoria A ou AB ativa no Registro Nacional de Condutores</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Ausência de suspensão ou cassação do direito de dirigir</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
