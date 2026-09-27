import { Given, When, Then, And } from './gherkin-runner.js';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3007';
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:3004';
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000';

// -------------------------------------------------------------
// Passos de Cadastro e Notificação
// -------------------------------------------------------------
Given(/^que os serviços de Autenticação e E-mail estão operacionais$/, async (context) => {
  const authHealth = await fetch(`${AUTH_SERVICE_URL}/api/auth/health`).then(r => r.json()).catch(() => null);
  if (!authHealth || authHealth.status !== 'UP') {
    throw new Error(`Auth Service inacessível em ${AUTH_SERVICE_URL}`);
  }

  const emailHealth = await fetch(`${EMAIL_SERVICE_URL}/api/emails/health`).then(r => r.json()).catch(() => null);
  if (!emailHealth || emailHealth.status !== 'UP') {
    throw new Error(`Email Service inacessível em ${EMAIL_SERVICE_URL}`);
  }

  context.servicesHealthy = true;
});

When(/^o atleta "([^"]*)" com e-mail "([^"]*)" e perfil "([^"]*)" realiza o cadastro com a senha "([^"]*)"$/, async (context, name, email, role, password) => {
  // Gera e-mail único com timestamp se já tiver sido usado em testes anteriores
  const uniqueEmail = email.replace('@', `+${Date.now()}@`);
  context.registeredEmail = uniqueEmail;

  const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email: uniqueEmail, role, password })
  });

  context.responseStatus = response.status;
  context.responseBody = await response.json();
});

Then(/^a resposta da API de autenticação deve ter status (\d+)$/, (context, expectedStatus) => {
  if (context.responseStatus !== parseInt(expectedStatus, 10)) {
    throw new Error(`Status esperado ${expectedStatus}, mas recebeu ${context.responseStatus}: ${JSON.stringify(context.responseBody)}`);
  }
});

And(/^a resposta deve conter um token de sessão válido no padrão "([^"]*)"$/, (context, patternPrefix) => {
  const token = context.responseBody?.token;
  if (!token || !token.startsWith(patternPrefix)) {
    throw new Error(`Token inválido: ${token}`);
  }
  context.lastToken = token;
});

And(/^o usuário retornado deve ter o nome "([^"]*)" e papel "([^"]*)"$/, (context, expectedName, expectedRole) => {
  const user = context.responseBody?.user;
  if (!user || user.name !== expectedName || user.role !== expectedRole) {
    throw new Error(`Dados de usuário divergentes: ${JSON.stringify(user)}`);
  }
});

And(/^uma notificação de e-mail de boas-vindas deve existir na caixa de saída do serviço de e-mail para "([^"]*)"$/, async (context, originalEmail) => {
  const targetEmail = context.registeredEmail || originalEmail;

  // Dá um pequeno tempo para a chamada assíncrona/REST
  await new Promise(r => setTimeout(r, 250));

  const response = await fetch(`${EMAIL_SERVICE_URL}/api/emails`);
  const data = await response.json();

  const found = data.emails.find((e: any) => e.to === targetEmail);
  if (!found) {
    throw new Error(`Nenhum e-mail encontrado na outbox para: ${targetEmail}. Total na outbox: ${data.total}`);
  }

  if (!found.subject.includes('Bem-vindo ao Voleiplay')) {
    throw new Error(`Assunto do e-mail inesperado: "${found.subject}"`);
  }
});

Given(/^que existe um usuário cadastrado com e-mail "([^"]*)"$/, async (context, email) => {
  context.existingEmail = email;
});

When(/^eu tento cadastrar um novo usuário com o mesmo e-mail "([^"]*)"$/, async (context, email) => {
  const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Nome Duplicado',
      email,
      password: 'qualquer_senha',
      role: 'FAN'
    })
  });

  context.responseStatus = response.status;
  context.responseBody = await response.json();
});

Then(/^a resposta da API de autenticação deve retornar erro com status (\d+)$/, (context, expectedStatus) => {
  if (context.responseStatus !== parseInt(expectedStatus, 10)) {
    throw new Error(`Status de erro esperado ${expectedStatus}, recebido: ${context.responseStatus}`);
  }
});

And(/^a mensagem de erro deve conter "([^"]*)"$/, (context, textSnippet) => {
  const errorMsg = context.responseBody?.error || '';
  if (!errorMsg.toLowerCase().includes(textSnippet.toLowerCase())) {
    throw new Error(`Mensagem de erro não contém "${textSnippet}": "${errorMsg}"`);
  }
});

// -------------------------------------------------------------
// Passos de Autenticação e Sessão
// -------------------------------------------------------------
Given(/^que existe o usuário cadastrado "([^"]*)" com a senha "([^"]*)"$/, (context, email, password) => {
  context.loginEmail = email;
  context.loginPassword = password;
});

When(/^eu realizo o login com o e-mail "([^"]*)" e senha "([^"]*)"$/, async (context, email, password) => {
  const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  context.responseStatus = response.status;
  context.responseBody = await response.json();
  if (context.responseBody?.token) {
    context.authToken = context.responseBody.token;
  }
});

And(/^a sessão deve retornar o papel "([^"]*)"$/, (context, expectedRole) => {
  const role = context.responseBody?.user?.role;
  if (role !== expectedRole) {
    throw new Error(`Papel do usuário divergente: esperado ${expectedRole}, obtido ${role}`);
  }
});

