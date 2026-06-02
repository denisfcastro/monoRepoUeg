# Plano de Execução Técnica: Meu Palpite

Este documento contém o planejamento de implementação passo-a-passo para a funcionalidade de Palpites e Apostas. Ele foi detalhado com informações sobre as entidades, regras de negócios em testes unitários e detalhes técnicos para facilitar a implementação por meio de assistentes de código (LLMs).

## Arquitetura Geral

O projeto segue um padrão de Monorepo com `Turborepo`, contendo:
* **packages/utils:** Para tipos e DTOs compartilhados (contratos).
* **apps/backend:** NestJS, TypeORM, e SQLite. Arquitetura em módulos (`JogosModule`, `PalpitesModule`, `ApostasModule`).
* **apps/frontend:** Angular 21, Signals, TailwindCSS v4. Componentes Standalone.

---

## Fase 1: Contratos e DTOs Compartilhados (`packages/utils`)

**Objetivo:** Criar os tipos de TypeScript que serão usados tanto pelo backend quanto pelo frontend para garantir tipagem estrita.

**Tarefa 1.1: Criar interfaces base e DTOs**
* **Arquivo alvo:** `packages/utils/src/types.ts`
* **Detalhes de Implementação:**
  * **Jogo:** `id` (string/UUID), `selecaoCasa` (string), `selecaoVisitante` (string), `dataJogo` (string YYYY-MM-DD), `horarioJogo` (string HH:mm), `estadio` (string), `nomeJuiz` (string), `encerrado` (boolean).
  * **CreateJogoDto:** Todos os campos do Jogo, exceto `id`, `encerrado` e campos de data de criação.
  * **UpdateJogoDto:** Campos opcionais baseados no CreateJogo, adicionando o booleano `encerrado` (opcional).
  * **Palpite:** `id` (string/UUID), `jogoId` (string), `golsCasa` (number), `golsVisitante` (number).
  * **CreatePalpiteDto:** `jogoId`, `golsCasa`, `golsVisitante`.
  * **Aposta:** `id` (string/UUID), `jogoId` (string), `userId` (string), `palpiteId` (string opcional), `golsCasa` (number), `golsVisitante` (number).
  * **CreateApostaDto:** `jogoId`, `palpiteId` (opcional), `golsCasa`, `golsVisitante`.

---

## Fase 2: Backend - Módulo de Jogos

**Objetivo:** Implementar o CRUD completo de Jogos com validações de negócio.

**Tarefa 2.1: Entidade TypeORM**
* **Arquivo alvo:** `apps/backend/src/jogos/jogo.entity.ts`
* **Detalhes:** Mapear a classe `Jogo` usando `@Entity()`. Definir os campos textuais básicos e `encerrado` com default `false`. Incluir uma relação `@OneToMany` com a entidade `Palpite` (em cascata) e `Aposta`.

**Tarefa 2.2: DTOs do Backend**
* **Arquivos:** `apps/backend/src/jogos/dto/create-jogo.dto.ts` e `update-jogo.dto.ts`
* **Detalhes:** Implementar as classes usando o pacote `class-validator`. Ex: `@IsNotEmpty()`, `@IsDateString()` para `dataJogo`, `@Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)` para `horarioJogo`.

**Tarefa 2.3: Serviço de Jogos (TDD - Implementar Testes Primeiro)**
* **Arquivo de Teste:** `apps/backend/src/jogos/__tests__/jogos.service.spec.ts`
  * **Casos de Teste (Mockar Repositório):**
    * *should create a game successfully:* Validar sucesso na criação.
    * *should throw exception if game duplicate:* Testar falha ao criar jogo com a mesma seleção e data.
    * *should throw error when updating closed game:* Mockar retorno de um jogo com `encerrado: true` e testar rejeição na atualização/exclusão.
* **Arquivo de Serviço:** `apps/backend/src/jogos/jogos.service.ts`
  * **Detalhes:** Lançar `BusinessException('JOGO_003', 'Jogo encerrado', 400)` nas operações restritas se `jogo.encerrado === true`.

**Tarefa 2.4: Controller e Módulo**
* **Controller:** `apps/backend/src/jogos/jogos.controller.ts`
  * Restringir rotas `POST`, `PATCH`, `DELETE` usando `@UseGuards(JwtAuthGuard, RolesGuard)` e `@Roles('ADMIN')`.
  * A rota `GET` deve ser pública ou acessível a usuários comuns.

---

## Fase 3: Backend - Módulo de Palpites (Recomendações)

**Objetivo:** Permitir ao Administrador cadastrar sugestões de placares limitadas a 4 por jogo.

**Tarefa 3.1: Entidade e DTO**
* **Entity:** `apps/backend/src/palpites/palpite.entity.ts`. Relacionamento `@ManyToOne` com `Jogo`.
* **DTO:** `create-palpite.dto.ts`. Usar `@IsInt()`, `@Min(0)`, e `@Max(20)` nos campos de gols para validar a regra de placar real.

