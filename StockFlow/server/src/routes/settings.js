const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    let settings = await req.prisma.settings.findUnique({ where: { organizationId: req.organizationId } });
    if (!settings) {
      settings = await req.prisma.settings.create({
        data: { organizationId: req.organizationId, defaultLowStockThreshold: 5 },
      });
    }
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', [
  body('defaultLowStockThreshold').isInt({ min: 0 }).withMessage('Threshold must be a non-negative integer'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  try {
    const { defaultLowStockThreshold } = req.body;
    const settings = await req.prisma.settings.upsert({
      where: { organizationId: req.organizationId },
      update: { defaultLowStockThreshold: parseInt(defaultLowStockThreshold) },
      create: { organizationId: req.organizationId, defaultLowStockThreshold: parseInt(defaultLowStockThreshold) },
    });
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
