import { TestBed } from '@angular/core/testing';
import { TournamentStateService } from './tournament-state.service';

describe('TournamentStateService', () => {
  let service: TournamentStateService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TournamentStateService);
    service.loadDemoData();
  });

  it('should initialize with demo data', () => {
    expect(service.players().length).toBeGreaterThan(0);
    expect(service.teams().length).toBeGreaterThan(0);
    expect(service.matches().length).toBeGreaterThan(0);
  });

  it('should add a new player', () => {
    const initialCount = service.players().length;
    const added = service.addPlayer({
      name: 'Test Player',
      gender: 'M',
      position: 'Defensor',
      skillLevel: 5,
      dominantHand: 'Destro'
    });

    expect(service.players().length).toBe(initialCount + 1);
    expect(added.id).toContain('p-');
  });

  it('should calculate leaderboard sorted by wins and sets', () => {
    const leaders = service.leaderboard();
    expect(leaders.length).toBe(service.teams().length);
    // 1st team should have greater or equal wins than 2nd team
    expect(leaders[0].stats.wins).toBeGreaterThanOrEqual(leaders[1].stats.wins);
  });

  it('should add a custom sport', () => {
    const initialCount = service.sports().length;
    const addedSport = service.addSport({
      name: 'Futmesa',
      icon: 'table',
      positions: ['Atacante', 'Defensor', 'Siririca'],
      defaultTeamSize: 2
    });

    expect(service.sports().length).toBe(initialCount + 1);
    expect(addedSport.id).toContain('sport-');
    expect(addedSport.isPreset).toBeFalse();
  });

  it('should update a custom sport', () => {
    const addedSport = service.addSport({
      name: 'Futmesa',
      icon: 'table',
      positions: ['Atacante', 'Defensor'],
      defaultTeamSize: 2
    });

    service.updateSport(addedSport.id, { name: 'Futmesa 2x2' });
    const sport = service.sports().find(s => s.id === addedSport.id);
    expect(sport?.name).toBe('Futmesa 2x2');
  });

  it('should delete a custom sport but not a preset sport', () => {
    const customSport = service.addSport({
      name: 'Custom',
      icon: 'icon',
      positions: [],
      defaultTeamSize: 1
    });

    const presetSport = service.sports().find(s => s.isPreset);
    expect(presetSport).toBeTruthy();

    if (presetSport) {
      service.deleteSport(presetSport.id); // Should not delete
      expect(service.sports().find(s => s.id === presetSport.id)).toBeTruthy();
    }

    service.deleteSport(customSport.id); // Should delete
    expect(service.sports().find(s => s.id === customSport.id)).toBeFalsy();
  });
});
