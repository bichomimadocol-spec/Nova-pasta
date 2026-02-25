// api/pets.ts
import { createPool } from '@vercel/postgres';

const pool = createPool({
  connectionString: process.env.NEON_POSTGRES_URL,
});

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
    // Criar tabela se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pets (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER NOT NULL REFERENCES clientes(id),
        nome TEXT NOT NULL,
        especie TEXT,
        raca TEXT,
        data_nascimento DATE,
        observacoes TEXT
      );
    `);

    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM pets ORDER BY id DESC');
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      console.log('BODY_PET', req.body);
      const { cliente_id, nome, especie, raca, data_nascimento, observacoes } = req.body;

      if (!cliente_id || !nome) {
        return res.status(400).json({ error: 'cliente_id e nome são obrigatórios' });
      }

      const result = await pool.query(
        'INSERT INTO pets (cliente_id, nome, especie, raca, data_nascimento, observacoes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [cliente_id, nome, especie || null, raca || null, data_nascimento || null, observacoes || null]
      );

      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}