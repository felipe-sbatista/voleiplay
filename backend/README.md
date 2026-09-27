# VOLEIPLAY Backend - Laboratório de Padrões Arquiteturais 🏐

Bem-vindo ao backend educacional do **VOLEIPLAY**. Este projeto foi construído para servir como base didática prática para aulas de **Arquitetura de Software**, demonstrando como o **mesmo problema de negócio** (o CRUD de Jogadores de Vôlei de Praia) é resolvido através de **três estilos arquiteturais distintos**:

1. 🔷 **Arquitetura Hexagonal (Ports & Adapters)**
2. 🔶 **Vertical Slice Architecture**
3. 🟢 **CQRS com Mediator Pattern (Commands, Queries & Pipeline)**
4. 🟣 **Saga Pattern & Transações Distribuídas (Microsserviços de Prêmios e E-mail)**
5. 💾 **Persistência Poliglota & Caching (PostgreSQL, MongoDB, Redis e Guia Teórico)**

---

## 🚀 Como Executar

Dentro do diretório `backend/`:

```bash
cd backend
npm install
```

### Opção 1: Gateway Unificado & Simulador Visual (Recomendado para aulas)
Inicia o servidor principal na porta **3000** com o **Dashboard visual interativo** no navegador, simulador de Sagas em tempo real e todas as arquiteturas montadas:

