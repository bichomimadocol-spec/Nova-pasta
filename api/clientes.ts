// api/clientes.ts
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
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        telefone VARCHAR(50),
        cpf VARCHAR(50),
        data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        dados_extra JSONB
      );
    `);

    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
      const clientes = result.rows.map((row: any) => ({
        ...row.dados_extra,
        id: row.id,
        nome: row.nome,
        email: row.email,
        telefone: row.telefone,
        cpf: row.cpf,
        dataCadastro: row.data_cadastro,
      }));
      return res.status(200).json(clientes);
    }

    if (req.method === 'POST') {
      const { nome, email, telefone, cpf, ...rest } = req.body;
      
      if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });

      const result = await pool.query(
        'INSERT INTO clientes (nome, email, telefone, cpf, dados_extra) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [nome, email || '', telefone || '', cpf || '', JSON.stringify(rest)]
      );
      
      const row = result.rows[0];
      const novoCliente = {
        ...row.dados_extra,
        id: row.id,
        nome: row.nome,
        email: row.email,
        telefone: row.telefone,
        cpf: row.cpf,
        dataCadastro: row.data_cadastro,
      };

      return res.status(201).json(novoCliente);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { nome, email, telefone, cpf, ...rest } = req.body;
      
      if (!id || !nome) return res.status(400).json({ error: 'ID e nome são obrigatórios' });

      const result = await pool.query(
        'UPDATE clientes SET nome = $1, email = $2, telefone = $3, cpf = $4, dados_extra = $5 WHERE id = $6 RETURNING *',
        [nome, email || '', telefone || '', cpf || '', JSON.stringify(rest), id]
      );
      
      if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });

      const row = result.rows[0];
      const clienteAtualizado = {
        ...row.dados_extra,
        id: row.id,
        nome: row.nome,
        email: row.email,
        telefone: row.telefone,
        cpf: row.cpf,
        dataCadastro: row.data_cadastro,
      };

      return res.status(200).json(clienteAtualizado);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) return res.status(400).json({ error: 'ID é obrigatório' });

      const result = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });

      return res.status(200).json({ message: 'Cliente deletado com sucesso' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
