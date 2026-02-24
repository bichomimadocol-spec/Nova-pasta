import { sql } from '@vercel/postgres';

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
    await sql`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        telefone VARCHAR(50),
        cpf VARCHAR(50),
        data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        dados_extra JSONB
      );
    `;

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM clientes ORDER BY id DESC`;
      const clientes = rows.map((row: any) => ({
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

      const result = await sql`
        INSERT INTO clientes (nome, email, telefone, cpf, dados_extra)
        VALUES (${nome}, ${email || ''}, ${telefone || ''}, ${cpf || ''}, ${JSON.stringify(rest)})
        RETURNING *;
      `;
      
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
      const { id, nome, email, telefone, cpf, ...rest } = req.body;
      
      if (!id) return res.status(400).json({ error: 'ID é obrigatório' });

      const result = await sql`
        UPDATE clientes 
        SET nome = ${nome}, 
            email = ${email || ''}, 
            telefone = ${telefone || ''}, 
            cpf = ${cpf || ''}, 
            dados_extra = ${JSON.stringify(rest)}
        WHERE id = ${id}
        RETURNING *;
      `;

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

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

      await sql`DELETE FROM clientes WHERE id = ${id}`;
      
      return res.status(200).json({ message: 'Cliente removido com sucesso' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
