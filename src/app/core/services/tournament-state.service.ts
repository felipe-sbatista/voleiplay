import { Injectable, signal, computed, effect } from '@angular/core';
import { Player } from '../models/player.model';
import { Team, TeamCategory } from '../models/team.model';
import { Match, MatchSet } from '../models/match.model';
import { Tournament, TournamentFormat } from '../models/tournament.model';
import { Sport, PRESET_SPORTS } from '../models/sport.model';
import { INITIAL_PLAYERS, INITIAL_TEAMS, INITIAL_MATCHES, INITIAL_TOURNAMENT, INITIAL_SPORTS } from './mock-data';

const STORAGE_KEYS = {
  PLAYERS: 'voleiplay_players_v1',
  TEAMS: 'voleiplay_teams_v1',
  MATCHES: 'voleiplay_matches_v1',
  TOURNAMENT: 'voleiplay_tournament_v1',
  SPORTS: 'voleiplay_sports_v1'
};

@Injectable({
  providedIn: 'root'
})
export class TournamentStateService {
  // Primary Signals
  readonly players = signal<Player[]>(this.loadFromStorage(STORAGE_KEYS.PLAYERS, INITIAL_PLAYERS));
  readonly teams = signal<Team[]>(this.loadFromStorage(STORAGE_KEYS.TEAMS, INITIAL_TEAMS));
  readonly matches = signal<Match[]>(this.loadFromStorage(STORAGE_KEYS.MATCHES, INITIAL_MATCHES));
  readonly tournament = signal<Tournament>(this.loadFromStorage(STORAGE_KEYS.TOURNAMENT, INITIAL_TOURNAMENT));
  readonly sports = signal<Sport[]>(this.loadFromStorage(STORAGE_KEYS.SPORTS, INITIAL_SPORTS));

  // Search & Filter state
  readonly playerSearchQuery = signal<string>('');
  readonly teamSearchQuery = signal<string>('');
  readonly selectedCategoryFilter = signal<string>('all');

  // Computed signals
  readonly activeSport = computed<Sport>(() => {
    const t = this.tournament();
    const sports = this.sports();
    return sports.find(s => s.id === t.sportId) || sports[0] || INITIAL_SPORTS[0];
  });

  // Computed signals
  readonly teamsWithPlayers = computed(() => {
    const playerMap = new Map(this.players().map(p => [p.id, p]));
    return this.teams().map(team => ({
      ...team,
      players: (team.playerIds || []).map(id => playerMap.get(id)).filter((p): p is Player => !!p)
    }));
  });

  readonly availableFreeAgents = computed(() => {
    return this.players().filter(p => !p.teamId);
  });

  readonly matchesWithTeams = computed(() => {
    const teamMap = new Map(this.teamsWithPlayers().map(t => [t.id, t]));
    return this.matches().map(m => ({
      ...m,
      team1: m.team1Id ? teamMap.get(m.team1Id) : undefined,
      team2: m.team2Id ? teamMap.get(m.team2Id) : undefined
    }));
  });

  readonly leaderboard = computed(() => {
    const teams = [...this.teamsWithPlayers()];
    return teams.sort((a, b) => {
      // 1. Tournament Points / Wins
      if (b.stats.wins !== a.stats.wins) {
        return b.stats.wins - a.stats.wins;
      }
      // 2. Set difference / ratio
      const setDiffB = b.stats.setsWon - b.stats.setsLost;
      const setDiffA = a.stats.setsWon - a.stats.setsLost;
      if (setDiffB !== setDiffA) {
        return setDiffB - setDiffA;
      }
      // 3. Points ratio
      return (b.stats.pointsRatio || 0) - (a.stats.pointsRatio || 0);
    });
  });

