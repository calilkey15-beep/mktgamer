const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, plan: true, planExpiresAt: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

const requirePlan = (requiredPlans) => {
  return (req, res, next) => {
    if (!requiredPlans.includes(req.user.plan)) {
      return res.status(403).json({ 
        error: 'Plano insuficiente',
        message: 'Esta funcionalidade requer um plano superior',
        requiredPlans,
        currentPlan: req.user.plan
      });
    }

    // Check if plan is expired (for paid plans)
    if (req.user.plan !== 'FREE' && req.user.planExpiresAt && new Date() > req.user.planExpiresAt) {
      return res.status(403).json({
        error: 'Plano expirado',
        message: 'Seu plano expirou. Renove para continuar usando esta funcionalidade'
      });
    }

    next();
  };
};

const requireAdmin = (req, res, next) => {
  // In a real app, you'd have an admin role
  // For now, we'll use a specific email or add an isAdmin field
  if (req.user.email !== 'admin@emprestahelp.com') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requirePlan,
  requireAdmin
};