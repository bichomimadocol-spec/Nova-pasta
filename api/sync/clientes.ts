// api/sync/clientes.ts

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

  // Endpoint desativado / não implementado neste ambiente
  if (req.method === 'GET' || req.method === 'POST') {
    return res.status(501).json({
      error: 'Endpoint /api/sync/clientes desativado no ambiente de produção.',
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
