import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private themeService = inject(ThemeService);
  title = 'Nostria Find';
  
  constructor() {
    // Apply theme immediately on app load
    effect(() => {
      const theme = this.themeService.getTheme()();
      console.log('Theme changed to:', theme);
    });
  }
}
