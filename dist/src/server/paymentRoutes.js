"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const updateHandler_1 = require("./utils/updateHandler");
const drizzle_orm_2 = require("drizzle-orm");
const uuid_1 = require("uuid");
const gatewayInterface_1 = require("./payments/gatewayInterface");
const encryption_1 = require("./utils/encryption");
const router = express_1.default.Router();
// --- Admin: Manage Gateways ---
router.get('/admin/gateways', async (req, res) => {
    try {
        if (!process.env.DATABASE_URL)
            return res.json([]);
        const result = await db_1.db.select().from(schema_1.paymentGateways);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch gateways' });
    }
});
router.post('/admin/gateways', async (req, res) => {
    try {
        if (!process.env.DATABASE_URL)
            return res.status(500).json({ error: 'Database not connected' });
        const id = (0, uuid_1.v4)();
        await db_1.db.insert(schema_1.paymentGateways).values({ ...req.body, id });
        const [newGateway] = await db_1.db.select().from(schema_1.paymentGateways).where((0, drizzle_orm_2.eq)(schema_1.paymentGateways.id, id));
        res.status(201).json(newGateway);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create gateway' });
    }
});
router.put('/admin/gateways/:id', async (req, res) => {
    try {
        if (!process.env.DATABASE_URL)
            return res.status(500).json({ error: 'Database not connected' });
        await db_1.db.update(schema_1.paymentGateways)
            .set(req.body)
            .where((0, drizzle_orm_2.eq)(schema_1.paymentGateways.id, req.params.id));
        const [updatedGateway] = await db_1.db.select().from(schema_1.paymentGateways).where((0, drizzle_orm_2.eq)(schema_1.paymentGateways.id, req.params.id));
        res.json(updatedGateway);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update gateway' });
    }
});
router.get('/admin/payments', async (req, res) => {
    try {
        if (!process.env.DATABASE_URL)
            return res.json([]);
        const result = await db_1.db.select().from(schema_1.transactions).orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.createdAt));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});
