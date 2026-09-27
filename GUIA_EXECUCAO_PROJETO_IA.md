# 🚀 Guia de Execução: Construção de Software do Zero com Agentes de IA
## Da Identidade Visual à Suíte de Testes 5 Estrelas

Este roteiro estabelece o fluxo metódico de engenharia de software para construir uma aplicação completa **do zero** utilizando agentes inteligentes de IA. Siga rigorosamente cada etapa, exercendo controle técnico sobre o agente e validando cada decisão arquitetural, container e linha de código gerada.

---

## 📑 Sumário de Execução

0. [Fase 0: Instalação e Gerenciamento de Skills do Agente](#fase-0-instalação-e-gerenciamento-de-skills-do-agente)
1. [Fase 1: Identidade Visual, Logo SVG e Brand Guidelines (Design First)](#fase-1-identidade-visual-logo-svg-e-brand-guidelines-design-first)
2. [Fase 2: Concepção de Requisitos e Decisão do Banco de Dados (Grill & Brainstorm)](#fase-2-concepção-de-requisitos-e-decisão-do-banco-de-dados-grill--brainstorm)
3. [Fase 3: Planejamento Arquitetural Estruturado (Writing Plans)](#fase-3-planejamento-arquitetural-estruturado-writing-plans)
4. [Fase 4: Infraestrutura & Containerização Docker do Zero (Hands-on)](#fase-4-infraestrutura--containerização-docker-do-zero-hands-on)
5. [Fase 5: Execução Controlada e Implementação (Execute Plans)](#fase-5-execução-controlada-e-implementação-execute-plans)
6. [Fase 6: Construção da Suíte de Testes 5 Estrelas](#fase-6-construção-da-suíte-de-testes-5-estrelas)
7. [Checklist Final de Entrega](#checklist-final-de-entrega)

---

## Fase 0: Instalação e Gerenciamento de Skills do Agente

As skills são pacotes padronizados de instruções, referências e ferramentas que estendem as capacidades do agente de IA para tarefas de engenharia de alta complexidade. 

O projeto adota o gerenciador de skills oficial (`npx skills`) e integra repositórios da comunidade para capacidades avançadas de design vetorial e descoberta de ferramentas.

### Ação 0.1: Instalar a Skill de Design Vetorial (`svg-design`)
Instale a skill `svg-design` diretamente a partir do repositório oficial [tryopendata/skills](https://github.com/tryopendata/skills). Ela capacita o agente a gerar código SVG puro, otimizado e semanticamente correto para logos, ícones e assets gráficos do seu novo software:

```powershell
npx skills add https://github.com/tryopendata/skills --skill svg-design -y
```

> **Verificação:** Confirme que o diretório `.agents/skills/svg-design/` foi criado no workspace contendo o arquivo `SKILL.md` e referências especializadas em geometria, curvas Bézier e viewBox.

### Ação 0.2: Instalar a Skill de Descoberta de Habilidades (`find-skills`)
Instale a skill `find-skills` para permitir que o agente localize e sugira pacotes adicionais conforme a necessidade do projeto:

```powershell
npx skills add vercel-labs/skills --skill find-skills -y
```

### Ação 0.3: Restaurar Todas as Skills via `skills-lock.json`
Em qualquer novo ambiente de desenvolvimento clonado a partir do repositório, restaure todas as dependências de skills registradas com um único comando:

```powershell
npx skills experimental_install
```

### Ação 0.4: Mapear as Skills de Governança do Agente
Certifique-se de acionar as skills de fluxo em cada fase do ciclo de desenvolvimento:
* **`svg-design`** (de `tryopendata/skills`): Criação da logo vetorial e iconografia do sistema.
* **`grill-with-docs`** (ou `/grill-with-docs`): Sabatina crítica para travar requisitos e guiar a arquitetura de persistência.
* **`brainstorming`**: Análise de alternativas e comparação de trade-offs de engenharia.
* **`writing-plans`** (ou `/plan`): Formulação do plano atômico de implementação TDD.
* **`execute-plans`** (ou `/goal`): Implementação metódica passo a passo orientada aos testes.

---

## Fase 1: Identidade Visual, Logo SVG e Brand Guidelines (Design First)

Não inicie a implementação de backend ou regras de negócio antes de definir a identidade visual, a logo oficial e os contratos de interface.

### Ação 1.1: Criar a Logo Vetorial com a Skill `svg-design`
Execute o prompt abaixo para acionar a skill `svg-design` (instalada de [tryopendata/skills](https://github.com/tryopendata/skills)). O agente deve desenhar a logo oficial em SVG puro, sem utilizar imagens bitmap:

```text
Atue sob a skill 'svg-design' (instalada de https://github.com/tryopendata/skills).
Crie o arquivo 'public/assets/logo.svg' contendo a logo vetorial oficial do projeto [NOME_DO_PROJETO].

Contexto do Projeto: [DESCREVA EM 1 OU 2 FRASES O PROPÓSITO DO SEU SOFTWARE].

Siga os princípios da skill:
1. Estrutura Limpa: viewBox='0 0 120 120', sem atributos fixos de width/height no root para permitir escala fluida em qualquer resolução.
2. Identidade Visual Marcante:
   - Símbolo geométrico icônico que represente o nicho do software usando curvas Bézier elegantes ou traços limpos.
   - Aplicação de gradientes lineares harmoniosos com paleta moderna (ex: primária de destaque e contraste de fundo escuro).
   - Tipografia integrada ou ícone centralizado e pixel-perfect.
3. Código SVG Semântico: use <defs>, <linearGradient> com IDs descritivos, <path> otimizado e tags de acessibilidade (<title> e <desc>).
```

Salve e inspecione o arquivo gerado em `public/assets/logo.svg`.

### Ação 1.2: Gerar o Poster de Brand Identity System
Utilize a logo criada na etapa anterior para gerar as diretrizes completas de marca e design system do projeto. Envie o seguinte prompt ao agente:

```text
Using the uploaded logo (public/assets/logo.svg), generate a high-end, agency-grade brand identity system poster.

🎯 OBJECTIVE
Create a complete, presentation-ready brand guideline board that looks like it was designed by a top branding studio. The result must feel commercial, realistic, and client-deliverable, not conceptual.

⚠️ INTELLIGENCE RULE
Before designing, analyze the logo and infer:
- dominant color psychology
- brand personality (luxury / tech / playful / corporate / street / minimal)
- geometric language (sharp / curved / fluid / rigid)
- emotional tone (bold / calm / energetic / premium)
Then build the entire system from that analysis. No generic styling allowed.

🧱 CANVAS
- 4:5 vertical poster
- 2K resolution
- dense, structured grid system
- high information density but clean hierarchy

🔝 HEADER SECTION
- Brand name: [NOME_DO_PROJETO]
- Tagline (max 6 words, brand-relevant)
- 3 identity traits (based on analysis)

🎨 COLOR SYSTEM (SMART GENERATION)
Extract palette from logo automatically. Include:
- Primary colors (3–5)
- Secondary colors (3–5)
- Accent colors
Each must show:
- HEX codes
- labeled usage (primary / UI / highlight / background)
Also generate: gradients, color combinations, tonal variations.

🔤 TYPOGRAPHY SYSTEM (MATCH PERSONALITY)
Select typography style based on brand:
- luxury → elegant serif
- tech → geometric sans
- street → bold condensed
- corporate → clean neutral sans
Show: headline / subheadline / body with real brand-relevant text examples and clear hierarchy.

🧠 VISUAL LANGUAGE
Define and visualize:
- image style (editorial / lifestyle / futuristic / minimal)
- lighting (soft / dramatic / high contrast)
- mood (energetic / premium / calm / disruptive)
Show 3–5 visual tiles.

📦 BRAND APPLICATIONS (REALISM BOOST)
Generate consistent mockups: packaging or product, website hero, mobile UI, 3 social media creatives, business card, billboard / ad. All must feel real-world usable.

🧩 LAYOUT SYSTEM
Grid system, spacing scale (4pt / 8pt system). Show UI components, cards, buttons, layout examples.

🔘 ICONOGRAPHY
6–10 icons in style derived from brand (rounded / sharp / minimal / filled).

🧿 PATTERNS & ELEMENTS
Shapes derived from logo, repeating motifs, background systems.

🔬 MICRO DETAILS
Shadows, reflections, textures, depth layering.

🎯 VISUAL STYLE CONTROL
Modern editorial + system design hybrid, strong hierarchy, layered composition, controlled spacing.

⚡ DENSITY RULE
Minimum 30–50 elements, mix of macro + micro components, no empty or filler space.

🚫 HARD RESTRICTIONS
No placeholders, no generic UI, no inconsistent styles, no random colors.

✅ FINAL OUTPUT
A high-end brand system poster that looks Behance feature-worthy, agency presentation-ready, visually consistent and detailed.
```

### Ação 1.3: Definir Estados da Interface e Contratos de Dados
Com a identidade visual definida, especifique a interface do usuário antes de codificar:
1. **4 Estados de Interface:** Carregando (*Skeleton screen*), Vazio (*Empty state* educativo), Sucesso (dados renderizados) e Erro/Conexão (com botão de *retry*).
2. **Contrato de Dados Frontend-Backend:** Defina as interfaces TypeScript com tipos primitivos, campos opcionais e tratamento de erros.

---

## Fase 2: Concepção de Requisitos e Decisão do Banco de Dados (Grill & Brainstorm)

Nesta etapa, force o agente a atuar como Arquiteto de Software Sênior para conduzir uma entrevista diagnóstica e guiar a decisão técnica sobre a tecnologia de persistência.

### Ação 2.1: Ativar a Sabatina Técnica (`grill-with-docs` / `/grill-with-docs`)
Use o comando `/grill-with-docs` ou envie o prompt estruturado descrevendo a ideia do seu software:

```text
Atue sob a skill 'grill-with-docs'.

Estou iniciando a construção de um novo software do zero:
- Nome do Projeto: [NOME_DO_PROJETO]
- Domínio e Problema a Resolver: [DESCREVA O PROBLEMA QUE O SOFTWARE RESOLVE]
- Principais Atores e Operações: [DESCREVA QUEM USA E QUAIS SÃO AS PRINCIPAIS AÇÕES]

NÃO me apresente o código pronto. Faça uma sabatina técnica de 4 perguntas comigo para extrair as necessidades reais do sistema e me ajudar a decidir qual banco de dados utilizar:
1. Qual o nível de consistência exigido pelas operações centrais (Consistência Estrita ACID vs Consistência Eventual BASE)? Existem movimentações financeiras, auditoria ou reserva de recursos concorrentes?
2. Como se comportam os esquemas de dados das principais entidades (Estrutura relacional rígida com chaves estrangeiras vs Documentos polimórficos, aninhados e mutáveis em JSON)?
3. Qual o perfil de carga, volume e requisito de latência (Leituras massivas sub-milissegundo, escritas em rajada ou agregação de eventos em lote)?
4. Há necessidade de persistência poliglota (combinar mais de um tipo de armazenamento)?

Após as minhas respostas, sintetize nossa decisão em uma matriz de trade-offs técnicos comparando:
- Banco Relacional SQL (ex: PostgreSQL)
- Banco NoSQL Documental (ex: MongoDB)
- Armazenamento In-Memory / Caching (ex: Redis)
```

### Ação 2.2: Responder às Perguntas da IA e Formalizar a Escolha
Responda tecnicamente às perguntas da IA justificando sua escolha com base nos pilares da computação:
* **Se o projeto exige transações financeiras, carteiras ou contratos:** Escolha **PostgreSQL** para garantir Atomicidade e Isolamento com `BEGIN ... COMMIT / ROLLBACK`.
* **Se o projeto armazena catálogos dinâmicos, formulários flexíveis ou eventos semiestruturados:** Escolha **MongoDB** para modelagem orientada a documentos e agilidade de esquema.
* **Se o projeto tem rotas com tráfego massivo e dados repetitivos:** Adicione **Redis** como camada de *Cache-Aside* com tempo de expiração (TTL).

---

## Fase 3: Planejamento Arquitetural Estruturado (Writing Plans)

Transforme a decisão arquitetural em um plano de engenharia granular e verificável antes de iniciar a escrita de código.

### Ação 3.1: Solicitar o Plano de Implementação (`/plan`)
Execute o comando `/plan` ou envie o seguinte prompt:

```text
Atue sob a skill 'writing-plans'.
Com base na decisão da Fase 2, elabore um plano de execução passo a passo em formato Markdown para construir o backend e frontend do [NOME_DO_PROJETO].

O plano deve conter obrigatoriamente:
1. Contratos de Tipos e DTOs (TypeScript) para as entidades principais.
2. Definição da organização arquitetural do código (ex: Arquitetura Hexagonal com Portas/Adaptadores ou Vertical Slice por funcionalidade).
3. Sequência estrita de implementação TDD (Test-Driven Development):
   - 1º Teste Unitário -> 2º Repositório de Dados -> 3º Serviço de Domínio -> 4º Controller/Rota HTTP.
4. Critérios de aceitação objetivos e verificáveis para cada etapa.
```

### Ação 3.2: Salvar o Plano
Armazene o documento gerado em `plans/implementacao.md` e faça o commit inicial no repositório.

---

## Fase 4: Infraestrutura & Containerização Docker do Zero (Hands-on)

Construa a infraestrutura completa de containers do projeto, entendendo a finalidade de cada instrução.

### Ação 4.0: Instalar e Validar o Docker no Sistema Operacional

Antes de criar arquivos de configuração de containers, instale o Docker Engine e o Docker Compose de acordo com o seu sistema operacional:

#### 1. No Windows (Recomendado via Terminal com winget):
1. Abra o PowerShell como Administrador e instale o **Docker Desktop**:
   ```powershell
   winget install -e --id Docker.DockerDesktop
   ```
   *(Ou baixe manualmente o instalador oficial em [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/))*.
2. Caso o WSL 2 (Windows Subsystem for Linux) ainda não esteja habilitado, ative-o executando:
   ```powershell
   wsl --install
   wsl --update
   ```
3. Reinicie o computador caso solicitado pelo instalador.
4. Abra o **Docker Desktop** pelo menu Iniciar, aceite os termos de serviço e certifique-se de que a opção **"Use the WSL 2 based engine"** esteja marcada em *Settings -> General*.

#### 2. No Linux (Ubuntu / Debian):
Execute os comandos no terminal para instalar o Docker Engine oficial e o plugin Compose:
```bash
# 1. Remover pacotes antigos conflitantes
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done

# 2. Configurar o repositório oficial do Docker
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 3. Instalar o Docker Engine e Compose
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. Habilitar o Docker para rodar sem sudo (opcional, recomendado)
sudo usermod -aG docker $USER
newgrp docker
```

#### 3. No macOS:
Instale via Homebrew ou instalador oficial:
```bash
brew install --cask docker
```
Abra o aplicativo **Docker** na pasta Aplicativos para iniciar o daemon.

#### 4. Validar a Instalação do Docker:
Execute os comandos abaixo no terminal e confirme que as versões são exibidas e o container de teste roda com sucesso:

```bash
docker --version
docker compose version
docker run --rm hello-world
```

---

### Ação 4.1: Construir o Dockerfile Multi-Stage do Frontend
Crie o arquivo `Dockerfile.frontend` aplicando a técnica de múltiplos estágios para otimizar tamanho e segurança:

```dockerfile
# Estágio 1: Build da Aplicação Web
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Estágio 2: Imagem Final Leve com Nginx
FROM nginx:1.25-alpine
COPY --from=builder /app/dist/*/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

> **Fundamento Técnico:** O estágio de compilação contém ferramentas pesadas (~1 GB); a imagem final entregue em produção contém exclusivamente o Nginx e os arquivos estáticos otimizados (~25 MB).

### Ação 4.2: Construir o Dockerfile do Backend
Crie o arquivo `backend/Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

### Ação 4.3: Configurar o `docker-compose.yml` com Healthchecks e Redes
Crie o arquivo `docker-compose.yml` integrando a aplicação e os bancos de dados selecionados na Fase 2, garantindo que o backend aguarde a integridade real dos bancos antes de iniciar:

```yaml
version: '3.8'

services:
  # Banco Relacional SQL (se selecionado na Fase 2)
  postgres:
    image: postgres:16-alpine
    container_name: app-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: app_password
      POSTGRES_DB: app_database
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app_user -d app_database"]
      interval: 5s
      timeout: 3s
      retries: 5

  # Banco NoSQL Documental (se selecionado na Fase 2)
  mongodb:
    image: mongo:7
    container_name: app-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: app_user
      MONGO_INITDB_ROOT_PASSWORD: app_password
      MONGO_INITDB_DATABASE: app_database
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "mongosh --eval 'db.runCommand(\"ping\").ok' --quiet"]
      interval: 5s
      timeout: 3s
      retries: 5

  # Cache In-Memory (se selecionado na Fase 2)
  redis:
    image: redis:7-alpine
    container_name: app-redis
    restart: unless-stopped
    command: redis-server --save 60 1 --loglevel warning
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "redis-cli ping | grep PONG"]
      interval: 5s
      timeout: 3s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: app-api
    ports:
      - "3000:3000"
    environment:
      PORT: 3000
      POSTGRES_HOST: postgres
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: app_password
      POSTGRES_DB: app_database
      MONGO_URI: mongodb://app_user:app_password@mongodb:27017/app_database?authSource=admin
      REDIS_HOST: redis
    depends_on:
      postgres:
        condition: service_healthy
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-network

networks:
  app-network:
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

Execute os passos planejados de forma atômica e incremental com o agente.

### Ação 5.1: Iniciar a Implementação Guiada (`execute-plans` / `/goal`)
Envie a instrução de execução para a IA:

```text
Atue sob a skill 'execute-plans'.
Execute o primeiro item do plano 'plans/implementacao.md':
1. Escreva o teste de unidade da regra central de negócio.
2. Implemente o código mínimo necessário para fazer o teste passar verde.
3. Não avance para o próximo passo sem a minha validação explícita.
```

### Ação 5.2: Inspeção Contínua
A cada alteração gerada pela IA:
* Analise o diff no Git.
* Valide se nenhuma dependência indevida foi introduzida.
* Execute a checagem de tipos e lint: `npx tsc --noEmit` ou equivalente.

---

## Fase 6: Construção da Suíte de Testes 5 Estrelas

Construa a pirâmide de testes completa para garantir que a aplicação seja resiliente, performática e arquiteturalmente sólida.

```
                  /\
                 /  \     5. Testes de Arquitetura (Dependency Cruiser / ArchUnit)
                /----\
               /      \    4. Testes de Carga & Estresse (Autocannon / k6)
              /--------\
             /          \   3. Testes Mutantes (Stryker Mutator)
            /------------\
           /              \  2. Testes Funcionais / BDD (Gherkin / Features)
          /----------------\
         /                  \ 1. Testes Unitários Isolados (Vitest / Jest)
        ----------------------
```

### 1. Testes Unitários Isolados
Teste todas as regras de negócio de forma isolada, simulando dependências externas através de mocks e stubs.

* **Executar os testes:**
```bash
npm run test:unit
```
* **Critério de Aceite:** 100% dos testes unitários passando com asserções estritas tanto para fluxos de sucesso quanto para cenários de erro/exceção.

---

### 2. Testes Funcionais / BDD (Gherkin em Português)
Crie cenários de negócio legíveis no formato `Dado / Quando / Então` dentro de arquivos `.feature`:

```gherkin
Funcionalidade: Operação Central do Sistema
  Como usuário autenticado
  Quero realizar uma operação essencial
  Para obter o resultado de negócio esperado

  Cenário: Execução de operação com dados válidos
    Dado que o usuário possui permissão de acesso
    E os dados de entrada atendem a todos os critérios de validação
    Quando o usuário submete a requisição para a API
    Então o sistema deve registrar a operação com sucesso
    E retornar o código HTTP 201 com o identificador criado
```

* **Executar os testes funcionais:**
```bash
npm run test:functional
```

---

### 3. Testes de Carga & Estresse (Autocannon / k6)
Submeta os endpoints da API a testes de concorrência massiva para identificar limites de throughput e comprovar a eficiência do cache.

* **Executar o teste de carga:**
```bash
npx autocannon -c 100 -d 20 -p 10 http://localhost:3000/api/endpoint-principal
```

* **Métricas Obrigatórias a Documentar:**
  - Requisições por segundo (RPS) sustentadas.
  - Latência de resposta (p50, p95 e p99 em milissegundos).
  - Porcentagem de erros HTTP 5xx (deve ser 0%).

---

### 4. Testes Mutantes (Stryker Mutator)
Avalie a eficácia real da suíte de testes unitários através da injeção automatizada de mutações no código-fonte.

### Ação 6.4.1: Executar a Análise de Mutantes
```bash
npx stryker run
```

### Ação 6.4.2: Interpretar os Resultados
* O Stryker injeta alterações lógicas intencionais no código (inversão de condicionais, troca de operadores, remoção de chamadas).
* **Mutante Morto (Killed):** O teste falhou diante da mutação. Comprova que o teste é eficaz e detecta regressões.
* **Mutante Sobrevivente (Survived):** A mutação foi inserida e os testes continuaram passando verdes. **Ação imediata:** Crie novos casos de teste para eliminar o mutante sobrevivente.
* **Meta obrigatória:** *Mutation Score* igual ou superior a **80%**.

---

### 5. Testes de Arquitetura (Dependency Cruiser / ArchUnit)
Garanta por meio de testes automatizados que as fronteiras arquiteturais do projeto sejam respeitadas.

### Ação 6.5.1: Criar Regras de Fronteira no `.dependency-cruiser.js`
Configure regras impedindo violações de camadas (ex: camadas de domínio puro não podem importar bibliotecas de infraestrutura, bancos de dados ou frameworks HTTP):

```javascript
module.exports = {
  forbidden: [
    {
      name: 'domain-cannot-import-infrastructure',
      comment: 'O núcleo de domínio não pode importar adaptadores externos de banco ou HTTP',
      severity: 'error',
      from: { path: '^src/domain' },
      to: { path: '^src/(infrastructure|adapters|database)' }
    },
    {
      name: 'modules-cannot-cross-depend-directly',
      comment: 'Módulos independentes não devem acoplar diretamente sem contratos explícitos',
      severity: 'error',
      from: { path: '^src/modules/([^/]+)' },
      to: {
        path: '^src/modules/([^/]+)',
        pathNot: '^src/modules/$1'
      }
    }
  ]
};
```

### Ação 6.5.2: Executar a Verificação Arquitetural
```bash
npx depcruise --config .dependency-cruiser.js src
```
* **Critério de Aceite:** 0 violações arquiteturais encontradas.

---

## 🏁 Checklist Final de Entrega

Antes de submeter o projeto, execute e valide cada um dos itens abaixo:

- [ ] Instalação das skills concluída via `npx skills add` ou restaurada com `npx skills experimental_install`.
- [ ] Logo oficial vetorial criada em SVG limpo (`public/assets/logo.svg`) utilizando a skill `svg-design`.
- [ ] Brand Identity System Poster gerado e documentado.
- [ ] Transcrição da sabatina técnica com a IA contendo a justificativa da escolha do banco de dados (SQL, NoSQL e/ou Cache).
- [ ] Plano de implementação TDD (`plans/implementacao.md`) aprovado e versionado no Git.
- [ ] Docker Engine e Docker Compose instalados e validados com `docker run --rm hello-world`.
- [ ] `docker compose up -d` executado com todos os serviços em estado `healthy`.
- [ ] Testes Unitários executados e passando verde (`npm run test:unit`).
- [ ] Testes Funcionais em formato Gherkin passando verde (`npm run test:functional`).
- [ ] Testes de Carga executados com métricas de RPS e latências p95/p99 documentadas.
- [ ] Análise de Testes Mutantes concluída com Mutation Score $\ge 80\%$.
- [ ] Testes de Arquitetura executados com 0 violações de fronteiras de código.
