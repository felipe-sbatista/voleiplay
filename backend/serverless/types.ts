export interface RawPlayerStats {
  kills: number;           // Ataques convertidos em ponto
  attackErrors: number;    // Ataques na rede ou para fora
  totalAttacks: number;    // Total de tentativas de ataque
  aces: number;            // Pontos diretos de saque
  serviceErrors: number;   // Saques na rede ou para fora
  blocks: number;          // Bloqueios convertidos em ponto
  digs: number;            // Defesas bem-sucedidas na areia
  unforcedErrors: number;  // Erros não forçados gerais
}

export interface PlayerInput {
  id: string;
  name: string;
  stats: RawPlayerStats;
}

export interface TeamInput {
  name: string;
  players: PlayerInput[];
}

export interface MatchInput {
  matchId: string;
  tournament?: string;
  teams: TeamInput[];
}

export interface ProcessedPlayerStats {
  id: string;
  name: string;
  team: string;
  rawStats: RawPlayerStats;
  attackEfficiencyPct: number; // ((kills - errors) / total) * 100
  mvpScore: number;            // Pontuação ponderada de MVP
  totalPointsScored: number;   // kills + aces + blocks
  rank: number;
}

export interface MatchSummary {
  mvp: {
    id: string;
    name: string;
    team: string;
    mvpScore: number;
    highlights: string[];
  };
  bestAttacker: {
    id: string;
    name: string;
    team: string;
    efficiencyPct: number;
    kills: number;
  };
  bestBlocker: {
    id: string;
    name: string;
    team: string;
    blocks: number;
  };
  bestServer: {
    id: string;
    name: string;
    team: string;
    aces: number;
  };
  totalMatchPoints: number;
}

export interface MVPCalculationResponse {
  success: boolean;
  matchId: string;
  tournament: string;
  processedAt: string;
  executionTimeMs: number;
  runtime: string;
  summary: MatchSummary;
  leaderboard: ProcessedPlayerStats[];
}
