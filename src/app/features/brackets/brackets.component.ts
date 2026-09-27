import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TournamentStateService } from '../../core/services/tournament-state.service';
import { DrawService } from '../../core/services/draw.service';
import { MatchScoreModalComponent } from '../../shared/components/match-score-modal/match-score-modal.component';
import { Match } from '../../core/models/match.model';
import { Team } from '../../core/models/team.model';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-brackets',
  standalone: true,
  imports: [CommonModule, FormsModule, MatchScoreModalComponent],
  templateUrl: './brackets.component.html',
  styleUrl: './brackets.component.scss'
})
export class BracketsComponent {
  protected state = inject(TournamentStateService);
  private drawService = inject(DrawService);

  viewMode = signal<'knockout' | 'groups'>('knockout');
  selectedMatch: Match | null = null;
  isDrawModalOpen = signal<boolean>(false);
  drawSeeded = signal<boolean>(true);

  // Computed matches by round for bracket tree view
  readonly rounds = computed(() => {
    const matches = this.state.matchesWithTeams();
    // Exclude group matches and 3rd place from main progression columns
    const knockoutMatches = matches.filter(m => m.stage !== 'groups' && m.stage !== 'third_place');
    
    // Group by roundIndex
    const roundMap = new Map<number, Match[]>();
    knockoutMatches.forEach(m => {
      if (!roundMap.has(m.roundIndex)) {
        roundMap.set(m.roundIndex, []);
      }
      roundMap.get(m.roundIndex)!.push(m);
    });

    const sortedRounds = Array.from(roundMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([roundIdx, roundMatches]) => {
        const firstMatch = roundMatches[0];
        return {
          roundIndex: roundIdx,
          stageName: firstMatch?.stageName || `Rodada ${roundIdx + 1}`,
          matches: roundMatches.sort((a, b) => a.matchIndex - b.matchIndex)
        };
      });

    return sortedRounds;
  });

  readonly thirdPlaceMatch = computed(() => {
    return this.state.matchesWithTeams().find(m => m.stage === 'third_place') || null;
  });

  readonly groupMatches = computed(() => {
    return this.state.matchesWithTeams().filter(m => m.stage === 'groups');
  });

  readonly championTeam = computed(() => {
    const champId = this.state.tournament().championTeamId;
    if (!champId) return null;
    return this.state.teamsWithPlayers().find(t => t.id === champId) || null;
  });

  openScoreModal(match: Match) {
    if (!match.team1Id || !match.team2Id) {
      alert('Esta partida ainda aguarda a definição dos times das fases anteriores.');
      return;
    }
    this.selectedMatch = match;
  }

  closeScoreModal() {
    this.selectedMatch = null;
  }

  openDrawModal() {
    this.isDrawModalOpen.set(true);
  }

  closeDrawModal() {
    this.isDrawModalOpen.set(false);
  }

  executeBracketDraw() {
    const teams = this.state.teams();
    if (teams.length < 2) {
      alert('Cadastre ao menos 2 times para sortear as chaves.');
      return;
    }

    const matches = this.drawService.generateSingleEliminationBracket(
      teams,
      this.state.tournament().id,
      this.drawSeeded()
    );

    this.state.setTournamentMatches(matches, {
      status: 'in_progress',
      currentStage: 'Eliminatórias',
      championTeamId: null,
      runnerUpTeamId: null,
      thirdPlaceTeamId: null
    });

    this.closeDrawModal();

    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#D4F63D', '#00F0FF', '#FF4655', '#FFFFFF']
      });
    } catch {}
  }

  generateGroupStage() {
    const teams = this.state.teams();
    if (teams.length < 4) {
      alert('Cadastre ao menos 4 times para criar a fase de grupos.');
      return;
    }

    const { groups, matches } = this.drawService.generateGroupStageMatches(
      teams,
      this.state.tournament().id,
      4
    );

    this.state.setTournamentMatches(matches, {
      groups,
      status: 'in_progress',
      currentStage: 'Fase de Grupos'
    });

    this.viewMode.set('groups');
  }
}
