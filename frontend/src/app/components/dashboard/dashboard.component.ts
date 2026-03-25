import { Component, OnInit, AfterViewChecked, computed, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { MessageService, Message } from '../../services/message.service';
import { Post, PostType } from '../../models/post.model';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="px-4 py-6 md:px-8 max-w-[1400px] mx-auto relative min-h-screen">
      
      <!-- Premium Ambient Background Orbs -->
      <div class="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none animate-float -z-10"></div>
      <div class="fixed bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-400/20 rounded-full blur-[140px] pointer-events-none animate-float-delayed -z-10"></div>

      <!-- Floating Glass Navbar -->
      <header class="glass rounded-[2rem] flex justify-between items-center px-6 py-4 mb-16 sticky top-6 z-50 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-11 h-11 rounded-[1.25rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-black text-xl shadow-[0_8px_16px_rgb(99,102,241,0.4)] border border-white/20 transform hover:scale-105 transition-transform cursor-pointer">
            K
          </div>
          <h1 class="text-2xl font-black text-slate-800 tracking-tight hidden sm:block">Kray<span class="text-indigo-600">.tn</span></h1>
        </div>
        
        <div class="flex items-center space-x-2 md:space-x-5">
          <div class="hidden md:flex items-center space-x-2 bg-slate-100/50 p-1 rounded-2xl border border-white/60 shadow-inner">
            <button routerLink="/messages" class="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all flex items-center gap-2 text-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              Inbox
            </button>
            <button routerLink="/post-form/offer" class="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all text-sm">
              List Item
            </button>
            <button routerLink="/post-form/request" class="px-6 py-2.5 rounded-xl font-bold text-white bg-slate-900 shadow-lg hover:shadow-xl hover:bg-indigo-600 transition-all text-sm transform hover:-translate-y-0.5">
              Post Request
            </button>
          </div>
          <div class="flex items-center space-x-4 pl-2 md:pl-4">
            @if (authService.currentUser()?.avatar) {
              <button routerLink="/settings" title="Profile Settings" class="group relative">
                <img [src]="authService.currentUser()?.avatar" class="w-11 h-11 rounded-[1.25rem] border-2 border-white shadow-md group-hover:shadow-indigo-500/30 transition-all object-cover">
                <div class="absolute inset-0 rounded-[1.25rem] bg-indigo-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
              </button>
            }
            <button (click)="logout()" class="w-11 h-11 rounded-[1.25rem] bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-all shadow-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Massive Premium Hero Section -->
      <div class="text-center max-w-4xl mx-auto mb-16 pt-4 animate-fade-in-up">
        <h2 class="text-6xl md:text-[5rem] font-black text-slate-900 tracking-tight mb-6 leading-[1.1]">
          Unlock the value of <br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500">Shared Access</span>
        </h2>
        <p class="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">Join Tunisia's most trusted P2P marketplace. Rent what you need for a day, or list your gear and start earning passively.</p>
      </div>

      <!-- Airbnb-Style Search Bar -->
      <div class="glass mx-auto max-w-4xl rounded-full p-2.5 shadow-[0_20px_40px_rgb(0,0,0,0.06)] border border-white/80 mb-16 flex flex-col md:flex-row items-center relative z-20 animate-fade-in-up" style="animation-delay: 100ms">
        
        <div class="flex-1 w-full relative px-6 py-3 hover:bg-slate-50/50 rounded-full cursor-text transition-colors group">
          <label class="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">Looking for</label>
          <input type="text" [(ngModel)]="searchCategory" placeholder="e.g. Cameras, Tents, Tools" 
                 class="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-600 font-semibold placeholder-slate-400 outline-none truncate">
        </div>
        
        <div class="w-full md:w-px h-px md:h-12 bg-slate-200 my-2 md:my-0"></div>
        
        <div class="flex-1 w-full relative px-6 py-3 hover:bg-slate-50/50 rounded-full cursor-text transition-colors group">
          <label class="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">Location</label>
          <input type="text" [(ngModel)]="searchCity" placeholder="Where do you need it?" 
                 class="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-600 font-semibold placeholder-slate-400 outline-none truncate">
        </div>

        <button (click)="loadPosts()" class="w-full md:w-auto mt-2 md:mt-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-5 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shrink-0">
          <svg class="w-5 h-5 text-indigo-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <span class="font-bold text-lg">Search</span>
        </button>
      </div>

      <!-- Segmented Control Tabs -->
      <div class="flex justify-center mb-12 animate-fade-in-up" style="animation-delay: 200ms">
        <div class="bg-slate-200/50 backdrop-blur-md p-1.5 rounded-[1.5rem] inline-flex shadow-inner border border-white/40">
          <button (click)="setTab('OFFER')" 
                  [class.bg-white]="activeTab() === 'OFFER'" [class.shadow]="activeTab() === 'OFFER'" [class.text-indigo-700]="activeTab() === 'OFFER'"
                  [class.text-slate-500]="activeTab() !== 'OFFER'" [class.hover:text-slate-700]="activeTab() !== 'OFFER'"
                  class="px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2.5 text-sm">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" *ngIf="activeTab() === 'OFFER'"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
            Available Offers
          </button>
          <button (click)="setTab('REQUEST')" 
                  [class.bg-white]="activeTab() === 'REQUEST'" [class.shadow]="activeTab() === 'REQUEST'" [class.text-purple-700]="activeTab() === 'REQUEST'"
                  [class.text-slate-500]="activeTab() !== 'REQUEST'" [class.hover:text-slate-700]="activeTab() !== 'REQUEST'"
                  class="px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2.5 text-sm">
             <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" *ngIf="activeTab() === 'REQUEST'"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
            Community Requests
          </button>
        </div>
      </div>

      <!-- Feed Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        @for (post of filteredPosts(); track post.id; let i = $index) {
          <div class="glass-card rounded-[2rem] overflow-hidden relative flex flex-col h-[420px] animate-fade-in-up" [ngClass]="'delay-' + (i % 12)">
            
            <!-- Cover Image (or placeholder) -->
            <div class="h-56 w-full relative overflow-hidden shrink-0 group">
              @if (post.image) {
                <img [src]="'http://127.0.0.1:8000' + post.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out">
              } @else {
                <div class="w-full h-full bg-slate-100 flex items-center justify-center">
                  <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
              }
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80 pointer-events-none"></div>
              
              <!-- Floating Price Badge over image -->
              <div class="absolute top-4 right-4 glass-badge px-3 py-1.5 rounded-xl flex items-center">
                @if (post.price) {
                  <span class="font-black text-white text-sm">{{ post.price }}<span class="text-[10px] text-white/80 ml-0.5">TND/d</span></span>
                } @else {
                  <span class="font-bold text-emerald-300 text-xs">Negotiable</span>
                }
              </div>

              <!-- Category Badge -->
              <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm">
                <span class="text-[10px] font-black text-slate-800 uppercase tracking-widest">{{ post.category }}</span>
              </div>
            </div>
            
            <!-- Card Body -->
            <div class="p-6 flex-1 flex flex-col bg-white">
              <div class="flex justify-between items-start mb-2 gap-4">
                <h3 class="text-xl font-black text-slate-800 line-clamp-2 leading-tight">{{ post.title }}</h3>
                
                <!-- Avatar -->
                <div class="w-10 h-10 rounded-full border-2 border-white shadow-md shrink-0 relative -mt-10 z-10">
                  <img [src]="post.owner?.avatar" class="w-full h-full rounded-full object-cover" [title]="post.owner?.fullName">
                </div>
              </div>

              <p class="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">{{ post.description }}</p>
              
              <div class="flex justify-between items-center pt-4 border-t border-slate-100 mt-auto">
                <div class="flex items-center text-slate-400 text-xs font-bold">
                  <svg class="w-4 h-4 mr-1 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                  {{ post.location }}
                </div>
                
                <button (click)="openContact(post)" class="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:bg-indigo-600 hover:shadow-indigo-500/30 transition-all">
                  Contact
                </button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-24 px-4 text-center animate-fade-in-up">
            <div class="w-32 h-32 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <svg class="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 class="text-3xl font-black text-slate-800 mb-2">No listings found</h3>
            <p class="text-slate-500 max-w-md mx-auto text-lg font-medium">Be the first to create a post in this area and get the community started!</p>
            <button (click)="searchCategory=''; searchCity=''; loadPosts()" class="mt-8 text-indigo-600 font-bold hover:underline">Clear Filters</button>
          </div>
        }
      </div>

      <!-- Chat Modal (Remains sleek as before, slightly adjusted radii) -->
      @if (selectedPost()) {
        <div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4" (click)="closeContact()">
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
          <div class="glass w-full max-w-md rounded-[2.5rem] flex flex-col relative z-10 shadow-2xl animate-slide-up overflow-hidden" style="max-height: 85vh" (click)="$event.stopPropagation()">
            <!-- Chat Header -->
            <div class="flex items-center gap-4 p-5 border-b border-slate-100 bg-white/50 shrink-0">
              <div class="relative">
                <img [src]="selectedPost()?.owner?.avatar" class="w-12 h-12 rounded-[1rem] object-cover border-2 border-white shadow-sm">
                <span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></span>
              </div>
              <div class="flex-1">
                <p class="font-black text-slate-800 text-lg leading-tight">{{ selectedPost()?.owner?.fullName }}</p>
                <p class="text-[11px] font-bold text-indigo-500 uppercase tracking-wider truncate">{{ selectedPost()?.title }}</p>
              </div>
              <button (click)="closeContact()" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <!-- Messages Area -->
            <div #chatScroll class="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/80" style="min-height:300px; max-height:400px">
              @if (messages().length === 0) {
                <div class="flex flex-col items-center justify-center h-full text-center">
                  <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <span class="text-2xl">👋</span>
                  </div>
                  <p class="text-slate-500 font-bold text-sm">Say hi to start the conversation!</p>
                </div>
              }
              @for (msg of messages(); track msg.id) {
                <div class="flex" [class.justify-end]="msg.senderId === myUserId()">
                  @if (msg.senderId !== myUserId()) {
                    <img [src]="msg.senderAvatar" class="w-8 h-8 rounded-full object-cover mr-2 self-end shrink-0 shadow-sm border border-slate-100">
                  }
                  <div class="max-w-[75%] px-4 py-3 rounded-2xl text-sm font-semibold shadow-sm"
                       [class.bg-indigo-600]="msg.senderId === myUserId()" [class.text-white]="msg.senderId === myUserId()" [class.rounded-br-sm]="msg.senderId === myUserId()"
                       [class.bg-white]="msg.senderId !== myUserId()" [class.text-slate-700]="msg.senderId !== myUserId()" [class.rounded-bl-sm]="msg.senderId !== myUserId()">
                    {{ msg.content }}
                    <span class="block text-[10px] mt-1.5 opacity-70 font-bold" [class.text-right]="msg.senderId === myUserId()">{{ msg.createdAt }}</span>
                  </div>
                </div>
              }
            </div>

            <!-- Message Input -->
            <div class="p-4 bg-white shrink-0 border-t border-slate-100">
              <form (ngSubmit)="sendMessage()" class="flex items-center gap-3">
                <input type="text" [(ngModel)]="newMessage" name="newMsg" placeholder="Type a message..."
                       class="glass-input flex-1 px-5 py-4 rounded-full text-slate-800 placeholder-slate-400 font-semibold outline-none text-sm focus:ring-2 focus:ring-indigo-300 transition-all">
                <button type="submit" [disabled]="!newMessage.trim() || isSending()"
                        class="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-indigo-600 transition-all disabled:opacity-50 shrink-0 shadow-md">
                  @if (isSending()) {
                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewChecked {
    @ViewChild('chatScroll') private chatScrollEl!: ElementRef;

    public authService = inject(AuthService);
    private postService = inject(PostService);
    private messageService = inject(MessageService);
    private router = inject(Router);

    activeTab = signal<PostType>('OFFER');
    posts = signal<Post[]>([]);
    selectedPost = signal<Post | null>(null);
    messages = signal<Message[]>([]);
    newMessage = '';
    isSending = signal(false);

    myUserId = computed(() => this.authService.getUserId());

    openContact(post: Post) {
        this.selectedPost.set(post);
        this.messages.set([]);
        const ownerId = post.owner?.id;
        if (ownerId) {
            this.messageService.getConversation(post.id, ownerId).subscribe(res => {
                this.messages.set(res.data);
            });
        }
    }

    closeContact() {
        this.selectedPost.set(null);
        this.messages.set([]);
    }

    sendMessage() {
        const post = this.selectedPost();
        const content = this.newMessage.trim();
        if (!content || !post?.owner?.id) return;
        this.isSending.set(true);
        this.messageService.sendMessage(post.id, post.owner.id, content).subscribe({
            next: (msg) => {
                this.messages.update(msgs => [...msgs, msg]);
                this.newMessage = '';
                this.isSending.set(false);
            },
            error: () => this.isSending.set(false)
        });
    }

    ngAfterViewChecked() {
        try {
            if (this.chatScrollEl) {
                const el = this.chatScrollEl.nativeElement;
                el.scrollTop = el.scrollHeight;
            }
        } catch {}
    }

    searchCategory = '';
    searchCity = '';

    filteredPosts = computed(() => {
        return this.posts().filter(p => p.type === this.activeTab());
    });

    ngOnInit() {
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/']);
        } else {
            this.loadPosts();
        }
    }

    setTab(tab: PostType) {
        this.activeTab.set(tab);
    }

    loadPosts() {
        this.postService.getPosts({
            category: this.searchCategory || undefined,
            city: this.searchCity || undefined
        }).pipe(
            catchError(err => {
                console.error('Error loading posts', err);
                return of({ data: [] });
            })
        ).subscribe(res => {
            this.posts.set(res.data || []);
        });
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}
