import { Injectable, Signal, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private theme = signal<Theme>('light');
  
  constructor() {
    // Initialize theme from localStorage or system preference
    this.initializeTheme();
    
    // Apply theme changes via effect
    effect(() => {
      const currentTheme = this.theme();
      this.applyTheme(currentTheme);
      localStorage.setItem('theme', currentTheme);
    });
  }
  
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      this.theme.set(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window?.matchMedia('(prefers-color-scheme: dark)').matches;
      this.theme.set(prefersDark ? 'dark' : 'light');
    }
  }
  
  private applyTheme(theme: Theme): void {
    const { classList } = this.document.documentElement;
    
    if (theme === 'dark') {
      classList.add('dark-theme');
      classList.remove('light-theme');
    } else {
      classList.add('light-theme');
      classList.remove('dark-theme');
    }
  }
  
  getTheme(): Signal<Theme> {
    return this.theme.asReadonly();
  }
  
  toggleTheme(): void {
    const current = this.theme();
    this.theme.set(current === 'light' ? 'dark' : 'light');
  }
}
