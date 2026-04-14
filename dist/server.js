"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vite_1 = require("vite");
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const routes_1 = __importDefault(require("./src/server/routes"));
const paymentRoutes_1 = __importDefault(require("./src/server/paymentRoutes"));
const orderRoutes_1 = __importDefault(require("./src/server/orderRoutes"));
const omsRoutes_1 = __importDefault(require("./src/server/omsRoutes"));
const dashboardRoutes_1 = __importDefault(require("./src/server/dashboardRoutes"));
const migrate_1 = require("./src/db/migrate");
const db_1 = require("./src/db");
const drizzle_orm_1 = require("drizzle-orm");
dotenv_1.default.config();
async function startServer() {
    // Run migrations
    await (0, migrate_1.migrate)();
    const app = (0, express_1.default)();
    const PORT = 3000;
    app.get('/api/debug/db', async (req, res) => {
        try {
            const isMysql = process.env.DATABASE_URL?.startsWith('mysql');
            let ordersCols, itemsCols, commProvidersCols;
            if (isMysql) {
                [ordersCols] = await db_1.db.execute(drizzle_orm_1.sql.raw('DESCRIBE orders'));
                [itemsCols] = await db_1.db.execute(drizzle_orm_1.sql.raw('DESCRIBE order_items'));
                try {
                    [commProvidersCols] = await db_1.db.execute(drizzle_orm_1.sql.raw('DESCRIBE communication_providers'));
                }
                catch (e) {
                    commProvidersCols = { error: e.message };
                }
            }
            else {
                [ordersCols] = await db_1.db.execute(drizzle_orm_1.sql.raw("SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'"));
                [itemsCols] = await db_1.db.execute(drizzle_orm_1.sql.raw("SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items'"));
                try {
                    [commProvidersCols] = await db_1.db.execute(drizzle_orm_1.sql.raw("SELECT column_name FROM information_schema.columns WHERE table_name = 'communication_providers'"));
                }
                catch (e) {
                    commProvidersCols = { error: e.message };
                }
            }
            res.json({ ordersCols, itemsCols, commProvidersCols });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    app.use((0, cors_1.default)());
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
    // API proxy for geolocation to avoid CORS on local
    app.get('/api/detect-country', async (req, res) => {
        try {
            const response = await axios_1.default.get('https://ipapi.co/json/', { timeout: 5000 });
            res.json(response.data);
        }
        catch (error) {
            res.json({ country_code: null });
        }
    });
    // API routes FIRST
    app.use('/api', routes_1.default);
    app.use('/api/payments', paymentRoutes_1.default);
    app.use('/api', orderRoutes_1.default);
    app.use('/api/oms', omsRoutes_1.default);
    app.use('/api/dashboard', dashboardRoutes_1.default);
    // Vite middleware for development
    if (process.env.NODE_ENV !== 'production') {
        console.log('Running in DEVELOPMENT mode with Vite middleware');
        const vite = await (0, vite_1.createServer)({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
        app.use('*', async (req, res, next) => {
            const url = req.originalUrl;
            try {
                let template = fs_1.default.readFileSync(path_1.default.resolve(process.cwd(), 'index.html'), 'utf-8');
                template = await vite.transformIndexHtml(url, template);
                res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
            }
            catch (e) {
                vite.ssrFixStacktrace(e);
                next(e);
            }
        });
    }
    else {
        console.log('Running in PRODUCTION mode');
        const distPath = path_1.default.join(process.cwd(), 'dist');
        app.use(express_1.default.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path_1.default.join(distPath, 'index.html'));
        });
    }
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
startServer();
