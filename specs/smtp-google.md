# Configuração do SMTP do Google para Envio de E-mails

Para que o sistema consiga enviar e-mails de recuperação de senha utilizando uma conta do Gmail, siga as instruções abaixo para configurar as credenciais.

## 1. Habilitar Verificação em Duas Etapas
O Google não permite mais o uso da senha padrão da conta para aplicativos de terceiros sem a verificação em duas etapas ativa.

1. Acesse sua conta Google e vá em **Segurança**.
2. Em "Como você faz login no Google", ative a **Verificação em duas etapas**.

## 2. Gerar Senha de App
Após ativar a verificação em duas etapas, você deve gerar uma senha específica para o aplicativo:

1. Ainda na página de **Segurança**, procure por **Senhas de app** (você pode pesquisar na barra de busca se não encontrar).
2. Diga que é para um app customizado (ex: `Monorepo App`).
3. O Google gerará uma senha de **16 caracteres**. Copie-a (ela não será exibida novamente).

## 3. Configurar Variáveis de Ambiente
No backend (`apps/backend`), crie ou edite o arquivo `.env` e adicione as seguintes variáveis:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app-de-16-caracteres
SMTP_FROM="Monorepo App <seu-email@gmail.com>"
```

*Nota: Não use espaços na senha de app ao colá-la no `.env`.*
