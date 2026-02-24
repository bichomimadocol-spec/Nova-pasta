## Como usar o Banco de Dados Completo

Este projeto agora possui uma definição completa de banco de dados para o PetNexis, cobrindo todos os módulos (Clientes, Pets, Vendas, Financeiro, Estoque, etc).

### Passo 1: Configurar o Banco de Dados

1.  Certifique-se de ter um banco de dados PostgreSQL disponível (Vercel Postgres, Supabase, Neon, ou local).
2.  Obtenha a string de conexão (`POSTGRES_URL`).
3.  Adicione a variável `POSTGRES_URL` no seu arquivo `.env` (se estiver rodando localmente) ou nas variáveis de ambiente da Vercel.

### Passo 2: Criar as Tabelas (Opção A - SQL Direto)

Se você preferir rodar o SQL diretamente no console do seu banco de dados:

1.  Abra o arquivo `schema.sql`.
2.  Copie todo o conteúdo.
3.  Cole e execute no console SQL do seu banco de dados (ex: Vercel Postgres Console).

### Passo 3: Criar as Tabelas (Opção B - Prisma)

Se você preferir usar o Prisma (recomendado para manter o código sincronizado):

1.  Certifique-se de que o arquivo `prisma/schema.prisma` está presente.
2.  Instale as dependências do Prisma (se ainda não estiverem):
    ```bash
    npm install -D prisma
    npm install @prisma/client
    ```
3.  Gere o cliente Prisma:
    ```bash
    npx prisma generate
    ```
4.  Envie o schema para o banco de dados:
    ```bash
    npx prisma db push
    ```

### Passo 4: Verificar

Após rodar um dos passos acima, seu banco de dados terá todas as tabelas necessárias, incluindo:
- `empresas` (Multi-tenancy)
- `clientes` e `pets`
- `produtos`, `servicos` e `planos`
- `vendas` e `itens_venda`
- `agendamentos`
- `financeiro` (contas, títulos, movimentos)
- `caixa` (frente de caixa)

### Notas Importantes

-   **Multi-tenancy**: Todas as tabelas principais possuem `empresa_id`. Certifique-se de sempre filtrar por este campo nas suas queries.
-   **IDs**: A maioria das tabelas usa `SERIAL` (Integers) para compatibilidade com o frontend atual. As tabelas de Caixa usam `UUID` para maior segurança e unicidade em operações offline-first futuras.
-   **Dados de Exemplo**: O arquivo `schema.sql` contém alguns inserts iniciais para popular o banco com dados básicos de teste.
