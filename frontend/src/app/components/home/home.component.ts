import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

type Step = 'login' | 'phone' | 'verify';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="min-h-screen flex items-center justify-center p-4 relative">
      <div class="absolute w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></div>
      
      <div class="glass w-full max-w-md rounded-[2.5rem] p-10 md:p-14 shadow-2xl relative z-10 animate-fade-in-up text-center">
        
        <!-- Logo -->
        <div class="w-16 h-16 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center font-black text-3xl shadow-lg mb-6 transform -rotate-3 hover:rotate-3 transition-transform">K</div>
        <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2 tracking-tight">Kray.tn</h1>

        <!-- === STEP 1: Login === -->
        @if (step() === 'login') {
          <p class="text-slate-500 mb-10 font-medium">Tunisia's premier P2P rental marketplace. Borrow & lend locally.</p>
          
          @if (errorMsg()) {
            <div class="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 mb-6 text-sm font-semibold">{{ errorMsg() }}</div>
          }

          <div class="space-y-4">
            <button (click)="login('google')" [disabled]="isLoading()" class="w-full relative flex items-center justify-center px-6 py-4 rounded-2xl font-bold bg-white text-slate-700 hover:text-indigo-600 shadow-md border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl disabled:opacity-70">
              <svg class="w-6 h-6 mr-3 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
              {{ isLoading() ? 'Connecting...' : 'Continue with Google' }}
            </button>
            <button (click)="login('facebook')" [disabled]="isLoading()" class="w-full relative flex items-center justify-center px-6 py-4 rounded-2xl font-bold bg-[#1877F2] text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-70">
              <svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              {{ isLoading() ? 'Connecting...' : 'Continue with Facebook' }}
            </button>
          </div>
        }

        <!-- === STEP 2: Phone Input === -->
        @if (step() === 'phone') {
          <div class="animate-fade-in">
            <div class="w-14 h-14 mx-auto bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 text-2xl">📱</div>
            <h2 class="text-xl font-black text-slate-800 mb-2">Enter Mobile Number</h2>
            <p class="text-slate-500 font-medium mb-8 text-sm">We need this to securely link your account.<br>We'll send you an SMS code.</p>

            @if (errorMsg()) {
              <div class="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 mb-4 text-sm font-semibold">{{ errorMsg() }}</div>
            }

            <form (ngSubmit)="submitPhone()" class="space-y-4">
              <div class="relative">
                <div class="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <span class="font-bold text-slate-500">+216</span>
                </div>
                <input type="tel" [(ngModel)]="phoneValue" name="phone" placeholder="22 123 456"
                       class="glass-input block w-full pl-16 pr-5 py-4 rounded-2xl text-slate-800 font-bold text-lg tracking-wide outline-none placeholder-slate-300 focus:ring-2 focus:ring-indigo-300"
                       autocomplete="tel">
              </div>

              <button type="submit" [disabled]="phoneValue.length < 8 || isLoading()"
                      class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-lg">
                @if (isLoading()) {
                  <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Sending Code...
                } @else {
                  Send SMS Code
                }
              </button>
            </form>

            <button (click)="goBackToLogin()" class="mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors font-medium">← Cancel</button>
          </div>
        }

        <!-- === STEP 3: OTP Verify === -->
        @if (step() === 'verify') {
          <div class="animate-fade-in">
            <div class="w-14 h-14 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <h2 class="text-xl font-black text-slate-800 mb-1">Enter SMS Code</h2>
            <p class="text-slate-500 font-medium mb-8 text-sm">We sent a 6-digit code to<br><span class="font-bold text-slate-700">{{ pendingPhone }}</span></p>

            @if (errorMsg()) {
              <div class="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 mb-4 text-sm font-semibold">{{ errorMsg() }}</div>
            }
            @if (devOtp()) {
              <div class="bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl px-4 py-3 mb-4 text-sm font-medium">
                🛠 Dev mode • SMS: <span class="font-black tracking-widest">{{ devOtp() }}</span>
              </div>
            }

            <form (ngSubmit)="verify()" class="space-y-4">
              <input type="text" [(ngModel)]="otpValue" name="otp" maxlength="6" placeholder="_ _ _ _ _ _"
                     class="glass-input block w-full text-center px-5 py-5 rounded-2xl text-slate-800 font-black text-3xl tracking-[16px] outline-none placeholder-slate-200 focus:ring-2 focus:ring-indigo-300"
                     autocomplete="one-time-code" inputmode="numeric">
              
              <button type="submit" [disabled]="otpValue.length !== 6 || isLoading()"
                      class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-lg">
                @if (isLoading()) {
                  <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Verifying...
                } @else {
                  Verify & Sign In
                }
              </button>
            </form>

            <button (click)="goBackToLogin()" class="mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors font-medium">← Sign in with a different account</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
  `]
})
export class HomeComponent {
    private authService = inject(AuthService);
    private router = inject(Router);
    private http = inject(HttpClient);

    step = signal<Step>('login');
    isLoading = signal(false);
    errorMsg = signal('');
    devOtp = signal('');
    
    phoneValue = '';
    otpValue = '';
    
    pendingUserId: number | null = null;
    pendingPhone = '';

    login(provider: 'facebook' | 'google') {
        this.isLoading.set(true);
        this.errorMsg.set('');
        const email = provider === 'facebook' ? 'fb_user@test.com' : 'google_user@test.com';
        const name  = provider === 'facebook' ? 'Zied FB' : 'Ahmed Google';
        const avatar = `https://ui-avatars.com/api/?name=${name}&background=${provider === 'facebook' ? '1877F2' : 'EA4335'}&color=fff&rounded=true`;

        this.http.post<{ step: string; user?: any; userId?: number; phone?: string; devOtp?: string }>(
            'http://127.0.0.1:8000/api/auth/login',
            { provider, email, fullName: name, avatar }
        ).subscribe({
            next: (res) => {
                this.isLoading.set(false);
                if (res.step === 'success' && res.user) {
                    localStorage.setItem('kray_user', JSON.stringify(res.user));
                    window.location.href = '/dashboard';
                } else if (res.step === 'phone') {
                    this.pendingUserId = res.userId || null;
                    this.step.set('phone');
                } else if (res.step === 'verify') {
                    this.pendingUserId = res.userId || null;
                    this.pendingPhone = res.phone || '+216...';
                    if (res.devOtp) this.devOtp.set(res.devOtp);
                    this.step.set('verify');
                }
            },
            error: () => {
                this.isLoading.set(false);
                this.errorMsg.set('Login failed. Please try again.');
            }
        });
    }

    submitPhone() {
        if (!this.pendingUserId || this.phoneValue.length < 8) return;
        this.isLoading.set(true);
        this.errorMsg.set('');

        let cleanPhone = this.phoneValue.replace(/\s+/g, '');
        if (cleanPhone.startsWith('00216')) {
            cleanPhone = '+' + cleanPhone.substring(2);
        } else if (!cleanPhone.startsWith('+216')) {
            cleanPhone = '+216' + cleanPhone;
        }

        this.http.post<{ step: string; phone: string; devOtp?: string }>(
            'http://127.0.0.1:8000/api/auth/send-sms',
            { userId: this.pendingUserId, phone: cleanPhone }
        ).subscribe({
            next: (res) => {
                this.isLoading.set(false);
                this.pendingPhone = res.phone;
                if (res.devOtp) this.devOtp.set(res.devOtp);
                this.step.set('verify');
            },
            error: () => {
                this.isLoading.set(false);
                this.errorMsg.set('Failed to send SMS code.');
            }
        });
    }

    verify() {
        if (!this.pendingUserId || this.otpValue.length !== 6) return;
        this.isLoading.set(true);
        this.errorMsg.set('');

        this.http.post<{ step: string; user: any }>('http://127.0.0.1:8000/api/auth/verify', {
            userId: this.pendingUserId,
            code: this.otpValue
        }).subscribe({
            next: (res) => {
                this.isLoading.set(false);
                localStorage.setItem('kray_user', JSON.stringify(res.user));
                window.location.href = '/dashboard';
            },
            error: (err) => {
                this.isLoading.set(false);
                this.errorMsg.set(err.error?.message || 'Invalid code. Please try again.');
                this.otpValue = '';
            }
        });
    }

    goBackToLogin() {
        this.step.set('login');
        this.phoneValue = '';
        this.otpValue = '';
        this.errorMsg.set('');
        this.devOtp.set('');
        this.pendingUserId = null;
    }
}
