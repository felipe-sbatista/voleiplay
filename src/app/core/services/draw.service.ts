import { Injectable } from '@angular/core';
import { Player } from '../models/player.model';
import { Team, TeamCategory } from '../models/team.model';
import { Match, MatchStage } from '../models/match.model';
import { Tournament } from '../models/tournament.model';

const TEAM_NAMES_PRESETS = [
  'Tubarões da Areia',
  'Águias da Praia',
  'Furacão Volley',
  'Bloqueio Dourado',
  'Beach Kings',
  'Saque Atômico',
  'Vôlei Raiz',
  'Vortex Pro',
  'Tempestade na Rede',
  'Copa Kings',
  'Trovão da Praia',
  'Guerreiros da Areia',
  'Rede Elétrica',
  'Paredão Carioca',
  'Maresia Volley',
  'Sol & Areia BPT'
];

const TEAM_COLORS = [
  '#D4F63D', // Volt
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#6366F1'  // Indigo
];

@Injectable({
  providedIn: 'root'
})
export class DrawService {

  // --- 1. Sorteador de Times a partir de Jogadores ---
  drawTeamsFromPlayers(
    players: Player[],
    teamSize: number = 2,
    mode: 'random' | 'balanced_skill' = 'balanced_skill',
    category: TeamCategory = 'Dupla (2x2)',
    sportPositions: string[] = []
  ): { name: string; category: TeamCategory; color: string; playerIds: string[] }[] {
    if (!players.length) return [];

    let workingPool = [...players];

    if (mode === 'random') {
      workingPool = this.shuffleArray(workingPool);
    } else {
      // Balanced skill: Sort descending by skill level. If sport positions exist, group by them first.
      workingPool.sort((a, b) => b.skillLevel - a.skillLevel);
    }

    const numTeams = Math.floor(workingPool.length / teamSize);
    if (numTeams === 0) return [];

    const teams: { name: string; category: TeamCategory; color: string; playerIds: string[] }[] = [];

    for (let i = 0; i < numTeams; i++) {
      const name = TEAM_NAMES_PRESETS[i % TEAM_NAMES_PRESETS.length] + (i >= TEAM_NAMES_PRESETS.length ? ` #${i + 1}` : '');
      const color = TEAM_COLORS[i % TEAM_COLORS.length];
      teams.push({
        name,
        category,
        color,
        playerIds: []
      });
    }

    if (mode === 'balanced_skill') {
      if (sportPositions && sportPositions.length > 0) {
        workingPool.sort((a, b) => {
          const posA = sportPositions.indexOf(a.position);
          const posB = sportPositions.indexOf(b.position);
          if (posA !== posB) return posA - posB;
          return b.skillLevel - a.skillLevel;
        });
      }
      
      // Snake distribution (0, 1, 2... N-1, N-1, ... 1, 0)
      let teamIndex = 0;
      let forward = true;
      for (const player of workingPool.slice(0, numTeams * teamSize)) {
        teams[teamIndex].playerIds.push(player.id);
        if (forward) {
          if (teamIndex === numTeams - 1) {
            forward = false;
          } else {
            teamIndex++;
          }
        } else {
          if (teamIndex === 0) {
            forward = true;
          } else {
            teamIndex--;
          }
        }
      }
    } else {
      // Direct chunking
      for (let i = 0; i < numTeams; i++) {
        const slice = workingPool.slice(i * teamSize, (i + 1) * teamSize);
        teams[i].playerIds = slice.map(p => p.id);
      }
    }

    return teams;
  }

