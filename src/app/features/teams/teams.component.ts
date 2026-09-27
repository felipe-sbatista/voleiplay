import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TournamentStateService } from '../../core/services/tournament-state.service';
import { Team, TeamCategory } from '../../core/models/team.model';
import { Player } from '../../core/models/player.model';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.scss'
})
export class TeamsComponent {
  protected state = inject(TournamentStateService);

  searchQuery = signal<string>('');
  categoryFilter = signal<string>('all');

  isModalOpen = false;
  isEditing = false;
  editingTeamId: string | null = null;

  // Form Fields
  teamName = '';
  teamCategory: TeamCategory = 'Dupla (2x2)';
  teamCity = '';
  teamCountry = 'Brasil';
  teamFlag = '🇧🇷';
  teamColor = '#D4F63D';
  teamSeed = 1;
  selectedPlayerIds: string[] = [];

  readonly filteredTeams = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.categoryFilter();
    let teams = this.state.teamsWithPlayers();

    if (cat !== 'all') {
      teams = teams.filter(t => t.category === cat);
    }
    if (q) {
      teams = teams.filter(t => 
        t.name.toLowerCase().includes(q) || 
        (t.city && t.city.toLowerCase().includes(q)) ||
        (t.country && t.country.toLowerCase().includes(q))
      );
    }
    return teams;
  });

  openCreateModal() {
    this.isEditing = false;
    this.editingTeamId = null;
    this.teamName = '';
    this.teamCategory = 'Dupla (2x2)';
    this.teamCity = '';
    this.teamCountry = 'Brasil';
    this.teamFlag = '🇧🇷';
    this.teamColor = '#D4F63D';
    this.teamSeed = this.state.teams().length + 1;
    this.selectedPlayerIds = [];
    this.isModalOpen = true;
  }

  openEditModal(team: Team) {
    this.isEditing = true;
    this.editingTeamId = team.id;
    this.teamName = team.name;
    this.teamCategory = team.category;
    this.teamCity = team.city || '';
    this.teamCountry = team.country || '';
    this.teamFlag = team.flag || '🇧🇷';
    this.teamColor = team.color || '#D4F63D';
    this.teamSeed = team.seed || 1;
    this.selectedPlayerIds = [...(team.playerIds || [])];
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  togglePlayerSelection(playerId: string) {
    const index = this.selectedPlayerIds.indexOf(playerId);
    if (index >= 0) {
      this.selectedPlayerIds.splice(index, 1);
    } else {
      this.selectedPlayerIds.push(playerId);
    }
  }

  isPlayerSelected(playerId: string): boolean {
    return this.selectedPlayerIds.includes(playerId);
  }

  saveTeam() {
    if (!this.teamName.trim()) {
      alert('Por favor, informe o nome do time.');
      return;
    }

    if (this.isEditing && this.editingTeamId) {
      this.state.updateTeam(this.editingTeamId, {
        name: this.teamName.trim(),
        category: this.teamCategory,
        city: this.teamCity.trim(),
        country: this.teamCountry.trim(),
        flag: this.teamFlag,
        color: this.teamColor,
        seed: Number(this.teamSeed),
        playerIds: this.selectedPlayerIds
      });
    } else {
      this.state.addTeam({
        name: this.teamName.trim(),
        category: this.teamCategory,
        city: this.teamCity.trim(),
        country: this.teamCountry.trim(),
        flag: this.teamFlag,
        color: this.teamColor,
        seed: Number(this.teamSeed),
        playerIds: this.selectedPlayerIds
      });
    }

    this.closeModal();
  }

  deleteTeam(team: Team) {
    if (confirm(`Deseja realmente remover o time "${team.name}"?`)) {
      this.state.deleteTeam(team.id);
    }
  }
}
