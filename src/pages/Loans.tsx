import React, { useState } from 'react';
import { Plus, Search, Calendar, DollarSign, AlertTriangle, CheckCircle, Clock, FileText, MessageSquare } from 'lucide-react';
import { useLoans } from '../hooks/useLoans';
import { useClients } from '../hooks/useClients';
import LoanForm from '../components/LoanForm';
import { createPaymentConfirmationMessage, generateWhatsAppLink } from '../utils/whatsapp';
import { calculateOverdueAmount, formatCurrency } from '../utils/calculations';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-toastify';

const Loans: React.FC = () => {
  const { loans, loading, addLoan, addPayment } = useLoans();
  const { clients } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);

  const filteredLoans = loans.filter(loan => {
    const client = loan.client;
    const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddLoan = async (loanData: any) => {
    try {
      await addLoan(loanData);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding loan:', error);
    }
  };

  const handleAddPayment = async (loanId: string) => {
    const amountStr = prompt('Valor do pagamento:');
    const amount = parseFloat(amountStr || '0');
    
    if (amount > 0) {
      try {
        await addPayment(loanId, {
          amount,
          payment_date: new Date().toISOString(),
          installment_number: 1,
        });
      } catch (error) {
        console.error('Error adding payment:', error);
      }
    }
  };

  const handleSendWhatsApp = (client: any, loan: any) => {
    const message = `Olá ${client.name}! Lembrete sobre seu empréstimo (${loan.id}) no valor de R$ ${loan.installment_amount.toLocaleString()}.`;
    const phone = client.whatsapp || client.phone;
    const whatsappUrl = generateWhatsAppLink(phone, message);
    window.open(whatsappUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-400 bg-blue-400/20';
      case 'paid': return 'text-green-400 bg-green-400/20';
      case 'overdue': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock size={16} />;
      case 'paid': return <CheckCircle size={16} />;
      case 'overdue': return <AlertTriangle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'paid': return 'Pago';
      case 'overdue': return 'Atrasado';
      default: return 'Desconhecido';
    }
  };

  const getDaysInfo = (dueDate: string, status: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const days = differenceInDays(due, today);

    if (status === 'paid') return null;
    
    if (days < 0) {
      return { text: `${Math.abs(days)} dias de atraso`, color: 'text-red-400' };
    } else if (days === 0) {
      return { text: 'Vence hoje', color: 'text-yellow-400' };
    } else if (days <= 7) {
      return { text: `Vence em ${days} dias`, color: 'text-yellow-400' };
    } else {
      return { text: `Vence em ${days} dias`, color: 'text-gray-400' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Empréstimos</h1>
          <p className="text-gray-400">Gerencie seus empréstimos e penhoras</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Novo Empréstimo</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativos</option>
          <option value="paid">Pagos</option>
          <option value="overdue">Atrasados</option>
        </select>
      </div>

      {/* Loans List */}
      <div className="space-y-4">
        {filteredLoans.map((loan) => {
          const client = loan.client;
          const totalPaid = loan.payments?.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount), 0) || 0;
          const remaining = parseFloat(loan.total_amount) - totalPaid;
          const daysInfo = getDaysInfo(loan.due_date, loan.status);
          const overdueInfo = calculateOverdueAmount(loan);

          return (
            <div key={loan.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {client?.name || 'Cliente não encontrado'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(loan.status)}`}>
                      {getStatusIcon(loan.status)}
                      <span>{getStatusText(loan.status)}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-400/20 text-purple-400">
                      {loan.type === 'loan' ? 'Empréstimo' : 'Penhora'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Valor Emprestado</p>
                      <p className="text-white font-medium">R$ {parseFloat(loan.amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Taxa de Juros</p>
                      <p className="text-white font-medium">{loan.interest_rate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total a Pagar</p>
                      <p className="text-white font-medium">R$ {parseFloat(loan.total_amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Restante</p>
                      <p className="text-white font-medium">{formatCurrency(remaining)}</p>
                      {overdueInfo.daysOverdue > 0 && (
                        <p className="text-red-400 text-xs">
                          + {formatCurrency(overdueInfo.dailyInterest + overdueInfo.lateFee)} (atraso)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mt-3 text-sm">
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Calendar size={16} />
                      <span>Vencimento: {format(new Date(loan.due_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                    </div>
                    {daysInfo && (
                      <span className={daysInfo.color}>
                        {daysInfo.text}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Generate Contract */}
                  <button
                    onClick={() => toast.info('Funcionalidade de contrato em desenvolvimento')}
                    className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    <FileText size={16} />
                    <span>Contrato</span>
                  </button>

                  {loan.status !== 'paid' && (
                    <>
                      <button
                        onClick={() => handleAddPayment(loan.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                      >
                        💰 Pagamento
                      </button>

                      {client && (client.whatsapp || client.phone) && (
                        <button
                          onClick={() => handleSendWhatsApp(client, loan)}
                          className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                        >
                          <MessageSquare size={16} />
                          <span>WhatsApp</span>
                        </button>
                      )}
                    </>
                  )}
                  
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-sm">
                    Ver Detalhes
                  </button>
                </div>
              </div>

              {/* Overdue Information */}
              {overdueInfo.daysOverdue > 0 && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                  <h5 className="text-red-400 font-medium text-sm mb-2">
                    ⚠️ Empréstimo em atraso há {overdueInfo.daysOverdue} dias
                  </h5>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-gray-400">Valor Original</p>
                      <p className="text-white">{formatCurrency(remaining)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Juros de Atraso</p>
                      <p className="text-red-400">{formatCurrency(overdueInfo.dailyInterest)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Multa</p>
                      <p className="text-red-400">{formatCurrency(overdueInfo.lateFee)}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-red-500/30">
                    <p className="text-red-400 font-medium">
                      Total com atraso: {formatCurrency(overdueInfo.totalOverdue)}
                    </p>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {loan.status !== 'paid' && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Progresso do Pagamento</span>
                    <span>{Math.round((totalPaid / parseFloat(loan.total_amount)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(totalPaid / parseFloat(loan.total_amount)) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredLoans.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'Nenhum empréstimo encontrado' : 'Nenhum empréstimo cadastrado'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando seu primeiro empréstimo'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Criar Empréstimo
            </button>
          )}
        </div>
      )}

      {/* Loan Form Modal */}
      {showForm && (
        <LoanForm
          clients={clients}
          onSubmit={handleAddLoan}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Loans;