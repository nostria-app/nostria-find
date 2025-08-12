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
  showServerMenu = signal<boolean>(false);
  availableServers = signal<ServerInfo[]>([]);
  
  constructor() {
    // Apply theme immediately on app load
    effect(() => {
      const theme = this.themeService.getTheme()();
      console.log('Theme changed to:', theme);
    });
  }
  
  async ngOnInit() {
    // Only run discovery if we don't have a saved server
    if (this.discoveryService.shouldRunDiscovery()) {
      await this.discoveryService.checkServerLatency();
    }
    this.updateAvailableServers();
    this.showServerInfo.set(true);
  }
  
  toggleServerMenu(): void {
    this.showServerMenu.update(value => !value);
  }
  
  updateAvailableServers(): void {
    const servers = this.discoveryService.getServersByLatency();
    this.availableServers.set(servers);
  }
  
  async selectServer(server: ServerInfo) {
    this.discoveryService.selectServer(server);
    this.toggleServerMenu();
  }
  
  async refreshServers(): Promise<void> {
    this.showServerMenu.set(false);
    this.showServerInfo.set(false);
    await this.discoveryService.checkServerLatency();
    this.updateAvailableServers();
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
