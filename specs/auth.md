# Especificação da Feature: Autenticação e Autorização

Esta especificação detalha o funcionamento do sistema de autenticação e autorização para o monorepo, utilizando NestJS (Passport JWT) no backend e Angular 20 no frontend.

## 1. Regras de Negócio

### 1.1 Provedor e Credenciais
- Autenticação baseada em **E-mail e Senha**.
- Campos do Usuário:
  - `id`: Gerado automaticamente (UUID ou similar).
  - `name`: Nome completo.
  - `email`: E-mail único.
  - `password`: Hash da senha.
  - `active`: Booleano (indica se o usuário está liberado para acessar).
  - `role`: Enum (`ADMIN` | `USER`).

### 1.2 Cadastro (Sign Up)
- O sistema permitirá auto-cadastro de novos usuários.
- **Importante:** Todo novo usuário cadastrado terá o campo `active` como `false` por padrão.
- O acesso só será permitido após um Administrador ativar o usuário manualmente.

### 1.3 Perfis de Acesso (Roles)
- **USER:** Usuário comum do sistema.
- **ADMIN:** Administrador com poderes de gestão de usuários (aprovação e reset de senha). Haverá um administrador pré-cadastrado no sistema (via seed ou script).

---

## 2. Casos de Uso

### 2.1 Fluxo de Login
1. O usuário acessa a tela de login.
2. Informa e-mail e senha obrigatoriamente.
3. Se as credenciais forem válidas e o usuário estiver `active: true`, ele é redirecionado para a área restrita.

### 2.2 Acesso a Rotas Protegidas
- Quando um usuário não autenticado tentar acessar uma rota protegida:
  - O sistema deve exibir uma página informando que o acesso precisa de autenticação.
  - Deve conter um link visível para a tela de login.

### 2.3 Recuperação de Senha
- O usuário pode solicitar a recuperação de senha informando seu e-mail.
- O sistema enviará um e-mail com um link contendo um hash de uso único.
- Se o e-mail não existir na base, o sistema deve simular o envio (exibir a mesma mensagem de sucesso) para evitar enumeração de e-mails.
- O Administrador também poderá disparar um e-mail de reset de senha para qualquer usuário através da tela de listagem de usuários.
- As instruções de configuração do SMTP do Google (para envio de e-mails) estão detalhadas em [specs/smtp-google.md](file:///c:/projetosFabrica/monoRepo/specs/smtp-google.md).

---

## 3. Critérios de Aceitação

### 3.1 Login e Sessão
- [ ] É possível fazer login no sistema com credenciais válidas.
- [ ] Quando logado, o cabeçalho da página deve exibir o nome do usuário logado.
- [ ] A sessão deve expirar após **60 minutos de inatividade**. Ao expirar, o usuário deve ser redirecionado para a tela de login com uma mensagem informando que a sessão expirou.

### 3.2 Validações e Erros
- [ ] Tentativa de login com e-mail ou senha errados deve retornar a mensagem genérica: *"E-mail ou senha não confere"*.
- [ ] Tentativa de cadastro com um e-mail que já existe deve redirecionar o usuário diretamente para a tela de login (ou informar que já possui cadastro).

### 3.3 Recuperação de Senha
- [ ] Ao clicar em "Esqueci minha senha", um formulário solicita o e-mail.
- [ ] Após o envio, uma mensagem confirma a ação e exibe um link para voltar à tela de login.

---

## 4. Detalhes Técnicos

### Backend (NestJS)
- **Estratégia:** Passport com JWT (JSON Web Token).
- **Armazenamento:** SQLite (via TypeORM).
- **Segurança:** Hash de senha com bcrypt.
- **Exceções:** Uso de `BusinessException` com códigos específicos (ex: `AUTH_INVALID_CREDENTIALS`).

### Frontend (Angular)
- **Estado:** Signals para gerenciar o estado do usuário logado.
- **Formulários:** Reactive Forms.
- **Estilização:** TailwindCSS.
- **Guards:** CanActivate para proteger rotas.
