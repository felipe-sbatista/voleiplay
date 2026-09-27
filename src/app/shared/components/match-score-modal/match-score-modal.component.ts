import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Match, MatchSet } from '../../../core/models/match.model';
import { TournamentStateService } from '../../../core/services/tournament-state.service';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-match-score-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './match-score-modal.component.html',
  styleUrl: './match-score-modal.component.scss'
})
export class MatchScoreModalComponent implements OnInit {
  @Input({ required: true }) match!: Match;
  @Output() close = new EventEmitter<void>();
  @Output() matchUpdated = new EventEmitter<void>();

  private state = inject(TournamentStateService);

  sets: MatchSet[] = [];
  selectedMvp: string = '';
  isLive: boolean = false;

  ngOnInit() {
    // Clone sets or init with at least 2 sets
    if (this.match.sets && this.match.sets.length > 0) {
      this.sets = this.match.sets.map(s => ({ ...s }));
    } else {
      this.sets = [
        { setNumber: 1, team1Score: 0, team2Score: 0 },
        { setNumber: 2, team1Score: 0, team2Score: 0 }
      ];
    }
    this.selectedMvp = this.match.mvpPlayerName || '';
    this.isLive = this.match.status === 'live';
  }

  addSet() {
    if (this.sets.length < 3) {
      this.sets.push({
        setNumber: this.sets.length + 1,
        team1Score: 0,
        team2Score: 0
      });
    }
  }

  removeSet(index: number) {
    if (this.sets.length > 2) {
      this.sets.splice(index, 1);
      this.sets.forEach((s, idx) => s.setNumber = idx + 1);
    }
  }

  adjustScore(setIndex: number, team: 1 | 2, delta: number) {
    const set = this.sets[setIndex];
    if (team === 1) {
      set.team1Score = Math.max(0, set.team1Score + delta);
    } else {
      set.team2Score = Math.max(0, set.team2Score + delta);
    }
  }

  get calculatedSetsWon(): { team1: number; team2: number } {
    let t1 = 0;
    let t2 = 0;
    this.sets.forEach(s => {
      if (s.team1Score > s.team2Score && (s.team1Score >= 21 || (s.setNumber === 3 && s.team1Score >= 15))) {
        t1++;
      } else if (s.team2Score > s.team1Score && (s.team2Score >= 21 || (s.setNumber === 3 && s.team2Score >= 15))) {
        t2++;
      }
    });
    return { team1: t1, team2: t2 };
  }

  get isDecided(): boolean {
    const { team1, team2 } = this.calculatedSetsWon;
    return team1 >= 2 || team2 >= 2;
  }

  saveAsLive() {
    this.state.updateMatchScore(this.match.id, this.sets, true);
    this.matchUpdated.emit();
    this.close.emit();
  }

  finishMatch() {
    this.state.finishMatch(this.match.id, this.sets, this.selectedMvp);

    // Fanfare confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4F63D', '#00F0FF', '#FF4655', '#FFFFFF', '#FBBF24']
      });
    } catch {}

    this.matchUpdated.emit();
    this.close.emit();
  }
}
