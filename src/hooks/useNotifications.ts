import { useState, useEffect } from 'react';
import { getNotifications, createNotification } from '../lib/supabase';
import { differenceInDays } from 'date-fns';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

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

  const addNotification = async (notificationData: any) => {
    try {
      const notification = await createNotification(notificationData);
      setNotifications(prev => [notification, ...prev]);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  return {
    notifications,
    loading,
    generateLoanNotifications,
    addNotification,
    refreshNotifications: loadNotifications,
  };
};