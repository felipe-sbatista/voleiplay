import { TeamCategory } from './team.model';

export type TournamentFormat = 'single_elimination' | 'groups_and_knockout' | 'round_robin';

export interface TournamentGroup {
  name: string;
  teamIds: string[];
}

export interface Tournament {
  id: string;
  name: string;
  subtitle: string;
  edition: string;
  location: string;
  season: string;
  format: TournamentFormat;
  category: TeamCategory;
  sportId?: string;
  status: 'draft' | 'in_progress' | 'completed';
  currentStage: string;
  groups?: TournamentGroup[];
  championTeamId?: string | null;
  runnerUpTeamId?: string | null;
  thirdPlaceTeamId?: string | null;
  bannerImage?: string;
  createdAt: string;
}
