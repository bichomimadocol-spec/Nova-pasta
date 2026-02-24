import { getPets, createPet } from './db';

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
      const pets = await getPets();
      return res.status(200).json(pets);
    }

    if (req.method === 'POST') {
      const { nome, clienteId } = req.body;
      if (!nome || !clienteId) return res.status(400).json({ error: 'Nome e Cliente são obrigatórios' });

      const novoPet = await createPet(req.body);
      return res.status(201).json(novoPet);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in pets handler:', error);
    return res.status(500).json({ error: error.message });
  }
}
