import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import clientesHandler from './api/sync/clientes';
import vendasHandler from './api/sync/vendas';
import petsHandler from './api/sync/pets';
import agendamentosHandler from './api/sync/agendamentos';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Check for database configuration
  if (!process.env.POSTGRES_URL) {
    console.warn('WARNING: POSTGRES_URL environment variable is not set. Database operations will fail.');
  }

  // Middleware to parse JSON bodies (needed for API routes)
  app.use(express.json());

  // API Routes - Map legacy and new routes to the same handlers
  // We wrap the handler to catch errors and ensure it returns a promise if needed
  const wrapHandler = (handler: any, name: string) => async (req: any, res: any) => {
    try {
      await handler(req, res);
    } catch (error: any) {
      console.error(`Error in ${name} handler:`, error);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Internal Server Error', 
          details: error.message 
        });
      }
    }
  };

  app.all('/api/clientes', wrapHandler(clientesHandler, 'clientes'));
  app.all('/api/vendas', wrapHandler(vendasHandler, 'vendas'));
  app.all('/api/pets', wrapHandler(petsHandler, 'pets'));
  app.all('/api/agendamentos', wrapHandler(agendamentosHandler, 'agendamentos'));
  app.all('/api/sync/clientes', wrapHandler(clientesHandler, 'sync/clientes'));
  app.all('/api/sync/vendas', wrapHandler(vendasHandler, 'sync/vendas'));
  app.all('/api/sync/pets', wrapHandler(petsHandler, 'sync/pets'));
  app.all('/api/sync/agendamentos', wrapHandler(agendamentosHandler, 'sync/agendamentos'));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving (if needed, but usually handled by build)
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
