# ⚡ VoleiPlay Serverless Lab: Calculadora de MVP & Estatísticas

Módulo didático de **Function as a Service (FaaS)** e **Edge Serverless** do projeto VoleiPlay.

---

## 🧭 1. O que é Serverless / FaaS?

Na computação tradicional (como o backend que roda no Railway ou Docker):
* O servidor Node.js/Express fica **ligado 24 horas por dia**, ocupando portas de rede, ouvindo requisições e consumindo memória RAM mesmo quando ninguém está utilizando o sistema.

No modelo **Serverless (FaaS)**:
* **Não existe servidor permanente**.
* O provedor (ex: **Cloudflare Workers**, AWS Lambda) mantém o código armazenado.
* Quando uma requisição HTTP chega, o provedor **instancia o ambiente em milissegundos**, executa a função, envia a resposta ao cliente e **desliga imediatamente** (Escala a Zero).

---

## 🎯 2. Por que esta função é o caso de uso perfeito?

1. **Stateless (Sem Estado)**: Ela não precisa de banco de dados nem de variáveis globais persistentes. Recebe `MatchInput` (scout bruto), aplica as fórmulas matemáticas e devolve `MVPCalculationResponse`.
2. **Custo Zero quando Ociosa**: Uma partida de vôlei termina a cada ~45 minutos. Não faz sentido pagar servidor para calcular estatísticas continuamente.
3. **Pico de Acesso (Spike de Final de Torneio)**: Se 50 partidas terminarem no mesmo minuto em etapas de circuito, o Cloudflare Workers sobe 50 instâncias paralelas instantaneamente em milissegundos na borda do mundo inteiro, sem sobrecarregar o backend principal no Railway.

---

## 📐 3. Fórmulas de Vôlei Aplicadas

### Eficiência de Ataque (Attack Efficiency %)
$$\text{Efficiency} = \frac{\text{Kills} - \text{Erros de Ataque}}{\text{Total de Ataques}} \times 100$$

### Pontuação Ponderada de MVP (MVP Score)
$$\text{Score} = (\text{Aces} \times 3) + (\text{Blocks} \times 3) + (\text{Kills} \times 2) + (\text{Digs} \times 1.5) - (\text{Erros Não Forçados} \times 2) - (\text{Erros de Saque} \times 1) - (\text{Erros de Ataque} \times 1.5)$$

---

## 🚀 4. Como Executar e Testar

### Teste Local Rápido (Node.js / tsx)
Dentro da pasta `serverless/mvp-calculator`:
```bash
npx tsx verify-calculator.ts
```

### Como Fazer Deploy no Cloudflare Workers

1. Certifique-se de ter o Wrangler instalado:
```bash
npm install -g wrangler
```
2. Faça login na Cloudflare:
```bash
wrangler login
```
3. Faça o deploy da função na borda:
```bash
wrangler deploy
```
Em menos de 10 segundos, a Cloudflare fornecerá uma URL pública HTTPS (ex: `https://voleiplay-mvp-calculator.<seu-subdominio>.workers.dev`) distribuída em mais de 300 data centers globais com latência sub-10ms.
