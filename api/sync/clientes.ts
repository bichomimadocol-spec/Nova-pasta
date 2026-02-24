import { getClientes, createCliente } from './db';

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
      const clientes = await getClientes();
      return res.status(200).json(clientes);
    }

    if (req.method === 'POST') {
      const { nome } = req.body;
      if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });

      const novoCliente = await createCliente(req.body);
      return res.status(201).json(novoCliente);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in clientes handler:', error);
    return res.status(500).json({ error: error.message });
  }
}
