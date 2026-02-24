import { sql } from '@vercel/postgres';
import Database from 'better-sqlite3';
import path from 'path';

const isPostgres = !!process.env.POSTGRES_URL;
let sqliteDb: any;

if (!isPostgres) {
  try {
    const dbPath = path.resolve(process.cwd(), 'local.db');
    console.log('Using local SQLite database at:', dbPath);
    sqliteDb = new Database(dbPath);
    
    // Initialize tables
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT,
        telefone TEXT,
        cpf TEXT,
        data_cadastro TEXT DEFAULT CURRENT_TIMESTAMP,
        dados_extra TEXT
      );
      
      CREATE TABLE IF NOT EXISTS vendas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        total REAL,
        data_venda TEXT,
        forma_pagamento TEXT,
        dados_extra TEXT
      );
    `);
  } catch (error) {
    console.error('Failed to initialize SQLite database:', error);
  }
} else {
    // Ensure Postgres tables exist
    // Note: This is async, so we can't await it at top level easily in CommonJS/ESM hybrid without top-level await support
    // We'll do it lazily or just assume migration script ran. 
    // For this fix, we'll try to run it on first access if possible, or just rely on the handlers calling it.
}

export async function ensureTables() {
    if (isPostgres) {
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
    }
}

// --- CLIENTES ---

export async function getClientes() {
  if (isPostgres) {
    await ensureTables();
    const { rows } = await sql`SELECT * FROM clientes ORDER BY id DESC`;
    return rows.map((row: any) => ({
      ...row.dados_extra,
      id: row.id,
      nome: row.nome,
      email: row.email,
      telefone: row.telefone,
      cpf: row.cpf,
      dataCadastro: row.data_cadastro,
    }));
  } else {
    const rows = sqliteDb.prepare('SELECT * FROM clientes ORDER BY id DESC').all();
    return rows.map((row: any) => {
      let dadosExtra = {};
      try { dadosExtra = JSON.parse(row.dados_extra); } catch (e) {}
      return {
        ...dadosExtra,
        id: row.id,
        nome: row.nome,
        email: row.email,
        telefone: row.telefone,
        cpf: row.cpf,
        dataCadastro: row.data_cadastro,
      };
    });
  }
}

export async function createCliente(data: any) {
  const { nome, email, telefone, cpf, ...rest } = data;
  
  if (isPostgres) {
    await ensureTables();
    const result = await sql`
      INSERT INTO clientes (nome, email, telefone, cpf, dados_extra)
      VALUES (${nome}, ${email || ''}, ${telefone || ''}, ${cpf || ''}, ${JSON.stringify(rest)})
      RETURNING *;
    `;
    const row = result.rows[0];
    return {
      ...row.dados_extra,
      id: row.id,
      nome: row.nome,
      email: row.email,
      telefone: row.telefone,
      cpf: row.cpf,
      dataCadastro: row.data_cadastro,
    };
  } else {
    const stmt = sqliteDb.prepare(`
      INSERT INTO clientes (nome, email, telefone, cpf, dados_extra)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(nome, email || '', telefone || '', cpf || '', JSON.stringify(rest));
    
    // Fetch the created row
    const row = sqliteDb.prepare('SELECT * FROM clientes WHERE id = ?').get(info.lastInsertRowid);
    let dadosExtra = {};
    try { dadosExtra = JSON.parse(row.dados_extra); } catch (e) {}
    
    return {
      ...dadosExtra,
      id: row.id,
      nome: row.nome,
      email: row.email,
      telefone: row.telefone,
      cpf: row.cpf,
      dataCadastro: row.data_cadastro,
    };
  }
}

// --- PETS ---

