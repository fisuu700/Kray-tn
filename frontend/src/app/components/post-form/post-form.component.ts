import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { PostCreateDto, PostType } from '../../models/post.model';

@Component({
    selector: 'app-post-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="min-h-screen py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
      
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="w-full max-w-2xl relative z-10 animate-fade-in-up">
        
        <!-- Header -->
        <div class="text-center mb-10">
          <button routerLink="/dashboard" class="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-6 transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/60 shadow-sm">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Dashboard
          </button>
          
          <h2 class="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mb-3">
            Create new <span class="bg-clip-text text-transparent" [ngClass]="isOffer() ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-purple-600 to-fuchsia-600'">{{ isOffer() ? 'Offer' : 'Request' }}</span>
          </h2>
          <p class="text-lg text-slate-500 font-medium">
            {{ isOffer() ? 'List an item you have available for rent and earn money.' : 'Describe what you need, and locals will help you out!' }}
          </p>
        </div>

        <!-- Form Card -->
        <div class="glass rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          
          <div class="absolute top-0 left-0 right-0 h-1.5" [ngClass]="isOffer() ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-gradient-to-r from-purple-400 to-fuchsia-500'"></div>

          <form (ngSubmit)="submit()" class="space-y-8 mt-2">
            
            <!-- Title -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Title of your {{ isOffer() ? 'item' : 'request' }}</label>
              <input type="text" [(ngModel)]="post.title" name="title" required placeholder="e.g. Professional DSLR Camera"
                     class="glass-input block w-full px-5 py-4 rounded-2xl text-slate-800 placeholder-slate-400 font-medium outline-none text-lg">
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Details & Description</label>
              <textarea [(ngModel)]="post.description" name="description" rows="4" required placeholder="Describe the condition, dates needed, etc..."
                        class="glass-input block w-full px-5 py-4 rounded-2xl text-slate-800 placeholder-slate-400 font-medium outline-none resize-none text-lg"></textarea>
            </div>

            <!-- Image Upload -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Photo (Optional)</label>
              
              @if (imagePreview()) {
                <!-- Preview -->
                <div class="relative rounded-2xl overflow-hidden border-2 border-indigo-300 shadow-md mb-3 group">
                  <img [src]="imagePreview()" alt="preview" class="w-full h-56 object-cover">
                  <button type="button" (click)="removeImage()" class="absolute top-3 right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              } @else {
                <!-- Upload zone -->
                <label class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all"
                       [ngClass]="isOffer() ? 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-400' : 'border-purple-200 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-400'">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                    <svg class="w-10 h-10 mb-3" [ngClass]="isOffer() ? 'text-indigo-300' : 'text-purple-300'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p class="text-sm font-semibold text-slate-600">Click to upload a photo</p>
                    <p class="text-xs text-slate-400 mt-1">PNG, JPG or WEBP (Max 5MB)</p>
                  </div>
                  <input type="file" class="hidden" accept="image/*" (change)="onImageSelected($event)">
                </label>
              }
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Category -->
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Category</label>
                <div class="relative">
                  <select [(ngModel)]="post.category" name="category" required 
                          class="glass-input block w-full px-5 py-4 rounded-2xl text-slate-800 font-medium outline-none appearance-none cursor-pointer text-lg">
                    <option value="" disabled selected>Select category</option>
                    <option value="Electronics">💻 Electronics</option>
                    <option value="Vehicles">🚗 Vehicles</option>
                    <option value="Tools">🔧 Tools & DIY</option>
                    <option value="Event Equipment">🎉 Event Equipment</option>
                    <option value="Photography">📷 Photography</option>
                    <option value="Books">📚 Books</option>
                    <option value="Sports">⚽ Sports Gear</option>
                    <option value="Other">✨ Other</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-500">
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                  </div>
                </div>
              </div>

              <!-- Location -->
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">City Location</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <input type="text" [(ngModel)]="post.location" name="location" required placeholder="e.g. Tunis"
                         class="glass-input block w-full pl-12 pr-5 py-4 rounded-2xl text-slate-800 placeholder-slate-400 font-medium outline-none text-lg">
                </div>
              </div>
            </div>

            <!-- Conditional Price -->
            @if (isOffer()) {
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Price per day</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <span class="font-bold text-slate-500">TND</span>
                  </div>
                  <input type="number" [(ngModel)]="post.price" name="price" min="0" step="0.5" placeholder="0.00"
                         class="glass-input block w-full pl-16 pr-5 py-4 rounded-2xl text-slate-800 placeholder-slate-400 font-extrabold outline-none text-2xl">
                </div>
              </div>
            }

            <div class="pt-6">
              <button type="submit" [disabled]="!isFormValid() || isSubmitting()"
                      [ngClass]="isOffer() ? 'from-blue-600 to-indigo-600 hover:shadow-indigo-500/30' : 'from-purple-600 to-fuchsia-600 hover:shadow-purple-500/30'"
                      class="w-full relative flex transform items-center justify-center p-5 text-xl font-bold text-white transition-all bg-gradient-to-r rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none overflow-hidden group/btn">
                
                <span class="relative z-10 flex items-center gap-2">
                  @if (isSubmitting()) {
                    <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Publishing...
                  } @else {
                    Publish {{ isOffer() ? 'Offer' : 'Request' }}
                    <svg class="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                  }
                </span>
                <div class="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
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
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class PostFormComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private postService = inject(PostService);
    private authService = inject(AuthService);

    type: PostType = 'OFFER';
    post: Partial<PostCreateDto> = { title: '', description: '', category: '', location: '' };

    selectedImageFile = signal<File | null>(null);
    imagePreview = signal<string | null>(null);
    isSubmitting = signal(false);

    ngOnInit() {
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/']);
            return;
        }
        this.route.url.subscribe(urlSegment => {
            const typeParam = urlSegment[urlSegment.length - 1]?.path;
            this.type = typeParam === 'request' ? 'REQUEST' : 'OFFER';
            this.post.type = this.type;
        });
    }

    onImageSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            this.selectedImageFile.set(file);
            const reader = new FileReader();
            reader.onload = (e) => this.imagePreview.set(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    }

    removeImage() {
        this.selectedImageFile.set(null);
        this.imagePreview.set(null);
    }

    isOffer() { return this.type === 'OFFER'; }

    isFormValid() {
        return this.post.title && this.post.description && this.post.category && this.post.location;
    }

    submit() {
        if (this.isFormValid()) {
            this.isSubmitting.set(true);
            this.postService.createPost(this.post as PostCreateDto, this.selectedImageFile() ?? undefined).subscribe({
                next: () => {
                    this.isSubmitting.set(false);
                    this.router.navigate(['/dashboard']);
                },
                error: (err) => {
                    console.error('Failed to create post', err);
                    this.isSubmitting.set(false);
                    this.router.navigate(['/dashboard']);
                }
            });
        }
    }
}
