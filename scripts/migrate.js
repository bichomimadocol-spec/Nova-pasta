const { db } = require('@vercel/postgres');
require('dotenv').config();

async function migrate() {
  const client = await db.connect();

  try {
    console.log('Iniciando migração...');

    // 1. Clientes
    await client.sql`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        telefone VARCHAR(50),
        email VARCHAR(255),
        cpf VARCHAR(20),
        data_cadastro DATE DEFAULT CURRENT_DATE,
        tipo_pessoa VARCHAR(20),
        rg VARCHAR(20),
        endereco TEXT,
        bairro VARCHAR(100),
        cidade VARCHAR(100),
        uf VARCHAR(2),
        cep VARCHAR(10),
        observacao TEXT
      );
    `;

    // Add PJ columns if not exists (Soft Add)
    try {
      await client.sql`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cnpj VARCHAR(18);`;
      await client.sql`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS razao_social VARCHAR(255);`;
      await client.sql`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS nome_fantasia VARCHAR(255);`;
      await client.sql`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS inscricao_estadual VARCHAR(20);`;
      await client.sql`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS ramo_atividade VARCHAR(255);`;
      await client.sql`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS responsavel_nome VARCHAR(255);`;
      await client.sql`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS responsavel_cpf VARCHAR(14);`;
      await client.sql`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS responsavel_email VARCHAR(255);`;
      await client.sql`ALTER TABLE clientes ADD COLUMN IF NOT EXISTS responsavel_telefone VARCHAR(20);`;
    } catch (e) {
      console.log('Colunas PJ já existem ou erro ao adicionar:', e.message);
    }

    // 2. Pets
    await client.sql`
      CREATE TABLE IF NOT EXISTS pets (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        especie VARCHAR(50),
        raca VARCHAR(100),
        porte VARCHAR(50),
        pelagem VARCHAR(50),
        cliente_id INTEGER REFERENCES clientes(id),
        data_cadastro DATE DEFAULT CURRENT_DATE,
        genero VARCHAR(20),
        data_nascimento DATE,
        chip VARCHAR(50),
        observacao TEXT
      );
    `;

    // 3. Produtos
    await client.sql`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(50),
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        categoria VARCHAR(100),
        preco DECIMAL(10, 2),
        ativo BOOLEAN DEFAULT TRUE,
        controla_estoque BOOLEAN DEFAULT FALSE,
        estoque_atual INTEGER DEFAULT 0,
        estoque_minimo INTEGER DEFAULT 0,
        data_cadastro DATE DEFAULT CURRENT_DATE
      );
    `;

    // 4. Vendas
    await client.sql`
      CREATE TABLE IF NOT EXISTS vendas (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id),
        pet_id INTEGER REFERENCES pets(id),
        total DECIMAL(10, 2),
        forma_pagamento VARCHAR(50),
        data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status_pagamento VARCHAR(20) DEFAULT 'PAGO',
        observacao TEXT
      );
    `;

    // 5. Usuários
    await client.sql`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        perfil VARCHAR(50) NOT NULL
      );
    `;

    // 6. Caixa Diário
    await client.sql`
      CREATE TABLE IF NOT EXISTS daily_cash_register (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        data DATE UNIQUE NOT NULL,
        status VARCHAR(20) CHECK (status IN ('aberto', 'fechado')) NOT NULL,
        saldo_inicial DECIMAL(10, 2) DEFAULT 0,
        saldo_final DECIMAL(10, 2) DEFAULT 0,
        usuario_abertura VARCHAR(255) NOT NULL,
        usuario_fechamento VARCHAR(255),
        dt_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        dt_fechamento TIMESTAMP,
        observacoes TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 7. Operadoras de Cartão
    await client.sql`
      CREATE TABLE IF NOT EXISTS card_operators (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(255) NOT NULL,
        taxa_comissao DECIMAL(5, 2) DEFAULT 0,
        dias_repasse INTEGER DEFAULT 1,
        ativo BOOLEAN DEFAULT TRUE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 8. Contas de Pagamento
    await client.sql`
      CREATE TABLE IF NOT EXISTS payment_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tipo_pagamento VARCHAR(20) CHECK (tipo_pagamento IN ('pix', 'banco')) NOT NULL,
        chave_pix VARCHAR(255),
        banco_titular VARCHAR(255),
        agencia VARCHAR(20),
        conta VARCHAR(20),
        ativo BOOLEAN DEFAULT TRUE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 9. Transações de Caixa
    await client.sql`
      CREATE TABLE IF NOT EXISTS cash_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        caixa_id UUID REFERENCES daily_cash_register(id),
        tipo VARCHAR(20) CHECK (tipo IN ('dinheiro', 'pix', 'debito', 'credito', 'crediario')) NOT NULL,
        subtipo VARCHAR(50) NOT NULL,
        descricao VARCHAR(255) NOT NULL,
        valor DECIMAL(10, 2) NOT NULL,
        origem VARCHAR(50) CHECK (origem IN ('vendas', 'atendimento', 'recebimento_cliente', 'adiantamento', 'suprimento', 'entrada_troco', 'sangria', 'devolucao', 'pagamento', 'saida_troco')) NOT NULL,
        referencia_id VARCHAR(255),
        referencia_tipo VARCHAR(50),
        operadora_id UUID REFERENCES card_operators(id),
        status_conciliacao VARCHAR(20) CHECK (status_conciliacao IN ('pendente', 'conciliado')),
        usuario_criacao VARCHAR(255) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deletado_em TIMESTAMP,
        notas TEXT
      );
    `;

    // 10. Parcelas de Crediário
    await client.sql`
      CREATE TABLE IF NOT EXISTS crediario_parcelas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transacao_id UUID REFERENCES cash_transactions(id),
        cliente_id INTEGER REFERENCES clientes(id),
        num_parcela INTEGER NOT NULL,
        total_parcelas INTEGER NOT NULL,
        valor_parcela DECIMAL(10, 2) NOT NULL,
        intervalo_dias INTEGER NOT NULL,
        data_vencimento DATE NOT NULL,
        data_pagamento DATE,
        status VARCHAR(20) CHECK (status IN ('pendente', 'pago', 'vencido', 'atrasado')) DEFAULT 'pendente',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 11. Planos
    await client.sql`
      CREATE TABLE IF NOT EXISTS planos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(255) NOT NULL UNIQUE,
        descricao TEXT,
        valor_mensal DECIMAL(10, 2) NOT NULL,
        valor_trimestral DECIMAL(10, 2),
        valor_semestral DECIMAL(10, 2),
        valor_anual DECIMAL(10, 2),
        ativo BOOLEAN NOT NULL DEFAULT true,
        notas TEXT,
        criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deletado_em TIMESTAMP
      );
    `;

    // 12. Serviços do Plano
    await client.sql`
      CREATE TABLE IF NOT EXISTS plano_servicos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        plano_id UUID NOT NULL REFERENCES planos(id) ON DELETE CASCADE,
        servico_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
        quantidade INTEGER NOT NULL DEFAULT 1,
        frequencia_mes INTEGER NOT NULL DEFAULT 1,
        descricao_adicional TEXT,
        criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT chk_quantidade_positiva CHECK (quantidade > 0),
        CONSTRAINT chk_frequencia_positiva CHECK (frequencia_mes > 0),
        CONSTRAINT unique_plano_servico UNIQUE(plano_id, servico_id)
      );
    `;

    // Seed Admin User if not exists
    const { rowCount } = await client.sql`SELECT * FROM usuarios WHERE email = 'admin'`;
    if (rowCount === 0) {
      await client.sql`
        INSERT INTO usuarios (nome, email, senha, perfil)
        VALUES ('Administrador', 'admin', '123', 'ADMIN');
      `;
      console.log('Usuário admin criado.');
    }

    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro na migração:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