```bash
npm run dev:all
```
- **Dashboard Visual & Simulador de Saga**: [http://localhost:3000](http://localhost:3000)
- **Hexagonal**: `http://localhost:3000/hexagonal/players`
- **Vertical Slice**: `http://localhost:3000/vertical/players`
- **CQRS Mediator**: `http://localhost:3000/cqrs/players`
- **Microsserviço de E-mail**: `http://localhost:3000/services/email`
- **Microsserviço de Prêmios**: `http://localhost:3000/services/prizes/batches`
- **Orquestrador de Saga**: `http://localhost:3000/saga/executions`

### Opção 2: Servidores Independentes (Portas Separadas)
Para demonstrar aos alunos cada arquitetura e microsserviço isolado como processos autônomos de rede:

- **Hexagonal** (Porta 3001):
  ```bash
  npm run dev:hexagonal
  ```
- **Vertical Slice** (Porta 3002):
  ```bash
  npm run dev:vertical
  ```
- **CQRS com Mediator** (Porta 3003):
  ```bash
  npm run dev:cqrs
  ```
- **Microsserviço de E-mail** (Porta 3004):
  ```bash
  npm run dev:email
  ```
- **Microsserviço de Processamento de Prêmios em Batch** (Porta 3005):
  ```bash
  npm run dev:prize
  ```
- **Orquestrador de Saga** (Porta 3006):
  ```bash
  npm run dev:saga
  ```

---

## 📁 Estrutura do Projeto

```
backend/
├── index.ts                           # Gateway unificado e Dashboard didático
├── requests.http                      # Arquivo de testes rápidos (REST Client)
├── shared/                            # Tipos e dados mock compartilhados
│   ├── types/player.types.ts
│   └── data/initial-players.ts
│
├── 1-hexagonal/                       # 🔷 Hexagonal (Ports & Adapters)
│   ├── domain/                        # Entidade Player, erros e portas
│   │   ├── player.entity.ts
│   │   ├── player.errors.ts
│   │   └── ports/
│   │       ├── inbound/               # Use cases / Driving ports
│   │       └── outbound/              # Repositório / Driven ports
│   ├── application/                   # Casos de uso (orquestração pura)
│   └── adapters/                      # Adaptadores HTTP e Persistência
│       ├── inbound/http/
│       └── outbound/persistence/
│
├── 2-vertical-slice/                  # 🔶 Vertical Slice
│   ├── features/                      # Fatias autônomas (DTO + Handler + Endpoint + Repository)
│   │   ├── create-player/             # create-player.dto.ts, .handler.ts, .endpoint.ts, .repository.ts
│   │   ├── get-player-by-id/          # get-player.handler.ts, .endpoint.ts, .repository.ts
│   │   ├── list-players/              # list-players.handler.ts, .endpoint.ts, .repository.ts
│   │   ├── update-player/             # update-player.dto.ts, .handler.ts, .endpoint.ts, .repository.ts
│   │   └── delete-player/             # delete-player.handler.ts, .endpoint.ts, .repository.ts
│   └── infrastructure/
│       └── in-memory-db.ts            # DB em memória
│
└── 3-cqrs-mediator/                   # 🟢 CQRS com Mediator
    ├── core/                          # Implementação do Mediator e Pipeline
    │   ├── mediator.interface.ts
    │   ├── mediator.ts
    │   └── pipeline/logging.behavior.ts
    ├── commands/                      # Mutação de estado (Write Model)
    │   ├── create-player/
    │   ├── update-player/
    │   └── delete-player/
    ├── queries/                       # Consultas sem efeito colateral (Read Model)
    │   ├── get-player-by-id/
    │   └── list-players/
    ├── storage/                       # Separação Write Model vs Read Model
    │   ├── player-write.repository.ts
    │   └── player-read.repository.ts
    └── controllers/                   # Controller enxuto que só despacha mensagens
```

---

## 🎓 Comparação Teórica e Prática para Apresentação em Aula

| Critério | 🔷 Hexagonal (Ports & Adapters) | 🔶 Vertical Slice | 🟢 CQRS com Mediator |
| :--- | :--- | :--- | :--- |
| **Organização** | Camadas concêntricas (Domínio puro no centro) | Por funcionalidade/caso de uso (fatias verticais) | Por intenção da mensagem (Commands vs Queries) |
| **Direção de Dependência** | Dependências apontam sempre para o centro (Ports) | Dentro da fatia (DTO -> Handler -> DB) | Controller -> Mediator -> Handlers |
| **Acoplamento** | Muito baixo (totalmente desacoplado via interfaces) | Isolamento total entre features, coesão interna | Fracamente acoplado através de mensagens (Requests) |
| **Facilidade de Deletar Feature** | Média (precisa remover em Domain, App e Adapters) | **Muito Alta** (apenas apague a pasta da feature) | Alta (apague o Command/Query e seu Handler) |
| **Cross-Cutting Concerns** | Decorators ou Interceptors de Use Case | Middlewares no router da fatia | **Pipeline Behaviors** (ex: Logging, Validação) |
| **Complexidade Inicial** | Alta (muitas interfaces e camadas) | Baixa a Média (código direto ao ponto) | Média (exige infraestrutura de mensageria/barramento) |
| **Cenário Ideal** | Domínios ricos, corporativos e independentes de framework | Sistemas ágeis, microsserviços, evolução rápida | Sistemas com assimetria grande entre escrita e leitura |

---

## 🏐 Roteiro Sugerido para Conduzir a Aula

### Passo 1: O Problema de Negócio (Contexto)
- Apresente aos alunos a necessidade de gerenciar jogadores de vôlei de praia (nome, posição, skillLevel, estatísticas).
- Mostre que os três backends atendem exatamente aos mesmos requisitos de negócio, mas estruturados de formas diferentes.

### Passo 2: Mostrando a Arquitetura Hexagonal (Aleristair Cockburn)
1. Abra `backend/1-hexagonal/domain/player.entity.ts`:
   - Destaque que não há `@Entity`, `@Table`, nem imports do Express ou Prisma. O domínio é agnóstico.
2. Abra `backend/1-hexagonal/domain/ports/`:
   - Diferencie **Inbound Ports** (Portas de Entrada / Intenções do usuário) de **Outbound Ports** (Portas de Saída / Infraestrutura requerida pelo domínio).
3. Abra `backend/1-hexagonal/adapters/`:
   - Mostre como o `PlayerController` (Express) e o `InMemoryPlayerRepository` implementam as portas sem poluir o núcleo.

### Passo 3: Mostrando a Vertical Slice Architecture (Jimmy Bogard)
1. Pergunte aos alunos: *"Se precisarmos mudar a criação de jogadores, em quantos arquivos precisamos mexer na Hexagonal?"* (Controller, UseCase, DTO, etc.).
2. Abra `backend/2-vertical-slice/features/create-player/`:
   - Mostre que tudo o que a feature precisa está dentro de uma única pasta: `dto`, `handler`, `endpoint`.
   - Demonstre como essa abordagem reduz a fadiga mental de navegar por dezenas de pastas horizontais.

### Passo 4: Mostrando CQRS com Mediator (Greg Young / MediatR)
1. Explique a assimetria fundamental da maioria dos sistemas modernos: em 90% do tempo estamos lendo dados (Queries), e em 10% estamos escrevendo/mutando (Commands).
2. Abra `backend/3-cqrs-mediator/controllers/player.controller.ts`:
   - Mostre como o Controller é ultraleve: ele não tem injeção de serviços nem repositórios. Ele apenas cria um `Command` ou `Query` e chama `mediator.send(...)`.
3. Abra `backend/3-cqrs-mediator/core/pipeline/logging.behavior.ts`:
   - Destaque a beleza do padrão Mediator para cross-cutting concerns: qualquer comando ou consulta é interceptado, cronometrado e logado automaticamente!
4. Execute uma requisição de escrita (POST) e observe no terminal o log:
   `[Mediator] 🟢 Executando COMMAND ✍️ [CreatePlayerCommand]...`
   `[Mediator] ✅ Concluído [CreatePlayerCommand] em 1.20ms`

### Passo 5: Mostrando o Padrão Saga e Microsserviços 🟣
1. **O Desafio Distribuído**:
   - Questione os alunos: *"Quando temos dois microsserviços (Prêmios e E-mail), cada um com seu próprio banco de dados, podemos usar `BEGIN TRANSACTION` e `COMMIT` tradicionais do SQL?"*
   - Explique por que o protocolo 2PC (Two-Phase Commit) é lento e bloqueante (SPOF, sem escalabilidade em nuvem).
2. **A Solução com o Padrão Saga**:
   - Apresente a Saga como uma sequência de **transações locais** $T_1, T_2, T_3$.
   - Cada transação local commita em seu próprio serviço.
   - Se ocorrer uma falha no meio do caminho, o orquestrador executa **transações compensatórias** $C_{k-1}, \dots, C_1$ em ordem reversa para desfazer as alterações e garantir **consistência eventual**.
3. **Demonstração Prática no Dashboard (`http://localhost:3000`)**:
   - **Cenário 1: Happy Path (Verde)**:
     - Clique em *"Executar Cenário Feliz"*.
     - Mostre no terminal e na timeline visual:
       1. $T_1$: Criação do lote pendente no `PrizeService`.
       2. $T_2$: Processamento em batch debitando R$ 80.000 do orçamento do torneio.
       3. $T_3$: Disparo assíncrono de e-mails aos atletas campeões.
       4. Status Final: `COMPLETED`.
   - **Cenário 2: Falha no Batch (Vermelho)**:
     - Clique em *"Simular Falha no Batch"*.
     - Mostre a compensação $C_1$: O lote é cancelado e não há débito indevido no orçamento.
   - **Cenário 3: Falha no Envio de E-mails (Amarelo / Compensação Completa)**:
     - Clique em *"Simular Falha no E-mail"*.
     - Observe a compensação em ação:
       - $T_1$ e $T_2$ foram executados com sucesso (o dinheiro chegou a ser provisionado/debitado).
       - $T_3$ falhou ao disparar os e-mails.
       - O Orquestrador entra no estado `COMPENSATING`:
         - Executa $C_2$: Estorna o lote no `PrizeService`, devolve os R$ 80.000 para o saldo do torneio e marca itens como `REFUNDED`.
         - Executa $C_3$: Dispara e-mail especial de cancelamento aos atletas explicando a inconsistência.
       - Status Final: `COMPENSATED`.

---

## 💾 Persistência Poliglota & Laboratório de Bancos de Dados

O projeto conta com três motores adicionais integrados via Docker Compose para demonstrações de engenharia de dados:

1. 🐘 **PostgreSQL 16 Alpine** (Porta `5432`): RDBMS relacional leve, demonstrando integridade referencial, DDL e transações **ACID** com `BEGIN`, `COMMIT` e `ROLLBACK`.
2. 🍃 **MongoDB 7** (Porta `27017`): NoSQL orientado a documentos, demonstrando flexibilidade de schema (modelo **BASE**) para scouts detalhados de partidas e heatmaps na areia.
3. ⚡ **Redis 7 Alpine** (Porta `6379`): Armazenamento in-memory ultrarrápido para caching com padrão **Cache-Aside** (TTL, HIT vs MISS) e invalidação sob demanda.

> 📖 **Guia Completo da Aula**: Consulte o arquivo [DATABASE_GUIDE.md](file:///c:/Users/felip/Documents/voleiplay/backend/DATABASE_GUIDE.md) para a teoria aprofundada de **ACID vs BASE**, **Teorema CAP / PACELC**, **Estratégias de Caching** e roteiro de perguntas para a turma.

### Para iniciar todos os bancos e ferramentas:
```bash
docker compose up -d
```

---

## 🧪 Testando com o arquivo `requests.http`

O arquivo `backend/requests.http` já vem pré-configurado com requisições prontas de:
- **Persistência Poliglota & Caching**:
  - `GET /database/status` (Checagem unificada de Postgres, Mongo, Redis e Elasticsearch)
  - `GET /database/benchmark` (Comparativo de latência RAM vs Disco)
  - `GET /database/cache-demo/player/p-1` (Simulação do Cache-Aside - MISS na 1ª, HIT na 2ª)
  - `DELETE /database/cache-demo/player/p-1` (Invalidação manual de cache)
  - `POST /database/relational/transaction` (Transação ACID com Commit ou Rollback simulado)
  - `POST /database/nosql/scout` e `GET /database/nosql/scouts` (Documentos flexíveis MongoDB)
- **Hexagonal, Vertical Slice e CQRS**: CRUD completo de atletas
- **Saga Pattern**:
  - `POST /saga/prize-distribution/execute` (Cenário Feliz, Falha no Batch, Falha no E-mail)
  - `GET /saga/executions` (Auditoria e timeline passo a passo)
- **Microsserviço de Prêmios**:
  - `GET /services/prizes/tournaments` (Consulta de orçamentos)
  - `GET /services/prizes/batches` (Lotes processados e status)
- **Microsserviço de E-mail**:
  - `GET /services/email` (Caixa de saída de e-mails mockados)
  - `GET /services/email/stats` (Métricas de envio)

Para usar, basta instalar a extensão **REST Client** ou **Thunder Client** no VS Code e clicar em **"Send Request"**.


