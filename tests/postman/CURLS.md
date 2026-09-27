# Comandos cURL - Voleiplay Beach Pro Tour

Você pode importar qualquer um desses comandos diretamente no Postman:
> **No Postman**: Clique em **Import** (canto superior esquerdo) $\rightarrow$ Cole o comando cURL no campo de texto $\rightarrow$ Pressione **Enter**.

---

## 🔐 1. Microsserviço de Autenticação (`auth-service` na porta 3007)

### 1.1 Healthcheck
```bash
curl --location 'http://localhost:3007/api/auth/health'
```

### 1.2 Login de Atleta (Ana Patrícia)
```bash
curl --location 'http://localhost:3007/api/auth/login' \
--header 'Content-Type: application/json' \
--data '{
  "email": "ana.patricia@voleiplay.com.br",
  "password": "atleta123"
}'
```

### 1.3 Login de Administrador (Diretor BPT)
```bash
curl --location 'http://localhost:3007/api/auth/login' \
--header 'Content-Type: application/json' \
--data '{
  "email": "admin@voleiplay.com.br",
  "password": "admin123"
}'
```

### 1.4 Login com Senha Incorreta (Teste de Rejeição 401)
```bash
curl --location 'http://localhost:3007/api/auth/login' \
--header 'Content-Type: application/json' \
--data '{
  "email": "ana.patricia@voleiplay.com.br",
  "password": "senha_incorreta"
}'
```

### 1.5 Cadastro de Novo Usuário (com disparo automático de e-mail de boas-vindas)
```bash
curl --location 'http://localhost:3007/api/auth/register' \
--header 'Content-Type: application/json' \
--data '{
  "name": "Alison Cerutti",
  "email": "alison.cerutti@voleiplay.com.br",
  "password": "senhaSegura123",
  "role": "ATHLETE",
  "bio": "Campeão Olímpico Rio 2016"
}'
```

### 1.6 Validar Sessão Atual (`/api/auth/me`)
> Substitua `<SEU_TOKEN>` pelo token retornado no login/cadastro (ex: `vptok_...`)
```bash
curl --location 'http://localhost:3007/api/auth/me' \
--header 'Authorization: Bearer <SEU_TOKEN>'
```

### 1.7 Listar Todos os Usuários
```bash
curl --location 'http://localhost:3007/api/auth/users'
```

### 1.8 Estatísticas de Autenticação e Usuários
```bash
curl --location 'http://localhost:3007/api/auth/stats'
```

### 1.9 Logout (Encerrar Sessão)
```bash
curl --location --request POST 'http://localhost:3007/api/auth/logout' \
--header 'Authorization: Bearer <SEU_TOKEN>'
```

---

## 📧 2. Microsserviço de E-mail (`email-service` na porta 3004)

### 2.1 Healthcheck
```bash
curl --location 'http://localhost:3004/api/emails/health'
```

### 2.2 Enviar E-mail Avulso (Mockado)
```bash
curl --location 'http://localhost:3004/api/emails/send' \
--header 'Content-Type: application/json' \
--data '{
  "to": "duda.lisboa@voleiplay.com.br",
  "recipientName": "Eduarda (Duda) Lisboa",
  "subject": "🏐 Convocação Oficial Etapa Paris Elite 16",
  "body": "Parabéns! Sua dupla está confirmada como cabeça de chave número 1 do torneio.",
  "type": "SYSTEM_ALERT"
}'
```

### 2.3 Simular Falha de Envio SMTP (Status 500)
```bash
curl --location 'http://localhost:3004/api/emails/send' \
--header 'Content-Type: application/json' \
--data '{
  "to": "falha.teste@voleiplay.com",
  "recipientName": "Atleta Teste",
  "subject": "E-mail com falha simulada",
  "body": "Este envio falhará intencionalmente.",
  "simulateFailure": true
}'
```

### 2.4 Disparo de E-mails em Lote (Batch)
```bash
curl --location 'http://localhost:3004/api/emails/send-batch' \
--header 'Content-Type: application/json' \
--data '{
  "batchId": "batch-etapa-saquarema",
  "emails": [
    {
      "to": "ana.patricia@voleiplay.com.br",
      "recipientName": "Ana Patrícia",
      "subject": "🏐 Escala de Jogos - Quadra Central",
      "body": "Seu confronto começará às 15:30."
    },
    {
      "to": "duda.lisboa@voleiplay.com.br",
      "recipientName": "Duda Lisboa",
      "subject": "🏐 Escala de Jogos - Quadra Central",
      "body": "Seu confronto começará às 15:30."
    }
  ]
}'
```

### 2.5 Consultar Caixa de Saída (Outbox em memória)
```bash
curl --location 'http://localhost:3004/api/emails'
```

### 2.6 Estatísticas do Serviço de E-mail
```bash
curl --location 'http://localhost:3004/api/emails/stats'
```

### 2.7 Transação Compensatória (Saga Pattern - Estorno de Premiação)
```bash
curl --location 'http://localhost:3004/api/emails/compensate' \
--header 'Content-Type: application/json' \
--data '{
  "originalBatchId": "batch-1029",
  "recipients": [
    {
      "to": "ana.patricia@voleiplay.com.br",
      "recipientName": "Ana Patrícia"
    },
    {
      "to": "duda.lisboa@voleiplay.com.br",
      "recipientName": "Duda Lisboa"
    }
  ],
  "reason": "Condições climáticas adversas cancelaram as finais"
}'
```

---

## 🌐 3. Gateway Principal & Circuit Breaker (`backend` na porta 3000)

### 3.1 Healthcheck do Gateway
```bash
curl --location 'http://localhost:3000/health'
```

### 3.2 Consultar Status e Métricas do Circuit Breaker
```bash
curl --location 'http://localhost:3000/services/email/circuit-breaker'
```

### 3.3 Forçar Reset do Circuit Breaker para `CLOSED`
```bash
curl --location --request POST 'http://localhost:3000/services/email/circuit-breaker/reset'
```

### 3.4 Gateway Proxy -> Estatísticas de Autenticação
```bash
curl --location 'http://localhost:3000/services/auth/stats'
```

### 3.5 Gateway Proxy -> Login de Atleta
```bash
curl --location 'http://localhost:3000/services/auth/login' \
--header 'Content-Type: application/json' \
--data '{
  "email": "ana.patricia@voleiplay.com.br",
  "password": "atleta123"
}'
```

### 3.6 Gateway Proxy -> Disparo de E-mail Protegido por Circuit Breaker & Retry Backoff
```bash
curl --location 'http://localhost:3000/services/email/send' \
--header 'Content-Type: application/json' \
--data '{
  "to": "atleta.gateway@voleiplay.com.br",
  "recipientName": "Atleta Gateway",
  "subject": "Disparo Resiliente via Gateway",
  "body": "Requisição roteada pelo proxy com proteção contra falhas.",
  "type": "SYSTEM_ALERT"
}'
```
