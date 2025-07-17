import { Client, Loan } from '../types';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from './calculations';

export interface WhatsAppMessage {
  to: string;
  message: string;
  type: 'reminder' | 'overdue' | 'payment_confirmation';
}

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present
  if (cleaned.length === 11 && cleaned.startsWith('11')) {
    return `55${cleaned}`;
  } else if (cleaned.length === 10) {
    return `5511${cleaned}`;
  } else if (cleaned.startsWith('55')) {
    return cleaned;
  }
  
  return `55${cleaned}`;
};

export const createReminderMessage = (client: Client, loan: Loan): WhatsAppMessage => {
  const dueDate = format(new Date(loan.due_date), 'dd/MM/yyyy', { locale: ptBR });
  const daysUntilDue = differenceInDays(new Date(loan.due_date), new Date());
  
  let message = `Olá ${client.name}! 👋\n\n`;
  
  if (daysUntilDue === 0) {
    message += `🔔 Lembrete: Seu empréstimo vence HOJE (${dueDate})\n\n`;
  } else if (daysUntilDue > 0) {
    message += `🔔 Lembrete: Seu empréstimo vence em ${daysUntilDue} dias (${dueDate})\n\n`;
  } else {
    message += `🚨 ATENÇÃO: Seu empréstimo está em atraso há ${Math.abs(daysUntilDue)} dias!\n\n`;
  }
  
  message += `💰 Valor a pagar: ${formatCurrency(loan.installment_amount)}\n`;
  message += `📋 Contrato: ${loan.id}\n\n`;
  message += `Para mais informações, entre em contato conosco.\n\n`;
  message += `Atenciosamente,\n${import.meta.env.VITE_COMPANY_NAME || 'Sistema de Empréstimos'}`;
  
  return {
    to: formatPhoneNumber(client.whatsapp || client.phone),
    message,
    type: daysUntilDue < 0 ? 'overdue' : 'reminder',
  };
};

export const createPaymentConfirmationMessage = (client: Client, loan: Loan, paymentAmount: number): WhatsAppMessage => {
  const message = `Olá ${client.name}! 👋\n\n` +
    `✅ Pagamento confirmado!\n\n` +
    `💰 Valor recebido: ${formatCurrency(paymentAmount)}\n` +
    `📋 Contrato: ${loan.id}\n` +
    `📅 Data: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}\n\n` +
    `Obrigado pela pontualidade! 🙏\n\n` +
    `Atenciosamente,\n${import.meta.env.VITE_COMPANY_NAME || 'Sistema de Empréstimos'}`;
  
  return {
    to: formatPhoneNumber(client.whatsapp || client.phone),
    message,
    type: 'payment_confirmation',
  };
};

export const sendWhatsAppMessage = async (messageData: WhatsAppMessage): Promise<boolean> => {
  try {
    const apiUrl = import.meta.env.VITE_WHATSAPP_API_URL;
    const token = import.meta.env.VITE_WHATSAPP_TOKEN;
    
    if (!apiUrl || !token) {
      console.warn('WhatsApp API not configured');
      return false;
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: messageData.to,
        text: messageData.message,
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
};

export const generateWhatsAppLink = (phone: string, message: string): string => {
  const formattedPhone = formatPhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};