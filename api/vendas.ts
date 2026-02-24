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
      CREATE TABLE IF NOT EXISTS vendas (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER,
        total DECIMAL(10, 2),
        data_venda TIMESTAMP,
        forma_pagamento VARCHAR(50),
        dados_extra JSONB
      );
    `;

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM vendas ORDER BY id DESC`;
      const vendas = rows.map((row: any) => ({
        ...row.dados_extra,
        id: row.id,
        clienteId: row.cliente_id,
        total: parseFloat(row.total),
        dataVenda: row.data_venda,
        formaPagamento: row.forma_pagamento,
      }));
      return res.status(200).json(vendas);
    }

    if (req.method === 'POST') {
      const { clienteId, total, dataVenda, formaPagamento, ...rest } = req.body;
      
      if (!clienteId || !total) return res.status(400).json({ error: 'Dados obrigatórios faltando' });

      const result = await sql`
        INSERT INTO vendas (cliente_id, total, data_venda, forma_pagamento, dados_extra)
        VALUES (${clienteId}, ${total}, ${dataVenda}, ${formaPagamento}, ${JSON.stringify(rest)})
        RETURNING *;
      `;
      
      const row = result.rows[0];
      const novaVenda = {
        ...row.dados_extra,
        id: row.id,
        clienteId: row.cliente_id,
        total: parseFloat(row.total),
        dataVenda: row.data_venda,
        formaPagamento: row.forma_pagamento,
      };
      
      return res.status(201).json(novaVenda);
    }

    if (req.method === 'PUT') {
      const { id, clienteId, total, dataVenda, formaPagamento, ...rest } = req.body;
      
      if (!id) return res.status(400).json({ error: 'ID é obrigatório' });

      const result = await sql`
        UPDATE vendas 
        SET cliente_id = ${clienteId}, 
            total = ${total}, 
            data_venda = ${dataVenda}, 
            forma_pagamento = ${formaPagamento}, 
            dados_extra = ${JSON.stringify(rest)}
        WHERE id = ${id}
        RETURNING *;
      `;

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      const row = result.rows[0];
      const vendaAtualizada = {
        ...row.dados_extra,
        id: row.id,
        clienteId: row.cliente_id,
        total: parseFloat(row.total),
        dataVenda: row.data_venda,
        formaPagamento: row.forma_pagamento,
      };

      return res.status(200).json(vendaAtualizada);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) return res.status(400).json({ error: 'ID é obrigatório' });

      await sql`DELETE FROM vendas WHERE id = ${id}`;
      
      return res.status(200).json({ message: 'Venda removida com sucesso' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
