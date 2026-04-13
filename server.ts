import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import apiRoutes from './src/server/routes';
import paymentRoutes from './src/server/paymentRoutes';
import orderRoutes from './src/server/orderRoutes';
import omsRoutes from './src/server/omsRoutes';
import dashboardRoutes from './src/server/dashboardRoutes';
import { migrate } from './src/db/migrate';
import { db } from './src/db';
import { sql } from 'drizzle-orm';

dotenv.config();

async function startServer() {
  // Run migrations
  await migrate();

  const app = express();
  const PORT = 3000;

  app.get('/api/debug/db', async (req, res) => {
    try {
      const isMysql = process.env.DATABASE_URL?.startsWith('mysql');
      let ordersCols, itemsCols, commProvidersCols;
      
      if (isMysql) {
        [ordersCols] = await db.execute(sql.raw('DESCRIBE orders'));
        [itemsCols] = await db.execute(sql.raw('DESCRIBE order_items'));
        try {
          [commProvidersCols] = await db.execute(sql.raw('DESCRIBE communication_providers'));
        } catch (e) {
          commProvidersCols = { error: e.message };
        }
      } else {
        [ordersCols] = await db.execute(sql.raw("SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'"));
        [itemsCols] = await db.execute(sql.raw("SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items'"));
        try {
          [commProvidersCols] = await db.execute(sql.raw("SELECT column_name FROM information_schema.columns WHERE table_name = 'communication_providers'"));
        } catch (e) {
          commProvidersCols = { error: e.message };
        }
      }
      
      res.json({ ordersCols, itemsCols, commProvidersCols });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // API proxy for geolocation to avoid CORS on local
  app.get('/api/detect-country', async (req, res) => {
    try {
      const response = await axios.get('https://ipapi.co/json/', { timeout: 5000 });
      res.json(response.data);
    } catch (error) {
      res.json({ country_code: null });
    }
  });

  // API routes FIRST
  app.use('/api', apiRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api', orderRoutes);
  app.use('/api/oms', omsRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running in DEVELOPMENT mode with Vite middleware');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    console.log('Running in PRODUCTION mode');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
