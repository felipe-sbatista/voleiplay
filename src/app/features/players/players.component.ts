import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TournamentStateService } from '../../core/services/tournament-state.service';
import { Player, PlayerPosition } from '../../core/models/player.model';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
];

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss'
})
export class PlayersComponent {
  protected state = inject(TournamentStateService);
  avatarPresets = AVATAR_PRESETS;

  searchQuery = signal<string>('');
  positionFilter = signal<string>('all');
  availabilityFilter = signal<string>('all'); // 'all', 'free', 'allocated'

  isModalOpen = false;
  isEditing = false;
  editingPlayerId: string | null = null;

  // Form Fields
  name = '';
  nickname = '';
  gender: 'M' | 'F' | 'Misto' = 'M';
  position: PlayerPosition = 'Defensor';
  skillLevel = 4;
  height: number | null = 185;
  dominantHand: 'Destro' | 'Canhoto' | 'Ambidestro' = 'Destro';
  avatar = AVATAR_PRESETS[0];
  bio = '';

  readonly activeSportPositions = computed(() => {
    return this.state.activeSport()?.positions || [
      'Bloqueador', 'Defensor', 'Levantador', 'Ponteiro', 'Oposto', 'Líbero', 'Completo'
    ];
  });

  readonly filteredPlayers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const pos = this.positionFilter();
    const avail = this.availabilityFilter();
    let players = this.state.players();

    if (pos !== 'all') {
      players = players.filter(p => p.position === pos);
    }
    if (avail === 'free') {
      players = players.filter(p => !p.teamId);
    } else if (avail === 'allocated') {
      players = players.filter(p => !!p.teamId);
    }

    if (q) {
      players = players.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.nickname && p.nickname.toLowerCase().includes(q)) ||
        p.position.toLowerCase().includes(q)
      );
    }
    return players;
  });

  getTeamName(teamId?: string | null): string | null {
    if (!teamId) return null;
    const team = this.state.teams().find(t => t.id === teamId);
    return team ? team.name : null;
  }

  openCreateModal() {
    this.isEditing = false;
    this.editingPlayerId = null;
    this.name = '';
    this.nickname = '';
    this.gender = 'M';
    this.position = 'Defensor';
    this.skillLevel = 4;
    this.height = 185;
    this.dominantHand = 'Destro';
    this.avatar = this.avatarPresets[Math.floor(Math.random() * this.avatarPresets.length)];
    this.bio = '';
    this.isModalOpen = true;
  }

  openEditModal(player: Player) {
    this.isEditing = true;
    this.editingPlayerId = player.id;
    this.name = player.name;
    this.nickname = player.nickname || '';
    this.gender = player.gender;
    this.position = player.position;
    this.skillLevel = player.skillLevel;
    this.height = player.height || null;
    this.dominantHand = player.dominantHand;
    this.avatar = player.avatar || this.avatarPresets[0];
    this.bio = player.bio || '';
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  setSkill(level: number) {
    this.skillLevel = level;
  }

  savePlayer() {
    if (!this.name.trim()) {
      alert('Por favor, preencha o nome do atleta.');
      return;
    }

    if (this.isEditing && this.editingPlayerId) {
      this.state.updatePlayer(this.editingPlayerId, {
        name: this.name.trim(),
        nickname: this.nickname.trim() || undefined,
        gender: this.gender,
        position: this.position,
        skillLevel: this.skillLevel,
        height: this.height || undefined,
        dominantHand: this.dominantHand,
        avatar: this.avatar,
        bio: this.bio.trim() || undefined
      });
    } else {
      this.state.addPlayer({
        name: this.name.trim(),
        nickname: this.nickname.trim() || undefined,
        gender: this.gender,
        position: this.position,
        skillLevel: this.skillLevel,
        height: this.height || undefined,
        dominantHand: this.dominantHand,
        avatar: this.avatar,
        bio: this.bio.trim() || undefined,
        teamId: null
      });
    }

    this.closeModal();
  }

  deletePlayer(player: Player) {
    if (confirm(`Deseja remover o atleta "${player.name}"?`)) {
      this.state.deletePlayer(player.id);
    }
  }
}