  readonly tournamentStats = computed(() => {
    const matches = this.matches();
    const finishedMatches = matches.filter(m => m.status === 'finished');
    const liveMatches = matches.filter(m => m.status === 'live');
    const totalPointsScored = matches.reduce((acc, m) => {
      return acc + (m.sets || []).reduce((setAcc, s) => setAcc + s.team1Score + s.team2Score, 0);
    }, 0);

    return {
      totalTeams: this.teams().length,
      totalPlayers: this.players().length,
      totalMatches: matches.length,
      finishedMatches: finishedMatches.length,
      liveMatches: liveMatches.length,
      totalPointsScored
    };
  });

  constructor() {
    // Auto sync to LocalStorage
    effect(() => {
      this.saveToStorage(STORAGE_KEYS.PLAYERS, this.players());
    });
    effect(() => {
      this.saveToStorage(STORAGE_KEYS.TEAMS, this.teams());
    });
    effect(() => {
      this.saveToStorage(STORAGE_KEYS.MATCHES, this.matches());
    });
    effect(() => {
      this.saveToStorage(STORAGE_KEYS.TOURNAMENT, this.tournament());
    });
    effect(() => {
      this.saveToStorage(STORAGE_KEYS.SPORTS, this.sports());
    });
  }

  // --- Sports CRUD ---
  addSport(sportData: Omit<Sport, 'id' | 'isPreset'>): Sport {
    const newSport: Sport = {
      ...sportData,
      id: `sport-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isPreset: false
    };
    this.sports.update(list => [...list, newSport]);
    return newSport;
  }

  updateSport(id: string, updates: Partial<Sport>): void {
    this.sports.update(list =>
      list.map(s => s.id === id ? { ...s, ...updates } : s)
    );
  }

  deleteSport(id: string): void {
    const sportToDelete = this.sports().find(s => s.id === id);
    if (sportToDelete?.isPreset) {
      console.warn('Cannot delete preset sport');
      return;
    }
    this.sports.update(list => list.filter(s => s.id !== id));
  }

  // --- Players CRUD ---
  addPlayer(playerData: Omit<Player, 'id' | 'stats'>): Player {
    const newPlayer: Player = {
      ...playerData,
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      stats: { matches: 0, wins: 0, pointsScored: 0, mvps: 0 }
    };
    this.players.update(list => [newPlayer, ...list]);
    return newPlayer;
  }

  updatePlayer(id: string, updates: Partial<Player>): void {
    this.players.update(list => 
      list.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  }

  deletePlayer(id: string): void {
    // Also remove player from any assigned team
    this.teams.update(teams => 
      teams.map(t => ({
        ...t,
        playerIds: (t.playerIds || []).filter(pid => pid !== id)
      }))
    );
    this.players.update(list => list.filter(p => p.id !== id));
  }

  // --- Teams CRUD ---
  addTeam(teamData: Omit<Team, 'id' | 'stats' | 'createdAt'>): Team {
    const newTeam: Team = {
      ...teamData,
      id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      stats: {
        matches: 0,
        wins: 0,
        losses: 0,
        setsWon: 0,
        setsLost: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointsRatio: 1.0,
        tournamentPoints: 0
      },
      createdAt: new Date().toISOString()
    };

    // Update players to associate them with this team
    if (newTeam.playerIds?.length) {
      this.players.update(players =>
        players.map(p => newTeam.playerIds.includes(p.id) ? { ...p, teamId: newTeam.id } : p)
      );
    }

    this.teams.update(list => [newTeam, ...list]);
    return newTeam;
  }

  updateTeam(id: string, updates: Partial<Team>): void {
    this.teams.update(list =>
      list.map(t => {
        if (t.id !== id) return t;
        const updated = { ...t, ...updates };
        if (updates.playerIds) {
          // Sync player associations
          this.players.update(players =>
            players.map(p => {
              if (updates.playerIds?.includes(p.id)) {
                return { ...p, teamId: id };
              } else if (p.teamId === id) {
                return { ...p, teamId: null };
              }
              return p;
            })
          );
        }
        return updated;
      })
    );
  }

  deleteTeam(id: string): void {
    // Unlink players
    this.players.update(players =>
      players.map(p => p.teamId === id ? { ...p, teamId: null } : p)
    );
    // Remove from matches or reset slots
    this.matches.update(matches =>
      matches.map(m => ({
        ...m,
        team1Id: m.team1Id === id ? null : m.team1Id,
        team2Id: m.team2Id === id ? null : m.team2Id,
        winnerId: m.winnerId === id ? null : m.winnerId
      }))
    );
    this.teams.update(list => list.filter(t => t.id !== id));
  }

  // --- Matches and Tournament Bracket Operations ---
  updateMatchScore(matchId: string, sets: MatchSet[], isLive = false): void {
    this.matches.update(matches => {
      return matches.map(m => {
        if (m.id !== matchId) return m;

        let team1Sets = 0;
        let team2Sets = 0;
        sets.forEach(s => {
          if (s.team1Score > s.team2Score && (s.team1Score >= 21 || (s.setNumber === 3 && s.team1Score >= 15))) {
            team1Sets++;
          } else if (s.team2Score > s.team1Score && (s.team2Score >= 21 || (s.setNumber === 3 && s.team2Score >= 15))) {
            team2Sets++;
          }
        });

        const status = isLive ? 'live' : m.status;
        return {
          ...m,
          sets,
          team1Sets,
          team2Sets,
          status
        };
      });
    });
  }

  finishMatch(matchId: string, sets: MatchSet[], mvpPlayerName?: string): void {
    const currentMatches = this.matches();
    const match = currentMatches.find(m => m.id === matchId);
    if (!match || !match.team1Id || !match.team2Id) return;

    let team1Sets = 0;
    let team2Sets = 0;
    let team1TotalPoints = 0;
    let team2TotalPoints = 0;

    sets.forEach(s => {
      team1TotalPoints += s.team1Score;
      team2TotalPoints += s.team2Score;
      if (s.team1Score > s.team2Score) {
        team1Sets++;
      } else if (s.team2Score > s.team1Score) {
        team2Sets++;
      }
    });

    const winnerId = team1Sets > team2Sets ? match.team1Id : match.team2Id;
    const loserId = team1Sets > team2Sets ? match.team2Id : match.team1Id;

    // 1. Update Match Record
    const updatedMatches = currentMatches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          sets,
          team1Sets,
          team2Sets,
          status: 'finished' as const,
          winnerId,
          mvpPlayerName: mvpPlayerName || m.mvpPlayerName
        };
      }
      return m;
    });

    // 2. Propagate Winner to Next Match Slot
    if (match.nextMatchId && match.nextMatchSlot) {
      const nextMatchIndex = updatedMatches.findIndex(m => m.id === match.nextMatchId);
      if (nextMatchIndex >= 0) {
        const nextMatch = { ...updatedMatches[nextMatchIndex] };
        if (match.nextMatchSlot === 1) {
          nextMatch.team1Id = winnerId;
        } else {
          nextMatch.team2Id = winnerId;
        }
        updatedMatches[nextMatchIndex] = nextMatch;
      }
    }

    // 3. If this was a Semifinal, propagate loser to 3rd place match if present
    if (match.stage === 'semifinals') {
      const thirdPlaceMatchIndex = updatedMatches.findIndex(m => m.stage === 'third_place');
      if (thirdPlaceMatchIndex >= 0) {
        const thirdMatch = { ...updatedMatches[thirdPlaceMatchIndex] };
        if (match.matchIndex === 0) {
          thirdMatch.team1Id = loserId;
        } else {
          thirdMatch.team2Id = loserId;
        }
        updatedMatches[thirdPlaceMatchIndex] = thirdMatch;
      }
    }

    // 4. If this was the Final, update champion and runner-up in tournament
    if (match.stage === 'finals') {
      this.tournament.update(t => ({
        ...t,
        status: 'completed',
        championTeamId: winnerId,
        runnerUpTeamId: loserId
      }));
    }

    if (match.stage === 'third_place') {
      this.tournament.update(t => ({
        ...t,
        thirdPlaceTeamId: winnerId
      }));
    }

    this.matches.set(updatedMatches);
    this.recalculateTeamStats();
  }

  recalculateTeamStats(): void {
    const matches = this.matches().filter(m => m.status === 'finished');
    const teamStatsMap = new Map<string, {
      matches: number;
      wins: number;
      losses: number;
      setsWon: number;
      setsLost: number;
      pointsFor: number;
      pointsAgainst: number;
    }>();

    // Initialize all teams
    this.teams().forEach(t => {
      teamStatsMap.set(t.id, {
        matches: 0,
        wins: 0,
        losses: 0,
        setsWon: 0,
        setsLost: 0,
        pointsFor: 0,
        pointsAgainst: 0
      });
    });

    matches.forEach(m => {
      if (!m.team1Id || !m.team2Id) return;
      const s1 = teamStatsMap.get(m.team1Id);
      const s2 = teamStatsMap.get(m.team2Id);
      if (!s1 || !s2) return;

      s1.matches++;
      s2.matches++;
      s1.setsWon += m.team1Sets;
      s1.setsLost += m.team2Sets;
      s2.setsWon += m.team2Sets;
      s2.setsLost += m.team1Sets;

      (m.sets || []).forEach(set => {
        s1.pointsFor += set.team1Score;
        s1.pointsAgainst += set.team2Score;
        s2.pointsFor += set.team2Score;
        s2.pointsAgainst += set.team1Score;
      });

      if (m.winnerId === m.team1Id) {
        s1.wins++;
        s2.losses++;
      } else if (m.winnerId === m.team2Id) {
        s2.wins++;
        s1.losses++;
      }
    });

    this.teams.update(teams =>
      teams.map(t => {
        const stats = teamStatsMap.get(t.id);
        if (!stats) return t;
        const pointsRatio = stats.pointsAgainst > 0 
          ? Number((stats.pointsFor / stats.pointsAgainst).toFixed(2)) 
          : (stats.pointsFor > 0 ? 2.0 : 1.0);
        const tournamentPoints = (stats.wins * 3) + stats.setsWon;

        return {
          ...t,
          stats: {
            ...stats,
            pointsRatio,
            tournamentPoints
          }
        };
      })
    );
  }

  setTournamentMatches(matches: Match[], tournamentUpdates?: Partial<Tournament>): void {
    this.matches.set(matches);
    if (tournamentUpdates) {
      this.tournament.update(t => ({ ...t, ...tournamentUpdates }));
    }
  }

  // --- Reset & Demo Data ---
  loadDemoData(): void {
    this.players.set(INITIAL_PLAYERS);
    this.teams.set(INITIAL_TEAMS);
    this.matches.set(INITIAL_MATCHES);
    this.tournament.set(INITIAL_TOURNAMENT);
    this.sports.set(INITIAL_SPORTS);
  }

  clearAllData(): void {
    this.players.set([]);
    this.teams.set([]);
    this.matches.set([]);
    this.tournament.update(t => ({
      ...t,
      status: 'draft',
      championTeamId: null,
      runnerUpTeamId: null,
      thirdPlaceTeamId: null
    }));
  }

  exportDataJson(): string {
    return JSON.stringify({
      sports: this.sports(),
      players: this.players(),
      teams: this.teams(),
      matches: this.matches(),
      tournament: this.tournament(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  importDataJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.sports && Array.isArray(data.sports)) this.sports.set(data.sports);
      if (data.players && Array.isArray(data.players)) this.players.set(data.players);
      if (data.teams && Array.isArray(data.teams)) this.teams.set(data.teams);
      if (data.matches && Array.isArray(data.matches)) this.matches.set(data.matches);
      if (data.tournament) this.tournament.set(data.tournament);
      return true;
    } catch {
      return false;
    }
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  }

  private saveToStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }
}
