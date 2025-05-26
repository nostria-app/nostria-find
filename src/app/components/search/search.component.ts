import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

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
  
  async search(): Promise<void> {
    if (!this.query.trim()) return;
    
    // Navigate to profile page with the query
    await this.router.navigate(['/p', this.query.trim()]);
  }
}
