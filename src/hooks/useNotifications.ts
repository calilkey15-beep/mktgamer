import { useState, useEffect } from 'react';
import { differenceInDays } from 'date-fns';

export const useNotifications = () => {
  const generateLoanNotifications = (loans: any[]) => {
    const today = new Date();
    const generatedNotifications: any[] = [];

    loans.forEach(loan => {
      if (loan.status === 'paid') return;

      const dueDate = new Date(loan.due_date);
      const daysUntilDue = differenceInDays(dueDate, today);

      let type = '';
      let message = '';

      if (daysUntilDue < 0) {
        type = 'overdue_alert';
        message = `Empréstimo em atraso há ${Math.abs(daysUntilDue)} dias`;
      } else if (daysUntilDue <= 3) {
        type = 'due_reminder';
        message = daysUntilDue === 0 ? 'Empréstimo vence hoje' : `Empréstimo vence em ${daysUntilDue} dias`;
      }

      if (type && message) {
        generatedNotifications.push({
          id: `${loan.id}-${type}`,
          client_id: loan.client_id,
          loan_id: loan.id,
          type,
          message,
          client: loan.client,
          loan,
          daysUntilDue,
          priority: daysUntilDue < 0 ? 'high' : daysUntilDue <= 1 ? 'medium' : 'low',
        });
      }
    });

    return generatedNotifications.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.daysUntilDue - b.daysUntilDue;
    });
  };

  return {
    generateLoanNotifications,
  };
};