import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TournamentStateService } from '../../../core/services/tournament-state.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header-nav.component.html',
  styleUrl: './header-nav.component.scss'
})
export class HeaderNavComponent {
  protected state = inject(TournamentStateService);
  protected auth = inject(AuthService);
  
  navLinks = [
    { path: '/dashboard', label: 'Visão Geral', icon: 'activity' },
    { path: '/brackets', label: 'Chaves & Jogos', icon: 'git-merge' },
    { path: '/team-draw', label: 'Sorteador de Times', icon: 'shuffle' },
    { path: '/teams', label: 'Times & Duplas', icon: 'users' },
    { path: '/players', label: 'Atletas', icon: 'user' },
    { path: '/standings', label: 'Classificação', icon: 'award' },
    { path: '/sports', label: 'Esportes', icon: 'dribbble' }
  ];

  isMenuOpen = false;
  isSettingsOpen = false;
  isUserMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleSettings() {
    this.isSettingsOpen = !this.isSettingsOpen;
    if (this.isSettingsOpen) this.isUserMenuOpen = false;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    if (this.isUserMenuOpen) this.isSettingsOpen = false;
  }

  logout() {
    this.auth.logout();
    this.isUserMenuOpen = false;
  }

  loadDemo() {
    this.state.loadDemoData();
    this.isSettingsOpen = false;
  }

  clearAll() {
    if (confirm('Tem certeza que deseja limpar todos os dados do torneio?')) {
      this.state.clearAllData();
      this.isSettingsOpen = false;
    }
  }

  exportJson() {
    const data = this.state.exportDataJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voleiplay-torneio-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.isSettingsOpen = false;
  }
}
