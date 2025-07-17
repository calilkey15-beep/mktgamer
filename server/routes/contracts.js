const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requirePlan } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Generate contract (Premium only)
router.post('/generate/:loanId', [
  authenticateToken,
  requirePlan(['PREMIUM'])
], async (req, res) => {
  try {
    const { loanId } = req.params;

    // Get loan with client data
    const loan = await prisma.loan.findFirst({
      where: { id: loanId, userId: req.user.id },
      include: {
        client: true,
        user: true
      }
    });

    if (!loan) {
      return res.status(404).json({ error: 'Empréstimo não encontrado' });
    }

    // Check if contract already exists
    const existingContract = await prisma.contract.findFirst({
      where: { loanId }
    });

    if (existingContract) {
      return res.json({
        message: 'Contrato já existe',
        contract: existingContract
      });
    }

    // Generate contract data (in a real app, you'd generate a PDF here)
    const contractData = {
      loanId,
      clientName: loan.client.name,
      clientCpf: loan.client.cpf,
      clientPhone: loan.client.phone,
      clientAddress: loan.client.address,
      loanAmount: loan.amount,
      interestRate: loan.interestRate,
      totalAmount: loan.totalAmount,
      dueDate: loan.dueDate,
      createdAt: new Date(),
      lenderName: loan.user.name,
      lenderEmail: loan.user.email
    };

    // Create contract record
    const contract = await prisma.contract.create({
      data: {
        loanId,
        userId: req.user.id,
        fileName: `contrato_${loanId}.pdf`,
        fileUrl: `/contracts/${loanId}.pdf`, // Mock URL
        signed: false
      }
    });

    res.json({
      message: 'Contrato gerado com sucesso',
      contract,
      contractData
    });
  } catch (error) {
    console.error('Generate contract error:', error);
    res.status(500).json({ error: 'Erro ao gerar contrato' });
  }
});

// Get contracts for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const contracts = await prisma.contract.findMany({
      where: { userId: req.user.id },
      include: {
        loan: {
          include: {
            client: {
              select: {
                name: true,
                cpf: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(contracts);
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({ error: 'Erro ao buscar contratos' });
  }
});

// Sign contract
router.patch('/:id/sign', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await prisma.contract.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contrato não encontrado' });
    }

    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        signed: true,
        signedAt: new Date()
      }
    });

    res.json({
      message: 'Contrato assinado com sucesso',
      contract: updatedContract
    });
  } catch (error) {
    console.error('Sign contract error:', error);
    res.status(500).json({ error: 'Erro ao assinar contrato' });
  }
});

module.exports = router;