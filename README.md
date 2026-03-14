# Backend Geração Tech - API de E-commerce

Este é o projeto final do curso Geração Tech. Uma API REST robusta construída com Node.js, Express e Sequelize, seguindo os princípios SOLID e incluindo documentação Swagger e testes automatizados.

## 🚀 Tecnologias

- **Node.js** & **Express**
- **MySQL** (Persistência de dados)
- **Sequelize ORM** (Modelagem e Migrações)
- **JWT** (Segurança e Autenticação)
- **Jest & Supertest** (Testes automatizados)
- **Swagger UI** (Documentação da API)
- **Bcrypt** (Hash de senhas)

## 📋 Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:

- [Node.js](https://nodejs.org/en/) (v16 ou superior)
- [MySQL](https://www.mysql.com/)

## 🔧 Instalação

1. Clone o repositório ou baixe os arquivos.
2. Navegue até a pasta raiz do projeto no terminal.
3. Instale as dependências:
   ```bash
   npm install
   ```

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do projeto e configure as credenciais do seu banco de dados MySQL:

```env
PORT=3000
NODE_ENV=development

# Configurações do Banco de Dados
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=geracao_tech

# Segurança
JWT_SECRET=sua_chave_secreta_aqui
```

## 🏃 Como rodar o projeto

### Modo de Desenvolvimento (com recarregamento automático):

```bash
npm run dev
```

### Modo de Produção:

```bash
npm start
```

_O Sequelize está configurado para sincronizar as tabelas automaticamente (`alter: true`) ao iniciar o servidor._

## 🐳 Rodando com Docker (Banco de Dados)

O projeto já inclui um arquivo `docker-compose.yml` para facilitar a subida do banco de dados MySQL via container.

### Como subir o banco via Docker:

1. Certifique-se de que o Docker e o Docker Compose estão instalados.
2. Certifique-se de que o seu arquivo `.env` está configurado (o Docker usará as variáveis `${DB_PASSWORD}` e `${DB_NAME}`).
3. Na raiz do projeto, execute:

   ```bash
   docker-compose up -d
   ```

   _Isso baixará a imagem do MySQL 8.0 e iniciará o container `geracao_tech_db` em segundo plano._

4. Para parar o banco:
   ```bash
   docker-compose down
   ```

## 🧪 Como rodar os testes

Os testes utilizam um banco de dados SQLite em memória para não afetar seu banco MySQL local.

```bash
npm run test
```

## 📖 Documentação da API

Após iniciar o servidor em modo de desenvolvimento, você pode acessar a documentação interativa do Swagger em:

[http://localhost:3000/docs](http://localhost:3000/docs)

Lá você encontrará todos os endpoints de:

- **Usuários**: Cadastro, busca, atualização e deleção.
- **Categorias**: Listagem com filtros e busca por ID.
- **Produtos**: Busca avançada (filtros por preço, categoria, opções), criação e gerenciamento.
- **Autenticação**: Geração de token JWT.

---