export async function getPets() {
  if (isPostgres) {
    await ensureTables();
    // Ensure pets table exists
    await sql`
      CREATE TABLE IF NOT EXISTS pets (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER,
        nome VARCHAR(255) NOT NULL,
        especie VARCHAR(100),
        raca VARCHAR(100),
        dados_extra JSONB
      );
    `;
    const { rows } = await sql`SELECT * FROM pets ORDER BY id DESC`;
    return rows.map((row: any) => ({
      ...row.dados_extra,
      id: row.id,
      clienteId: row.cliente_id,
      nome: row.nome,
      especie: row.especie,
      raca: row.raca,
    }));
  } else {
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        nome TEXT NOT NULL,
        especie TEXT,
        raca TEXT,
        dados_extra TEXT
      );
    `);
    const rows = sqliteDb.prepare('SELECT * FROM pets ORDER BY id DESC').all();
    return rows.map((row: any) => {
      let dadosExtra = {};
      try { dadosExtra = JSON.parse(row.dados_extra); } catch (e) {}
      return {
        ...dadosExtra,
        id: row.id,
        clienteId: row.cliente_id,
        nome: row.nome,
        especie: row.especie,
        raca: row.raca,
      };
    });
  }
}

export async function createPet(data: any) {
  const { clienteId, nome, especie, raca, ...rest } = data;

  if (isPostgres) {
    await ensureTables();
    // Ensure pets table exists (lazy check)
    await sql`
      CREATE TABLE IF NOT EXISTS pets (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER,
        nome VARCHAR(255) NOT NULL,
        especie VARCHAR(100),
        raca VARCHAR(100),
        dados_extra JSONB
      );
    `;
    const result = await sql`
      INSERT INTO pets (cliente_id, nome, especie, raca, dados_extra)
      VALUES (${clienteId}, ${nome}, ${especie}, ${raca}, ${JSON.stringify(rest)})
      RETURNING *;
    `;
    const row = result.rows[0];
    return {
      ...row.dados_extra,
      id: row.id,
      clienteId: row.cliente_id,
      nome: row.nome,
      especie: row.especie,
      raca: row.raca,
    };
  } else {
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        nome TEXT NOT NULL,
        especie TEXT,
        raca TEXT,
        dados_extra TEXT
      );
    `);
    const stmt = sqliteDb.prepare(`
      INSERT INTO pets (cliente_id, nome, especie, raca, dados_extra)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(clienteId, nome, especie, raca, JSON.stringify(rest));
    
    const row = sqliteDb.prepare('SELECT * FROM pets WHERE id = ?').get(info.lastInsertRowid);
    let dadosExtra = {};
    try { dadosExtra = JSON.parse(row.dados_extra); } catch (e) {}
    
    return {
      ...dadosExtra,
      id: row.id,
      clienteId: row.cliente_id,
      nome: row.nome,
      especie: row.especie,
      raca: row.raca,
    };
  }
}

// --- AGENDAMENTOS ---

export async function getAgendamentos() {
  if (isPostgres) {
    await ensureTables();
    await sql`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER,
        pet_id INTEGER,
        servico VARCHAR(255),
        data_inicio TIMESTAMP,
        data_fim TIMESTAMP,
        status VARCHAR(50),
        valor DECIMAL(10, 2),
        dados_extra JSONB
      );
    `;
    const { rows } = await sql`SELECT * FROM agendamentos ORDER BY data_inicio DESC`;
    return rows.map((row: any) => ({
      ...row.dados_extra,
      id: row.id,
      clienteId: row.cliente_id,
      petId: row.pet_id,
      servico: row.servico,
      dataInicio: row.data_inicio,
      dataFim: row.data_fim,
      status: row.status,
      valor: parseFloat(row.valor),
    }));
  } else {
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        pet_id INTEGER,
        servico TEXT,
        data_inicio TEXT,
        data_fim TEXT,
        status TEXT,
        valor REAL,
        dados_extra TEXT
      );
    `);
    const rows = sqliteDb.prepare('SELECT * FROM agendamentos ORDER BY data_inicio DESC').all();
    return rows.map((row: any) => {
      let dadosExtra = {};
      try { dadosExtra = JSON.parse(row.dados_extra); } catch (e) {}
      return {
        ...dadosExtra,
        id: row.id,
        clienteId: row.cliente_id,
        petId: row.pet_id,
        servico: row.servico,
        dataInicio: row.data_inicio,
        dataFim: row.data_fim,
        status: row.status,
        valor: row.valor,
      };
    });
  }
}

