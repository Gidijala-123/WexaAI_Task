const { Router } = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');

const router = Router();
router.use(authMiddleware);

router.get('/', [
  query('search').optional().trim().escape(),
], async (req, res) => {
  try {
    const { search } = req.query;
    const where = { organizationId: req.organizationId };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ];
    }
    const products = await req.prisma.product.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', [
  param('id').isInt().withMessage('Invalid product ID'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  try {
    const product = await req.prisma.product.findFirst({
      where: { id: parseInt(req.params.id), organizationId: req.organizationId },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('sku').trim().isLength({ min: 1 }).withMessage('SKU is required'),
  body('quantityOnHand').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('costPrice').optional({ values: 'null' }).isFloat({ min: 0 }).withMessage('Cost price must be non-negative'),
  body('sellingPrice').optional({ values: 'null' }).isFloat({ min: 0 }).withMessage('Selling price must be non-negative'),
  body('lowStockThreshold').optional({ values: 'null' }).isInt({ min: 0 }).withMessage('Threshold must be a non-negative integer'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } = req.body;
  try {
    const existing = await req.prisma.product.findFirst({
      where: { organizationId: req.organizationId, sku: sku.trim() },
    });
    if (existing) {
      return res.status(409).json({ error: 'SKU already exists in your organization' });
    }
    const product = await req.prisma.product.create({
      data: {
        organizationId: req.organizationId,
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        description: description || null,
        quantityOnHand: quantityOnHand != null ? parseInt(quantityOnHand) : 0,
        costPrice: costPrice != null ? parseFloat(costPrice) : null,
        sellingPrice: sellingPrice != null ? parseFloat(sellingPrice) : null,
        lowStockThreshold: lowStockThreshold != null ? parseInt(lowStockThreshold) : null,
      },
    });
    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', [
  param('id').isInt().withMessage('Invalid product ID'),
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('sku').optional().trim().isLength({ min: 1 }).withMessage('SKU is required'),
  body('quantityOnHand').optional({ values: 'null' }).isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('costPrice').optional({ values: 'null' }).isFloat({ min: 0 }).withMessage('Cost price must be non-negative'),
  body('sellingPrice').optional({ values: 'null' }).isFloat({ min: 0 }).withMessage('Selling price must be non-negative'),
  body('lowStockThreshold').optional({ values: 'null' }).isInt({ min: 0 }).withMessage('Threshold must be a non-negative integer'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  try {
    const existing = await req.prisma.product.findFirst({
      where: { id: parseInt(req.params.id), organizationId: req.organizationId },
    });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } = req.body;

    if (sku && sku.trim() !== existing.sku) {
      const dup = await req.prisma.product.findFirst({
        where: { organizationId: req.organizationId, sku: sku.trim().toUpperCase(), id: { not: existing.id } },
      });
      if (dup) return res.status(409).json({ error: 'SKU already exists' });
    }

    const product = await req.prisma.product.update({
      where: { id: existing.id },
      data: {
        name: name ? name.trim() : existing.name,
        sku: sku ? sku.trim().toUpperCase() : existing.sku,
        description: description !== undefined ? (description || null) : existing.description,
        quantityOnHand: quantityOnHand != null ? parseInt(quantityOnHand) : existing.quantityOnHand,
        costPrice: costPrice !== undefined ? (costPrice != null ? parseFloat(costPrice) : null) : existing.costPrice,
        sellingPrice: sellingPrice !== undefined ? (sellingPrice != null ? parseFloat(sellingPrice) : null) : existing.sellingPrice,
        lowStockThreshold: lowStockThreshold !== undefined ? (lowStockThreshold != null ? parseInt(lowStockThreshold) : null) : existing.lowStockThreshold,
      },
    });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', [
  param('id').isInt().withMessage('Invalid product ID'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  try {
    const existing = await req.prisma.product.findFirst({
      where: { id: parseInt(req.params.id), organizationId: req.organizationId },
    });
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    await req.prisma.product.delete({ where: { id: existing.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/stock', [
  param('id').isInt().withMessage('Invalid product ID'),
  body('adjustment').isInt({ allow_leading_zeroes: false }).withMessage('Adjustment must be an integer'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  try {
    const existing = await req.prisma.product.findFirst({
      where: { id: parseInt(req.params.id), organizationId: req.organizationId },
    });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const { adjustment } = req.body;
    const newQty = existing.quantityOnHand + parseInt(adjustment);
    if (newQty < 0) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const product = await req.prisma.product.update({
      where: { id: existing.id },
      data: { quantityOnHand: newQty },
    });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
