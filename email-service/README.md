# Voleiplay Email Service (API de E-mails Mockada) 📧

Microsserviço autônomo responsável pelo envio de e-mails, notificações de premiações de torneios e transações compensatórias do **Padrão Saga**.

> [!NOTE]
> Este serviço opera em modo **mockado** (didático): ele valida, processa e armazena os e-mails em memória, emitindo logs coloridos no console sem disparar e-mails reais via SMTP na internet.

---

## 🚀 Como Executar

### 1. Instalar dependências:
```bash
npm install
```

### 2. Rodar em modo desenvolvimento:
```bash
npm run dev
```

A API iniciará na porta **3004** (ou na porta definida pela variável de ambiente `PORT`).
Abra [http://localhost:3004](http://localhost:3004) no navegador para ver o Dashboard interativo da caixa de saída.

---

## 🔌 Endpoints REST

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/health` ou `/api/emails/health` | Healthcheck do serviço |
| `GET` | `/api/emails` | Lista e-mails enviados recentemente (`?limit=50`) |
| `GET` | `/api/emails/stats` | Estatísticas (total enviado, falhas, por tipo) |
| `POST` | `/api/emails/send` | Envio de e-mail avulso |
| `POST` | `/api/emails/send-batch` | Envio em lote (usado no passo T3 da Saga) |
| `POST` | `/api/emails/compensate` | Disparo de e-mails de cancelamento/estorno (compensação C3) |
| `DELETE` | `/api/emails` | Esvazia o histórico em memória |

---

## 📡 Rastreamento Distribuído (Distributed Tracing com APM)

O serviço possui suporte nativo ao Elastic APM (`elastic-apm-node`). Quando executado em conjunto com o backend principal e o APM Server (porta 8200), todas as requisições HTTP REST vindas do orquestrador da Saga preservam o cabeçalho W3C `traceparent`, gerando rastreamento de ponta a ponta (Distributed Tracing).
