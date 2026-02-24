import { getVendas, createVenda } from './db';

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const vendas = await getVendas();
      return res.status(200).json(vendas);
    }

    if (req.method === 'POST') {
      const { clienteId, total } = req.body;
      if (!clienteId || !total) return res.status(400).json({ error: 'Dados obrigatórios faltando' });

      const novaVenda = await createVenda(req.body);
      return res.status(201).json(novaVenda);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in vendas handler:', error);
    return res.status(500).json({ error: error.message });
  }
}
