// api/vendas.ts

export default async function handler(req: any, res: any) {
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
      return res.status(501).json({
        error: 'GET /api/vendas desativado (banco não configurado neste ambiente).',
      });
    }

    if (req.method === 'POST') {
      const { clienteId, total } = req.body;
      if (!clienteId || !total) {
        return res.status(400).json({ error: 'Dados obrigatórios faltando' });
      }

      // Retorno fake só para não quebrar o fluxo
      const novaVenda = {
        id: Date.now(),
        ...req.body,
      };

      return res.status(201).json(novaVenda);
    }

    if (req.method === 'PUT' || req.method === 'DELETE') {
      return res.status(501).json({
        error: `${req.method} /api/vendas desativado (banco não configurado neste ambiente).`,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
