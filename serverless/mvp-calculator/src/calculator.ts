import {
  MatchInput,
  ProcessedPlayerStats,
  MatchSummary,
  MVPCalculationResponse,
  RawPlayerStats
} from './types.js';

/**
 * Calcula a eficiência de ataque (Attack Efficiency %)
 * Fórmula padrão FIVB / Vôlei de Praia:
 * Efficiency = ((Ataques Certos - Erros de Ataque) / Total de Tentativas) * 100
 */
export function calculateAttackEfficiency(stats: RawPlayerStats): number {
  if (!stats.totalAttacks || stats.totalAttacks <= 0) return 0;
  const netKills = stats.kills - stats.attackErrors;
  const efficiency = (netKills / stats.totalAttacks) * 100;
  return Number(efficiency.toFixed(1));
}

/**
 * Calcula a pontuação ponderada de MVP da partida:
 * Pesos positivos:
 * - Ace: +3.0 pontos (ponto direto de saque)
 * - Bloqueio: +3.0 pontos (ponto direto de bloqueio)
 * - Ataque (Kill): +2.0 pontos (conversão ofensiva)
 * - Defesa (Dig): +1.5 pontos (continuidade de jogo)
 * 
 * Penalidades (pesos negativos):
 * - Erro Não Forçado: -2.0 pontos
 * - Erro de Saque: -1.0 ponto
 */
export function calculateMvpScore(stats: RawPlayerStats): number {
  const positive =
    (stats.aces * 3.0) +
    (stats.blocks * 3.0) +
    (stats.kills * 2.0) +
    (stats.digs * 1.5);

  const penalties =
    (stats.unforcedErrors * 2.0) +
    (stats.serviceErrors * 1.0) +
    (stats.attackErrors * 1.5);

  const finalScore = positive - penalties;
  return Number(finalScore.toFixed(1));
}

/**
 * Processa a partida completa de forma pura e stateless
 */
export function processMatchStats(match: MatchInput, executionStartTime: number): MVPCalculationResponse {
  const allPlayers: ProcessedPlayerStats[] = [];

  for (const team of match.teams) {
    for (const player of team.players) {
      const efficiency = calculateAttackEfficiency(player.stats);
      const score = calculateMvpScore(player.stats);
      const totalPoints = player.stats.kills + player.stats.aces + player.stats.blocks;

      allPlayers.push({
        id: player.id,
        name: player.name,
        team: team.name,
        rawStats: player.stats,
        attackEfficiencyPct: efficiency,
        mvpScore: score,
        totalPointsScored: totalPoints,
        rank: 0
      });
    }
  }

  // Ordena por pontuação de MVP decrescente
  allPlayers.sort((a, b) => b.mvpScore - a.mvpScore);

  // Atribui posições no ranking
  allPlayers.forEach((player, idx) => {
    player.rank = idx + 1;
  });

  const mvpPlayer = allPlayers[0];

  // Identifica destaques
  const bestAttacker = [...allPlayers].sort((a, b) => b.attackEfficiencyPct - a.attackEfficiencyPct)[0];
  const bestBlocker = [...allPlayers].sort((a, b) => b.rawStats.blocks - a.rawStats.blocks)[0];
  const bestServer = [...allPlayers].sort((a, b) => b.rawStats.aces - a.rawStats.aces)[0];

  const totalMatchPoints = allPlayers.reduce((acc, p) => acc + p.totalPointsScored, 0);

  const mvpHighlights: string[] = [];
  if (mvpPlayer.rawStats.kills > 0) mvpHighlights.push(`${mvpPlayer.rawStats.kills} ataques`);
  if (mvpPlayer.rawStats.blocks > 0) mvpHighlights.push(`${mvpPlayer.rawStats.blocks} bloqueios`);
  if (mvpPlayer.rawStats.aces > 0) mvpHighlights.push(`${mvpPlayer.rawStats.aces} aces`);
  if (mvpPlayer.rawStats.digs > 0) mvpHighlights.push(`${mvpPlayer.rawStats.digs} defesas`);
  mvpHighlights.push(`Eficiência de ${mvpPlayer.attackEfficiencyPct}%`);

  const summary: MatchSummary = {
    mvp: {
      id: mvpPlayer.id,
      name: mvpPlayer.name,
      team: mvpPlayer.team,
      mvpScore: mvpPlayer.mvpScore,
      highlights: mvpHighlights
    },
    bestAttacker: {
      id: bestAttacker.id,
      name: bestAttacker.name,
      team: bestAttacker.team,
      efficiencyPct: bestAttacker.attackEfficiencyPct,
      kills: bestAttacker.rawStats.kills
    },
    bestBlocker: {
      id: bestBlocker.id,
      name: bestBlocker.name,
      team: bestBlocker.team,
      blocks: bestBlocker.rawStats.blocks
    },
    bestServer: {
      id: bestServer.id,
      name: bestServer.name,
      team: bestServer.team,
      aces: bestServer.rawStats.aces
    },
    totalMatchPoints
  };

  const executionTimeMs = Number((performance.now() - executionStartTime).toFixed(2));

  return {
    success: true,
    matchId: match.matchId,
    tournament: match.tournament || 'Circuito VoleiPlay',
    processedAt: new Date().toISOString(),
    executionTimeMs,
    runtime: 'Cloudflare Worker / Serverless Edge',
    summary,
    leaderboard: allPlayers
  };
}
