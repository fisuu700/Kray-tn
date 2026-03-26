import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type Mode = 'login' | 'register';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0A061E]">
      <!-- Animated Background Glows -->
      <div class="absolute w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 top-0 left-0"></div>
      <div class="absolute w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none translate-x-1/2 translate-y-1/2 bottom-0 right-0"></div>
      
      <div class="glass w-full max-w-md rounded-[2.5rem] p-10 md:p-14 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 relative z-10 animate-fade-in-up text-center">
        
        <!-- Logo Image or CSS Fallback -->
        <div class="mx-auto mb-6 flex justify-center">
            <!-- If you put the image in assets, you can replace this div with: <img src="assets/logo.png" class="w-24 h-24 drop-shadow-2xl" /> -->
            <div class="w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-black text-4xl shadow-[0_0_30px_rgba(32,227,178,0.4)] transform -rotate-3 hover:rotate-3 transition-transform">K</div>
        </div>
        
        <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2 tracking-tight">Kray.tn</h1>
        <p class="text-indigo-200/70 mb-8 font-medium">Tunisia's premier P2P rental marketplace. Borrow & lend locally.</p>
        
        @if (errorMsg()) {
          <div class="bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl px-4 py-3 mb-6 text-sm font-semibold shadow-lg backdrop-blur-sm">{{ errorMsg() }}</div>
        }

        <div class="space-y-4 text-left">
            <div>
              <label class="block text-sm font-semibold text-indigo-300 mb-1">Nom et Prénom</label>
              <input type="text" [(ngModel)]="fullName" placeholder="Foulen Ben Foulen"
                class="w-full px-5 py-4 rounded-2xl bg-[#130E2A] border-2 border-white/5 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all outline-none text-white font-medium placeholder-indigo-200/30">
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-indigo-300 mb-1">Mot de passe</label>
              <input type="password" [(ngModel)]="password" placeholder="••••••••"
                class="w-full px-5 py-4 rounded-2xl bg-[#130E2A] border-2 border-white/5 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all outline-none text-white font-medium placeholder-indigo-200/30">
            </div>

            @if (mode() === 'login') {
                <button (click)="submitLogin()" [disabled]="isLoading()"
                  class="w-full mt-6 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_10px_30px_rgba(124,58,237,0.3)] hover:from-blue-500 hover:to-purple-500 hover:-translate-y-1 transition-all disabled:opacity-70 border border-white/10">
                  {{ isLoading() ? 'Connexion...' : 'Se connecter' }}
                </button>
                <p class="mt-6 text-center text-sm text-indigo-300/70 font-medium">
                  Nouveau sur Kray ? 
                  <button (click)="mode.set('register')" class="text-cyan-400 font-bold hover:underline hover:text-cyan-300 transition-colors">Créer un compte</button>
                </p>
            } @else {
                <button (click)="submitRegister()" [disabled]="isLoading()"
                  class="w-full mt-6 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_10px_30px_rgba(6,182,212,0.3)] hover:from-cyan-400 hover:to-blue-500 hover:-translate-y-1 transition-all disabled:opacity-70 border border-white/10">
                  {{ isLoading() ? 'Création...' : 'Créer un compte' }}
                </button>
                <p class="mt-6 text-center text-sm text-indigo-300/70 font-medium">
                  Déjà un compte ? 
                  <button (click)="mode.set('login')" class="text-purple-400 font-bold hover:underline hover:text-purple-300 transition-colors">Se connecter</button>
                </p>
            }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    .glass { 
      background: rgba(18, 13, 43, 0.4); 
      backdrop-filter: blur(24px); 
      -webkit-backdrop-filter: blur(24px);
    }
  `]
})
export class HomeComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    mode = signal<Mode>('login'); /* switched default to login for returning users */
    isLoading = signal(false);
    errorMsg = signal('');
    
    fullName = '';
    password = '';

    submitLogin() {
        if (!this.fullName || !this.password) {
            this.errorMsg.set('Veuillez remplir tous les champs.');
            return;
        }

        this.isLoading.set(true);
        this.errorMsg.set('');

        this.authService.login(this.fullName, this.password).subscribe({
            next: (res) => {
                this.isLoading.set(false);
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.errorMsg.set('Nom ou mot de passe incorrect.');
            }
        });
    }

    submitRegister() {
        if (!this.fullName || !this.password) {
            this.errorMsg.set('Veuillez remplir tous les champs.');
            return;
        }

        this.isLoading.set(true);
        this.errorMsg.set('');

        this.authService.register(this.fullName, this.password).subscribe({
            next: (res) => {
                this.isLoading.set(false);
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.isLoading.set(false);
                if (err.status === 409) {
                    this.errorMsg.set('Ce compte existe déjà.');
                } else {
                    this.errorMsg.set('Erreur lors de la création du compte.');
                }
            }
        });
    }
}
