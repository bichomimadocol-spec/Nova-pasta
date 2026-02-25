// api/agendamentos.ts
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
      CREATE TABLE IF NOT EXISTS agendamentos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER NOT NULL REFERENCES clientes(id),
        pet_id INTEGER REFERENCES pets(id),
        servico TEXT NOT NULL,
        data_inicio TIMESTAMP NOT NULL,
        data_fim TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'AGENDADO',
        observacao TEXT,
        valor DECIMAL(10,2),
        forma_pagamento TEXT,
        desconto DECIMAL(10,2),
        valor_total DECIMAL(10,2),
        observacoes_financeiro TEXT,
        origem_servico TEXT,
        plano_id INTEGER,
        plano_item_id INTEGER,
        servico_id INTEGER,
        servico_nome TEXT,
        plano_consumo_pendente BOOLEAN DEFAULT FALSE
      );
    `);

    if (req.method === 'GET') {
      let query = 'SELECT * FROM agendamentos';
      if (req.query.today === 'true') {
        query += ' WHERE DATE(data_inicio) = CURRENT_DATE';
      }
      query += ' ORDER BY data_inicio DESC';
      const result = await pool.query(query);
      const agendamentos = result.rows.map((row: any) => ({
        id: row.id,
        clienteId: row.cliente_id,
        petId: row.pet_id,
        servico: row.servico,
        dataInicio: row.data_inicio,
        dataFim: row.data_fim,
        status: row.status,
        observacao: row.observacao,
        valor: row.valor ? parseFloat(row.valor) : undefined,
        formaPagamento: row.forma_pagamento,
        desconto: row.desconto ? parseFloat(row.desconto) : undefined,
        valorTotal: row.valor_total ? parseFloat(row.valor_total) : undefined,
        observacoesFinanceiro: row.observacoes_financeiro,
        origemServico: row.origem_servico,
        planoId: row.plano_id,
        planoItemId: row.plano_item_id,
        servicoId: row.servico_id,
        servicoNome: row.servico_nome,
        planoConsumoPendente: row.plano_consumo_pendente,
      }));
      return res.status(200).json(agendamentos);
    }

    if (req.method === 'POST') {
      console.log('BODY_AGENDAMENTO:', req.body);
      const {
        clienteId,
        petId,
        servico,
        dataInicio,
        dataFim,
        status,
        observacao,
        valor,
        formaPagamento,
        desconto,
        valorTotal,
        observacoesFinanceiro,
        origemServico,
        planoId,
        planoItemId,
        servicoId,
        servicoNome,
        planoConsumoPendente,
      } = req.body;

      if (!clienteId || !servico || !dataInicio || !dataFim) {
        return res.status(400).json({ error: 'clienteId, servico, dataInicio e dataFim são obrigatórios' });
      }

      const result = await pool.query(
        `INSERT INTO agendamentos (
          cliente_id, pet_id, servico, data_inicio, data_fim, status, observacao, valor,
          forma_pagamento, desconto, valor_total, observacoes_financeiro, origem_servico,
          plano_id, plano_item_id, servico_id, servico_nome, plano_consumo_pendente
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
        [
          clienteId, petId || null, servico, dataInicio, dataFim, status || 'AGENDADO',
          observacao || null, valor || null, formaPagamento || null, desconto || null,
          valorTotal || null, observacoesFinanceiro || null, origemServico || null,
          planoId || null, planoItemId || null, servicoId || null, servicoNome || null,
          planoConsumoPendente || false
        ]
      );

      const row = result.rows[0];
      const agendamento = {
        id: row.id,
        clienteId: row.cliente_id,
        petId: row.pet_id,
        servico: row.servico,
        dataInicio: row.data_inicio,
        dataFim: row.data_fim,
        status: row.status,
        observacao: row.observacao,
        valor: row.valor ? parseFloat(row.valor) : undefined,
        formaPagamento: row.forma_pagamento,
        desconto: row.desconto ? parseFloat(row.desconto) : undefined,
        valorTotal: row.valor_total ? parseFloat(row.valor_total) : undefined,
        observacoesFinanceiro: row.observacoes_financeiro,
        origemServico: row.origem_servico,
        planoId: row.plano_id,
        planoItemId: row.plano_item_id,
        servicoId: row.servico_id,
        servicoNome: row.servico_nome,
        planoConsumoPendente: row.plano_consumo_pendente,
      };

      return res.status(201).json(agendamento);
    }

    if (req.method === 'DELETE' && req.query.today === 'true') {
      const result = await pool.query('DELETE FROM agendamentos WHERE DATE(data_inicio) = CURRENT_DATE');
      console.log(`Deleted ${result.rowCount} agendamentos from today`);
      return res.status(200).json({ message: `Deleted ${result.rowCount} agendamentos from today` });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}