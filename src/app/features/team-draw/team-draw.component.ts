import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TournamentStateService } from '../../core/services/tournament-state.service';
import { DrawService } from '../../core/services/draw.service';
import { Player } from '../../core/models/player.model';
import { TeamCategory } from '../../core/models/team.model';
import confetti from 'canvas-confetti';

interface DrawnTeam {
  name: string;
  category: TeamCategory;
  color: string;
  players: Player[];
  averageRating: number;
}

@Component({
  selector: 'app-team-draw',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-draw.component.html',
  styleUrl: './team-draw.component.scss'
})
export class TeamDrawComponent {
  protected state = inject(TournamentStateService);
  private drawService = inject(DrawService);
  private router = inject(Router);

  // Pool Selection
  selectedPlayerIds = signal<string[]>([]);
  teamSize = signal<number>(this.state.activeSport().defaultTeamSize || 2);
  drawMode = signal<'balanced_skill' | 'random'>('balanced_skill');
  category: TeamCategory = 'Dupla (2x2)';

  // Animation & State
  isDrawing = signal<boolean>(false);
  countdown = signal<number>(3);
  drawnTeams = signal<DrawnTeam[]>([]);
  hasDrawn = signal<boolean>(false);

  constructor() {
    // Default select all available players
    const all = this.state.players().map(p => p.id);
    this.selectedPlayerIds.set(all);
    
    // Set category based on team size
    this.onFormatChange(this.teamSize());
  }

  readonly availablePlayers = computed(() => this.state.players());

  readonly selectedPlayersCount = computed(() => this.selectedPlayerIds().length);

  readonly possibleTeamsCount = computed(() => {
    return Math.floor(this.selectedPlayersCount() / this.teamSize());
  });

  readonly remainingPlayersCount = computed(() => {
    return this.selectedPlayersCount() % this.teamSize();
  });

  selectAllPlayers() {
    this.selectedPlayerIds.set(this.state.players().map(p => p.id));
  }

  selectFreeAgentsOnly() {
    this.selectedPlayerIds.set(this.state.availableFreeAgents().map(p => p.id));
  }

  clearSelection() {
    this.selectedPlayerIds.set([]);
  }

  togglePlayer(id: string) {
    this.selectedPlayerIds.update(current => {
      if (current.includes(id)) {
        return current.filter(pid => pid !== id);
      } else {
        return [...current, id];
      }
    });
  }

  onFormatChange(size: number) {
    this.teamSize.set(size);
    if (size === 2) this.category = 'Dupla (2x2)';
    else if (size === 3) this.category = 'Trio (3x3)';
    else if (size === 4) this.category = 'Quarteto (4x4)';
    else if (size === 6) this.category = 'Sexteto (6x6)';
    else this.category = 'Outro';
  }

  executeDraw() {
    const selectedIds = this.selectedPlayerIds();
    const playersToDraw = this.state.players().filter(p => selectedIds.includes(p.id));

    if (playersToDraw.length < this.teamSize()) {
      alert(`Selecione ao menos ${this.teamSize()} atletas para realizar o sorteio.`);
      return;
    }

    this.isDrawing.set(true);
    this.countdown.set(3);
    this.hasDrawn.set(false);

    // Countdown animation
    const interval = setInterval(() => {
      this.countdown.update(c => {
        if (c <= 1) {
          clearInterval(interval);
          this.finishDrawAnimation(playersToDraw);
          return 0;
        }
        return c - 1;
      });
    }, 600);
  }

  private finishDrawAnimation(pool: Player[]) {
    const activeSport = this.state.activeSport();
    const rawTeams = this.drawService.drawTeamsFromPlayers(
      pool,
      this.teamSize(),
      this.drawMode(),
      this.category,
      activeSport?.positions || []
    );

    const playerMap = new Map(pool.map(p => [p.id, p]));

    const enriched: DrawnTeam[] = rawTeams.map(t => {
      const players = t.playerIds.map(id => playerMap.get(id)!).filter(Boolean);
      const totalStars = players.reduce((acc, p) => acc + p.skillLevel, 0);
      const averageRating = players.length ? Number((totalStars / players.length).toFixed(1)) : 5;

      return {
        name: t.name,
        category: t.category,
        color: t.color,
        players,
        averageRating
      };
    });

    this.drawnTeams.set(enriched);
    this.isDrawing.set(false);
    this.hasDrawn.set(true);

    // Celebration Confetti
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#D4F63D', '#00F0FF', '#FF4655', '#FFFFFF', '#FBBF24']
      });
    } catch {}
  }

  saveTeamsToTournament() {
    const teams = this.drawnTeams();
    if (!teams.length) return;

    // Add each team to tournament state
    teams.forEach((t, idx) => {
      this.state.addTeam({
        name: t.name,
        category: t.category,
        color: t.color,
        flag: '🏐',
        seed: idx + 1,
        playerIds: t.players.map(p => p.id)
      });
    });

    alert(`${teams.length} times foram salvos com sucesso no torneio!`);
    this.router.navigate(['/brackets']);
  }
}