  // --- 2. Geração e Sorteio de Chaves de Torneio (Brackets) ---
  generateSingleEliminationBracket(
    teams: Team[],
    tournamentId: string,
    isSeeded: boolean = true
  ): Match[] {
    if (teams.length < 2) return [];

    // Determine bracket power of 2 (4, 8, 16, 32)
    const bracketSize = this.getNextPowerOfTwo(Math.max(4, teams.length));
    
    // Sort or shuffle teams
    let orderedTeams: (Team | null)[] = [];
    if (isSeeded) {
      // Sort by seed or rating
      const sorted = [...teams].sort((a, b) => (a.seed || 999) - (b.seed || 999));
      orderedTeams = this.applyStandardTournamentSeeding(sorted, bracketSize);
    } else {
      orderedTeams = this.shuffleArray([...teams]);
      while (orderedTeams.length < bracketSize) {
        orderedTeams.push(null);
      }
    }

    const totalRounds = Math.log2(bracketSize);
    const matches: Match[] = [];

    // Build rounds starting from final down to first round
    // We will build matches from Round 0 (First round) up to Final
    const roundStageNames: { [numTeamsInRound: number]: { stage: MatchStage; name: string } } = {
      32: { stage: 'round_32', name: 'Dezesseis-avos de Final' },
      16: { stage: 'round_16', name: 'Oitavas de Final' },
      8: { stage: 'quarterfinals', name: 'Quartas de Final' },
      4: { stage: 'semifinals', name: 'Semifinais' },
      2: { stage: 'finals', name: 'Grande Final Ouro' }
    };

    // Store references to link nextMatchId
    const matchesByRound: Match[][] = [];

    for (let r = 0; r < totalRounds; r++) {
      const teamsInRound = Math.pow(2, totalRounds - r);
      const matchesInRoundCount = teamsInRound / 2;
      const stageInfo = roundStageNames[teamsInRound] || { stage: 'round_16', name: `Rodada ${r + 1}` };
      const currentRoundMatches: Match[] = [];

      for (let m = 0; m < matchesInRoundCount; m++) {
        const matchId = `m-r${r}-m${m}-${Date.now().toString(36)}`;
        let team1Id: string | null = null;
        let team2Id: string | null = null;

        if (r === 0) {
          // First round pairs
          const t1 = orderedTeams[m * 2];
          const t2 = orderedTeams[m * 2 + 1];
          team1Id = t1 ? t1.id : null;
          team2Id = t2 ? t2.id : null;
        }

        const match: Match = {
          id: matchId,
          tournamentId,
          stage: stageInfo.stage,
          stageName: stageInfo.name,
          roundIndex: r,
          matchIndex: m,
          team1Id,
          team2Id,
          team1Sets: 0,
          team2Sets: 0,
          sets: [],
          status: 'scheduled',
          winnerId: null,
          court: `Quadra ${(m % 3) + 1}`,
          scheduledTime: `${10 + r * 2}:${m % 2 === 0 ? '00' : '45'}`
        };

        currentRoundMatches.push(match);
      }
      matchesByRound.push(currentRoundMatches);
    }

    // Link nextMatchId between rounds
    for (let r = 0; r < totalRounds - 1; r++) {
      const currentRound = matchesByRound[r];
      const nextRound = matchesByRound[r + 1];

      for (let m = 0; m < currentRound.length; m++) {
        const nextMatchIndex = Math.floor(m / 2);
        const slot = (m % 2 === 0 ? 1 : 2) as 1 | 2;
        currentRound[m].nextMatchId = nextRound[nextMatchIndex].id;
        currentRound[m].nextMatchSlot = slot;
      }
    }

    // Add 3rd Place Match (Disputa de Bronze)
    const thirdPlaceMatch: Match = {
      id: `m-third-${Date.now().toString(36)}`,
      tournamentId,
      stage: 'third_place',
      stageName: 'Disputa de Bronze (3º Lugar)',
      roundIndex: totalRounds - 1,
      matchIndex: 1,
      team1Id: null,
      team2Id: null,
      team1Sets: 0,
      team2Sets: 0,
      sets: [],
      status: 'scheduled',
      winnerId: null,
      court: 'Quadra Central (Rede 2)',
      scheduledTime: `${10 + (totalRounds - 1) * 2}:00`
    };

    // Flatten all matches
    const allMatches = matchesByRound.flat();
    allMatches.push(thirdPlaceMatch);

    return allMatches;
  }

  // --- 3. Geração de Fase de Grupos (Pool Play - Beach Pro Tour) ---
  generateGroupStageMatches(
    teams: Team[],
    tournamentId: string,
    groupSize: number = 4
  ): { groups: { name: string; teamIds: string[] }[]; matches: Match[] } {
    const shuffled = this.shuffleArray([...teams]);
    const numGroups = Math.ceil(shuffled.length / groupSize);
    const groups: { name: string; teamIds: string[] }[] = [];
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let g = 0; g < numGroups; g++) {
      const groupTeams = shuffled.slice(g * groupSize, (g + 1) * groupSize);
      groups.push({
        name: `Grupo ${alphabet[g]}`,
        teamIds: groupTeams.map(t => t.id)
      });
    }

    const matches: Match[] = [];
    let matchCounter = 0;

    groups.forEach(group => {
      const groupTeamIds = group.teamIds;
      // Round robin inside group
      for (let i = 0; i < groupTeamIds.length; i++) {
        for (let j = i + 1; j < groupTeamIds.length; j++) {
          matches.push({
            id: `m-grp-${matchCounter++}-${Date.now().toString(36)}`,
            tournamentId,
            stage: 'groups',
            stageName: `${group.name} - Rodada`,
            roundIndex: 0,
            matchIndex: matchCounter,
            groupName: group.name,
            team1Id: groupTeamIds[i],
            team2Id: groupTeamIds[j],
            team1Sets: 0,
            team2Sets: 0,
            sets: [],
            status: 'scheduled',
            winnerId: null,
            court: `Quadra ${(matchCounter % 4) + 1}`,
            scheduledTime: `${9 + (matchCounter % 5)}:${(matchCounter % 2) * 30}`
          });
        }
      }
    });

    return { groups, matches };
  }

  // --- Helpers ---
  private shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private getNextPowerOfTwo(n: number): number {
    let p = 2;
    while (p < n) {
      p *= 2;
    }
    return p;
  }

  private applyStandardTournamentSeeding(teams: (Team | null)[], bracketSize: number): (Team | null)[] {
    const result: (Team | null)[] = new Array(bracketSize).fill(null);
    const seeds = this.getBracketSeedPattern(bracketSize);
    for (let i = 0; i < bracketSize; i++) {
      const seedIndex = seeds[i] - 1;
      result[i] = teams[seedIndex] || null;
    }
    return result;
  }

  private getBracketSeedPattern(size: number): number[] {
    let pattern = [1, 2];
    while (pattern.length < size) {
      const next: number[] = [];
      const sum = pattern.length * 2 + 1;
      for (const seed of pattern) {
        next.push(seed);
        next.push(sum - seed);
      }
      pattern = next;
    }
    return pattern;
  }
}
