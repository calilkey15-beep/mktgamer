import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ContractData } from '../types';
import { formatCurrency } from './calculations';

export const generateContract = (contractData: ContractData): jsPDF => {
  const { loan, client, company } = contractData;
  const pdf = new jsPDF();
  
  // Header
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CONTRATO DE EMPRÉSTIMO', 105, 20, { align: 'center' });
  
  // Company info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${company.name}`, 20, 40);
  pdf.text(`CNPJ: ${company.cnpj}`, 20, 50);
  pdf.text(`${company.address}`, 20, 60);
  
  // Contract details
  pdf.setFont('helvetica', 'bold');
  pdf.text('DADOS DO CONTRATO:', 20, 80);
  
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Número do Contrato: ${loan.id}`, 20, 95);
  pdf.text(`Data: ${format(new Date(loan.loan_date), 'dd/MM/yyyy', { locale: ptBR })}`, 20, 105);
  pdf.text(`Tipo: ${loan.type === 'loan' ? 'Empréstimo' : 'Penhora'}`, 20, 115);
  
  // Client info
  pdf.setFont('helvetica', 'bold');
  pdf.text('DADOS DO CLIENTE:', 20, 135);
  
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Nome: ${client.name}`, 20, 150);
  if (client.cpf) pdf.text(`CPF: ${client.cpf}`, 20, 160);
  if (client.rg) pdf.text(`RG: ${client.rg}`, 20, 170);
  pdf.text(`Telefone: ${client.phone}`, 20, 180);
  pdf.text(`Endereço: ${client.address}`, 20, 190);
  
  // Loan details
  pdf.setFont('helvetica', 'bold');
  pdf.text('CONDIÇÕES DO EMPRÉSTIMO:', 20, 210);
  
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Valor Emprestado: ${formatCurrency(loan.amount)}`, 20, 225);
  pdf.text(`Taxa de Juros: ${loan.interest_rate}%`, 20, 235);
  pdf.text(`Valor Total: ${formatCurrency(loan.total_amount)}`, 20, 245);
  pdf.text(`Parcelas: ${loan.installments}x de ${formatCurrency(loan.installment_amount)}`, 20, 255);
  pdf.text(`Vencimento: ${format(new Date(loan.due_date), 'dd/MM/yyyy', { locale: ptBR })}`, 20, 265);
  
  // Terms and conditions
  pdf.addPage();
  pdf.setFont('helvetica', 'bold');
  pdf.text('TERMOS E CONDIÇÕES:', 20, 30);
  
  const terms = [
    '1. O cliente se compromete a pagar o valor total do empréstimo na data de vencimento.',
    '2. Em caso de atraso, será cobrada multa de 2% sobre o valor em aberto.',
    '3. Juros de mora de 0,1% ao dia sobre o valor em atraso.',
    '4. O não pagamento na data acordada implicará em protesto e negativação.',
    '5. As partes elegem o foro da comarca local para dirimir questões.',
    '6. Este contrato é válido e tem força de título executivo extrajudicial.',
  ];
  
  pdf.setFont('helvetica', 'normal');
  let yPosition = 50;
  terms.forEach((term) => {
    const lines = pdf.splitTextToSize(term, 170);
    pdf.text(lines, 20, yPosition);
    yPosition += lines.length * 7 + 5;
  });
  
  // Signatures
  yPosition += 20;
  pdf.text('_________________________________', 20, yPosition);
  pdf.text(`${company.name}`, 20, yPosition + 10);
  pdf.text('Credor', 20, yPosition + 20);
  
  pdf.text('_________________________________', 120, yPosition);
  pdf.text(`${client.name}`, 120, yPosition + 10);
  pdf.text('Devedor', 120, yPosition + 20);
  
  pdf.text(`Data: ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`, 20, yPosition + 40);
  
  return pdf;
};

export const generateContractBlob = (contractData: ContractData): Blob => {
  const pdf = generateContract(contractData);
  return pdf.output('blob');
};

export const downloadContract = (contractData: ContractData, filename?: string) => {
  const pdf = generateContract(contractData);
  const fileName = filename || `contrato_${contractData.loan.id}_${contractData.client.name.replace(/\s+/g, '_')}.pdf`;
  pdf.save(fileName);
};