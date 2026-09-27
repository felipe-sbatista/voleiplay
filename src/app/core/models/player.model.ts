export type PlayerPosition =
  | 'Bloqueador'
  | 'Defensor'
  | 'Levantador'
  | 'Ponteiro'
  | 'Oposto'
  | 'Líbero'
  | 'Completo'
  | (string & {});

export interface PlayerStats {
  matches: number;
  wins: number;
  pointsScored: number;
  mvps: number;
}

export interface Player {
  id: string;
  name: string;
  nickname?: string;
  gender: 'M' | 'F' | 'Misto';
  position: PlayerPosition;
  skillLevel: number; // 1 to 5
  height?: number; // cm
  dominantHand: 'Destro' | 'Canhoto' | 'Ambidestro';
  avatar?: string;
  teamId?: string | null;
  bio?: string;
  stats: PlayerStats;
}
