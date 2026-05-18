# 🚀 Backend Application (@repo/backend)

Esta é a API central e camada de serviços do monorepo, desenvolvida com o framework **NestJS 11** e **TypeScript**. Ela fornece a persistência de dados, regras de negócio e integrações externas para toda a nossa aplicação.

---

## 📋 Pré-requisitos & Ambiente de Execução

Como definido em nossas diretrizes globais (`agent.md`), a integridade e uniformidade do ambiente são obrigatórias:

1. **Node.js (v24.13.1)**: É mandatório o uso de **nvm** (Node Version Manager) para garantir a versão estável e compatível do runtime.
   ```bash
   nvm use 24.13.1
   ```
2. **pnpm**: Nosso monorepo utiliza o **pnpm** (versão 10+) com workspaces para o gerenciamento ultrarrápido de dependências.

---

## 🛠️ Configuração e Instalação

As dependências são orquestradas na raiz do monorepo. Para instalar tudo, navegue até a raiz do repositório (`monoRepo`) e execute:

```bash
pnpm install
```

---

## 💻 Comandos Úteis

O projeto utiliza **Turborepo** para compilação paralela inteligente e gerenciamento de scripts em cache.

### 1. Execução em Desenvolvimento (Modo Watch)
* **Monorepo Completo (Front + Back + Utils)** (Recomendado):
  Na raiz do projeto:
  ```bash
  pnpm dev
  ```
* **Somente o Backend** (A partir da raiz):
  ```bash
  pnpm --filter @repo/backend dev
  ```
* **Somente o Backend** (Dentro de `/apps/backend`):
  ```bash
  pnpm dev
  ```

### 2. Compilação (Build de Produção)
* **Monorepo Completo**:
  Na raiz do projeto:
  ```bash
  pnpm build
  ```
* **Somente o Backend** (A partir da raiz):
  ```bash
  pnpm --filter @repo/backend build
  ```
* **Somente o Backend** (Dentro de `/apps/backend`):
  ```bash
  pnpm build
  ```

### 3. Testes Unitários e de Integração
* **Rodar os Testes** (Dentro de `/apps/backend`):
  ```bash
  pnpm run test
  ```
* **Rodar em Modo Watch** (Dentro de `/apps/backend`):
  ```bash
  pnpm run test:watch
  ```
* **Cobertura de Testes (Coverage)**:
  ```bash
  pnpm run test:cov
  ```

---

## 🏛️ Diretrizes Arquiteturais & Regras do Backend

Para qualquer desenvolvedor (humano ou agente de IA) atuando nesta codebase, as regras em `.agents/rules/nestjs.md` e `agent.md` devem ser seguidas estritamente:

### ⚠️ Proibição do Tipo `any`
É expressamente **proibido** o uso de `any` no código TypeScript. Utilize tipagem estática rigorosa, interfaces robustas, DTOs específicos da aplicação, `unknown` ou generics.

### 🛡️ Tratamento de Exceções & Erros de Negócio
Não lance `HttpException` (como `BadRequestException`, `NotFoundException`) diretamente de dentro dos Services (camada de negócio).
* Lógica de negócio que falhe deve lançar obrigatoriamente a classe **`BusinessException`** (de `src/common/exceptions/business.exception.ts`).
* Forneça um código interno legível para o frontend tratar (ex: `AUTH_EMAIL_ALREADY_EXISTS`) e o HttpStatus apropriado.
* **Exemplo**:
  ```typescript
  throw new BusinessException('AUTH_USER_NOT_FOUND', 'Usuário não encontrado', HttpStatus.NOT_FOUND);
  ```
* Todas as exceções do tipo `BusinessException` são interceptadas e limpas na saída HTTP pelo **`BusinessExceptionFilter`** global.

### 📦 Banco de Dados e Serviços
* **ORM:** O projeto utiliza **TypeORM** com suporte a SQLite.
* **E-mails de Desenvolvimento:** O serviço de e-mail (`MailService`) detecta a ausência de variáveis SMTP reais e cria automaticamente um fallback seguro para contas de teste no **Ethereal Mail** localmente, logando a URL de visualização.

---

## 📂 Estrutura de Pastas de Domínio
```
apps/backend/src/
├── common/                  # Filtros, exceções e utilitários globais da API
│   ├── exceptions/          # Ex: business.exception.ts
│   └── filters/             # Ex: business-exception.filter.ts
├── auth/                    # Módulo de Autenticação (Serviços, Guards, DTOs, Estratégias)
├── users/                   # Módulo de Usuários (Entidades TypeORM e Acesso a Dados)
├── app.module.ts            # Módulo Raiz
└── main.ts                  # Bootstrapping (Validações globais e Filtros registrados)
```
