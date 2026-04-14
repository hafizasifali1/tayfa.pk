"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = express_1.default.Router();
// --- Admin Dashboard Stats ---
router.get('/admin/stats', async (req, res) => {
    try {
        const isMysql = process.env.DATABASE_URL?.startsWith('mysql');
        // 1. Total Revenue (Paid Orders)
        const [revenueResult] = await db_1.db.select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(CAST(${schema_1.orders.totalAmount} AS DECIMAL)), 0)`
        }).from(schema_1.orders).where((0, drizzle_orm_1.eq)(schema_1.orders.paymentStatus, 'paid'));
        // 2. Total Orders
        const [ordersCount] = await db_1.db.select({
            count: (0, drizzle_orm_1.sql) `COUNT(*)`
        }).from(schema_1.orders);
        // 3. Active Sellers
        const [sellersCount] = await db_1.db.select({
            count: (0, drizzle_orm_1.sql) `COUNT(*)`
        }).from(schema_1.users).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.role, 'seller'), (0, drizzle_orm_1.eq)(schema_1.users.status, 'active')));
        // 4. Total Customers
        const [customersCount] = await db_1.db.select({
            count: (0, drizzle_orm_1.sql) `COUNT(*)`
        }).from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.role, 'user'));
        // 5. Orders by Status
        const ordersByStatus = await db_1.db.select({
            status: schema_1.orders.status,
            count: (0, drizzle_orm_1.sql) `COUNT(*)`
        }).from(schema_1.orders).groupBy(schema_1.orders.status);
        // 6. Payments by Status
        const paymentsByStatus = await db_1.db.select({
            status: schema_1.orders.paymentStatus,
            count: (0, drizzle_orm_1.sql) `COUNT(*)`
        }).from(schema_1.orders).groupBy(schema_1.orders.paymentStatus);
        // 7. Top Selling Products
        const topProducts = await db_1.db.select({
            name: schema_1.orderItems.name,
            totalSold: (0, drizzle_orm_1.sql) `SUM(${schema_1.orderItems.quantity})`
        })
            .from(schema_1.orderItems)
            .groupBy(schema_1.orderItems.productId, schema_1.orderItems.name)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `SUM(${schema_1.orderItems.quantity})`))
            .limit(5);
        // 8. Sales Over Time (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        let salesOverTime;
        if (isMysql) {
            salesOverTime = await db_1.db.select({
                date: (0, drizzle_orm_1.sql) `DATE_FORMAT(${schema_1.orders.createdAt}, '%Y-%m-%d')`,
                revenue: (0, drizzle_orm_1.sql) `SUM(CAST(${schema_1.orders.totalAmount} AS DECIMAL))`
            })
                .from(schema_1.orders)
                .where((0, drizzle_orm_1.gte)(schema_1.orders.createdAt, thirtyDaysAgo))
                .groupBy((0, drizzle_orm_1.sql) `DATE_FORMAT(${schema_1.orders.createdAt}, '%Y-%m-%d')`)
                .orderBy((0, drizzle_orm_1.sql) `DATE_FORMAT(${schema_1.orders.createdAt}, '%Y-%m-%d')`);
        }
        else {
            salesOverTime = await db_1.db.select({
                date: (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.orders.createdAt}, 'YYYY-MM-DD')`,
                revenue: (0, drizzle_orm_1.sql) `SUM(CAST(${schema_1.orders.totalAmount} AS DECIMAL))`
            })
                .from(schema_1.orders)
                .where((0, drizzle_orm_1.gte)(schema_1.orders.createdAt, thirtyDaysAgo))
                .groupBy((0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.orders.createdAt}, 'YYYY-MM-DD')`)
                .orderBy((0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.orders.createdAt}, 'YYYY-MM-DD')`);
        }
        // 9. Recent Orders
        const recentOrders = await db_1.db.select({
            id: schema_1.orders.id,
            customer: schema_1.users.fullName,
            total: schema_1.orders.totalAmount,
            status: schema_1.orders.status,
            createdAt: schema_1.orders.createdAt
        })
            .from(schema_1.orders)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.orders.customerId, schema_1.users.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.orders.createdAt))
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
    }
    catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: error.message });
    }
});
// --- Seller Dashboard Stats ---
router.get('/seller/stats', async (req, res) => {
    const { sellerId } = req.query;
    if (!sellerId)
        return res.status(400).json({ error: 'sellerId is required' });
    try {
        const isMysql = process.env.DATABASE_URL?.startsWith('mysql');
        // 1. Total Orders Received
        const [ordersCount] = await db_1.db.select({
            count: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${schema_1.orderItems.orderId})`
        }).from(schema_1.orderItems).where((0, drizzle_orm_1.eq)(schema_1.orderItems.sellerId, sellerId));
        // 2. Total Revenue
        const [revenueResult] = await db_1.db.select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(CAST(${schema_1.orderItems.price} AS DECIMAL) * ${schema_1.orderItems.quantity}), 0)`
        }).from(schema_1.orderItems).where((0, drizzle_orm_1.eq)(schema_1.orderItems.sellerId, sellerId));
        // 3. Order Status Summary
        const ordersByStatus = await db_1.db.select({
            status: schema_1.orderItems.status,
            count: (0, drizzle_orm_1.sql) `COUNT(*)`
        }).from(schema_1.orderItems).where((0, drizzle_orm_1.eq)(schema_1.orderItems.sellerId, sellerId)).groupBy(schema_1.orderItems.status);
        // 4. Low Stock Alerts
        const [lowStockCount] = await db_1.db.select({
            count: (0, drizzle_orm_1.sql) `COUNT(*)`
        })
            .from(schema_1.products)
            .innerJoin(schema_1.brands, (0, drizzle_orm_1.eq)(schema_1.products.brandId, schema_1.brands.id))
            .innerJoin(schema_1.companies, (0, drizzle_orm_1.eq)(schema_1.brands.companyId, schema_1.companies.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.companies.sellerId, sellerId), (0, drizzle_orm_1.sql) `${schema_1.products.stock} < 10`));
        // 5. Top Products
        const topProducts = await db_1.db.select({
            name: schema_1.orderItems.name,
            totalSold: (0, drizzle_orm_1.sql) `SUM(${schema_1.orderItems.quantity})`
        })
            .from(schema_1.orderItems)
            .where((0, drizzle_orm_1.eq)(schema_1.orderItems.sellerId, sellerId))
            .groupBy(schema_1.orderItems.productId, schema_1.orderItems.name)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `SUM(${schema_1.orderItems.quantity})`))
            .limit(5);
        // 6. Sales Over Time (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        let salesOverTime;
        if (isMysql) {
            salesOverTime = await db_1.db.select({
                date: (0, drizzle_orm_1.sql) `DATE_FORMAT(${schema_1.orderItems.createdAt}, '%Y-%m-%d')`,
                revenue: (0, drizzle_orm_1.sql) `SUM(CAST(${schema_1.orderItems.price} AS DECIMAL) * ${schema_1.orderItems.quantity})`
            })
                .from(schema_1.orderItems)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.orderItems.sellerId, sellerId), (0, drizzle_orm_1.gte)(schema_1.orderItems.createdAt, thirtyDaysAgo)))
                .groupBy((0, drizzle_orm_1.sql) `DATE_FORMAT(${schema_1.orderItems.createdAt}, '%Y-%m-%d')`)
                .orderBy((0, drizzle_orm_1.sql) `DATE_FORMAT(${schema_1.orderItems.createdAt}, '%Y-%m-%d')`);
        }
        else {
            salesOverTime = await db_1.db.select({
                date: (0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.orderItems.createdAt}, 'YYYY-MM-DD')`,
                revenue: (0, drizzle_orm_1.sql) `SUM(CAST(${schema_1.orderItems.price} AS DECIMAL) * ${schema_1.orderItems.quantity})`
            })
                .from(schema_1.orderItems)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.orderItems.sellerId, sellerId), (0, drizzle_orm_1.gte)(schema_1.orderItems.createdAt, thirtyDaysAgo)))
                .groupBy((0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.orderItems.createdAt}, 'YYYY-MM-DD')`)
                .orderBy((0, drizzle_orm_1.sql) `TO_CHAR(${schema_1.orderItems.createdAt}, 'YYYY-MM-DD')`);
        }
        // 7. Recent Orders
        const recentOrders = await db_1.db.select({
            id: schema_1.orders.id,
            customer: schema_1.users.fullName,
            total: (0, drizzle_orm_1.sql) `SUM(CAST(${schema_1.orderItems.price} AS DECIMAL) * ${schema_1.orderItems.quantity})`,
            status: schema_1.orderItems.status,
            createdAt: schema_1.orderItems.createdAt
        })
            .from(schema_1.orderItems)
            .innerJoin(schema_1.orders, (0, drizzle_orm_1.eq)(schema_1.orderItems.orderId, schema_1.orders.id))
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.orders.customerId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.orderItems.sellerId, sellerId))
            .groupBy(schema_1.orders.id, schema_1.users.fullName, schema_1.orderItems.status, schema_1.orderItems.createdAt)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.orderItems.createdAt))
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
    }
    catch (error) {
        console.error('Seller stats error:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
