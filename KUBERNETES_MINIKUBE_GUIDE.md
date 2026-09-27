# ☸️ GUIA DE AULA: DOCKER ISOLADO vs KUBERNETES (MINIKUBE)
> **Projeto:** `VOLEIPLAY` (Ecossistema Completo em Kubernetes)  
> **Tema:** Orquestração de Contêineres, Self-Healing, Alta Disponibilidade, Service Discovery e Rolling Updates  
> **Namespace no Cluster:** `voleiplay-k8s`  
> **Público-alvo:** Alunos de Engenharia de Software, Arquitetura Cloud, DevOps e Sistemas Distribuídos

---

## 📌 1. Visão Geral da Arquitetura em Aula

Durante a aula, você tem em mãos os dois mundos rodando em paralelo na mesma máquina:

```
   ┌────────────────────────────────────────────────────────┐
   │                     MÁQUINA HOST                       │
   │                                                        │
   │  ┌───────────────────────┐  ┌───────────────────────┐  │
   │  │ DOCKER ISOLADO (HOST) │  │  MINIKUBE KUBERNETES  │  │
   │  │                       │  │ (Cluster Orquestrado) │  │
   │  │ • voleiplay-postgres  │  │                       │  │
   │  │ • voleiplay-redis     │  │ Namespace:            │  │
   │  │ • voleiplay-mongodb   │  │ `voleiplay-k8s`        │  │
   │  │ • voleiplay-apm       │  │                       │  │
   │  │ • voleiplay-kibana    │  │ • 2x voleiplay-backend│  │
   │  │ • voleiplay-elastic   │  │ • 2x voleiplay-auth   │  │
   │  │                       │  │ • 1x voleiplay-email  │  │
   │  │                       │  │ • 2x voleiplay-spa    │  │
   │  │                       │  │ • 2x voleiplay-mfe    │  │
   │  │                       │  │ • 2x voleiplay-ssr    │  │
   │  │                       │  │ • 1x postgres (k8s)   │  │
   │  │                       │  │ • 1x redis (k8s)      │  │
   │  │                       │  │ • 1x mongodb (k8s)    │  │
   │  └───────────────────────┘  └───────────────────────┘  │
   └────────────────────────────────────────────────────────┘
```

---

## 📊 2. Matriz Comparativa: Docker Isolado vs Kubernetes

| Critério de Engenharia | Docker Isolado / Docker Compose | Kubernetes (Minikube / EKS / GKE) |
| :--- | :--- | :--- |
| **Escopo** | Gerenciador de contêineres em uma única máquina | **Orquestrador de sistemas distribuídos** em múltiplos nós |
| **Resiliência (Self-Healing)** | Se o processo trava com falha de memória ou bug, o contêiner morre ou precisa de `restart: always` básico | **Control Loop Contínuo**: Kubelet monitora liveness/readiness e recria pods em segundos se falharem |
| **Escalabilidade Horizontal** | Precisa configurar manualmente Nginx/Traefik reverso e portas mapeadas | **Nativo**: Basta `replicas: 2` ou HPA (Horizontal Pod Autoscaling) que o Service faz Load Balancing automático |
| **Service Discovery** | Resolução simples de nomes de rede Docker | **CoreDNS Integrado**: Serviços possuem nomes DNS internos imutáveis (`voleiplay-backend:3000`) |
| **Atualização sem Queda (Zero Downtime)** | Reiniciar o contêiner derruba a conexão dos usuários por alguns segundos | **RollingUpdate**: Sobe um novo pod saudável antes de matar o pod antigo (`maxUnavailable: 0`) |
| **Configuração Desacoplada** | Variáveis de ambiente no arquivo `.env` acoplado | **ConfigMaps & Secrets**: Configurações desacopladas do ciclo de vida das imagens |
| **Isolamento Lógico** | Apenas redes de contêineres | **Namespaces**: Permite rodar ambientes inteiros (dev, staging, prod) isolados no mesmo cluster |

---

## 🎯 3. Roteiro Prático de Demonstração em Aula (Passo a Passo)

Abra o PowerShell na pasta do projeto:

```powershell
cd c:\Users\felip\Documents\voleiplay
$minikube = 'C:\Program Files\Kubernetes\Minikube\minikube.exe'
```

---

### 🔹 Demonstração 1: Inspeção de Estado e Topologia
Execute no terminal para mostrar todos os componentes saudáveis no namespace:

```powershell
& $minikube kubectl -- get all -n voleiplay-k8s
```

**O que mostrar aos alunos:**
- Aponte que existem **2 réplicas** de cada serviço principal (`voleiplay-backend`, `voleiplay-spa`, `voleiplay-mfe`, `voleiplay-ssr`, `voleiplay-auth`).
- Mostre os **Services do tipo NodePort**:
  - `voleiplay-backend` na porta `:30000`
  - `voleiplay-auth` na porta `:30007`
  - `voleiplay-email` na porta `:30004`
  - `voleiplay-spa` na porta `:30080`
  - `voleiplay-mfe` na porta `:30082`
  - `voleiplay-ssr` na porta `:30040`

---

### 🔹 Demonstração 2: O Poder do Self-Healing (Morte e Ressurreição Automática)
Este é o teste mais impactante para entender por que o mercado usa Kubernetes:

