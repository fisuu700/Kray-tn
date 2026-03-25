import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen w-full bg-[#f8fafc] relative selection:bg-indigo-500/30 overflow-hidden">
      <!-- Premium Decorative background blobs (Dynamic Ambient Light) -->
      <div class="fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-400/30 blur-[120px] mix-blend-multiply pointer-events-none animate-blob"></div>
      <div class="fixed top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-500/30 blur-[120px] mix-blend-multiply pointer-events-none animate-blob animation-delay-2000"></div>
      <div class="fixed bottom-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-purple-400/30 blur-[120px] mix-blend-multiply pointer-events-none animate-blob animation-delay-4000"></div>
      
      <div class="relative z-10 min-h-screen backdrop-blur-[20px] bg-slate-50/40">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob {
      animation: blob 7s infinite;
    }
    .animation-delay-2000 {
      animation-delay: 2s;
    }
    .animation-delay-4000 {
      animation-delay: 4s;
    }
  `]
})
export class AppComponent {
  title = 'kerya-frontend';
}
