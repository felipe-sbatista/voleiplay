import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TournamentStateService } from '../../core/services/tournament-state.service';
import { MatchScoreModalComponent } from '../../shared/components/match-score-modal/match-score-modal.component';
import { Match } from '../../core/models/match.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatchScoreModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  protected state = inject(TournamentStateService);
  selectedMatch: Match | null = null;

  openScoreModal(match: Match) {
    this.selectedMatch = match;
  }

  closeScoreModal() {
    this.selectedMatch = null;
  }

  get liveAndUpcomingMatches(): Match[] {
    const all = this.state.matchesWithTeams();
    return all.filter(m => m.status === 'live' || m.status === 'scheduled').slice(0, 4);
  }

  get recentFinishedMatches(): Match[] {
    const all = this.state.matchesWithTeams();
    return all.filter(m => m.status === 'finished').slice(0, 4);
  }
}
