import { sql } from '@vercel/postgres';

export async function getClientes() {
  try {
    const { rows } = await sql`SELECT * FROM clientes`;
    return rows;
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    throw error;
  }
}

export async function createCliente(data: any) {
  try {
    const { rows } = await sql`
      INSERT INTO clientes (nome, email, telefone, cpf, tipo_pessoa)
      VALUES (
        ${data.nome || null},
        ${data.email || null},
        ${data.telefone || null},
        ${data.cpf || null},
        ${data.tipo_pessoa || 'PF'}
      )
      RETURNING *
    `;
    return rows[0];
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw error;
  }
}