export async function createAgendamento(data: any) {
  const { clienteId, petId, servico, dataInicio, dataFim, status, valor, ...rest } = data;

  if (isPostgres) {
    await ensureTables();
    await sql`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER,
        pet_id INTEGER,
        servico VARCHAR(255),
        data_inicio TIMESTAMP,
        data_fim TIMESTAMP,
        status VARCHAR(50),
        valor DECIMAL(10, 2),
        dados_extra JSONB
      );
    `;
    const result = await sql`
      INSERT INTO agendamentos (cliente_id, pet_id, servico, data_inicio, data_fim, status, valor, dados_extra)
      VALUES (${clienteId}, ${petId}, ${servico}, ${dataInicio}, ${dataFim}, ${status}, ${valor}, ${JSON.stringify(rest)})
      RETURNING *;
    `;
    const row = result.rows[0];
    return {
      ...row.dados_extra,
      id: row.id,
      clienteId: row.cliente_id,
      petId: row.pet_id,
      servico: row.servico,
      dataInicio: row.data_inicio,
      dataFim: row.data_fim,
      status: row.status,
      valor: parseFloat(row.valor),
    };
  } else {
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        pet_id INTEGER,
        servico TEXT,
        data_inicio TEXT,
        data_fim TEXT,
        status TEXT,
        valor REAL,
        dados_extra TEXT
      );
    `);
    const stmt = sqliteDb.prepare(`
      INSERT INTO agendamentos (cliente_id, pet_id, servico, data_inicio, data_fim, status, valor, dados_extra)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(clienteId, petId, servico, dataInicio, dataFim, status, valor, JSON.stringify(rest));
    
    const row = sqliteDb.prepare('SELECT * FROM agendamentos WHERE id = ?').get(info.lastInsertRowid);
    let dadosExtra = {};
    try { dadosExtra = JSON.parse(row.dados_extra); } catch (e) {}
    
    return {
      ...dadosExtra,
      id: row.id,
      clienteId: row.cliente_id,
      petId: row.pet_id,
      servico: row.servico,
      dataInicio: row.data_inicio,
      dataFim: row.data_fim,
      status: row.status,
      valor: row.valor,
    };
  }
}


export async function getVendas() {
  if (isPostgres) {
    await ensureTables();
    const { rows } = await sql`SELECT * FROM vendas ORDER BY id DESC`;
    return rows.map((row: any) => ({
      ...row.dados_extra,
      id: row.id,
      clienteId: row.cliente_id,
      total: parseFloat(row.total),
      dataVenda: row.data_venda,
      formaPagamento: row.forma_pagamento,
    }));
  } else {
    const rows = sqliteDb.prepare('SELECT * FROM vendas ORDER BY id DESC').all();
    return rows.map((row: any) => {
      let dadosExtra = {};
      try { dadosExtra = JSON.parse(row.dados_extra); } catch (e) {}
      return {
        ...dadosExtra,
        id: row.id,
        clienteId: row.cliente_id,
        total: row.total,
        dataVenda: row.data_venda,
        formaPagamento: row.forma_pagamento,
      };
    });
  }
}

export async function createVenda(data: any) {
  const { clienteId, total, dataVenda, formaPagamento, ...rest } = data;

  if (isPostgres) {
    await ensureTables();
    const result = await sql`
      INSERT INTO vendas (cliente_id, total, data_venda, forma_pagamento, dados_extra)
      VALUES (${clienteId}, ${total}, ${dataVenda}, ${formaPagamento}, ${JSON.stringify(rest)})
      RETURNING *;
    `;
    const row = result.rows[0];
    return {
      ...row.dados_extra,
      id: row.id,
      clienteId: row.cliente_id,
      total: parseFloat(row.total),
      dataVenda: row.data_venda,
      formaPagamento: row.forma_pagamento,
    };
  } else {
    const stmt = sqliteDb.prepare(`
      INSERT INTO vendas (cliente_id, total, data_venda, forma_pagamento, dados_extra)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(clienteId, total, dataVenda, formaPagamento, JSON.stringify(rest));
    
    const row = sqliteDb.prepare('SELECT * FROM vendas WHERE id = ?').get(info.lastInsertRowid);
    let dadosExtra = {};
    try { dadosExtra = JSON.parse(row.dados_extra); } catch (e) {}
    
    return {
      ...dadosExtra,
      id: row.id,
      clienteId: row.cliente_id,
      total: row.total,
      dataVenda: row.data_venda,
      formaPagamento: row.forma_pagamento,
    };
  }
}
