import { Component, OnInit, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="min-h-screen px-4 py-6 md:px-10 max-w-4xl mx-auto">

      <!-- Navbar -->
      <header class="glass rounded-2xl flex justify-between items-center px-6 py-4 mb-10 sticky top-6 z-50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg">K</div>
          <h1 class="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Kray.tn</h1>
        </div>
        <button routerLink="/dashboard" class="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors text-sm flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back
        </button>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up">

        <!-- Left: Avatar Card -->
        <div class="glass rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-xl col-span-1">
          <!-- Avatar Preview -->
          <div class="relative mb-6 group cursor-pointer" (click)="avatarInput.click()">
            <div class="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl">
              <img [src]="avatarPreview() || currentUser()?.avatar || 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&rounded=true'"
                   alt="avatar" class="w-full h-full object-cover">
            </div>
            <!-- Overlay -->
            <div class="absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <input #avatarInput type="file" class="hidden" accept="image/*" (change)="onAvatarSelected($event)">
          </div>

          <h3 class="font-black text-xl text-slate-800">{{ currentUser()?.fullName || 'Your Name' }}</h3>
          <p class="text-sm text-slate-500 mt-1">{{ currentUser()?.email }}</p>

          @if (currentUser()?.isVerified) {
            <div class="mt-3 flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              Verified Account
            </div>
          }

          <button (click)="avatarInput.click()" class="mt-6 w-full py-3 rounded-2xl border-2 border-dashed border-indigo-200 text-indigo-500 font-semibold text-sm hover:bg-indigo-50 hover:border-indigo-400 transition-all">
            Change Photo
          </button>
          @if (avatarPreview()) {
            <button (click)="removeAvatar()" class="mt-2 w-full py-2 rounded-2xl text-red-400 font-semibold text-sm hover:bg-red-50 transition-all text-xs">
              Remove new photo
            </button>
          }
        </div>

        <!-- Right: Edit Form -->
        <div class="glass rounded-[2.5rem] p-8 md:p-10 shadow-xl col-span-2">
          <div class="mb-8">
            <h2 class="text-3xl font-black text-slate-800 tracking-tight">Profile Settings</h2>
            <p class="text-slate-500 mt-1 font-medium">Update your personal information</p>
          </div>

          @if (successMsg()) {
            <div class="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-5 py-4 mb-6 font-semibold text-sm animate-fade-in">
              <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              {{ successMsg() }}
            </div>
          }

          <form (ngSubmit)="save()" class="space-y-6">
            <!-- Full Name -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Full Name</label>
              <input type="text" [(ngModel)]="fullName" name="fullName" placeholder="Your full name"
                     class="glass-input block w-full px-5 py-4 rounded-2xl text-slate-800 placeholder-slate-400 font-medium outline-none text-lg">
            </div>

            <!-- Email (read-only) -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Address <span class="text-slate-400 font-normal">(cannot be changed)</span></label>
              <div class="glass-input flex items-center gap-3 w-full px-5 py-4 rounded-2xl opacity-60 cursor-not-allowed">
                <svg class="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                <span class="text-slate-600 font-medium">{{ currentUser()?.email }}</span>
              </div>
            </div>

            <div class="pt-2">
              <button type="submit" [disabled]="saving()"
                      class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none text-lg">
                @if (saving()) {
                  <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Saving...
                } @else {
                  Save Changes
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
    .animate-fade-in    { animation: fadeIn 0.3s ease-out forwards; }
  `]
})
export class SettingsComponent implements OnInit {
    private authService = inject(AuthService);
    private http = inject(HttpClient);
    private router = inject(Router);

    currentUser = this.authService.currentUser;

    fullName      = '';
    avatarFile    = signal<File | null>(null);
    avatarPreview = signal<string | null>(null);
    saving        = signal(false);
    successMsg    = signal('');

    ngOnInit() {
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/']);
            return;
        }
        this.fullName = this.currentUser()?.fullName || '';
    }

    onAvatarSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files?.[0]) {
            const file = input.files[0];
            this.avatarFile.set(file);
            const reader = new FileReader();
            reader.onload = e => this.avatarPreview.set(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    }

    removeAvatar() {
        this.avatarFile.set(null);
        this.avatarPreview.set(null);
    }

    save() {
        this.saving.set(true);
        this.successMsg.set('');

        const formData = new FormData();
        formData.append('fullName', this.fullName);
        if (this.avatarFile()) formData.append('avatar', this.avatarFile()!);

        const userId = this.authService.getUserId();
        const headers = new HttpHeaders(userId ? { 'X-User-Id': userId.toString() } : {});

        this.http.post<{ user: any }>(`${environment.apiUrl}/api/user/profile`, formData, { headers }).subscribe({
            next: (res) => {
                // Update localStorage and signal
                localStorage.setItem('kray_user', JSON.stringify(res.user));
                window.location.reload(); // Reload to refresh AuthService signal
            },
            error: () => {
                this.saving.set(false);
                this.successMsg.set('❌ An error occurred. Please try again.');
            }
        });
    }
}
