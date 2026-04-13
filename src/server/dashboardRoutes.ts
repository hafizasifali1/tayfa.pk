import express from 'express';
import { db } from '../db';
import { 
  orders, 
  orderItems, 
  products, 
  users, 
  brands, 
  companies,
  categories
} from '../db/schema';
import { eq, and, sql, desc, gte } from 'drizzle-orm';

const router = express.Router();

// --- Admin Dashboard Stats ---
router.get('/admin/stats', async (req, res) => {
  try {
    const isMysql = process.env.DATABASE_URL?.startsWith('mysql');

    // 1. Total Revenue (Paid Orders)
    const [revenueResult] = await db.select({
      total: sql<number>`COALESCE(SUM(CAST(${orders.totalAmount} AS DECIMAL)), 0)`
    }).from(orders).where(eq(orders.paymentStatus, 'paid'));

    // 2. Total Orders
    const [ordersCount] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(orders);

    // 3. Active Sellers
    const [sellersCount] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(users).where(and(eq(users.role, 'seller'), eq(users.status, 'active')));

    // 4. Total Customers
    const [customersCount] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(users).where(eq(users.role, 'user'));

    // 5. Orders by Status
    const ordersByStatus = await db.select({
      status: orders.status,
      count: sql<number>`COUNT(*)`
    }).from(orders).groupBy(orders.status);

    // 6. Payments by Status
    const paymentsByStatus = await db.select({
      status: orders.paymentStatus,
      count: sql<number>`COUNT(*)`
    }).from(orders).groupBy(orders.paymentStatus);

    // 7. Top Selling Products
    const topProducts = await db.select({
      name: orderItems.name,
      totalSold: sql<number>`SUM(${orderItems.quantity})`
    })
    .from(orderItems)
    .groupBy(orderItems.productId, orderItems.name)
    .orderBy(desc(sql`SUM(${orderItems.quantity})`))
    .limit(5);

    // 8. Sales Over Time (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let salesOverTime;
    if (isMysql) {
      salesOverTime = await db.select({
        date: sql<string>`DATE_FORMAT(${orders.createdAt}, '%Y-%m-%d')`,
        revenue: sql<number>`SUM(CAST(${orders.totalAmount} AS DECIMAL))`
      })
      .from(orders)
      .where(gte(orders.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE_FORMAT(${orders.createdAt}, '%Y-%m-%d')`)
      .orderBy(sql`DATE_FORMAT(${orders.createdAt}, '%Y-%m-%d')`);
    } else {
      salesOverTime = await db.select({
        date: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`,
        revenue: sql<number>`SUM(CAST(${orders.totalAmount} AS DECIMAL))`
      })
      .from(orders)
      .where(gte(orders.createdAt, thirtyDaysAgo))
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`);
    }

    // 9. Recent Orders
    const recentOrders = await db.select({
      id: orders.id,
      customer: users.fullName,
      total: orders.totalAmount,
      status: orders.status,
      createdAt: orders.createdAt
    })
    .from(orders)
    .leftJoin(users, eq(orders.customerId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(5);

    res.json({
      revenue: revenueResult.total,
      orders: ordersCount.count,
      sellers: sellersCount.count,
      customers: customersCount.count,
      ordersByStatus,
      paymentsByStatus,
      topProducts,
      salesOverTime,
      recentOrders
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Seller Dashboard Stats ---
router.get('/seller/stats', async (req, res) => {
  const { sellerId } = req.query;
  if (!sellerId) return res.status(400).json({ error: 'sellerId is required' });

  try {
    const isMysql = process.env.DATABASE_URL?.startsWith('mysql');

    // 1. Total Orders Received
    const [ordersCount] = await db.select({
      count: sql<number>`COUNT(DISTINCT ${orderItems.orderId})`
    }).from(orderItems).where(eq(orderItems.sellerId, sellerId as string));

    // 2. Total Revenue
    const [revenueResult] = await db.select({
      total: sql<number>`COALESCE(SUM(CAST(${orderItems.price} AS DECIMAL) * ${orderItems.quantity}), 0)`
    }).from(orderItems).where(eq(orderItems.sellerId, sellerId as string));

    // 3. Order Status Summary
    const ordersByStatus = await db.select({
      status: orderItems.status,
      count: sql<number>`COUNT(*)`
    }).from(orderItems).where(eq(orderItems.sellerId, sellerId as string)).groupBy(orderItems.status);

    // 4. Low Stock Alerts
    const [lowStockCount] = await db.select({
      count: sql<number>`COUNT(*)`
    })
    .from(products)
    .innerJoin(brands, eq(products.brandId, brands.id))
    .innerJoin(companies, eq(brands.companyId, companies.id))
    .where(and(
      eq(companies.sellerId, sellerId as string),
      sql`${products.stock} < 10`
    ));

    // 5. Top Products
    const topProducts = await db.select({
      name: orderItems.name,
      totalSold: sql<number>`SUM(${orderItems.quantity})`
    })
    .from(orderItems)
    .where(eq(orderItems.sellerId, sellerId as string))
    .groupBy(orderItems.productId, orderItems.name)
    .orderBy(desc(sql`SUM(${orderItems.quantity})`))
    .limit(5);

    // 6. Sales Over Time (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let salesOverTime;
    if (isMysql) {
      salesOverTime = await db.select({
        date: sql<string>`DATE_FORMAT(${orderItems.createdAt}, '%Y-%m-%d')`,
        revenue: sql<number>`SUM(CAST(${orderItems.price} AS DECIMAL) * ${orderItems.quantity})`
      })
      .from(orderItems)
      .where(and(
        eq(orderItems.sellerId, sellerId as string),
        gte(orderItems.createdAt, thirtyDaysAgo)
      ))
      .groupBy(sql`DATE_FORMAT(${orderItems.createdAt}, '%Y-%m-%d')`)
      .orderBy(sql`DATE_FORMAT(${orderItems.createdAt}, '%Y-%m-%d')`);
    } else {
      salesOverTime = await db.select({
        date: sql<string>`TO_CHAR(${orderItems.createdAt}, 'YYYY-MM-DD')`,
        revenue: sql<number>`SUM(CAST(${orderItems.price} AS DECIMAL) * ${orderItems.quantity})`
      })
      .from(orderItems)
      .where(and(
        eq(orderItems.sellerId, sellerId as string),
        gte(orderItems.createdAt, thirtyDaysAgo)
      ))
      .groupBy(sql`TO_CHAR(${orderItems.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${orderItems.createdAt}, 'YYYY-MM-DD')`);
    }

    // 7. Recent Orders
    const recentOrders = await db.select({
      id: orders.id,
      customer: users.fullName,
      total: sql<number>`SUM(CAST(${orderItems.price} AS DECIMAL) * ${orderItems.quantity})`,
      status: orderItems.status,
      createdAt: orderItems.createdAt
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .leftJoin(users, eq(orders.customerId, users.id))
    .where(eq(orderItems.sellerId, sellerId as string))
    .groupBy(orders.id, users.fullName, orderItems.status, orderItems.createdAt)
    .orderBy(desc(orderItems.createdAt))
    .limit(5);

    res.json({
      orders: ordersCount.count,
      revenue: revenueResult.total,
      ordersByStatus,
      lowStock: lowStockCount.count,
      topProducts,
      salesOverTime,
      recentOrders
    });
  } catch (error: any) {
    console.error('Seller stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
