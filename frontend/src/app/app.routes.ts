import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'post-form/offer',
    loadComponent: () => import('./components/post-form/post-form.component').then(m => m.PostFormComponent)
  },
  {
    path: 'post-form/request',
    loadComponent: () => import('./components/post-form/post-form.component').then(m => m.PostFormComponent)
  },
  {
    path: 'messages',
    loadComponent: () => import('./components/messages/messages.component').then(m => m.MessagesComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent)
  }
];
