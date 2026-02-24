-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Empresas (Multi-tenancy)
CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(20) UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    logo_url TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Perfis de Acesso
CREATE TABLE perfis (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    nome VARCHAR(50) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    permissoes JSONB DEFAULT '[]', -- Armazena array de PermissaoModulo
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    perfil_id INTEGER REFERENCES perfis(id),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Profissionais (Veterinários, Groomers, etc)
CREATE TABLE profissionais (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    usuario_id INTEGER REFERENCES usuarios(id), -- Opcional, se o profissional também for usuário
    nome VARCHAR(100) NOT NULL,
    apelido VARCHAR(50),
    telefone VARCHAR(20),
    funcao VARCHAR(50),
    comissao_percentual DECIMAL(5, 2) DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de Clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    cpf VARCHAR(20),
    rg VARCHAR(20),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_pessoa VARCHAR(10) DEFAULT 'FISICA', -- FISICA, JURIDICA
    contribuinte_icms BOOLEAN DEFAULT FALSE,
    consumidor_final BOOLEAN DEFAULT TRUE,
    data_nascimento DATE,
    sexo VARCHAR(10),
    cep VARCHAR(10),
    endereco VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf VARCHAR(2),
    proximidade VARCHAR(50),
    tags TEXT,
    como_nos_conheceu VARCHAR(100),
    limite_credito DECIMAL(10, 2) DEFAULT 0,
    perfil_desconto VARCHAR(50),
    grupo_cliente VARCHAR(50),
    observacao TEXT,
    -- Campos PJ
    cnpj VARCHAR(20),
    razao_social VARCHAR(255),
    nome_fantasia VARCHAR(255),
    inscricao_estadual VARCHAR(50),
    ramo_atividade VARCHAR(100),
    responsavel_nome VARCHAR(100),
    responsavel_cpf VARCHAR(20),
    responsavel_email VARCHAR(255),
    responsavel_telefone VARCHAR(20),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Pets
CREATE TABLE pets (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    especie VARCHAR(50),
    raca VARCHAR(50),
    porte VARCHAR(20),
    pelagem VARCHAR(20),
    genero VARCHAR(10),
    data_nascimento DATE,
    idade VARCHAR(20), -- Pode ser calculado, mas mantendo campo texto conforme interface
    chip VARCHAR(50),
    pedigree_rg VARCHAR(50),
    alimentacao VARCHAR(100),
    tags TEXT,
    alergias TEXT,
    observacao TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabela de Produtos e Serviços
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    tipo VARCHAR(20) NOT NULL, -- Produto, Serviço, Plano
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100),
    preco DECIMAL(10, 2) NOT NULL DEFAULT 0,
    custo DECIMAL(10, 2) DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    controla_estoque BOOLEAN DEFAULT FALSE,
    estoque_atual DECIMAL(10, 3) DEFAULT 0,
    estoque_minimo DECIMAL(10, 3) DEFAULT 0,
    estoque_ideal DECIMAL(10, 3),
    permite_estoque_negativo BOOLEAN DEFAULT FALSE,
    codigo_barras VARCHAR(50),
    sku VARCHAR(50),
    unidade VARCHAR(10),
    ncm VARCHAR(20),
    cest VARCHAR(20),
    marca VARCHAR(100),
    localizacao VARCHAR(100),
    fornecedores TEXT,
    validade DATE,
    observacao TEXT,
    -- Campos de Serviço
    duracao VARCHAR(10),
    horas VARCHAR(5),
    minutos VARCHAR(5),
    situacao_tributaria VARCHAR(50),
    imposto_iss DECIMAL(5, 2),
    -- Campos de Plano
    tipo_plano VARCHAR(20), -- MENSALIDADE, CONSUMO
    texto_contrato TEXT,
    itens_inclusos JSONB, -- Array de strings ou IDs de serviços
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabela de Fornecedores
CREATE TABLE fornecedores (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    telefone VARCHAR(20),
    email VARCHAR(255),
    contato VARCHAR(100),
    observacao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Movimentação de Estoque
CREATE TABLE movimentacoes_estoque (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    produto_id INTEGER REFERENCES produtos(id),
    tipo VARCHAR(20) NOT NULL, -- ENTRADA, SAIDA, AJUSTE, INVENTARIO
    quantidade DECIMAL(10, 3) NOT NULL,
    motivo VARCHAR(255),
    observacao TEXT,
    referencia VARCHAR(100), -- ID de venda, compra, etc
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INTEGER REFERENCES usuarios(id)
);

-- 10. Entradas de Mercadoria (Compras)
CREATE TABLE entradas_mercadoria (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    fornecedor_id INTEGER REFERENCES fornecedores(id),
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    numero_documento VARCHAR(50),
    observacao TEXT,
    valor_total DECIMAL(10, 2) DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE itens_entrada (
    id SERIAL PRIMARY KEY,
    entrada_id INTEGER REFERENCES entradas_mercadoria(id) ON DELETE CASCADE,
    produto_id INTEGER REFERENCES produtos(id),
    quantidade DECIMAL(10, 3) NOT NULL,
    custo_unitario DECIMAL(10, 2) NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL
);

-- 11. Financeiro - Bancos e Contas
CREATE TABLE bancos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10),
    nome VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE contas_bancarias (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    banco_id INTEGER REFERENCES bancos(id),
    descricao VARCHAR(100) NOT NULL,
    agencia VARCHAR(20),
    conta VARCHAR(20),
    tipo VARCHAR(20) NOT NULL, -- CAIXA, CORRENTE, POUPANCA
    saldo_inicial DECIMAL(10, 2) DEFAULT 0,
    saldo_atual DECIMAL(10, 2) DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Financeiro - Categorias e Históricos
CREATE TABLE categorias_financeiras (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- RECEITA, DESPESA, TRANSFERENCIA, AJUSTE
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE historicos_padrao (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    descricao VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- RECEBIMENTO, PAGAMENTO, AJUSTE, TRANSFERENCIA
    ativo BOOLEAN DEFAULT TRUE
);

-- 13. Financeiro - Títulos (Contas a Pagar/Receber)
CREATE TABLE titulos_financeiros (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    tipo VARCHAR(20) NOT NULL, -- RECEBER, PAGAR
    pessoa_tipo VARCHAR(20), -- CLIENTE, FORNECEDOR, OUTROS
    pessoa_id INTEGER, -- ID genérico dependendo do tipo
    pessoa_nome VARCHAR(255),
    descricao VARCHAR(255) NOT NULL,
    data_emissao DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    valor_original DECIMAL(10, 2) NOT NULL,
    desconto DECIMAL(10, 2) DEFAULT 0,
    juros DECIMAL(10, 2) DEFAULT 0,
    multa DECIMAL(10, 2) DEFAULT 0,
    valor_liquido DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'ABERTO', -- ABERTO, PARCIAL, PAGO, CANCELADO
    observacao TEXT,
    origem VARCHAR(20), -- MANUAL, AGENDA, PDV, COMPRAS
    origem_id INTEGER,
    categoria_id INTEGER REFERENCES categorias_financeiras(id),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE baixas_titulos (
    id SERIAL PRIMARY KEY,
    titulo_id INTEGER REFERENCES titulos_financeiros(id) ON DELETE CASCADE,
    conta_id INTEGER REFERENCES contas_bancarias(id),
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor DECIMAL(10, 2) NOT NULL,
    forma_pagamento VARCHAR(50), -- DINHEIRO, PIX, DEBITO, CREDITO, ETC
    observacao TEXT,
    usuario_id INTEGER REFERENCES usuarios(id),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Financeiro - Movimentação de Contas
CREATE TABLE movimentos_contas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    conta_id INTEGER REFERENCES contas_bancarias(id),
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo VARCHAR(20) NOT NULL, -- ENTRADA, SAIDA, TRANSFERENCIA
    valor DECIMAL(10, 2) NOT NULL,
    historico VARCHAR(255),
    categoria_id INTEGER REFERENCES categorias_financeiras(id),
    referencia_tipo VARCHAR(50), -- AR, AP, AGENDA, PDV, MANUAL
    referencia_id INTEGER,
    conciliado BOOLEAN DEFAULT FALSE,
    observacao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Cartões
CREATE TABLE operadoras_cartao (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    nome VARCHAR(100) NOT NULL,
    taxa_debito DECIMAL(5, 2) DEFAULT 0,
    taxa_credito_avista DECIMAL(5, 2) DEFAULT 0,
    taxa_credito_parcelado DECIMAL(5, 2) DEFAULT 0,
    dias_liquidez_debito INTEGER DEFAULT 1,
    dias_liquidez_credito INTEGER DEFAULT 30,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recebiveis_cartao (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    operadora_id INTEGER REFERENCES operadoras_cartao(id),
    data_venda DATE NOT NULL,
    origem VARCHAR(20), -- PDV, AGENDA
    origem_id INTEGER,
    cliente_id INTEGER REFERENCES clientes(id),
    valor_bruto DECIMAL(10, 2) NOT NULL,
    taxa_percentual DECIMAL(5, 2),
    valor_taxa DECIMAL(10, 2),
    valor_liquido_previsto DECIMAL(10, 2) NOT NULL,
    bandeira VARCHAR(50),
    modalidade VARCHAR(50), -- DEBITO, CREDITO_AVISTA, CREDITO_PARCELADO
    parcelas INTEGER DEFAULT 1,
    parcela_numero INTEGER DEFAULT 1,
    data_prevista_recebimento DATE,
    status VARCHAR(20) DEFAULT 'ABERTO', -- ABERTO, RECEBIDO, CANCELADO
    valor_recebido_acumulado DECIMAL(10, 2) DEFAULT 0,
    conciliado BOOLEAN DEFAULT FALSE,
    observacao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Contratos e Assinaturas
CREATE TABLE contratos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    numero VARCHAR(50),
    cliente_id INTEGER REFERENCES clientes(id),
    pet_id INTEGER REFERENCES pets(id),
    plano_id INTEGER REFERENCES produtos(id),
    ativo BOOLEAN DEFAULT TRUE,
    leva_e_traz VARCHAR(10) DEFAULT 'Não',
    recorrente BOOLEAN DEFAULT FALSE,
    valor DECIMAL(10, 2) NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    prazo_vencimento_dias INTEGER DEFAULT 5,
    agendamento VARCHAR(10) DEFAULT 'SEM', -- COM, SEM
    dias_uso_plano JSONB, -- Array de dias da semana (0-6)
    data_inicio_contrato DATE,
    texto_contrato_snapshot TEXT,
    observacao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. Agendamentos
CREATE TABLE agendamentos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    cliente_id INTEGER REFERENCES clientes(id),
    pet_id INTEGER REFERENCES pets(id),
    profissional_id INTEGER REFERENCES profissionais(id),
    servico VARCHAR(255), -- Nome do serviço ou descrição
    servico_id INTEGER REFERENCES produtos(id), -- Link opcional para produto
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'AGENDADO', -- AGENDADO, CHECKIN, PRONTO, CHECKOUT, CANCELADO
    observacao TEXT,
    valor DECIMAL(10, 2) DEFAULT 0,
    -- Campos de Checkout/Financeiro
    forma_pagamento VARCHAR(50),
    desconto DECIMAL(10, 2) DEFAULT 0,
    valor_total DECIMAL(10, 2) DEFAULT 0,
    observacoes_financeiro TEXT,
    -- Campos de Plano
    origem_servico VARCHAR(20) DEFAULT 'AVULSO', -- AVULSO, PLANO
    plano_id INTEGER REFERENCES contratos(id),
    plano_consumo_pendente BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Vendas (PDV)
CREATE TABLE vendas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    cliente_id INTEGER REFERENCES clientes(id),
    pet_id INTEGER REFERENCES pets(id),
    data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10, 2) NOT NULL,
    desconto DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    forma_pagamento VARCHAR(50),
    valor_recebido DECIMAL(10, 2),
    troco DECIMAL(10, 2),
    status_pagamento VARCHAR(20) DEFAULT 'PAGO', -- PAGO, PENDENTE
    observacao TEXT,
    usuario_id INTEGER REFERENCES usuarios(id),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE itens_venda (
    id SERIAL PRIMARY KEY,
    venda_id INTEGER REFERENCES vendas(id) ON DELETE CASCADE,
    produto_id INTEGER REFERENCES produtos(id),
    nome VARCHAR(255), -- Snapshot do nome
    preco DECIMAL(10, 2) NOT NULL, -- Snapshot do preço
    quantidade DECIMAL(10, 3) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- 19. Caixa (Frente de Caixa)
CREATE TABLE caixas_diarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id INTEGER REFERENCES empresas(id),
    data DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'aberto', -- aberto, fechado
    saldo_inicial DECIMAL(10, 2) DEFAULT 0,
    saldo_final DECIMAL(10, 2) DEFAULT 0,
    usuario_abertura VARCHAR(100),
    usuario_fechamento VARCHAR(100),
    dt_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_fechamento TIMESTAMP,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transacoes_caixa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caixa_id UUID REFERENCES caixas_diarios(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL, -- dinheiro, pix, debito, credito, crediario
    subtipo VARCHAR(50),
    descricao VARCHAR(255),
    valor DECIMAL(10, 2) NOT NULL,
    origem VARCHAR(50), -- vendas, atendimento, etc
    referencia_id VARCHAR(50),
    referencia_tipo VARCHAR(50),
    operadora_id INTEGER REFERENCES operadoras_cartao(id),
    status_conciliacao VARCHAR(20) DEFAULT 'pendente',
    usuario_criacao VARCHAR(100),
    notas TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deletado_em TIMESTAMP
);

CREATE TABLE parcelas_crediario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transacao_id UUID REFERENCES transacoes_caixa(id) ON DELETE CASCADE,
    cliente_id INTEGER REFERENCES clientes(id),
    num_parcela INTEGER NOT NULL,
    total_parcelas INTEGER NOT NULL,
    valor_parcela DECIMAL(10, 2) NOT NULL,
    intervalo_dias INTEGER,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status VARCHAR(20) DEFAULT 'pendente', -- pendente, pago, vencido
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_clientes_empresa ON clientes(empresa_id);
CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_clientes_cpf ON clientes(cpf);
CREATE INDEX idx_pets_cliente ON pets(cliente_id);
CREATE INDEX idx_produtos_empresa ON produtos(empresa_id);
CREATE INDEX idx_agendamentos_data ON agendamentos(data_inicio);
CREATE INDEX idx_vendas_data ON vendas(data_venda);
CREATE INDEX idx_titulos_vencimento ON titulos_financeiros(data_vencimento);
CREATE INDEX idx_caixas_data ON caixas_diarios(data);

-- Dados Iniciais de Exemplo (Seed)
INSERT INTO empresas (razao_social, nome_fantasia, cnpj) VALUES ('PetShop Demo Ltda', 'PetNexis Demo', '00.000.000/0001-00');
INSERT INTO perfis (empresa_id, nome) VALUES (1, 'Administrador'), (1, 'Veterinário'), (1, 'Recepcionista');
INSERT INTO usuarios (empresa_id, perfil_id, nome, email, senha_hash) VALUES (1, 1, 'Admin', 'admin@petnexis.com', 'hash_da_senha');
INSERT INTO bancos (codigo, nome) VALUES ('001', 'Banco do Brasil'), ('104', 'Caixa Econômica'), ('260', 'Nubank');
