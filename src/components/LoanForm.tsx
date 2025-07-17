import React, { useState } from 'react';
import { X, DollarSign, Percent, Calendar, User, CreditCard } from 'lucide-react';

interface LoanFormProps {
  clients: any[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ clients, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    type: 'loan',
    amount: '',
    interest_rate: '30',
    loan_date: new Date().toISOString().split('T')[0],
    due_date: '',
    installments: '1',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quickRates = [20, 30, 40, 50];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const setQuickRate = (rate: number) => {
    setFormData(prev => ({ ...prev, interest_rate: rate.toString() }));
    if (errors.interest_rate) {
      setErrors(prev => ({ ...prev, interest_rate: '' }));
    }
  };

  const calculateLoanDetails = () => {
    const amount = parseFloat(formData.amount) || 0;
    const interestRate = parseFloat(formData.interest_rate) || 0;
    const installments = parseInt(formData.installments) || 1;

    const totalAmount = amount * (1 + interestRate / 100);
    const installmentAmount = totalAmount / installments;
    const totalInterest = totalAmount - amount;

    return {
      totalAmount,
      installmentAmount,
      totalInterest,
    };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.client_id) {
      newErrors.client_id = 'Cliente é obrigatório';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }
    
    if (!formData.interest_rate || parseFloat(formData.interest_rate) < 0) {
      newErrors.interest_rate = 'Taxa de juros é obrigatória';
    }
    
    if (!formData.loan_date) {
      newErrors.loan_date = 'Data do empréstimo é obrigatória';
    }
    
    if (!formData.due_date) {
      newErrors.due_date = 'Data de vencimento é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const loanDetails = calculateLoanDetails();
      const loanData = {
        client_id: formData.client_id,
        type: formData.type,
        amount: parseFloat(formData.amount),
        interest_rate: parseFloat(formData.interest_rate),
        loan_date: formData.loan_date,
        due_date: formData.due_date,
        installments: parseInt(formData.installments),
        total_amount: loanDetails.totalAmount,
        installment_amount: loanDetails.installmentAmount,
        status: 'active',
        daily_interest_rate: 0.1,
        late_fee_percentage: 2,
        contract_generated: true,
      };
      
      await onSubmit(loanData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loanDetails = calculateLoanDetails();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Novo Empréstimo</h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cliente *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.client_id && (
                <p className="text-red-400 text-sm mt-1">{errors.client_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo *
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="loan">Empréstimo</option>
                  <option value="pawn">Penhora</option>
                </select>
              </div>
            </div>
          </div>

          {/* Amount and Interest Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valor Emprestado *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>
              {errors.amount && (
                <p className="text-red-400 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Taxa de Juros (%) *
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    name="interest_rate"
                    value={formData.interest_rate}
                    onChange={handleChange}
                    step="0.1"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="30"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickRates.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setQuickRate(rate)}
                      className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm transition-colors"
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
              {errors.interest_rate && (
                <p className="text-red-400 text-sm mt-1">{errors.interest_rate}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data do Empréstimo *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  name="loan_date"
                  value={formData.loan_date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.loan_date && (
                <p className="text-red-400 text-sm mt-1">{errors.loan_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data de Vencimento *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.due_date && (
                <p className="text-red-400 text-sm mt-1">{errors.due_date}</p>
              )}
            </div>
          </div>

          {/* Installments */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Número de Parcelas *
            </label>
            <input
              type="number"
              name="installments"
              value={formData.installments}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1"
            />
          </div>

          {/* Calculation Summary */}
          {formData.amount && formData.interest_rate && (
            <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
              <h3 className="text-white font-medium mb-3">Resumo do Cálculo</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Valor Emprestado:</p>
                  <p className="text-white font-medium">R$ {parseFloat(formData.amount || '0').toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Taxa de Juros:</p>
                  <p className="text-white font-medium">{formData.interest_rate}%</p>
                </div>
                <div>
                  <p className="text-gray-400">Total a Pagar:</p>
                  <p className="text-green-400 font-medium">R$ {loanDetails.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Valor da Parcela:</p>
                  <p className="text-blue-400 font-medium">R$ {loanDetails.installmentAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Juros Total:</p>
                  <p className="text-purple-400 font-medium">R$ {loanDetails.totalInterest.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-600">
                <p className="text-gray-400 text-sm">
                  • Juros de atraso: 0,1% ao dia sobre o valor em aberto
                </p>
                <p className="text-gray-400 text-sm">
                  • Multa por atraso: 2% sobre o valor da parcela
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-3 px-4 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Empréstimo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanForm;