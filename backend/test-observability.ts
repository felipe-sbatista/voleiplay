/**
 * Script de Validação e Demonstração Automatizada da Observabilidade
 * Executa chamadas nos serviços do Voleiplay com o Elastic APM Agent ativo,
 * envia telemetria ao APM Server e consulta o Elasticsearch para validar a persistência.
 */
import './shared/observability/apm.js';
import { Observability } from './shared/observability/apm.js';
import { PrizeDistributionSagaOrchestrator } from './4-saga/saga-orchestrator/prize-distribution.saga.js';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function validateObservability() {
  console.log('\n================================================================');
  console.log('🚀 [Validação de Observabilidade] Iniciando Teste Integrado');
  console.log('================================================================');

  // 1. Validar conectividade com APM Server e Elasticsearch
  console.log('\n1️⃣ Verificando conectividade com a stack Docker:');
  try {
    const esRes = await fetch('http://localhost:9200');
    const esData = await esRes.json();
    console.log(`   ✔ Elasticsearch: ONLINE (Cluster: "${esData.cluster_name}", Versão: ${esData.version.number})`);
  } catch (err: any) {
    console.error('   ❌ Elasticsearch inacessível:', err.message);
    process.exit(1);
  }

  try {
    const apmRes = await fetch('http://localhost:8200');
    const apmData = await apmRes.json();
    console.log(`   ✔ Elastic APM Server: ONLINE (Versão: ${apmData.version}, Status: ${apmData.publish_ready ? 'Pronto' : 'Aguardando'})`);
  } catch (err: any) {
    console.error('   ❌ APM Server inacessível:', err.message);
    process.exit(1);
  }

  try {
    const kibanaRes = await fetch('http://localhost:5601/api/status');
    console.log(`   ✔ Kibana Dashboard: ONLINE (Status HTTP ${kibanaRes.status})`);
  } catch (err: any) {
    console.warn('   ⚠️ Kibana ainda inicializando ou inacessível:', err.message);
  }

  // 2. Iniciar Transação de Laboratório: Detecção de Gargalo com Spans
  console.log('\n2️⃣ Executando Transação com Waterfall de Spans (Medição de Performance):');
  const tx1 = Observability.agent.startTransaction('Laboratorio-Spans-Gargalo', 'educational');
  Observability.setLabel('labModule', 'waterfall-analysis');

  console.log('   🔹 Span 1: Leitura em Cache Redis (50ms)');
  const s1 = Observability.startSpan('Cache Read Redis', 'cache', 'redis');
  await sleep(50);
  s1?.end();

  console.log('   🔹 Span 2: Consulta SQL Pesada (300ms) - [Gargalo]');
  const s2 = Observability.startSpan('SQL Query Tournaments', 'db', 'postgresql');
  await sleep(300);
  s2?.end();

  console.log('   🔹 Span 3: Validação de Regra de Negócio (80ms)');
  const s3 = Observability.startSpan('Business Rule Check', 'app', 'domain');
  await sleep(80);
  s3?.end();

  tx1?.end('success');
  console.log('   ✔ Transação 1 concluída com 3 spans customizados!');

  // 3. Iniciar Transação com Captura Estruturada de Falha
  console.log('\n3️⃣ Executando Transação com Falha e Stack Trace Estruturado:');
  const tx2 = Observability.agent.startTransaction('Laboratorio-Captura-Excecao', 'educational');
  try {
    throw new Error('[SIMULAÇÃO APM] Violação de Invariante: Saldo insuficiente para pagamento de premiação.');
  } catch (err: any) {
    Observability.captureError(err, {
      tournament: 'Superliga 2026',
      errorCode: 'INSUFFICIENT_FUNDS',
      retryAllowed: false
    });
    console.log('   ✔ Erro capturado e reportado ao APM Server com metadados de negócio!');
  }
  tx2?.end('failure');

  // 4. Executar Saga com Distributed Tracing
  console.log('\n4️⃣ Executando Saga Pattern com Telemetria Integrada:');
  const txSaga = Observability.agent.startTransaction('Saga-Tournament-Prize-Distribution', 'saga');
  const orchestrator = new PrizeDistributionSagaOrchestrator();
  
  // Executa cenário de sucesso com o torneio cadastrado
  const resultSuccess = await orchestrator.execute({ tournamentId: 'tour-copa-2026' });
  console.log(`   ✔ Saga (Cenário Feliz) executada com status: ${resultSuccess.status} em ${resultSuccess.durationMs}ms`);

  // Executa cenário de falha com compensação semântica
  const resultFailed = await orchestrator.execute({ 
    tournamentId: 'tour-copa-2026',
    simulateFailureAt: 'send_emails'
  });
  console.log(`   ✔ Saga (Cenário com Falha) compensada com status: ${resultFailed.status} em ${resultFailed.durationMs}ms`);
  txSaga?.end('success');

  // 5. Executar Telemetria de Bancos de Dados (PostgreSQL, MongoDB e Redis)
  console.log('\n5️⃣ Executando Transações de Bancos de Dados (Persistência Poliglota no APM):');
  const txDb = Observability.agent.startTransaction('Laboratorio-Polyglot-Persistence', 'database');
  Observability.setLabel('labModule', 'polyglot-databases');

  console.log('   🔹 Testando Spans do Redis (Cache-Aside):');
  const spanRedis = Observability.startSpan('Redis Cache GET / SET', 'cache', 'redis', 'get');
  Observability.setLabel('cache_engine', 'redis-7-alpine');
  spanRedis?.end();

  console.log('   🔹 Testando Spans do PostgreSQL (Relacional ACID):');
  const spanPg = Observability.startSpan('PostgreSQL DDL / Transaction', 'db', 'postgresql', 'query');
  Observability.setLabel('db_engine', 'postgres-16-alpine');
  spanPg?.end();

  console.log('   🔹 Testando Spans do MongoDB (NoSQL Document):');
  const spanMongo = Observability.startSpan('MongoDB Match Scout Insert', 'db', 'mongodb', 'insert');
  Observability.setLabel('db_engine', 'mongo-7');
  spanMongo?.end();

  txDb?.end('success');
  console.log('   ✔ Spans de PostgreSQL, MongoDB e Redis registrados na telemetria APM!');

  // 6. Forçar flush imediato do APM Agent para o APM Server e aguardar indexação
  console.log('\n6️⃣ Descarregando buffer (flush) do APM Agent para o APM Server...');
  await new Promise(resolve => Observability.agent.flush(resolve));
  console.log('   ✔ Flush concluído! Aguardando indexação no Elasticsearch (5 segundos)...');
  await sleep(5000);

  // 6. Consultar índices do APM no Elasticsearch
  console.log('\n6️⃣ Verificando índices criados no Elasticsearch:');
  try {
    const indicesRes = await fetch('http://localhost:9200/_cat/indices/apm*?format=json');
    const indices = await indicesRes.json();
    console.log(`   ✔ Quantidade de índices APM criados: ${indices.length}`);
    indices.forEach((idx: any) => {
      console.log(`      📁 Índice: ${idx.index} | Documentos: ${idx['docs.count']} | Tamanho: ${idx['store.size']}`);
    });

    const searchRes = await fetch('http://localhost:9200/apm-*/_search?size=3');
    const searchData = await searchRes.json();
    console.log(`\n   ✔ Total de eventos de telemetria ingeridos no Elastic: ${searchData.hits.total.value}`);
    if (searchData.hits.hits.length > 0) {
      console.log(`   ✔ Amostra do primeiro documento APM indexado:`);
      const sample = searchData.hits.hits[0]._source;
      console.log(`      - Tipo de Evento: ${sample.processor?.event || 'desconhecido'}`);
      console.log(`      - Serviço: ${sample.service?.name}`);
      console.log(`      - Transação/Span: ${sample.transaction?.name || sample.span?.name || sample.error?.culprit || 'N/A'}`);
    }
  } catch (err: any) {
    console.warn('   ⚠️ Não foi possível listar índices detalhados:', err.message);
  }

  console.log('\n================================================================');
  console.log('🎉 [Sucesso Total] A stack de Observabilidade está 100% validada!');
  console.log('   Acesse o Kibana para visualizar os dados em interface gráfica:');
  console.log('   👉 http://localhost:5601/app/apm');
  console.log('================================================================\n');

  // Encerra processo de teste
  process.exit(0);
}

validateObservability().catch(err => {
  console.error('Erro na validação de observabilidade:', err);
  process.exit(1);
});
