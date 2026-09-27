import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderNavComponent } from './shared/components/header-nav/header-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderNavComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'VOLEIPLAY - Beach Pro Tour Tournament Manager';
}
