const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const orgId = req.organizationId;
    const products = await req.prisma.product.findMany({ where: { organizationId: orgId } });
    const settings = await req.prisma.settings.findUnique({ where: { organizationId: orgId } });
    const defaultThreshold = settings?.defaultLowStockThreshold ?? 5;

    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, p) => sum + p.quantityOnHand, 0);

    const lowStockItems = products.filter((p) => {
      const threshold = p.lowStockThreshold ?? defaultThreshold;
      return p.quantityOnHand <= threshold;
    }).map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      quantityOnHand: p.quantityOnHand,
      lowStockThreshold: p.lowStockThreshold ?? defaultThreshold,
    }));

    res.json({ totalProducts, totalQuantity, lowStockItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