router.patch('/admin/transactions/:id', async (req, res) => {
    try {
        const updated = await (0, updateHandler_1.handlePatchUpdate)({
            table: schema_1.transactions,
            id: req.params.id,
            data: req.body,
            userId: req.body.adminId || 'system',
            module: 'Transaction',
            allowedFields: ['status', 'currency', 'amount'],
            enumValidators: {
                status: ['pending', 'completed', 'failed', 'refunded']
            }
        });
        res.json(updated);
    }
    catch (error) {
        console.error('Error updating transaction:', error);
        res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
    }
});
// --- Admin: Manage Configs & Rules ---
router.get('/admin/gateways/:id/config', async (req, res) => {
    try {
        if (!process.env.DATABASE_URL)
            return res.json([]);
        const result = await db_1.db.select().from(schema_1.gatewayConfigs).where((0, drizzle_orm_2.eq)(schema_1.gatewayConfigs.gatewayId, req.params.id));
        // Mask sensitive values
        const maskedResult = result.map(c => ({
            ...c,
            value: c.key.toLowerCase().includes('secret') || c.key.toLowerCase().includes('key') ? '********' : c.value
        }));
        res.json(maskedResult);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});
router.post('/admin/gateways/:id/config', async (req, res) => {
    try {
        if (!process.env.DATABASE_URL)
            return res.status(500).json({ error: 'Database not connected' });
        const { key, value, environment } = req.body;
        const encryptedValue = key.toLowerCase().includes('secret') || key.toLowerCase().includes('key') ? (0, encryption_1.encrypt)(value) : value;
        const id = (0, uuid_1.v4)();
        await db_1.db.insert(schema_1.gatewayConfigs).values({
            id,
            gatewayId: req.params.id,
            key,
            value: encryptedValue,
            environment
        });
        const [newConfig] = await db_1.db.select().from(schema_1.gatewayConfigs).where((0, drizzle_orm_2.eq)(schema_1.gatewayConfigs.id, id));
        res.status(201).json(newConfig);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create config' });
    }
});
// --- Checkout: Get Eligible Gateways ---
router.get('/checkout/gateways', async (req, res) => {
    try {
        const { region, currency, userType } = req.query;
        if (!process.env.DATABASE_URL) {
            // Return mock data if DB not connected
            return res.json([
                { id: '1', name: 'Stripe', code: 'stripe', type: 'card', isDefault: true },
                { id: '2', name: 'PayPal', code: 'paypal', type: 'wallet', isDefault: false },
                { id: '3', name: 'COD', code: 'cod', type: 'cod', isDefault: false }
            ]);
        }
        // Fetch active gateways with rules
        const activeGateways = await db_1.db.select().from(schema_1.paymentGateways).where((0, drizzle_orm_2.eq)(schema_1.paymentGateways.status, true));
        // Filter by rules (simplified logic)
        const eligibleGateways = [];
        for (const gateway of activeGateways) {
            const rules = await db_1.db.select().from(schema_1.gatewayRules).where((0, drizzle_orm_2.eq)(schema_1.gatewayRules.gatewayId, gateway.id));
            if (rules.length === 0) {
                eligibleGateways.push(gateway);
                continue;
            }
            const matches = rules.some(rule => {
                const regionMatch = !rule.region || rule.region === region;
                const currencyMatch = !rule.currency || rule.currency === currency;
                const userTypeMatch = !rule.userType || rule.userType === userType;
                return regionMatch && currencyMatch && userTypeMatch;
            });
            if (matches)
                eligibleGateways.push(gateway);
        }
        // Also include active manual payment methods (e.g. Cash on Delivery) configured in admin
        const activeManualMethods = await db_1.db.select().from(schema_1.paymentMethods).where((0, drizzle_orm_2.eq)(schema_1.paymentMethods.isActive, true));
        const manualEntries = activeManualMethods.map(m => ({
            id: m.id,
            name: m.name,
            code: `pm_${m.id}`,
            type: 'cod',
            isDefault: false,
        }));
        res.json([...eligibleGateways, ...manualEntries]);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch eligible gateways' });
    }
});
// --- Checkout: Initiate Payment ---
router.post('/checkout/initiate-payment', async (req, res) => {
    try {
        const { gatewayCode, amount, currency, orderId } = req.body;
        if (!process.env.DATABASE_URL) {
            return res.json({ success: true, transactionId: 'mock_tx_123', redirectUrl: '#' });
        }
        // Manual payment method (e.g. Cash on Delivery) created via admin Payment Methods.
        // No external gateway call and no transactions row (no money moves until delivery).
        if (typeof gatewayCode === 'string' && gatewayCode.startsWith('pm_')) {
            const methodId = gatewayCode.slice(3);
            const [method] = await db_1.db.select().from(schema_1.paymentMethods).where((0, drizzle_orm_2.eq)(schema_1.paymentMethods.id, methodId));
            if (!method || !method.isActive) {
                return res.status(404).json({ error: 'Payment method not found' });
            }
            return res.json({
                success: true,
                transactionId: `manual_${(0, uuid_1.v4)()}`,
                message: method.instructions || 'Order placed. Payment will be collected as per the selected method.',
                metadata: { provider: 'manual', methodId: method.id, methodName: method.name },
            });
        }
        const [gateway] = await db_1.db.select().from(schema_1.paymentGateways).where((0, drizzle_orm_2.eq)(schema_1.paymentGateways.code, gatewayCode));
        if (!gateway)
            return res.status(404).json({ error: 'Gateway not found' });
        // Fetch config
        const configs = await db_1.db.select().from(schema_1.gatewayConfigs).where((0, drizzle_orm_2.eq)(schema_1.gatewayConfigs.gatewayId, gateway.id));
        const configMap = {};
        configs.forEach(c => {
            configMap[c.key] = c.key.toLowerCase().includes('secret') || c.key.toLowerCase().includes('key') ? (0, encryption_1.decrypt)(c.value) : c.value;
        });
        const gatewayImpl = (0, gatewayInterface_1.getGateway)(gatewayCode);
        if (!gatewayImpl)
            return res.status(500).json({ error: 'Gateway implementation not found' });
        const result = await gatewayImpl.initiatePayment(amount, currency, orderId, configMap);
        if (result.success) {
            // Create transaction record
            const id = (0, uuid_1.v4)();
            await db_1.db.insert(schema_1.transactions).values({
                id,
                orderId,
                gatewayId: gateway.id,
                amount: amount.toString(),
                currency,
                status: 'pending'
            });
            const [tx] = await db_1.db.select().from(schema_1.transactions).where((0, drizzle_orm_2.eq)(schema_1.transactions.id, id));
            res.json({ ...result, dbTransactionId: tx.id });
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Payment initiation error:', error);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
});
exports.default = router;