And(/^uma consulta com o token recebido no endpoint "\/api\/auth\/me" deve validar a sessão do usuário$/, async (context) => {
  const token = context.authToken;
  const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (response.status !== 200) {
    throw new Error(`Falha ao validar token em /api/auth/me: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || !data.user) {
    throw new Error(`Resposta de /me inválida: ${JSON.stringify(data)}`);
  }
});

Given(/^que existe o usuário cadastrado "([^"]*)"$/, (context, email) => {
  context.targetUserEmail = email;
});

When(/^eu tento realizar o login com o e-mail "([^"]*)" e senha "([^"]*)"$/, async (context, email, password) => {
  const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  context.responseStatus = response.status;
  context.responseBody = await response.json();
});

Given(/^que o usuário "([^"]*)" está autenticado com sessão ativa$/, async (context, email) => {
  const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'atleta123' })
  });
  const data = await response.json();
  if (!data.success || !data.token) {
    throw new Error(`Não foi possível autenticar o usuário para o teste de logout: ${email}`);
  }
  context.logoutToken = data.token;
});

When(/^o usuário solicita o encerramento da sessão$/, async (context) => {
  const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${context.logoutToken}` }
  });

  context.logoutStatus = response.status;
  context.logoutBody = await response.json();
});

Then(/^a resposta de logout deve ter status (\d+)$/, (context, expectedStatus) => {
  if (context.logoutStatus !== parseInt(expectedStatus, 10)) {
    throw new Error(`Status de logout esperado ${expectedStatus}, recebido: ${context.logoutStatus}`);
  }
});

And(/^uma nova tentativa de validação com o token anterior deve ser rejeitada com status (\d+)$/, async (context, expectedStatus) => {
  const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${context.logoutToken}` }
  });

  if (response.status !== parseInt(expectedStatus, 10)) {
    throw new Error(`Token deveria ter sido rejeitado com ${expectedStatus}, mas retornou ${response.status}`);
  }
});

// -------------------------------------------------------------
// Passos de Resiliência e Gateway
// -------------------------------------------------------------
Given(/^que o Gateway na porta 3000 e o serviço de autenticação na porta 3007 estão operacionais$/, async (context) => {
  const gw = await fetch(`${GATEWAY_URL}/services/auth/stats`).then(r => r.json()).catch(() => null);
  if (!gw || !gw.success) {
    throw new Error(`Gateway na porta 3000 inacessível ou não respondeu em /services/auth/stats`);
  }
});

When(/^uma requisição GET é enviada para o Gateway no endpoint "([^"]*)"$/, async (context, endpoint) => {
  const response = await fetch(`${GATEWAY_URL}${endpoint}`);
  context.gwStatus = response.status;
  context.gwBody = await response.json();
});

Then(/^o status retornado pelo Gateway deve ser (\d+)$/, (context, expectedStatus) => {
  if (context.gwStatus !== parseInt(expectedStatus, 10)) {
    throw new Error(`Status esperado ${expectedStatus}, recebido: ${context.gwStatus}`);
  }
});

And(/^a resposta deve conter a contagem de "([^"]*)" maior ou igual a (\d+)$/, (context, field, minCount) => {
  const val = context.gwBody?.stats?.[field];
  if (val === undefined || val < parseInt(minCount, 10)) {
    throw new Error(`Campo ${field} tem valor ${val}, esperado >= ${minCount}`);
  }
});

Given(/^que o Gateway expõe o status do Circuit Breaker de e-mail$/, async () => {
  // Reseta o circuit breaker antes para estado limpo
  await fetch(`${GATEWAY_URL}/services/email/circuit-breaker/reset`, { method: 'POST' });
});

When(/^eu consulto o endpoint do Gateway "([^"]*)"$/, async (context, endpoint) => {
  const response = await fetch(`${GATEWAY_URL}${endpoint}`);
  context.cbStatus = response.status;
  context.cbBody = await response.json();
});

Then(/^o status do Circuit Breaker deve ser "([^"]*)"$/, (context, expectedState) => {
  const state = context.cbBody?.circuitBreaker?.state;
  if (state !== expectedState) {
    throw new Error(`Estado do Circuit Breaker divergente: esperado "${expectedState}", recebido "${state}"`);
  }
});

And(/^o número de falhas registradas deve ser zero após o reset$/, (context) => {
  const failureCount = context.cbBody?.circuitBreaker?.failureCount;
  if (failureCount !== 0) {
    throw new Error(`Contagem de falhas deveria ser 0, recebido: ${failureCount}`);
  }
});
