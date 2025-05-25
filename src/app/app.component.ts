import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './services/theme.service';
import { DiscoveryService, ServerInfo } from './services/discovery.service';
import { LoadingIndicatorComponent } from './components/loading-indicator/loading-indicator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LoadingIndicatorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private themeService = inject(ThemeService);
  private discoveryService = inject(DiscoveryService);
  
  title = 'Nostria Find';
  showServerInfo = signal<boolean>(false);
  
  constructor() {
    // Apply theme immediately on app load
    effect(() => {
      const theme = this.themeService.getTheme()();
      console.log('Theme changed to:', theme);
    });
  }
  
  async ngOnInit() {
    await this.discoveryService.checkServerLatency();
    this.showServerInfo.set(true);
  }
  
  get isChecking() {
    return this.discoveryService.isChecking();
  }
  
  get progress() {
    return this.discoveryService.progress();
  }
  
  get selectedServer() {
    return this.discoveryService.selectedServer();
  }
}
