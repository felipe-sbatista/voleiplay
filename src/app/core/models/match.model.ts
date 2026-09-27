import { Team } from './team.model';

export type MatchStage = 
  | 'groups' 
  | 'round_32' 
  | 'round_16' 
  | 'quarterfinals' 
  | 'semifinals' 
  | 'third_place' 
  | 'finals';

export interface MatchSet {
  setNumber: number;
  team1Score: number;
  team2Score: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  stage: MatchStage;
  stageName: string;
  roundIndex: number;
  matchIndex: number;
  groupName?: string;
  team1Id: string | null;
  team2Id: string | null;
  team1?: Team;
  team2?: Team;
  team1Sets: number;
  team2Sets: number;
  sets: MatchSet[];
  status: 'scheduled' | 'live' | 'finished';
  winnerId: string | null;
  court?: string;
  scheduledTime?: string;
  mvpPlayerName?: string;
  nextMatchId?: string | null;
  nextMatchSlot?: 1 | 2;
}
