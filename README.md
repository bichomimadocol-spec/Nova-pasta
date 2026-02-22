# PetNexis

Sistema de gestão para Pet Shops e Clínicas Veterinárias.

## CI/CD Pipeline

Este projeto utiliza GitHub Actions para integração contínua e Vercel para deploy.

### Configuração de Secrets

Para que o pipeline funcione corretamente, configure os seguintes Secrets no repositório do GitHub (`Settings > Secrets and variables > Actions`):

1.  **POSTGRES_URL**: URL de conexão com o banco de dados Vercel Postgres.
2.  **VERCEL_TOKEN**: Token de acesso da sua conta Vercel.
3.  **VERCEL_ORG_ID**: ID da organização na Vercel.
4.  **VERCEL_PROJECT_ID**: ID do projeto na Vercel.

### Scripts

-   `npm run dev`: Inicia o servidor de desenvolvimento.
-   `npm run build`: Compila o projeto para produção.
-   `npm run migrate`: Executa as migrações do banco de dados.
