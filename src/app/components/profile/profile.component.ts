import { Component, OnDestroy, OnInit, Signal, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NostrService } from '../../services/nostr.service';
import { NostrClient, NOSTR_CLIENTS } from '../../models/nostr-clients';
import { ThemeService } from '../../services/theme.service';
import { DiscoveryService } from '../../services/discovery.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private nostrService = inject(NostrService);
  private discoveryService = inject(DiscoveryService);
  themeService = inject(ThemeService);
  
  // Signals from services
  profile: Signal<any> = this.nostrService.getUserProfile();
  badges: Signal<any[]> = this.nostrService.getUserBadges();
  loading: Signal<boolean> = this.nostrService.getLoading();
  error: Signal<string | null> = this.nostrService.getError();
  
  // Discovery service signals
  isDiscovering: Signal<boolean> = this.discoveryService.isChecking;
  discoveryProgress: Signal<number> = this.discoveryService.progress;
  
  // Client related properties
  clients = NOSTR_CLIENTS;
  preferredClient = signal<string | null>(null);
  
  // Profile loading state
  private pendingUserId = signal<string | null>(null);
  
  constructor() {
    // Effect to load profile when discovery completes and we have a pending user ID
    effect(() => {
      const userId = this.pendingUserId();
      const discoveryComplete = !this.isDiscovering();
      
      if (userId && discoveryComplete) {
        this.loadProfile(userId);
        this.pendingUserId.set(null); // Clear pending user ID
      }
    });
  }
  
  ngOnInit(): void {
    // Get the user ID from the route
    this.route.params.subscribe(params => {
      const userId = params['id'];
      if (userId) {
        this.initializeProfileLoad(userId);
      } else {
        this.router.navigate(['/']);
      }
    });
    
    // Load preferred client from local storage
    const savedClient = localStorage.getItem('preferredNostrClient');
    if (savedClient) {
      this.preferredClient.set(savedClient);
    }
  }
  
  ngOnDestroy(): void {
    // Close any open connections
    this.nostrService.closeConnections();
  }
  
  private async initializeProfileLoad(userId: string): Promise<void> {
    // Store the user ID for later use
    this.pendingUserId.set(userId);
    
    // If discovery is not running and no server is selected, start discovery
    if (!this.isDiscovering() && !this.discoveryService.selectedServer()) {
      try {
        await this.discoveryService.checkServerLatency();
      } catch (error) {
        console.error('Failed to discover relays:', error);
        // If discovery fails, the effect will still trigger the profile load
      }
    }
    // If discovery is already complete or running, the effect will handle the rest
  }
  
  async loadProfile(userId: string): Promise<void> {
    await this.nostrService.lookupUser(userId);
  }
  
  setPreferredClient(clientName: string): void {
    this.preferredClient.set(clientName);
    localStorage.setItem('preferredNostrClient', clientName);
  }
  
  getClientUrl(client: NostrClient): string {
    const npub = this.profile()?.npub || '';
    return client.url.replace('{npub}', npub);
  }
    // Helper to safely get image URL with fallback
  getImageUrl(url: string | undefined, type: 'avatar' | 'banner' = 'avatar'): string {
    if (!url) return type === 'avatar' ? 'assets/default-avatar.png' : 'assets/default-banner.svg';
    
    // Check if the URL is valid
    try {
      new URL(url);
      return url;
    } catch (e) {
      return type === 'avatar' ? 'assets/default-avatar.png' : 'assets/default-banner.svg';
    }
  }
  
  // Navigate back to search
  goToSearch(): void {
    this.router.navigate(['/']);
  }
}
