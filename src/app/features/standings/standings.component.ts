import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentStateService } from '../../core/services/tournament-state.service';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './standings.component.html',
  styleUrl: './standings.component.scss'
})
export class StandingsComponent {
  protected state = inject(TournamentStateService);

  triggerConfetti() {
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#FBBF24', '#D4F63D', '#E2E8F0', '#F97316', '#FFFFFF']
      });
    } catch {}
  }
}
