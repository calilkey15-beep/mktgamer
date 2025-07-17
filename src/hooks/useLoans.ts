import { useState, useEffect } from 'react';
import { getLoans, createLoan, addLoanPayment } from '../lib/supabase';
import { toast } from 'react-toastify';

export const useLoans = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const data = await getLoans();
      setLoans(data || []);
    } catch (error) {
      console.error('Error loading loans:', error);
      toast.error('Erro ao carregar empréstimos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add a small delay to ensure mock data is properly initialized
    const timer = setTimeout(() => {
      loadLoans();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const addLoan = async (loanData: any) => {
    try {
      const newLoan = await createLoan(loanData);
      setLoans(prev => [newLoan, ...prev]);
      toast.success('Empréstimo criado com sucesso!');
      return newLoan;
    } catch (error) {
      console.error('Error creating loan:', error);
      toast.error('Erro ao criar empréstimo');
      throw error;
    }
  };

  const addLoanPayment = async (loanId: string, paymentData: any) => {
    try {
      const payment = await addLoanPayment(loanId, paymentData.amount);
      
      // Reload loans to get updated data
      await loadLoans();
      
      toast.success('Pagamento registrado com sucesso!');
      return payment;
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Erro ao registrar pagamento');
      throw error;
    }
  };

  return {
    loans,
    loading,
    addLoan,
    addPayment: addLoanPayment,
    refreshLoans: loadLoans,
  };
};