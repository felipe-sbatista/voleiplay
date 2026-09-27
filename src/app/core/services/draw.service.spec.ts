import { TestBed } from '@angular/core/testing';
import { DrawService } from './draw.service';
import { Player } from '../models/player.model';
import { Team } from '../models/team.model';

describe('DrawService', () => {
  let service: DrawService;

  const mockPlayers: Player[] = [
    { id: 'p1', name: 'Player 1', gender: 'M', position: 'Defensor', skillLevel: 5, dominantHand: 'Destro', stats: { matches: 0, wins: 0, pointsScored: 0, mvps: 0 } },
    { id: 'p2', name: 'Player 2', gender: 'F', position: 'Bloqueador', skillLevel: 5, dominantHand: 'Destro', stats: { matches: 0, wins: 0, pointsScored: 0, mvps: 0 } },
    { id: 'p3', name: 'Player 3', gender: 'M', position: 'Levantador', skillLevel: 4, dominantHand: 'Destro', stats: { matches: 0, wins: 0, pointsScored: 0, mvps: 0 } },
    { id: 'p4', name: 'Player 4', gender: 'F', position: 'Defensor', skillLevel: 3, dominantHand: 'Destro', stats: { matches: 0, wins: 0, pointsScored: 0, mvps: 0 } },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrawService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should draw 2 pairs from 4 players', () => {
    const teams = service.drawTeamsFromPlayers(mockPlayers, 2, 'balanced_skill', 'Dupla (2x2)');
    expect(teams.length).toBe(2);
    expect(teams[0].playerIds.length).toBe(2);
    expect(teams[1].playerIds.length).toBe(2);
  });

  it('should balance players by sport positions when provided', () => {
    const players: Player[] = [
      { id: 'p1', name: 'Goleiro 1', gender: 'M', position: 'Goleiro', skillLevel: 5, dominantHand: 'Destro', stats: { matches: 0, wins: 0, pointsScored: 0, mvps: 0 } },
      { id: 'p2', name: 'Goleiro 2', gender: 'M', position: 'Goleiro', skillLevel: 4, dominantHand: 'Destro', stats: { matches: 0, wins: 0, pointsScored: 0, mvps: 0 } },
      { id: 'p3', name: 'Atacante 1', gender: 'M', position: 'Atacante', skillLevel: 5, dominantHand: 'Destro', stats: { matches: 0, wins: 0, pointsScored: 0, mvps: 0 } },
      { id: 'p4', name: 'Atacante 2', gender: 'M', position: 'Atacante', skillLevel: 4, dominantHand: 'Destro', stats: { matches: 0, wins: 0, pointsScored: 0, mvps: 0 } },
    ];
    
    // We want 2 teams of 2. We provide sportPositions to ensure 'Goleiro' and 'Atacante' are distributed.
    const sportPositions = ['Goleiro', 'Zagueiro', 'Meio-Campo', 'Atacante', 'Completo'];
    
    const teams = service.drawTeamsFromPlayers(players, 2, 'balanced_skill', 'Dupla (2x2)', sportPositions);
    expect(teams.length).toBe(2);
    
    // The sorting by position first ensures Goleiro 1 and Goleiro 2 are adjacent in the pool,
    // so the snake draft puts one in team 0 and one in team 1.
    const team1Players = teams[0].playerIds.map(id => players.find(p => p.id === id)?.position);
    const team2Players = teams[1].playerIds.map(id => players.find(p => p.id === id)?.position);
    
    expect(team1Players).toContain('Goleiro');
    expect(team1Players).toContain('Atacante');
    expect(team2Players).toContain('Goleiro');
    expect(team2Players).toContain('Atacante');
  });

  it('should generate single elimination bracket tree with nextMatchId links', () => {
    const mockTeams: Team[] = [
      { id: 't1', name: 'Team 1', category: 'Dupla (2x2)', seed: 1, playerIds: ['p1', 'p2'], stats: { matches: 0, wins: 0, losses: 0, setsWon: 0, setsLost: 0, pointsFor: 0, pointsAgainst: 0, pointsRatio: 1, tournamentPoints: 0 }, createdAt: '' },
      { id: 't2', name: 'Team 2', category: 'Dupla (2x2)', seed: 2, playerIds: ['p3', 'p4'], stats: { matches: 0, wins: 0, losses: 0, setsWon: 0, setsLost: 0, pointsFor: 0, pointsAgainst: 0, pointsRatio: 1, tournamentPoints: 0 }, createdAt: '' },
      { id: 't3', name: 'Team 3', category: 'Dupla (2x2)', seed: 3, playerIds: [], stats: { matches: 0, wins: 0, losses: 0, setsWon: 0, setsLost: 0, pointsFor: 0, pointsAgainst: 0, pointsRatio: 1, tournamentPoints: 0 }, createdAt: '' },
      { id: 't4', name: 'Team 4', category: 'Dupla (2x2)', seed: 4, playerIds: [], stats: { matches: 0, wins: 0, losses: 0, setsWon: 0, setsLost: 0, pointsFor: 0, pointsAgainst: 0, pointsRatio: 1, tournamentPoints: 0 }, createdAt: '' },
    ];

    const matches = service.generateSingleEliminationBracket(mockTeams, 'tour-test', true);
    expect(matches.length).toBeGreaterThan(0);
    // Should have semifinals, finals and 3rd place
    const finals = matches.find(m => m.stage === 'finals');
    expect(finals).toBeTruthy();
  });
});
