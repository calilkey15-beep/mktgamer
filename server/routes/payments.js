const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requirePlan } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's subscription payments
router.get('/subscriptions', authenticateToken, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { 
        userId: req.user.id,
        type: 'subscription'
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(payments);
  } catch (error) {
    console.error('Get subscription payments error:', error);
    res.status(500).json({ error: 'Erro ao buscar pagamentos' });
  }
});

// Create subscription payment
router.post('/subscribe', [
  authenticateToken,
  body('plan').isIn(['PRO', 'PREMIUM']).withMessage('Plano inválido'),
  body('paymentMethod').isIn(['PIX', 'CREDIT_CARD']).withMessage('Método de pagamento inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { plan, paymentMethod } = req.body;

    const planPrices = {
      PRO: 25.00,
      PREMIUM: 50.00
    };

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: req.user.id,
        amount: planPrices[plan],
        status: 'PENDING',
        type: 'subscription'
      }
    });

    // In a real app, you would integrate with a payment processor here
    // For demo purposes, we'll simulate immediate payment success
    
    // Update payment status to PAID (simulate successful payment)
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'PAID' }
    });

    // Update user plan
    const planExpiresAt = new Date();
    planExpiresAt.setMonth(planExpiresAt.getMonth() + 1); // 1 month from now

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        plan,
        planExpiresAt
      }
    });

    res.json({
      message: `Plano ${plan} ativado com sucesso!`,
      payment: {
        ...payment,
        status: 'PAID'
      },
      plan,
      expiresAt: planExpiresAt
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Erro ao processar assinatura' });
  }
});

// Generate PIX payment (mock)
router.post('/pix', [
  authenticateToken,
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor inválido')
], async (req, res) => {
  try {
    const { amount } = req.body;

    // Mock PIX data
    const pixData = {
      qrCode: `00020126580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substring(7)}5204000053039865802BR5925EMPRESTAHELP LTDA6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      pixKey: 'pix@emprestahelp.com',
      amount,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    };

    res.json({
      message: 'PIX gerado com sucesso',
      pix: pixData
    });
  } catch (error) {
    console.error('Generate PIX error:', error);
    res.status(500).json({ error: 'Erro ao gerar PIX' });
  }
});

module.exports = router;