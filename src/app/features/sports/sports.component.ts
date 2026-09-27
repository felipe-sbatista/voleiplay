import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TournamentStateService } from '../../core/services/tournament-state.service';
import { Sport } from '../../core/models/sport.model';
import { LucideAngularModule, Trophy, Activity, Dribbble, Volleyball, Plus, Trash2, Edit2, Check, X, Shield, Star, Flag } from 'lucide-angular';

@Component({
  selector: 'app-sports',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './sports.component.html',
  styleUrls: ['./sports.component.scss']
})
export class SportsComponent {
  private state = inject(TournamentStateService);
  
  sports = this.state.sports;
  
  showForm = signal(false);
  editingSportId = signal<string | null>(null);
  
  // Form State
  formName = signal('');
  formIcon = signal('activity');
  formPositions = signal<string[]>([]);
  formNewPosition = signal('');
  formTeamSize = signal(2);

  availableIcons = [
    { id: 'activity', icon: Activity, label: 'Atividade' },
    { id: 'dribble', icon: Dribbble, label: 'Bola' },
    { id: 'volleyball', icon: Volleyball, label: 'Vôlei' },
    { id: 'trophy', icon: Trophy, label: 'Troféu' },
    { id: 'shield', icon: Shield, label: 'Escudo' },
    { id: 'star', icon: Star, label: 'Estrela' },
    { id: 'flag', icon: Flag, label: 'Bandeira' },
  ];

  openForm(sport?: Sport) {
    if (sport) {
      if (sport.isPreset) return; // Cannot edit preset
      this.editingSportId.set(sport.id);
      this.formName.set(sport.name);
      this.formIcon.set(sport.icon);
      this.formPositions.set([...sport.positions]);
      this.formTeamSize.set(sport.defaultTeamSize);
    } else {
      this.editingSportId.set(null);
      this.formName.set('');
      this.formIcon.set('activity');
      this.formPositions.set([]);
      this.formTeamSize.set(2);
    }
    this.formNewPosition.set('');
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  addPosition() {
    const pos = this.formNewPosition().trim();
    if (pos && !this.formPositions().includes(pos)) {
      this.formPositions.update(list => [...list, pos]);
      this.formNewPosition.set('');
    }
  }

  removePosition(pos: string) {
    this.formPositions.update(list => list.filter(p => p !== pos));
  }

  saveSport() {
    if (!this.formName().trim() || this.formPositions().length === 0) return;

    const sportData = {
      name: this.formName(),
      icon: this.formIcon(),
      positions: this.formPositions(),
      defaultTeamSize: this.formTeamSize()
    };

    const id = this.editingSportId();
    if (id) {
      this.state.updateSport(id, sportData);
    } else {
      this.state.addSport(sportData);
    }
    
    this.closeForm();
  }

  deleteSport(id: string) {
    if (confirm('Tem certeza que deseja excluir este esporte?')) {
      this.state.deleteSport(id);
    }
  }
}
