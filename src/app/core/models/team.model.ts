import { Player } from './player.model';

export type TeamCategory = 'Dupla (2x2)' | 'Trio (3x3)' | 'Quarteto (4x4)' | 'Sexteto (6x6)' | 'Outro';

export interface TeamStats {
  matches: number;
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsRatio: number;
  tournamentPoints: number;
}

export interface Team {
  id: string;
  name: string;
  category: TeamCategory;
  city?: string;
  country?: string;
  flag?: string;
  color?: string;
  avatarUrl?: string;
  seed?: number;
  playerIds: string[];
  players?: Player[];
  stats: TeamStats;
  createdAt: string;
}
