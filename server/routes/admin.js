const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all users (admin only)
router.get('/users', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        planExpiresAt: true,
        createdAt: true,
        _count: {
          select: {
            clients: true,
            loans: true,
            payments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Get platform statistics
router.get('/stats', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const [
      totalUsers,
      freeUsers,
      proUsers,
      premiumUsers,
      totalClients,
      totalLoans,
      totalRevenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { plan: 'FREE' } }),
      prisma.user.count({ where: { plan: 'PRO' } }),
      prisma.user.count({ where: { plan: 'PREMIUM' } }),
      prisma.client.count(),
      prisma.loan.count(),
      prisma.payment.aggregate({
        where: { 
          type: 'subscription',
          status: 'PAID'
        },
        _sum: { amount: true }
      })
    ]);

    const stats = {
      users: {
        total: totalUsers,
        free: freeUsers,
        pro: proUsers,
        premium: premiumUsers
      },
      platform: {
        totalClients,
        totalLoans,
        totalRevenue: totalRevenue._sum.amount || 0
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Update user plan (admin only)
router.patch('/users/:id/plan', [
  authenticateToken,
  requireAdmin
], async (req, res) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;

    if (!['FREE', 'PRO', 'PREMIUM'].includes(plan)) {
      return res.status(400).json({ error: 'Plano inválido' });
    }

    const planExpiresAt = plan === 'FREE' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const user = await prisma.user.update({
      where: { id },
      data: {
        plan,
        planExpiresAt
      },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        planExpiresAt: true
      }
    });

    res.json({
      message: 'Plano do usuário atualizado',
      user
    });
  } catch (error) {
    console.error('Update user plan error:', error);
    res.status(500).json({ error: 'Erro ao atualizar plano do usuário' });
  }
});

module.exports = router;