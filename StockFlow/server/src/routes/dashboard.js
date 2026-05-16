const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const orgId = req.organizationId;

    const settings = await req.prisma.settings.findUnique({ where: { organizationId: orgId } });
    const defaultThreshold = settings?.defaultLowStockThreshold ?? 5;

  // Use DB aggregation instead of fetching all products into memory
    const [totalProducts, totalQuantityResult, allProducts] = await Promise.all([
      req.prisma.product.count({ where: { organizationId: orgId } }),
      req.prisma.product.aggregate({
        where: { organizationId: orgId },
        _sum: { quantityOnHand: true },
      }),
      req.prisma.product.findMany({
        where: { organizationId: orgId },
        select: {
          id: true,
          name: true,
          sku: true,
          quantityOnHand: true,
          lowStockThreshold: true,
        },
      }),
    ]);

    const totalQuantity = totalQuantityResult._sum.quantityOnHand ?? 0;

    const lowStockItems = allProducts
      .filter((p) => {
        const threshold = p.lowStockThreshold ?? defaultThreshold;
        return p.quantityOnHand <= threshold;
      })
      .map((p) => ({
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
