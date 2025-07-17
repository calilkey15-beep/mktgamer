const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all loans for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const loans = await prisma.loan.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            whatsapp: true
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            createdAt: true
          }
        }
      }
    });

    // Calculate additional fields
    const loansWithCalculations = loans.map(loan => {
      const totalPaid = loan.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const remaining = loan.totalAmount - totalPaid;
      const daysOverdue = loan.status === 'OVERDUE' ? 
        Math.floor((new Date() - new Date(loan.dueDate)) / (1000 * 60 * 60 * 24)) : 0;

      return {
        ...loan,
        totalPaid,
        remaining,
        daysOverdue
      };
    });

    res.json(loansWithCalculations);
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: 'Erro ao buscar empréstimos' });
  }
});

// Create loan
router.post('/', [
  authenticateToken,
  body('clientId').notEmpty().withMessage('Cliente é obrigatório'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que zero'),
  body('interestRate').isFloat({ min: 0 }).withMessage('Taxa de juros deve ser um número válido'),
  body('dueDate').isISO8601().withMessage('Data de vencimento inválida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check plan limits
    const loanCount = await prisma.loan.count({
      where: { userId: req.user.id }
    });

    const limits = {
      FREE: 3,
      PRO: 100,
      PREMIUM: Infinity
    };

    if (loanCount >= limits[req.user.plan]) {
      return res.status(403).json({
        error: 'Limite de empréstimos atingido',
        message: `Plano ${req.user.plan} permite até ${limits[req.user.plan]} empréstimos`,
        currentCount: loanCount,
        limit: limits[req.user.plan]
      });
    }

    const { clientId, amount, interestRate, dueDate, notes } = req.body;

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: { id: clientId, userId: req.user.id }
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Calculate total amount
    const totalAmount = amount * (1 + interestRate / 100);

    const loan = await prisma.loan.create({
      data: {
        userId: req.user.id,
        clientId,
        amount,
        interestRate,
        totalAmount,
        dueDate: new Date(dueDate),
        notes,
        status: 'ACTIVE'
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            whatsapp: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Empréstimo criado com sucesso',
      loan
    });
  } catch (error) {
    console.error('Create loan error:', error);
    res.status(500).json({ error: 'Erro ao criar empréstimo' });
  }
});

// Update loan status
router.patch('/:id/status', [
  authenticateToken,
  body('status').isIn(['ACTIVE', 'PAID', 'OVERDUE']).withMessage('Status inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Check if loan belongs to user
    const existingLoan = await prisma.loan.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existingLoan) {
      return res.status(404).json({ error: 'Empréstimo não encontrado' });
    }

    const loan = await prisma.loan.update({
      where: { id },
      data: { status }
    });

    res.json({
      message: 'Status do empréstimo atualizado',
      loan
    });
  } catch (error) {
    console.error('Update loan status error:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do empréstimo' });
  }
});

// Add payment to loan
router.post('/:id/payments', [
  authenticateToken,
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que zero')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { amount } = req.body;

    // Check if loan belongs to user
    const loan = await prisma.loan.findFirst({
      where: { id, userId: req.user.id },
      include: {
        payments: true
      }
    });

    if (!loan) {
      return res.status(404).json({ error: 'Empréstimo não encontrado' });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        userId: req.user.id,
        loanId: id,
        amount,
        status: 'PAID',
        type: 'loan_payment'
      }
    });

    // Check if loan is fully paid
    const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0) + amount;
    
    if (totalPaid >= loan.totalAmount) {
      await prisma.loan.update({
        where: { id },
        data: { status: 'PAID' }
      });
    }

    res.status(201).json({
      message: 'Pagamento registrado com sucesso',
      payment
    });
  } catch (error) {
    console.error('Add payment error:', error);
    res.status(500).json({ error: 'Erro ao registrar pagamento' });
  }
});

module.exports = router;