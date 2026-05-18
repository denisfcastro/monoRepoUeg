# Visão Arquitetural do Monorepo

Este documento centraliza as premissas fundamentais da arquitetura do projeto. Ele serve como ponto de partida (onboarding) para a inteligência artificial ou qualquer desenvolvedor em novas sessões de implementação.

## 1. Estrutura e Gerenciamento
- **Monorepo:** Gerenciado via **pnpm workspaces** e **Turborepo** para orquestração de builds e execuções paralelas de alta performance.
- **Ecossistema:** 
  - `apps/frontend`: Aplicação Web.
  - `apps/backend`: API e serviços core.
  - `packages/*`: Bibliotecas locais e código compartilhado entre aplicações (ex: tipagens, utilitários, eslint-config, typescript-config).
- **Regra de Isolamento:** Códigos dentro de `apps/` jamais devem ser importados por `packages/`. O fluxo de dependência é sempre unidirecional (`apps/` consomem `packages/` e nunca o inverso).

## 2. Backend (NestJS 11)
- **Modularização por Domínio:** Cada funcionalidade de negócio possui seu próprio módulo isolado (`[domain].module.ts`), encapsulando seus respectivos controllers, services e DTOs.
- **Inversão de Controle:** Uso agressivo de Injeção de Dependências (DI). Nenhuma classe de serviço ou domínio deve ser instanciada via `new` manualmente.
- **Tratamento de Exceções:** 
  - Tratamento de erro centralizado em um `ExceptionFilter` global.
  - As regras de negócio estritas devem lançar a exceção de domínio padronizada (`BusinessException`), que traduz falhas de negócio em respostas HTTP coesas contendo código interno (ex: `AUTH_001`), mensagem legível e detalhes do erro.
- **Validação de Entrada:** Uso mandatório de DTOs mapeados e validados globalmente com `class-validator` e `class-transformer`.

## 3. Frontend (Angular 20+)
- **Standalone Components:** Uso 100% focado em componentes standalone, eliminando as antigas abordagens e dependências de `NgModules`.
- **Gerenciamento de Estado:** Abordagem moderna focada em reatividade nativa do Angular utilizando a API de **Signals**.
- **Padrões de Interface:**
  - Padrão estrutural **Container vs Presentational (Smart/Dumb)** para todos os componentes criados.
  - Exigência rigorosa de feedback visual contínuo. Todas as telas e componentes dinâmicos devem prever e gerenciar adequadamente seus estados de Vida: *Loading* (carregamento), *Error* (falhas de rede/API) e *Empty* (ausência de dados).
- **Estilização:** Utilitária e unificada utilizando **TailwindCSS (v4)**, focando em construir um design system robusto, escalável e de nível premium.

## 4. Governança de Código
- **TypeScript Strict:** O projeto opera obrigatoriamente com a flag `strict: true`. O compilador TypeScript é a primeira barreira de segurança.
- **Clean Architecture & Clean Code:** Foco extremo no Princípio da Responsabilidade Única (SRP) e separação de camadas. Entregas devem focar tanto no resultado funcional (o código que "funciona") quanto no nível estrutural ("o código limpo").
- **TDD / Testabilidade:** Para novas construções de features ou integrações no repositório, o Desenvolvimento Guiado por Testes (TDD) atua como etapa mandatória. O agente e a equipe devem se antecipar a comportamentos utilizando Jest no Backend e ferramentas de testes baseados em Signals no Frontend.
