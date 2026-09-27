# 🏐 Guia de Execução: Engenharia de Software Guiada por Agentes de IA
## Da Concepção Visual à Suíte de Testes 5 Estrelas no Voleiplay

Este roteiro estabelece o fluxo metódico de engenharia de software utilizando agentes inteligentes. Siga rigorosamente cada etapa, mantendo o controle técnico sobre o agente e validando cada decisão arquitetural e linha de código gerada.

---

## 📑 Sumário de Execução

0. [Fase 0: Instalação e Gerenciamento de Skills do Agente](#fase-0-instalação-e-gerenciamento-de-skills-do-agente)
1. [Fase 1: Design System, Criação de Logo SVG e Contratos (Design First)](#fase-1-design-system-criação-de-logo-svg-e-contratos-design-first)
2. [Fase 2: Sabatina Técnica e Decisão de Banco de Dados (Grill & Brainstorm)](#fase-2-sabatina-técnica-e-decisão-de-banco-de-dados-grill--brainstorm)
3. [Fase 3: Planejamento Arquitetural Estruturado (Writing Plans)](#fase-3-planejamento-arquitetural-estruturado-writing-plans)
4. [Fase 4: Infraestrutura & Orquestração Docker (Hands-on)](#fase-4-infraestrutura--orquestração-docker-hands-on)
5. [Fase 5: Execução Controlada e Implementação (Execute Plans)](#fase-5-execução-controlada-e-implementação-execute-plans)
6. [Fase 6: Construção da Suíte de Testes 5 Estrelas](#fase-6-construção-da-suíte-de-testes-5-estrelas)
7. [Checklist Final de Entrega](#checklist-final-de-entrega)

---

## Fase 0: Instalação e Gerenciamento de Skills do Agente

As skills são pacotes padronizados de instruções, referências e ferramentas que estendem as capacidades do agente de IA para tarefas de engenharia de alta complexidade. 

O projeto Voleiplay utiliza o gerenciador de skills oficial (`npx skills`) e integra repositórios externos para capacidades avançadas de design vetorial e descoberta de habilidades.

### Ação 0.1: Instalar a Skill de Design Vetorial (`svg-design`)
Instale a skill `svg-design` diretamente a partir do repositório oficial [tryopendata/skills](https://github.com/tryopendata/skills). Ela capacita o agente a gerar código SVG puro, otimizado e semanticamente correto para logos, ícones e gráficos vetoriais esportivos:

```powershell
npx skills add https://github.com/tryopendata/skills --skill svg-design -y
```

> **Verificação:** Confirme que o diretório `.agents/skills/svg-design/` foi criado contendo o arquivo `SKILL.md` e referências especializadas em geometria, curvas Bézier e animação vetorial.

### Ação 0.2: Instalar a Skill de Descoberta de Habilidades (`find-skills`)
Instale a skill `find-skills` para permitir que o agente localize dinamicamente pacotes adicionais para novas necessidades técnicas:

```powershell
npx skills add vercel-labs/skills --skill find-skills -y
```

### Ação 0.3: Restaurar Todas as Skills via `skills-lock.json`
Em qualquer novo ambiente de desenvolvimento clonado a partir do repositório, restaure todas as dependências de skills registradas com um único comando:

```powershell
npx skills experimental_install
```

### Ação 0.4: Mapear as Skills de Governança do Agente
Certifique-se de que o agente utilize as skills de fluxo em cada etapa:
* **`svg-design`** (de `tryopendata/skills`): Criação da logo vetorial e iconografia do sistema.
* **`grill-with-docs`** (ou `/grill-me`): Sabatina crítica baseada na documentação para travar premissas.
* **`brainstorming`**: Análise de hipóteses e comparação de trade-offs de engenharia.
* **`writing-plans`** (ou `/plan`): Formulação do plano atômico de implementação TDD.
* **`execute-plans`** (ou `/goal`): Implementação metódica passo a passo orientada aos testes.

---

## Fase 1: Design System, Criação de Logo SVG e Contratos (Design First)

Não inicie a implementação de backend ou regras de negócio antes de definir a identidade visual, os contratos de interface e a comunicação de dados.

### Ação 1.1: Criar a Logo Vetorial do Voleiplay com a Skill `svg-design`
Execute o prompt abaixo para acionar a skill `svg-design` (instalada de [tryopendata/skills](https://github.com/tryopendata/skills)). O agente deve desenhar a logo oficial em SVG puro, sem usar placeholders de imagem bitmap:

```text
Atue sob a skill 'svg-design' (instalada de https://github.com/tryopendata/skills).
Crie o arquivo 'public/assets/logo-voleiplay.svg' contendo a logo vetorial oficial do Voleiplay.

Siga os princípios da skill:
1. Estrutura Limpa: viewBox='0 0 120 120', sem atributos fixos de width/height no root para permitir escala fluida.
2. Identidade Visual Esportiva:
   - Uma bola de vôlei estilizada com gomos dinâmicos em arcos e curvas Bézier elegantes.
   - Detalhes náuticos/praianos em gradientes lineares 'areia dourada' (#EAB308) e 'azul oceano' (#0284C7).
   - Tipografia integrada ou ícone solo centralizado e pixel-perfect.
3. Código SVG Semântico: use <defs>, <linearGradient> com IDs descritivos, <path> otimizado e acessibilidade via <title> e <desc>.
```

Salve e visualize o SVG gerado em `public/assets/logo-voleiplay.svg`.

### Ação 1.2: Definir Design Tokens e Estados da Interface
Envie o prompt abaixo para o agente a fim de criar a especificação visual do novo recurso (Exemplo: *Módulo de Registro de Scouts em Tempo Real e Premiação do Torneio*):

```text
Atue como Designer de Produto Sênior e Especialista em Frontend Angular.
Nosso objetivo é construir o 'Painel de Scouts em Tempo Real e Liquidação de Torneio' do Voleiplay, incorporando a logo gerada em SVG.

Antes de escrever qualquer código HTML:
1. Estabeleça os Design Tokens: paleta de cores (tema escuro esportivo, areia dourada #EAB308, azul atlântico #0284C7 e ardósia #0F172A), elevações e tipografia moderna.
2. Defina os 4 estados essenciais da interface:
   - Carregando (Skeleton screen com feedback visual).
   - Vazio (Nenhuma partida em andamento no momento).
   - Sucesso com Dados Ativos (Placar, quadra tática interativa e scouts).
   - Erro / Conexão Perdida (Opção de reconexão automática e retry).
3. Defina o contrato de dados JSON estrito (TypeScript Interface) que o componente espera receber do backend.
```

### Ação 1.3: Validar o Contrato Visual e de Dados
Revise a saída do agente. Garanta que o contrato possua campos obrigatórios, tipos imutáveis e tratamento de erros claros antes de prosseguir.

---

## Fase 2: Sabatina Técnica e Decisão de Banco de Dados (Grill & Brainstorm)

Nesta etapa, force o agente a assumir o papel de Arquiteto de Software Sênior para questionar premissas e guiar a seleção da tecnologia de persistência.

### Ação 2.1: Ativar a Sabatina com Documentação (`grill-with-docs`)
Use o comando `/grill-me` ou envie o prompt estruturado apontando para a base de conhecimento do projeto:

```text
Atue sob a skill 'grill-with-docs'. Analise a documentação dos arquivos 'backend/DATABASE_GUIDE.md' e 'backend/README.md'.

Estou projetando uma nova funcionalidade:
- Registro de lances de partida em tempo real (bloqueios, saques, ataques com coordenadas X e Y na quadra de areia).
- Débito da taxa de inscrição e crédito do prêmio em dinheiro da dupla campeã ao final da partida.
- Consulta de scouts em tempo real por milhares de torcedores concorrentes no app.

NÃO me apresente o código final. Faça uma entrevista técnica comigo, formulando 4 perguntas desafiadoras para que eu decida:
1. Onde aplicar garantias estritas de ACID (PostgreSQL).
2. Onde aplicar modelagem documental flexível BASE (MongoDB).
3. Onde aplicar cache em memória com sub-milissegundo de latência (Redis).

Após as minhas respostas, resuma nossa decisão em uma matriz de trade-offs técnicos.
```

### Ação 2.2: Responder às Perguntas da IA e Consolidar a Arquitetura Poliglota
Responda tecnicamente à sabatina da IA demonstrando o entendimento do Teorema CAP/PACELC e das garantias de cada banco:
* **PostgreSQL:** Persistência contábil de carteiras dos atletas e premiação (tabelas relacionais, chaves estrangeiras, `BEGIN ... COMMIT / ROLLBACK`).
* **MongoDB:** Scouts aninhados, eventos de rally e mapas de calor de lances na quadra (documento JSON/BSON sem migrations rígidas).
* **Redis:** Cache das pontuações e scouts agregados via padrão *Cache-Aside* (TTL curto de 15 segundos).

---

## Fase 3: Planejamento Arquitetural Estruturado (Writing Plans)

Transforme a decisão arquitetural em um plano de engenharia granular e verificável.

### Ação 3.1: Solicitar o Plano de Implementação (`/plan`)
Execute o comando `/plan` ou envie o seguinte prompt:

```text
Atue sob a skill 'writing-plans'.
Com base na decisão da Fase 2, elabore um plano de execução passo a passo em formato Markdown.

O plano deve conter obrigatoriamente:
1. Contratos de Tipos e DTOs (TypeScript) para a transação e para os scouts.
2. Definição da camada arquitetural: escolha se o recurso será implementado como Vertical Slice ou dentro da Arquitetura Hexagonal (Portas e Adaptadores).
3. Sequência estrita de implementação TDD (Test-Driven Development):
   - Passo de Teste Unitário -> Passo de Implementação do Repositório -> Passo de Endpoint HTTP.
4. Critérios de aceitação objetivos e verificáveis para cada etapa.
```

### Ação 3.2: Salvar o Plano
Armazene o documento gerado em `plans/feature-scouts-premiacao.md` e faça o commit inicial no repositório.

---

## Fase 4: Infraestrutura & Orquestração Docker (Hands-on)

Construa a infraestrutura de containers entendendo o papel de cada diretiva, sem aplicar arquivos sem inspeção prévia.

### Ação 4.1: Construir o Dockerfile Multi-Stage do Frontend
Crie o arquivo `Dockerfile.frontend` aplicando a técnica de otimização de imagens em múltiplos estágios:

```dockerfile
# Estágio 1: Build da Aplicação Angular
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Estágio 2: Imagem Final Leve com Servidor Nginx
FROM nginx:1.25-alpine
COPY --from=builder /app/dist/voleiplay/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Compreenda a razão: O primeiro estágio contém Node.js e ferramentas pesadas (~1 GB); o estágio final mantém apenas o Nginx e os arquivos estáticos compilados (~25 MB).

### Ação 4.2: Construir o Dockerfile do Backend
Crie o arquivo `backend/Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev:all"]
```

### Ação 4.3: Configurar o `docker-compose.yml` com Healthchecks Estritos
Configure os serviços de infraestrutura assegurando que o backend aguarde a inicialização completa e saudável dos bancos de dados:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: voleiplay-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: voleiplay
      POSTGRES_PASSWORD: voleiplay_pass
      POSTGRES_DB: voleiplay
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data
    networks:
      - voleiplay-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U voleiplay -d voleiplay"]
      interval: 5s
      timeout: 3s
      retries: 5

  mongodb:
    image: mongo:7
    container_name: voleiplay-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: voleiplay
      MONGO_INITDB_ROOT_PASSWORD: voleiplay_pass
      MONGO_INITDB_DATABASE: voleiplay
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - voleiplay-net
    healthcheck:
      test: ["CMD-SHELL", "mongosh --eval 'db.runCommand(\"ping\").ok' --quiet"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: voleiplay-redis
    restart: unless-stopped
    command: redis-server --save 60 1 --loglevel warning
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - voleiplay-net
    healthcheck:
      test: ["CMD-SHELL", "redis-cli ping | grep PONG"]
      interval: 5s
      timeout: 3s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: voleiplay-api
    ports:
      - "3000:3000"
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_USER: voleiplay
      POSTGRES_PASSWORD: voleiplay_pass
      POSTGRES_DB: voleiplay
      MONGO_URI: mongodb://voleiplay:voleiplay_pass@mongodb:27017/voleiplay?authSource=admin
      REDIS_HOST: redis
    depends_on:
      postgres:
        condition: service_healthy
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - voleiplay-net

networks:
  voleiplay-net:
    driver: bridge

volumes:
  pg_data:
  mongo_data:
  redis_data:
```

### Ação 4.4: Validar a Subida dos Containers
Execute no terminal e confirme que todos os nós atingiram o status `healthy`:

```bash
docker compose up -d --build
docker compose ps
```

---

## Fase 5: Execução Controlada e Implementação (Execute Plans)

Execute os passos planejados de forma atômica com o agente.

### Ação 5.1: Iniciar a Implementação Guiada (`execute-plans` / `/goal`)
Envie a instrução de execução para a IA:

```text
Atue sob a skill 'execute-plans'.
Execute o primeiro item do plano 'plans/feature-scouts-premiacao.md':
1. Escreva o teste de unidade que valida o cálculo da taxa de premiação e o isolamento de concorrência.
2. Implemente o código mínimo para fazer o teste passar.
3. Não avance para o próximo passo sem a minha confirmação explícita.
```

### Ação 5.2: Inspeção Contínua
A cada alteração gerada pela IA:
* Analise o diff no Git.
* Valide se nenhuma convenção do projeto foi violada.
* Execute o comando de compilação: `npm run build` ou `npx tsx --check`.

---

## Fase 6: Construção da Suíte de Testes 5 Estrelas

Construa a pirâmide de testes completa, cobrindo desde a lógica isolada até o comportamento sob carga e a robustez dos testes.

### 1. Testes Unitários Isolados (Vitest)
Crie o arquivo de teste unitário testando o caso de sucesso e o caso de falha transacional (rollback contábil).

* **Comando para executar:**
```bash
npm run test:unit
```
* **Critério de Aceite:** 100% dos testes unitários passando com mocks explícitos dos adaptadores de banco.

---

### 2. Testes Funcionais / BDD (Gherkin em Português)
Crie a especificação de negócio legível por humanos e automatizada no arquivo `tests/functional/features/premiacao-partida.feature`:

```gherkin
Funcionalidade: Liquidação Financeira de Partida de Vôlei de Praia
  Como organizador do torneio
  Quero finalizar uma partida oficial
  Para que a premiação seja creditada à dupla vencedora de forma atômica

  Cenário: Liquidação de premiação com saldo suficiente
    Dado que a dupla "Alison / Bruno" venceu a final por 2 sets a 1
    E o saldo inicial da organização é de 10000 reais
    Quando o árbitro confirma o resultado da partida
    Então o sistema deve debitar 2000 reais da conta do torneio
    E creditar 1000 reais para "Alison" e 1000 reais para "Bruno"
    E a transação deve ser confirmada com status "COMMIT" no PostgreSQL
```

* **Comando para executar:**
```bash
npm run test:functional
```

---

### 3. Testes de Carga & Estresse (Autocannon / k6)
Avalie a capacidade de resposta da API sob alta concorrência comparando o acesso com e sem cache Redis.

* **Executar o script de teste de carga:**
```bash
npx autocannon -c 100 -d 20 -p 10 http://localhost:3000/api/matches/match-1/scouts
```

* **Métricas Obrigatórias a Documentar:**
  - Requisições por segundo (RPS) com Cache Redis vs Direto no MongoDB.
  - Latência de resposta (p50, p95 e p99 em milissegundos).
  - Porcentagem de erros HTTP 5xx (deve ser 0%).

---

### 4. Testes Mutantes (Stryker Mutator)
Avalie se os seus testes realmente encontram falhas ou se são apenas testes "figurativos".

### Ação 6.4.1: Configurar e Executar o Stryker
Instale e execute a análise de mutantes:

```bash
npx stryker run
```

### Ação 6.4.2: Interpretar o Relatório de Mutantes
* O Stryker injetará mutações no código-fonte (ex: trocar `saldo >= taxa` por `saldo > taxa`, remover chamadas de rollback).
* **Mutante Morto (Killed):** O teste falhou. Isso é o esperado; comprova que o teste detecta bugs.
* **Mutante Sobrevivente (Survived):** O código foi corrompido e o teste continuou passando verde. **Ação imediata:** Adicione novos asserções e testes para matar o mutante.
* **Meta obrigatória:** *Mutation Score* igual ou superior a **80%**.

---

### 5. Testes de Arquitetura (Dependency Cruiser / ArchUnit)
Garanta por código que as regras de dependência de camadas não sejam violadas ao longo do tempo.

### Ação 6.5.1: Criar Regra de Isolamento de Camadas
Configure a regra no arquivo `.dependency-cruiser.js` impedindo que arquivos da camada de Domínio importem bibliotecas de infraestrutura ou adaptadores:

```javascript
module.exports = {
  forbidden: [
    {
      name: 'domain-cannot-import-infrastructure',
      comment: 'O núcleo de domínio não pode conhecer PostgreSQL, MongoDB, Redis ou Express',
      severity: 'error',
      from: { path: '^backend/shared/domain' },
      to: { path: '^backend/(shared/database|adapters|node_modules/(express|pg|mongodb|ioredis))' }
    },
    {
      name: 'slices-cannot-depend-on-other-slices',
      comment: 'Uma Vertical Slice deve ser autocontida e não deve acoplar internamente com outra Slice',
      severity: 'error',
      from: { path: '^backend/2-vertical-slice/features/([^/]+)' },
      to: {
        path: '^backend/2-vertical-slice/features/([^/]+)',
        pathNot: '^backend/2-vertical-slice/features/$1'
      }
    }
  ]
};
```

### Ação 6.5.2: Executar a Verificação Arquitetural
```bash
npx depcruise --config .dependency-cruiser.js backend
```
* **Critério de Aceite:** 0 violações de fronteiras arquiteturais encontradas.

---

## 🏁 Checklist Final de Entrega

Antes de submeter o projeto, execute e valide cada um dos itens abaixo:

- [ ] Instalação das skills concluída via `npx skills add` ou restaurada com `npx skills experimental_install`.
- [ ] Logo oficial do Voleiplay gerada em SVG semântico (`public/assets/logo-voleiplay.svg`) usando a skill `svg-design`.
- [ ] Contratos de UI e tokens de design documentados em Markdown.
- [ ] Transcrição da sabatina com a IA contendo a justificativa técnica para o uso do PostgreSQL, MongoDB e Redis.
- [ ] Plano de execução gerado (`plans/*.md`) com critérios de aceite TDD.
- [ ] `docker compose up -d` executado com todos os containers em estado `healthy`.
- [ ] Testes Unitários rodando e passando com `npm run test:unit`.
- [ ] Testes Funcionais em Gherkin passando com `npm run test:functional`.
- [ ] Testes de Carga executados e métricas de ganho com Redis registradas.
- [ ] Análise de Testes Mutantes concluída com Mutation Score $\ge 80\%$.
- [ ] Testes de Arquitetura executados sem quebras de fronteiras de camadas.
