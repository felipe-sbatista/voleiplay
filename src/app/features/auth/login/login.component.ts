import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/auth.models';

interface DemoUser {
  name: string;
  email: string;
  pass: string;
  role: UserRole;
  badge: string;
  avatar: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  readonly auth = inject(AuthService);
  private router = inject(Router);

  activeTab = signal<'LOGIN' | 'REGISTER'>('LOGIN');

  // Formulário Login
  loginEmail = '';
  loginPassword = '';

  // Formulário Registro
  regName = '';
  regEmail = '';
  regPassword = '';
  regRole: UserRole = 'ATHLETE';

  // Usuários de Demonstração Rápida
  demoUsers: DemoUser[] = [
    {
      name: 'Diretor BPT',
      email: 'admin@voleiplay.com.br',
      pass: 'admin123',
      role: 'ADMIN',
      badge: 'ADMINISTRADOR',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces'
    },
    {
      name: 'Ana Patrícia',
      email: 'ana.patricia@voleiplay.com.br',
      pass: 'atleta123',
      role: 'ATHLETE',
      badge: 'ATLETA CAMPEÃ',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=faces'
    },
    {
      name: 'Duda Lisboa',
      email: 'duda.lisboa@voleiplay.com.br',
      pass: 'atleta123',
      role: 'ATHLETE',
      badge: 'ATLETA CAMPEÃ',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=faces'
    },
    {
      name: 'Bernardinho',
      email: 'treinador@voleiplay.com.br',
      pass: 'treinador123',
      role: 'COACH',
      badge: 'TREINADOR',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces'
    }
  ];

  successMessage = signal<string | null>(null);

  async onLogin(): Promise<void> {
    if (!this.loginEmail || !this.loginPassword) return;
    this.successMessage.set(null);
    const success = await this.auth.login({
      email: this.loginEmail,
      password: this.loginPassword
    });

    if (success) {
      this.router.navigate(['/dashboard']);
    }
  }

  async onRegister(): Promise<void> {
    if (!this.regName || !this.regEmail || !this.regPassword) return;
    this.successMessage.set(null);
    const targetEmail = this.regEmail;
    const success = await this.auth.register({
      name: this.regName,
      email: this.regEmail,
      password: this.regPassword,
      role: this.regRole
    });

    if (success) {
      this.successMessage.set(
        `🎉 Cadastro realizado com sucesso! Um e-mail de boas-vindas foi disparado para ${targetEmail} via Email Service.`
      );
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2200);
    }
  }

  quickLogin(demo: DemoUser): void {
    this.loginEmail = demo.email;
    this.loginPassword = demo.pass;
    this.onLogin();
  }
}
