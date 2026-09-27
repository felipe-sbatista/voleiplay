import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'teams',
    loadComponent: () => import('./features/teams/teams.component').then(m => m.TeamsComponent)
  },
  {
    path: 'players',
    loadComponent: () => import('./features/players/players.component').then(m => m.PlayersComponent)
  },
  {
    path: 'team-draw',
    loadComponent: () => import('./features/team-draw/team-draw.component').then(m => m.TeamDrawComponent)
  },
  {
    path: 'brackets',
    loadComponent: () => import('./features/brackets/brackets.component').then(m => m.BracketsComponent)
  },
  {
    path: 'standings',
    loadComponent: () => import('./features/standings/standings.component').then(m => m.StandingsComponent)
  },
  {
    path: 'sports',
    loadComponent: () => import('./features/sports/sports.component').then(m => m.SportsComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
