import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { NostrUtilsService } from '../../services/nostr-utils.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  query = '';
  router = inject(Router);
  themeService = inject(ThemeService);
  private nostrUtils = inject(NostrUtilsService);
  
  errorMessage = signal<string | null>(null);
  
  async search(): Promise<void> {
    if (!this.query.trim()) return;
    
    try {
      // Clear any previous errors
      this.errorMessage.set(null);
      
      // Parse input - if it's hex, convert to npub; if it's npub, keep as-is
      const processedQuery = this.nostrUtils.parseInputToNpub(this.query.trim());
      
      // Navigate to profile page with the processed query
      await this.router.navigate(['/p', processedQuery]);
    } catch (error) {
      this.errorMessage.set((error as Error).message);
    }
  }
}
