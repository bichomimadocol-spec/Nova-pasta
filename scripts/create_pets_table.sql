-- Script SQL para criar a tabela pets no Neon Postgres

CREATE TABLE IF NOT EXISTS pets (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  nome TEXT NOT NULL,
  especie TEXT,
  raca TEXT,
  data_nascimento DATE,
  observacoes TEXT
);