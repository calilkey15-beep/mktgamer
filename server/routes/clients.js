const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all clients for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        loans: {
          select: {
            id: true,
            amount: true,
            status: true
          }
        }
      }
    });

    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// Create client
router.post('/', [
  authenticateToken,
  body('name').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('phone').notEmpty().withMessage('Telefone é obrigatório'),
  body('address').notEmpty().withMessage('Endereço é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check plan limits
    const clientCount = await prisma.client.count({
      where: { userId: req.user.id }
    });

    const limits = {
      FREE: 2,
      PRO: 50,
      PREMIUM: Infinity
    };

    if (clientCount >= limits[req.user.plan]) {
      return res.status(403).json({
        error: 'Limite de clientes atingido',
        message: `Plano ${req.user.plan} permite até ${limits[req.user.plan]} clientes`,
        currentCount: clientCount,
        limit: limits[req.user.plan]
      });
    }

    const { name, cpf, phone, whatsapp, address, photos, documents } = req.body;

    const client = await prisma.client.create({
      data: {
        userId: req.user.id,
        name,
        cpf,
        phone,
        whatsapp,
        address,
        photos: photos || [],
        documents: documents || []
      }
    });

    res.status(201).json({
      message: 'Cliente criado com sucesso',
      client
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// Update client
router.put('/:id', [
  authenticateToken,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('phone').optional().notEmpty().withMessage('Telefone não pode estar vazio'),
  body('address').optional().notEmpty().withMessage('Endereço não pode estar vazio')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if client belongs to user
    const existingClient = await prisma.client.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existingClient) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const client = await prisma.client.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Cliente atualizado com sucesso',
      client
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// Delete client
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if client belongs to user
    const existingClient = await prisma.client.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existingClient) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    await prisma.client.delete({
      where: { id }
    });

    res.json({ message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Erro ao excluir cliente' });
  }
});

module.exports = router;