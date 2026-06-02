# Especificação de Negócio: Meu Palpite (Casa de Aposta)

## 1. Visão Geral
O módulo "Meu Palpite" introduz uma dinâmica semelhante à de uma casa de apostas ao sistema. O objetivo principal é permitir que administradores cadastrem partidas de futebol e sugiram placares prováveis (recomendações), enquanto os usuários comuns podem realizar suas apostas (palpites) para essas partidas.

## 2. Atores do Sistema
* **Administrador (ADMIN):** Responsável por gerenciar os eventos esportivos. Pode criar, editar, excluir e encerrar partidas. Além disso, pode cadastrar placares recomendados para incentivar as apostas dos usuários.
* **Apostador (USER):** Usuário comum do sistema que acessa a plataforma para visualizar as partidas disponíveis e registrar o seu palpite de placar para os jogos em aberto.

## 3. Entidades de Negócio

### 3.1 Jogo (Partida)
Representa um evento esportivo (futebol).
* **Informações:** Seleção da Casa, Seleção Visitante, Data do Jogo, Horário, Estádio e Árbitro.
* **Status:** Pode estar "Aberto" (aceitando apostas) ou "Encerrado" (bloqueado para novas apostas ou modificações).

### 3.2 Palpite Recomendado (Sugestão da Casa)
Representa uma sugestão de placar feita pelo Administrador para uma partida específica.
* **Informações:** Gols da Casa, Gols do Visitante.
* **Restrição:** Limitado a no máximo 4 recomendações por jogo. Serve como um atalho visual para o usuário apostar rapidamente.

### 3.3 Aposta (Palpite do Usuário)
Representa a escolha final do usuário para o placar de um jogo.
* **Informações:** Gols da Casa, Gols do Visitante, Jogo apostado e Usuário que realizou a aposta.
* **Flexibilidade:** O usuário pode clicar em uma recomendação pronta ou preencher manualmente o seu próprio placar.

## 4. Regras de Negócio Core

### Regras de Partidas (Jogos)
1. **Unicidade:** Não é permitido o cadastro de dois jogos idênticos (mesmas seleções, mesma data e mesmo horário).
2. **Ciclo de Vida:** Apenas o Administrador pode encerrar um jogo. Uma vez encerrado, o jogo não pode ser modificado, excluído ou receber novos palpites recomendados.
3. **Exclusão:** Se um jogo for excluído, todas as recomendações de palpites e as apostas dos usuários vinculadas a ele também devem ser removidas em cascata (ou excluídas logicamente, dependendo da estratégia de banco de dados).

### Regras de Palpites Recomendados
1. **Limite Máximo:** Para manter a interface limpa e focada, um jogo pode ter, no máximo, 4 palpites recomendados.
2. **Placar Válido:** Como trata-se de futebol, o sistema deve prevenir erros de digitação, limitando o placar entre 0 e 20 gols por time.
3. **Bloqueio:** Não é possível adicionar ou remover recomendações de um jogo já encerrado.

### Regras de Apostas (Usuários)
1. **Aposta Única:** Cada usuário pode realizar apenas **1 aposta** por partida.
2. **Privacidade e Controle:** O usuário só pode visualizar e excluir a sua própria aposta. Ninguém mais tem acesso para alterar a aposta de um usuário.
3. **Cancelamento:** O usuário tem o direito de excluir (cancelar) a sua aposta a qualquer momento, **desde que o jogo ainda não tenha sido encerrado**.
4. **Placar Válido:** O placar apostado deve respeitar o limite de 0 a 20 gols.

## 5. Fluxos Principais

### Fluxo do Administrador
1. Acessa a plataforma e vai para a listagem de jogos.
2. Cria um Novo Jogo preenchendo as informações da partida.
3. Acessa a área de "Gerenciar Palpites" daquele jogo.
4. Adiciona de 1 a 4 placares recomendados (ex: 1x0, 2x1, 1x1, 0x0).
5. No momento em que a partida iniciar (ou quando desejar), clica em "Encerrar Jogo", travando o sistema para aquele evento.

### Fluxo do Usuário
1. Acessa a plataforma e visualiza o painel com as partidas disponíveis.
2. Clica em "Palpitar" em um jogo aberto.
3. O sistema apresenta as recomendações da casa. O usuário pode clicar em uma delas, o que preenche automaticamente o seu formulário, ou digitar seu palpite customizado.
4. Clica em "Confirmar Aposta". A interface atualiza escondendo o formulário e exibindo um card com a aposta confirmada.
5. Se mudar de ideia, pode acessar a área "Minhas Apostas" ou os detalhes do jogo e clicar em "Excluir Aposta" para liberar e poder apostar novamente.
