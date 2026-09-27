# Voleiplay Auth Service (API de Autenticação e Usuários) 🔐

Microsserviço autônomo responsável pela autenticação, controle de acesso baseado em papéis (RBAC), cadastro de usuários/atletas e gestão de sessões do ecossistema **Voleiplay**.

---

## 🚀 Como Executar

### 1. Instalar dependências:
```bash
npm install
```

### 2. Iniciar em desenvolvimento:
```bash
npm run dev
```

O serviço iniciará na porta **3007** (ou na porta configurada por `PORT` / `AUTH_SERVICE_PORT`).
Acesse [http://localhost:3007](http://localhost:3007) para ver o Dashboard Web interativo do serviço.

---

## 🔌 Endpoints REST

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/health` ou `/api/auth/health` | Healthcheck do serviço |
| `POST` | `/api/auth/login` | Login com e-mail e senha (retorna token de sessão) |
| `POST` | `/api/auth/register` | Cadastro de novo usuário |
| `GET` | `/api/auth/me` | Valida sessão ativa via `Authorization: Bearer <token>` |
| `POST` | `/api/auth/logout` | Encerra a sessão ativa |
| `GET` | `/api/auth/users` | Lista usuários cadastrados (para demonstração) |
| `GET` | `/api/auth/stats` | Métricas de usuários e logins |

---

## 👥 Contas Padrão para Demonstração Didática

| Papel | Nome | E-mail | Senha |
|---|---|---|---|
| **ADMIN** | Diretor BPT | `admin@voleiplay.com.br` | `admin123` |
| **ATHLETE** | Ana Patrícia Silva | `ana.patricia@voleiplay.com.br` | `atleta123` |
| **ATHLETE** | Eduarda (Duda) Lisboa | `duda.lisboa@voleiplay.com.br` | `atleta123` |
| **COACH** | Técnico Bernardinho | `treinador@voleiplay.com.br` | `treinador123` |

---

## 📡 Observabilidade e Elastic APM

O serviço é auto-instrumentado com o **Elastic APM** (`voleiplay-auth-service`). Todas as requisições geram transações e métricas registradas automaticamente no Elasticsearch e visualizáveis no Kibana APM ([http://localhost:5601/app/apm](http://localhost:5601/app/apm)).
