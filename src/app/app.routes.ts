import { Routes } from '@angular/router';
import { SearchComponent } from './components/search/search.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
  { path: '', component: SearchComponent },
  { path: 'p/:id', component: ProfileComponent },
  { path: '**', redirectTo: '' }
];
