const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');

const router = Router();

router.post('/signup', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('organizationName').trim().isLength({ min: 1 }).withMessage('Organization name is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  const { email, password, organizationName } = req.body;
  try {
    const existing = await req.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const org = await req.prisma.organization.create({
      data: {
        name: organizationName.trim(),
        settings: { create: { defaultLowStockThreshold: 5 } },
      },
    });
    const user = await req.prisma.user.create({
      data: { email, password: hashedPassword, organizationId: org.id },
    });
    const token = jwt.sign(
      { userId: user.id, organizationId: org.id },
      JWT_SECRET,
      { expiresIn: '7d' },
    );
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        organization: { id: org.id, name: org.name },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  const { email, password } = req.body;
  try {
    const user = await req.prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user.id, organizationId: user.organizationId },
      JWT_SECRET,
      { expiresIn: '7d' },
    );
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        organization: { id: user.organization.id, name: user.organization.name },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: { id: req.userId },
      include: { organization: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      user: {
        id: user.id,
        email: user.email,
        organization: { id: user.organization.id, name: user.organization.name },
      },
    });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
