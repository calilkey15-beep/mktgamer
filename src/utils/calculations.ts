import { differenceInDays, parseISO } from 'date-fns';

export const calculateLoanDetails = (
  amount: number,
  interestRate: number,
  installments: number = 1
) => {
  const totalAmount = amount * (1 + interestRate / 100);
  const installmentAmount = totalAmount / installments;
  
  return {
    totalAmount,
    installmentAmount,
    totalInterest: totalAmount - amount,
  };
};

export const calculateDailyInterest = (
  principal: number,
  dailyRate: number,
  days: number
) => {
  return principal * (dailyRate / 100) * days;
};

export const calculateLateFee = (
  amount: number,
  lateFeePercentage: number
) => {
  return amount * (lateFeePercentage / 100);
};

export const calculateOverdueAmount = (
  loan: any,
  dailyInterestRate: number = 0.1,
  lateFeePercentage: number = 2
) => {
  const today = new Date();
  const dueDate = parseISO(loan.due_date);
  const daysOverdue = differenceInDays(today, dueDate);
  
  if (daysOverdue <= 0) {
    return {
      daysOverdue: 0,
      dailyInterest: 0,
      lateFee: 0,
      totalOverdue: 0,
    };
  }
  
  const remainingAmount = loan.total_amount - loan.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
  const dailyInterest = calculateDailyInterest(remainingAmount, dailyInterestRate, daysOverdue);
  const lateFee = calculateLateFee(remainingAmount, lateFeePercentage);
  
  return {
    daysOverdue,
    dailyInterest,
    lateFee,
    totalOverdue: remainingAmount + dailyInterest + lateFee,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};