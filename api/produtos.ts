// api/produtos.ts
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
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(20) DEFAULT 'Produto',
        nome TEXT NOT NULL,
        categoria TEXT,
        preco DECIMAL(10,2) NOT NULL,
        estoque DECIMAL(10,2) DEFAULT 0
      );
    `);

    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM produtos ORDER BY id DESC');
      const produtos = result.rows.map((row: any) => ({
        id: row.id,
        tipo: row.tipo,
        nome: row.nome,
        categoria: row.categoria,
        preco: parseFloat(row.preco),
        estoque: parseFloat(row.estoque),
      }));
      return res.status(200).json(produtos);
    }

    if (req.method === 'POST') {
      try {
        console.log('BODY RECEBIDO EM /api/produtos:', req.body);
        const { tipo, nome, categoria, preco, estoque } = req.body;

        console.log('Campos extraídos:', { tipo, nome, categoria, preco, estoque });

        if (!nome || preco === undefined) {
          console.log('Validação falhou: nome ou preco ausente');
          return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
        }

        console.log('Executando query INSERT...');
        const result = await pool.query(
          'INSERT INTO produtos (tipo, nome, categoria, preco, estoque) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [tipo || 'Produto', nome, categoria || null, preco, estoque || 0]
        );

        console.log('Query executada, resultado:', result.rows[0]);

        const row = result.rows[0];
        const novoProduto = {
          id: row.id,
          tipo: row.tipo,
          nome: row.nome,
          categoria: row.categoria,
          preco: parseFloat(row.preco),
          estoque: parseFloat(row.estoque),
        };

        console.log('Retornando produto criado:', novoProduto);
        return res.status(201).json(novoProduto);
      } catch (error) {
        console.error('ERRO EM /api/produtos POST:', error);
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        return res.status(500).json({ error: 'Erro ao salvar produto', details: message });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}