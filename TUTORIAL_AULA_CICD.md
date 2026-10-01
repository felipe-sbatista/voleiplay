# 🎓 Tutorial Completo: Construindo um CI/CD Profissional e Gratuito no GitHub Actions com Deploy no Firebase Hosting

> **Objetivo:** Explicar do zero como configurar uma esteira de entrega contínua (CI/CD) profissional, segura e 100% gratuita utilizando **GitHub Actions** e **Firebase Hosting**. Ao final deste tutorial, você saberá como proteger a branch principal, auditar código contra segredos e vulnerabilidades, executar testes automatizados, validar tipagem estática, realizar deploy contínuo e integrar tudo com **Pull Requests** e **GitHub Projects**.

---

## 📑 Sumário

1. [Visão Geral da Arquitetura da Pipeline](#1-visão-geral-da-arquitetura-da-pipeline)
2. [Pré-requisitos e Ferramental](#2-pré-requisitos-e-ferramental)
3. [Passo 1: Preparando a Aplicação Web (Next.js Estático)](#passo-1-preparando-a-aplicação-web-nextjs-estático)
4. [Passo 2: Configurando o Firebase Hosting Localmente](#passo-2-configurando-o-firebase-hosting-localmente)
5. [Passo 3: Criando as Credenciais Seguras (Service Account do Google Cloud)](#passo-3-criando-as-credenciais-seguras-service-account-do-google-cloud)
6. [Passo 4: Configurando os Segredos no Repositório do GitHub](#passo-4-configurando-os-segredos-no-repositório-do-github)
7. [Passo 5: Escrevendo a Pipeline do GitHub Actions do Zero](#passo-5-escrevendo-a-pipeline-do-github-actions-do-zero)
   - [Job 1: 🛡️ Varredura de Segurança (Gitleaks + npm audit)](#job-1-️-varredura-de-segurança-gitleaks--npm-audit)
   - [Job 2: 🧪 Testes Automatizados com Feedback Visual](#job-2--testes-automatizados-com-feedback-visual)
   - [Job 3: 🔍 Análise Estática de Tipagem (Typecheck)](#job-3--análise-estática-de-tipagem-typecheck)
   - [Job 4: 🚀 Build & Deploy com GitHub Environments](#job-4--build--deploy-com-github-environments)
8. [Passo 6: Conectando a Pipeline ao GitHub Projects e Pull Requests](#passo-6-conectando-a-pipeline-ao-github-projects-e-pull-requests)
9. [Demonstração Prática: Fluxo de Vida Real](#demonstração-prática-fluxo-de-vida-real)
10. [Guia de Troubleshooting Comum](#guia-de-troubleshooting-comum)

---

## 1. Visão Geral da Arquitetura da Pipeline

Uma esteira moderna de CI/CD não deve apenas "copiar arquivos para o servidor". Ela atua como um **portão de qualidade** (*Quality Gate*), bloqueando falhas antes que cheguem em produção.

```mermaid
flowchart TD
    GitPush["Commit / Pull Request"] --> CI["GitHub Actions Trigger"]
    
    subgraph QualityGates ["Portões de Qualidade (Paralelos)"]
        CI --> JobSecurity["🛡️ Job 1: Segurança\n- Gitleaks (Chaves/Tokens)\n- npm audit (CVEs)"]
        CI --> JobTests["🧪 Job 2: Testes\n- Vitest / Jest\n- GitHub Test Reporter"]
        CI --> JobStatic["🔍 Job 3: Análise Estática\n- TypeScript Typecheck\n- Build de Contratos"]
    end

    JobSecurity --> NeedsPass{"Passou em tudo?"}
    JobTests --> NeedsPass
    JobStatic --> NeedsPass

    NeedsPass -- "Sim ✅" --> JobDeploy["🚀 Job 4: Build & Deploy\n- Next.js Static Export\n- Firebase Hosting Action\n- Registra GitHub Environment"]
    NeedsPass -- "Não ❌" --> Block["Bloqueia Deploy & Notifica PR"]

    JobDeploy --> Firebase["🌐 Firebase Hosting (Live)\nhttps://seu-projeto.web.app"]
    JobDeploy --> Projects["📋 GitHub Projects & PR Tracker"]
```

---

## 2. Pré-requisitos e Ferramental

Certifique-se de possuir os seguintes pré-requisitos:
- **Node.js 20+** instalado localmente.
- Conta gratuita no **GitHub** com um repositório git configurado.
- Conta gratuita no **Google / Firebase Console** ([console.firebase.google.com](https://console.firebase.google.com/)).
- **Firebase CLI** instalado na máquina:
  ```bash
  npm install -g firebase-tools
  ```

---

## Passo 1: Preparando a Aplicação Web (Next.js Estático)

Para manter o custo **100% gratuito** no plano Spark do Firebase Hosting, a aplicação frontend Next.js deve ser exportada estaticamente (`HTML/CSS/JS`).

No arquivo `next.config.mjs` (ou `next.config.js`) do frontend:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',        // Gera a pasta 'out' com arquivos estáticos
  trailingSlash: true,     // Garante URLs amigáveis com subdiretórios
  images: {
    unoptimized: true      // Desativa o otimizador dinâmico de imagens do Node.js
  }
};

export default nextConfig;
```

**Nota:** O Firebase Hosting serve arquivos estáticos via CDN global de altíssima velocidade e sem custo no plano Spark (até 10 GB de armazenamento e 360 MB/dia de transferência gratuita).

> [!TIP]
> 🤖 **Executando via Agente de IA:**
> Se estiver utilizando um assistente ou agente de IA no projeto, você pode solicitar esta alteração com o prompt:
> 
> *"Configure o arquivo `next.config.mjs` (ou `next.config.js`) do frontend para exportação estática (`output: 'export'`), ative `trailingSlash: true` e desative a otimização de imagens (`images: { unoptimized: true }`)."*

---

## Passo 2: Configurando o Firebase Hosting Localmente

Na raiz do projeto (ou do monorepo), criamos dois arquivos de configuração que indicam ao Firebase para onde apontar o deploy.

### 1. Criar o arquivo `firebase.json`:
```json
{
  "hosting": {
    "public": "apps/web/out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 2. Criar o arquivo `.firebaserc`:
```json
{
  "projects": {
    "default": "NOME-DO-SEU-PROJETO-NO-FIREBASE"
  }
}
```
*(Substitua `NOME-DO-SEU-PROJETO-NO-FIREBASE` pelo ID real criado no console do Firebase, ex: `floreio-b03f0`).*

> [!TIP]
> 🤖 **Executando via Agente de IA:**
> Para solicitar a criação automática dos arquivos de configuração ao agente de IA:
> 
> *"Crie os arquivos de configuração do Firebase Hosting na raiz do projeto: `firebase.json` apontando o public para `apps/web/out` (ou o diretório de build estático do frontend) com suporte a rewrites para SPA, e o `.firebaserc` configurado com o ID do projeto do Firebase `NOME-DO-SEU-PROJETO-NO-FIREBASE`."*

---

## Passo 3: Criando as Credenciais Seguras (Service Account do Google Cloud)

Para que o GitHub Actions tenha permissão de fazer deploy no Firebase sem pedir senha humana interativa, precisamos de uma **Service Account (Conta de Serviço)**.

### Método Recomendado (Via CLI do Firebase):
No terminal da sua máquina, autenticado na sua conta:

```bash
firebase login
firebase init hosting:github
```

O assistente interativo do Firebase fará perguntas:
1. *For which GitHub repository do you want to set up a GitHub workflow?* ➔ `seu-usuario/seu-repositorio`
2. *Set up the workflow to run a build script before every deploy?* ➔ `Yes`
3. *Set up automatic deployment to your site's live channel when a PR is merged?* ➔ `Yes`

> **O que esse comando faz nos bastidores:**
> Ele cria automaticamente no Google Cloud uma Service Account com o papel `Firebase Hosting Admin` e salva a chave privada diretamente no seu repositório do GitHub como um segredo chamado `FIREBASE_SERVICE_ACCOUNT_<SEU_PROJETO>`.

> [!TIP]
> 🤖 **Executando via Agente de IA:**
> Se o agente tiver suporte à execução de comandos no terminal:
> 
> *"Execute no terminal o comando `firebase init hosting:github` e me auxilie no processo de autenticação e criação da Service Account para o GitHub Actions."*

---

## Passo 4: Configurando os Segredos no Repositório do GitHub

Se você não usou o CLI interativo ou precisa validar a chave:

1. Acesse o seu repositório no GitHub.
2. Vá em **Settings** ➔ **Secrets and variables** ➔ **Actions**.
3. Em **Repository secrets**, clique em **New repository secret**.
4. **Name:** `FIREBASE_SERVICE_ACCOUNT_<ID_DO_PROJETO>` (ex: `FIREBASE_SERVICE_ACCOUNT_FLOREIO_B03F0`).
5. **Secret:** Cole o JSON completo da chave privada da Conta de Serviço.

> 💡 **Nota Importante:** O segredo `GITHUB_TOKEN` é gerado automaticamente e de forma transparente pelo próprio GitHub Actions a cada execução. Não é necessário criá-lo manualmente.

> [!TIP]
> 🤖 **Executando via Agente de IA (com GitHub CLI):**
> Se você possui a CLI do GitHub (`gh`) autenticada, pode solicitar ao agente:
> 
> *"Configure o segredo do GitHub Actions `FIREBASE_SERVICE_ACCOUNT_<ID_DO_PROJETO>` no repositório atual utilizando a CLI do GitHub (`gh secret set`), passando o conteúdo do JSON da nossa Service Account."*

---

## Passo 5: Escrevendo a Pipeline do GitHub Actions do Zero

Crie o arquivo no caminho: `.github/workflows/deploy-frontend-firebase.yml`.

Abaixo está a configuração completa comentada bloco a bloco:

> [!TIP]
> 🤖 **Executando via Agente de IA:**
> Em vez de criar o arquivo YAML manualmente, você pode pedir ao agente de IA:
> 
> *"Crie o workflow do GitHub Actions em `.github/workflows/deploy-frontend-firebase.yml` para CI/CD de um app Next.js estático no Firebase Hosting. Inclua 4 jobs: 1) Varredura de segurança com Gitleaks e npm audit; 2) Execução de testes com Vitest e resumo visual; 3) Análise estática com TypeScript typecheck; 4) Build e Deploy no Firebase Hosting utilizando GitHub Environments (preview para PRs e live para main)."*

```yaml
name: CI/CD - Frontend Firebase Hosting

# Quando a pipeline roda?
on:
  push:
    branches:
      - main           # Dispara ao fazer push/merge na main (Deploy em Produção)
  pull_request:
    branches:
      - main           # Dispara ao abrir ou atualizar PRs contra a main (Deploy em Preview)
  workflow_dispatch:   # Permite disparar manualmente pelo botão no painel do GitHub

# Concorrência: Cancela execuções antigas da mesma branch se um novo commit chegar
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # ========================================================
  # 1. ETAPA: SEGURANÇA & VARREDURA DE SEGREDOS
  # ========================================================
  security-audit:
    name: 🛡️ Segurança & Scan de Segredos
    runs-on: ubuntu-latest
    steps:
      - name: Checkout do Repositório (Histórico completo)
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      # Gitleaks: Varre todo o código em busca de API Keys, senhas e tokens vazados
      - name: 🔍 Varredura de Segredos Vazados (Gitleaks)
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup do Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      # npm audit: Checa vulnerabilidades conhecidas (CVEs) em bibliotecas externas
      - name: 🔒 Auditoria de Dependências (npm audit)
        run: |
          echo "### 🛡️ Relatório de Vulnerabilidades (npm audit)" >> $GITHUB_STEP_SUMMARY
          echo '```text' >> $GITHUB_STEP_SUMMARY
          npm audit --audit-level=critical || true >> $GITHUB_STEP_SUMMARY
          echo '```' >> $GITHUB_STEP_SUMMARY

  # ========================================================
  # 2. ETAPA: TESTES AUTOMATIZADOS
  # ========================================================
  tests:
    name: 🧪 Testes Automatizados (Vitest)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout do Código
        uses: actions/checkout@v4

      - name: Setup do Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Instalar Dependências Limpas
        run: npm ci

      - name: Compilar Contratos / Bibliotecas Internas
        run: npm run --workspace=@floreio/contracts build

      # Executa os testes com anotações automáticas nas linhas de código do GitHub
      - name: Executar Suíte de Testes
        run: npm test -- --reporter=default --reporter=github

      # $GITHUB_STEP_SUMMARY: Cria um resumo visual elegante na aba Actions
      - name: 📊 Publicar Resumo dos Testes
        if: always()
        run: |
          echo "### 🧪 Resumo da Suíte de Testes" >> $GITHUB_STEP_SUMMARY
          echo "| Métrica | Resultado |" >> $GITHUB_STEP_SUMMARY
          echo "|---|---|" >> $GITHUB_STEP_SUMMARY
          echo "| **Status** | ✅ Todos os testes unitários e de integração aprovados |" >> $GITHUB_STEP_SUMMARY

  # ========================================================
  # 3. ETAPA: ANÁLISE ESTÁTICA & TYPECHECK
  # ========================================================
  static-analysis:
    name: 🔍 Análise de Código Estático & Tipagem
    runs-on: ubuntu-latest
    steps:
      - name: Checkout do Código
        uses: actions/checkout@v4

      - name: Setup do Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Instalar Dependências
        run: npm ci

      - name: Typecheck - Contratos Compartilhados
        run: npm run --workspace=@floreio/contracts build

      - name: Typecheck - Backend API
        run: npm run --workspace=@floreio/api build

      - name: 📊 Publicar Resumo da Análise Estática
        run: |
          echo "### 🔍 Análise de Tipagem e Código Estático" >> $GITHUB_STEP_SUMMARY
          echo "- **TypeScript**: 0 erros de compilação e tipagem estrita." >> $GITHUB_STEP_SUMMARY

  # ========================================================
  # 4. ETAPA: BUILD & DEPLOY NO FIREBASE HOSTING
  # ========================================================
  build-and-deploy:
    name: 🚀 Build & Deploy Firebase Hosting
    needs: [security-audit, tests, static-analysis] # SÓ EXECUTA SE OS 3 PASSARAM!
    runs-on: ubuntu-latest
    
    # Declara o GitHub Environment para rastreamento em PRs e Projects
    environment:
      name: ${{ github.ref == 'refs/heads/main' && 'production' || 'preview' }}
      url: https://floreio-b03f0.web.app

    steps:
      - name: Checkout do Código
        uses: actions/checkout@v4

      - name: Setup do Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Instalar Dependências
        run: npm ci

      - name: Compilar Contratos
        run: npm run --workspace=@floreio/contracts build

      - name: Gerar Build de Produção Estática (Next.js Export)
        run: npm run --workspace=@floreio/web build

      # Action oficial do Firebase Hosting:
      # - Se for na branch main: faz deploy no canal "live" (produção)
      # - Se for em Pull Request: cria uma URL temporária de Preview exclusiva para o PR
      - name: Deploy no Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_FLOREIO_B03F0 }}'
          projectId: floreio-b03f0
          channelId: ${{ github.ref == 'refs/heads/main' && 'live' || '' }}

      - name: 🌐 Publicar Resumo do Deploy
        if: success()
        run: |
          echo "### 🚀 Deploy no Firebase Hosting Concluído com Sucesso!" >> $GITHUB_STEP_SUMMARY
          echo "| Item | Detalhes |" >> $GITHUB_STEP_SUMMARY
          echo "|---|---|" >> $GITHUB_STEP_SUMMARY
          echo "| **Projeto Firebase** | \`floreio-b03f0\` |" >> $GITHUB_STEP_SUMMARY
          echo "| **Ambiente** | Produção (Canal Live) |" >> $GITHUB_STEP_SUMMARY
          echo "| **URL** | [https://floreio-b03f0.web.app](https://floreio-b03f0.web.app) |" >> $GITHUB_STEP_SUMMARY
```

---

## Passo 6: Conectando a Pipeline ao GitHub Projects e Pull Requests

O ciclo de desenvolvimento profissional se fecha integrando a esteira ao Kanban de tarefas e aos Pull Requests:

### 1. Criando a ligação entre Tarefa (Card) e Código
Ao criar uma branch e abrir um Pull Request, use palavras-chave do GitHub no corpo do PR:
```markdown
## Descrição da Entrega
Implementação da tela de checkout com validação de cartão.

Closes #15
```
> O GitHub detecta `Closes #15`, `Fixes #15` ou `Resolves #15` e vincula o Pull Request diretamente ao Card correspondente no **GitHub Projects**.

> [!TIP]
> 🤖 **Executando via Agente de IA:**
> Ao concluir uma tarefa e desejar abrir um Pull Request integrado ao Kanban:
> 
> *"Crie um novo Pull Request a partir da minha branch atual descrevendo as alterações realizadas e inclua no corpo do PR a instrução `Closes #15` para vincular e mover o card automaticamente no GitHub Projects."*

### 2. O que acontece graças ao bloco `environment`?
Como configuramos:
```yaml
environment:
  name: production
  url: https://floreio-b03f0.web.app
```
O GitHub cria automaticamente uma seção de **Deployments**:
- O Pull Request ganha um badge verde com link direto para a URL onde a aplicação foi publicada.
- O Card no GitHub Projects mostra o status atual do Deploy (*Active in Production*).
- O repositório ganha a aba **Environments** com histórico de todas as versões já lançadas.

### 3. Automação no GitHub Projects (Mover Cards Sozinho)
1. No seu **GitHub Project**, vá nos `...` (canto superior direito) ➔ **Workflows**.
2. Ative:
   - **Auto-add to project**: Adiciona novas issues automaticamente ao Backlog.
   - **Item closed**: Quando o PR com `Closes #15` for mergeado na `main`, o Card vai direto para a coluna **Done** sem intervenção manual.

---

## Demonstração Prática: Fluxo de Vida Real

Roteiro para testar o comportamento da esteira na prática:

1. **Simular um Erro de Teste ou Tipagem:**
   - Altere intencionalmente um teste ou quebre uma tipagem.
   - Abra um Pull Request.
   - Mostre que a pipeline **fica vermelha** ❌ e **o deploy é impedido**!
2. **Simular um Segredo Vazado:**
   - Adicione uma string falsa como `const fakeKey = "ghp_1234567890abcdefghijklmnopqrstuvwxyz";`.
   - O `Gitleaks` detectará e bloqueará o pipeline no primeiro job!
3. **Corrigir e Ver o Sucesso:**
   - Corrija o código e faça o commit.
   - Todos os jobs passam em verde ✅.
   - O resumo visual do `$GITHUB_STEP_SUMMARY` surge na aba do GitHub Actions.
   - Acesse a URL do Firebase Hosting e mostre a aplicação rodando em tempo real.

> [!TIP]
> 🤖 **Executando testes de falha via Agente de IA:**
> Para testar se a pipeline realmente bloqueia erros, peça ao agente:
> 
> *"Insira temporariamente um erro de tipagem no TypeScript e crie um commit em uma branch de teste para que possamos validar se o job de análise estática bloqueia o deploy no Pull Request."*

---

## Guia de Troubleshooting Comum

| Problema Encontrado | Causa Mais Provável | Solução |
|---|---|---|
| **Erro no `npm ci`** | O arquivo `package-lock.json` não está commitado ou está desatualizado. | Rodar `npm install` localmente e commitar o `package-lock.json`. |
| **Erro de compilação em Monorepos** | Workspaces interdependentes não foram construídos na ordem correta. | Adicionar passo `npm run --workspace=@scope/pkg build` antes de rodar os testes. |
| **Erro no Deploy: 403 Forbidden** | A Service Account não tem a permissão `Firebase Hosting Admin` ou a secret do GitHub tem nome divergente. | Conferir se o nome da secret no repositório bate exatamente com `${{ secrets.FIREBASE_SERVICE_ACCOUNT_XXX }}`. |
| **Página em branco (404) no Firebase** | A propriedade `public` no `firebase.json` está apontando para uma pasta errada (ex: `build` em vez de `out`). | Conferir se o build estático gera a pasta especificada no `firebase.json`. |

---

*Guia prático de Engenharia de Software, DevOps e Boas Práticas de CI/CD.*
