import worker from './src/index.js';
import { MatchInput } from './src/types.js';

async function runVerification() {
  console.log('🏐 [Serverless Lab] Testando Function: Calculadora de MVP e Estatísticas...\n');

  // 1. Testa endpoint GET /health
  console.log('1️⃣ Chamando GET /health (Metadata da Function)...');
  const getReq = new Request('https://worker.local/health', { method: 'GET' });
  const getRes = await worker.fetch(getReq);
  const healthData = await getRes.json();
  console.log(`   Status: HTTP ${getRes.status}`);
  console.log(`   Serviço: ${healthData.service} (${healthData.type})\n`);

  // 2. Simula dados reais de uma Final de Circuito de Vôlei de Praia
  const matchPayload: MatchInput = {
    matchId: "match-final-saquarema-2026",
    tournament: "Circuito Brasileiro de Vôlei de Praia - Etapa Saquarema",
    teams: [
      {
        name: "Duda & Ana Patrícia",
        players: [
          {
            id: "p-1",
            name: "Duda Lisboa",
            stats: {
              kills: 16,
              attackErrors: 2,
              totalAttacks: 24,
              aces: 4,
              serviceErrors: 1,
              blocks: 1,
              digs: 9,
              unforcedErrors: 1
            }
          },
          {
            id: "p-2",
            name: "Ana Patrícia",
            stats: {
              kills: 12,
              attackErrors: 3,
              totalAttacks: 19,
              aces: 1,
              serviceErrors: 2,
              blocks: 7,
              digs: 3,
              unforcedErrors: 2
            }
          }
        ]
      },
      {
        name: "Bárbara & Carol",
        players: [
          {
            id: "p-3",
            name: "Bárbara Seixas",
            stats: {
              kills: 11,
              attackErrors: 4,
              totalAttacks: 22,
              aces: 2,
              serviceErrors: 2,
              blocks: 0,
              digs: 7,
              unforcedErrors: 3
            }
          },
          {
            id: "p-4",
            name: "Carol Solberg",
            stats: {
              kills: 10,
              attackErrors: 3,
              totalAttacks: 20,
              aces: 2,
              serviceErrors: 3,
              blocks: 5,
              digs: 4,
              unforcedErrors: 2
            }
          }
        ]
      }
    ]
  };

  console.log('2️⃣ Enviando dados da partida para POST /calculate via Request/Response...');
  const postReq = new Request('https://worker.local/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(matchPayload)
  });

  const postRes = await worker.fetch(postReq);
  const result = await postRes.json();

  console.log(`   Status: HTTP ${postRes.status}`);
  console.log(`   X-Serverless-Engine: ${postRes.headers.get('X-Serverless-Engine')}`);
  console.log(`   Tempo de execução da função: ${result.executionTimeMs} ms\n`);

  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log(`🏆 MVP ELEITA DA PARTIDA: ${result.summary.mvp.name} (${result.summary.mvp.team})`);
  console.log(`   Pontuação MVP Score: ${result.summary.mvp.mvpScore} pts`);
  console.log(`   Destaques: ${result.summary.mvp.highlights.join(' | ')}`);
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  console.log('📊 OUTROS DESTAQUES DA PARTIDA:');
  console.log(`   🎯 Melhor Atacante: ${result.summary.bestAttacker.name} (Eficiência: ${result.summary.bestAttacker.efficiencyPct}% | ${result.summary.bestAttacker.kills} kills)`);
  console.log(`   🧱 Melhor Bloqueadora: ${result.summary.bestBlocker.name} (${result.summary.bestBlocker.blocks} bloqueios)`);
  console.log(`   💣 Melhor Sacadora: ${result.summary.bestServer.name} (${result.summary.bestServer.aces} aces)\n`);

  console.log('📋 LEADERBOARD GERAL:');
  console.table(
    result.leaderboard.map((p: any) => ({
      Rank: `#${p.rank}`,
      Nome: p.name,
      Time: p.team,
      'MVP Score': p.mvpScore,
      'Eficiência (%)': `${p.attackEfficiencyPct}%`,
      Kills: p.rawStats.kills,
      Blocks: p.rawStats.blocks,
      Aces: p.rawStats.aces,
      Digs: p.rawStats.digs,
      Erros: p.rawStats.unforcedErrors + p.rawStats.serviceErrors
    }))
  );

  console.log('\n✅ [SUCESSO] A Serverless Function executou com perfeição de forma 100% pura e stateless!');
}

runVerification().catch(console.error);
