import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM clientes`;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { nome, email, telefone, cpf, tipo_pessoa } = req.body;
      if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });

      const { rows } = await sql`
        INSERT INTO clientes (nome, email, telefone, cpf, tipo_pessoa)
        VALUES (${nome}, ${email || null}, ${telefone || null}, ${cpf || null}, ${tipo_pessoa || 'PF'})
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in clientes handler:', error);
    return res.status(500).json({ error: error.message });
  }
}
