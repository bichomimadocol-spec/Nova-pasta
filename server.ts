// server.ts
import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';

// 🔴 REMOVIDOS: imports de handlers que não existem na Vercel
// import clientesHandler from './api/sync/clientes';
// import vendasHandler from './api/sync/vendas';
// import petsHandler from './api/sync/pets';
// import agendamentosHandler from './api/sync/agendamentos';

async function startServer() {
  const app = express();
  const PORT = 3000;

  if (!process.env.POSTGRES_URL) {
    console.warn(
      'WARNING: POSTGRES_URL environment variable is not set. Database operations will fail.'
    );
  }

  app.use(express.json());

  // 🔴 REMOVIDAS: rotas /api/... que delegavam para handlers externos
  // Elas são responsabilidade das rotas de API (pages/app/api) quando estiver na Vercel.

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