1. Liste os pods do backend:
   ```powershell
   & $minikube kubectl -- get pods -n voleiplay-k8s -l app=voleiplay-backend
   ```
2. Escolha o nome de um dos pods (ex: `voleiplay-backend-6b94897694-49rjm`) e delete-o propositalmente:
   ```powershell
   & $minikube kubectl -- delete pod -n voleiplay-k8s <NOME-DO-POD>
   ```
3. Imediatamente liste os pods novamente:
   ```powershell
   & $minikube kubectl -- get pods -n voleiplay-k8s -l app=voleiplay-backend
   ```
4. **Ponto pedagógico para discutir com os alunos:**
   > *"Vejam: o Kubernetes detectou que o estado desejado (Desired State = 2 réplicas) divergia do estado atual (Current State = 1 réplica). Em menos de 2 segundos, ele inicializou um novo pod substituto sem que o usuário final sofresse nenhuma interrupção, pois o Service continuou direcionando o tráfego para a outra réplica saudável!"*

---

### 🔹 Demonstração 3: Acessando os Serviços do Cluster no Navegador
Como o Minikube roda com driver Docker no Windows, o Kubernetes expõe as portas através do comando `service`:

#### Acessar o Backend de Torneios:
```powershell
& $minikube service voleiplay-backend -n voleiplay-k8s
```
*(Abre automaticamente no navegador com a API de jogadores, CQRS, Hexagonal e Saga).*

#### Acessar o Frontend SPA (Monólito):
```powershell
& $minikube service voleiplay-spa -n voleiplay-k8s
```

#### Acessar o Frontend Microfrontends (MFE Shell):
```powershell
& $minikube service voleiplay-mfe -n voleiplay-k8s
```

#### Acessar o Frontend Server-Side Rendering (SSR):
```powershell
& $minikube service voleiplay-ssr -n voleiplay-k8s
```

---

### 🔹 Demonstração 4: Escalabilidade Instantânea (Scaling Up e Down)
Mostre como é fácil escalar uma aplicação de 2 para 5 réplicas com um único comando declarativo:

```powershell
# Escalar para 5 réplicas do backend
& $minikube kubectl -- scale deployment voleiplay-backend -n voleiplay-k8s --replicas=5

# Acompanhar os novos pods surgindo em tempo real:
& $minikube kubectl -- get pods -n voleiplay-k8s -l app=voleiplay-backend

# Voltar para 2 réplicas:
& $minikube kubectl -- scale deployment voleiplay-backend -n voleiplay-k8s --replicas=2
```

---

### 🔹 Demonstração 5: Inspecionar Logs Centralizados dos Pods
```powershell
# Ver logs em tempo real de todas as réplicas do backend simultaneamente:
& $minikube kubectl -- logs -n voleiplay-k8s -l app=voleiplay-backend --tail=30 -f
```

---

## 🛠️ 4. Estrutura dos Arquivos Criados

Os manifestos declarativos oficiais estão versionados na pasta `k8s/`:

- `k8s/00-namespace.yaml`: Criação do namespace isolado `voleiplay-k8s`
- `k8s/01-configmap.yaml`: Configurações centralizadas de ambiente e banco
- `k8s/02-databases.yaml`: Deployments e Services de Postgres, Redis e MongoDB internos ao cluster
- `k8s/03-backend-services.yaml`: Deployments e Services de Backend, Auth e Email com RollingUpdate
- `k8s/04-frontends.yaml`: Deployments e Services Nginx e Node.js para SPA, Microfrontends e SSR
- `Dockerfile.frontend`: Imagem Nginx ultraleve para o SPA Monólito
- `voleiplay2/Dockerfile`: Imagem Nginx para o Microfrontend Shell
- `voleiplay-ssr/Dockerfile`: Imagem Node.js 20 para o SSR Express
- `backend/Dockerfile`: Imagem Node.js para a API de Torneios
- `auth-service/Dockerfile`: Imagem Node.js para o Microsserviço de Auth
- `email-service/Dockerfile`: Imagem Node.js para o Microsserviço de Email

---

## ❓ 5. Perguntas Desafiadoras para Fazer aos Alunos em Aula

1. *"Se um pod do backend receber uma requisição que consuma 100% de CPU ou memória infinita, o que o Kubernetes faz?"*  
   👉 **Resposta esperada:** Os limites definidos no manifesto (`resources.limits`) entram em ação. O Kubernetes mata o processo que ultrapassou o limite com código `OOMKilled` (Out Of Memory) e recria o pod automaticamente, protegendo os outros pods do cluster.
2. *"Qual a diferença entre um `ClusterIP` e um `NodePort` no Kubernetes?"*  
   👉 **Resposta esperada:** `ClusterIP` só é visível internamente entre pods do mesmo cluster (como nossos bancos Postgres/Redis/Mongo). `NodePort` abre uma porta na máquina para permitir acesso externo direto de navegadores e clientes.
3. *"Por que o Kubernetes é chamado de 'Sistema Declarativo' enquanto scripts de Docker são 'Imperativos'?"*  
   👉 **Resposta esperada:** No Docker tradicional, dizemos *'rode este comando agora'*. No Kubernetes, declaramos *'eu quero 2 réplicas deste serviço rodando'* através de arquivos YAML. O Kubernetes se encarrega de reconciliar continuamente a realidade com o estado declarado.