**Tarefa 3.2: Serviço (TDD)**
* **Testes:** `palpites.service.spec.ts`
  * *should throw PALPITE_001 if game has 4 palpites:* Mockar `repository.count` para retornar 4 e verificar a exceção `PALPITE_001`.
  * *should throw PALPITE_002 if game is closed:* Usar mock do `JogosService` para retornar jogo `encerrado: true`.
* **Serviço:** Validar regras acima antes de dar `.save()`.

**Tarefa 3.3: Controller e Módulo**
* Proteção `ADMIN` total para as rotas de modificação. O `GET` deve filtrar pela Query `?jogoId=uuid`.

---

## Fase 4: Backend - Módulo de Apostas (Usuários)

**Objetivo:** Recepcionar as escolhas dos usuários garantindo 1 aposta por usuário por jogo.

**Tarefa 4.1: Entidade e DTO**
* **Entity:** `apps/backend/src/apostas/aposta.entity.ts`. Guardar `userId` (o id de quem fez a request).
* **DTO:** `create-aposta.dto.ts`. Validações `@Min(0)` e `@Max(20)`. `palpiteId` `@IsOptional()`.

**Tarefa 4.2: Serviço (TDD)**
* **Testes:** `apostas.service.spec.ts`
  * *should throw APOSTA_001 if user already has an aposta for this game:* Buscar no repositório por `userId` e `jogoId`; se achar, lançar conflito.
  * *should throw APOSTA_002 if game is finished.*
  * *should throw FORBIDDEN if user tries to delete another user's aposta:* Validação no `remove(userId, id)` verificando se `aposta.userId !== userId`.
* **Serviço:** Validar regras e permitir a remoção.

**Tarefa 4.3: Controller**
* **Controller:** Extrair `userId` através do objeto da Request (ex: `@Request() req`, onde `req.user.id` está injetado pelo JwtStrategy). 

---

## Fase 5: Frontend - Serviços e Comunicação (Angular)

**Objetivo:** Criar conectores reativos para a API.

**Tarefa 5.1: Serviços com Signals**
* Criar `JogosService`, `PalpitesService`, `ApostasService`.
* Exemplo de padrão esperado para o LLM implementar (Gestão de Estado em Signals):
  ```typescript
  jogos = signal<Jogo[]>([]);
  loading = signal<boolean>(false);
  
  carregarJogos(): Observable<Jogo[]> {
    this.loading.set(true);
    return this.http.get<Jogo[]>(url).pipe(
      tap(dados => { this.jogos.set(dados); this.loading.set(false); })
    );
  }
  ```

---

## Fase 6: Frontend - Interface Premium e Componentização

**Objetivo:** Construir as telas baseadas no layout system usando TailwindCSS v4.

**Tarefa 6.1: Lista de Jogos (`JogoListComponent`)**
* Listar todos os jogos vindos do signal `jogos()`.
* Mostrar status (Encerrado/Aberto) visualmente colorido.
* Botão para acessar a tela de aposta (`/jogos/:id`). Se ADMIN, exibir botões de editar, gerenciar palpites e excluir (abrir modal customizado).

**Tarefa 6.2: Painel de Administração (`JogoAdminComponent`)**
* Formulário pequeno para adicionar palpites na mesma página.
* Validar limite visual: se a lista tiver 4 itens, desabilitar formulário e exibir alerta "Limite Atingido".
* Botão para "Encerrar Partida" com aviso crítico.

**Tarefa 6.3: Tela de Aposta (`JogoDetailComponent`)**
* Exibir os cards de palpites sugeridos (`PalpiteCardComponent`).
* Clicar em um card recomendado preenche os inputs do formulário reativo de aposta.
* Botão "Confirmar Aposta".
* **Regra de Renderização Condicional Crítica:**
  Se `apostasService.minhasApostas()` já possuir uma aposta onde `jogoId === jogo atual`, o **formulário de aposta some** e no lugar dele renderiza-se um painel de visualização dizendo "Sua Aposta Registrada: X a Y" com um botão para excluir (caso não esteja encerrado).

**Tarefa 6.4: Meus Palpites (`MinhasApostasComponent`)**
* Listar detalhadamente todas as apostas do usuário logado.
* Botão de exclusão (se jogo ativo).

**Tarefa 6.5: Testes do Frontend (Vitest / Karma)**
* Configurar mocks do backend e injetar no `TestBed`.
* Testar se os sinais (`loading()`, `error()`) são devidamente populados baseando-se em `HttpTestingController`.
* Testar renderização de listas baseadas em `signal()`.

---

## Informações Adicionais para a LLM (Assistente)
1. **Layout e TailwindCSS:** Use `bg-linear-to-r` ao invés das antigas classes bg-gradient (padrão do Tailwind v4). Foque na construção visual rica (`bg-slate-900`, textos contrastantes com `text-slate-100`, cantos arredondados, indicadores de status limpos).
2. **Signals Angular:** Sempre trate os dados do serviço por invocação de sinal `data()` no template e evite Observables assíncronos não gerenciados no template (`async` pipe não é necessário para state via signal).
3. **Erros HTTP:** Mostre caixas de erro na interface ao invés de usar `console.error` isoladamente.
