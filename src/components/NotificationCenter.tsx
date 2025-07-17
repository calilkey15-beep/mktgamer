import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, Mail, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useLoans } from '../hooks/useLoans';
import { useClients } from '../hooks/useClients';
import { useNotifications } from '../hooks/useNotifications';
import { createReminderMessage, generateWhatsAppLink } from '../utils/whatsapp';
import { toast } from 'react-toastify';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { loans } = useLoans();
  const { clients } = useClients();
  const { generateLoanNotifications } = useNotifications();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [sending, setSending] = useState<string>('');

  useEffect(() => {
    if (isOpen && loans.length > 0) {
      const generatedNotifications = generateLoanNotifications(loans);
      setNotifications(generatedNotifications);
    }
  }, [isOpen, loans, generateLoanNotifications]);

  const sendReminder = async (notification: any, method: 'whatsapp' | 'manual') => {
    setSending(notification.id);
    
    try {
      const message = createReminderMessage(notification.client, notification.loan);
      
      if (method === 'whatsapp') {
        // In a real app, this would call the WhatsApp API
        const whatsappUrl = generateWhatsAppLink(message.to, message.message);
        window.open(whatsappUrl, '_blank');
        toast.info('Abrindo WhatsApp para envio');
      } else {
        const whatsappUrl = generateWhatsAppLink(message.to, message.message);
        window.open(whatsappUrl, '_blank');
        toast.info('Abrindo WhatsApp para envio manual');
      }
    } catch (error) {
      toast.error('Erro ao enviar lembrete');
    } finally {
      setSending('');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue_alert':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'due_reminder':
        return <Bell className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'overdue_alert':
        return 'border-red-500 bg-red-500/10';
      case 'due_reminder':
        return 'border-yellow-500 bg-yellow-500/10';
      default:
        return 'border-blue-500 bg-blue-500/10';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Central de Notificações</h2>
            {notifications.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Tudo em dia! 🎉
              </h3>
              <p className="text-gray-400">
                Não há empréstimos vencendo ou em atraso no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <h4 className="text-white font-medium">
                          {notification.client.name}
                        </h4>
                        <p className="text-gray-300 text-sm">
                          Contrato: {notification.loan.id}
                        </p>
                        <p className="text-gray-300 text-sm">
                          Valor: R$ {notification.loan.installment_amount.toLocaleString()}
                        </p>
                        <p className={`text-sm font-medium ${
                          notification.type === 'overdue_alert' ? 'text-red-400' :
                          notification.type === 'due_reminder' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`}>
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => sendReminder(notification, 'manual')}
                        disabled={sending === notification.id}
                        className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                      >
                        <MessageSquare size={16} />
                        <span>WhatsApp</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          const subject = `Lembrete de Vencimento - Contrato ${notification.loan.id}`;
                          const body = createReminderMessage(notification.client, notification.loan).message;
                          window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                        }}
                        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                      >
                        <Mail size={16} />
                        <span>E-mail</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                {notifications.filter(n => n.type === 'overdue_alert').length} em atraso, {' '}
                {notifications.filter(n => n.type === 'due_reminder').length} vencendo em breve
              </p>
              <button
                onClick={() => {
                  notifications.forEach(notification => {
                    if (notification.type === 'overdue_alert' || notification.type === 'due_reminder') {
                      sendReminder(notification, 'manual');
                    }
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Enviar Todos os Lembretes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;