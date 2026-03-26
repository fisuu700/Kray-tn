import { Component, OnInit, AfterViewChecked, computed, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
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
    <div class="px-4 py-6 md:px-8 max-w-[1400px] mx-auto relative min-h-screen text-white">
      
      <!-- Premium Ambient Background Orbs -->
      <div class="fixed top-0 left-1/4 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-float -z-10"></div>
      <div class="fixed bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none animate-float-delayed -z-10"></div>

      <!-- Floating Glass Navbar -->
      <header class="glass rounded-[2rem] flex justify-between items-center px-6 py-4 mb-16 sticky top-6 z-50 transition-all border border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div class="flex items-center gap-4">
          <div class="w-11 h-11 rounded-[1.25rem] bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(32,227,178,0.4)] border border-white/10 transform hover:scale-105 transition-transform cursor-pointer">
            K
          </div>
          <h1 class="text-2xl font-black text-white tracking-tight hidden sm:block">Kray<span class="text-cyan-400">.tn</span></h1>
        </div>
        
        <div class="flex items-center space-x-2 md:space-x-5">
          <div class="hidden md:flex items-center space-x-2 bg-[#130E2A]/80 p-1 rounded-2xl border border-white/10 shadow-inner">
            <button routerLink="/messages" class="px-5 py-2.5 rounded-xl font-bold text-indigo-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 text-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              Inbox
            </button>
            <button routerLink="/post-form/offer" class="px-5 py-2.5 rounded-xl font-bold text-indigo-300 hover:bg-white/10 hover:text-white transition-all text-sm">
              List Item
            </button>
            <button routerLink="/post-form/request" class="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-purple-500/30 transition-all text-sm transform hover:-translate-y-0.5 border border-white/10">
              Post Request
            </button>
          </div>
          <div class="flex items-center space-x-4 pl-2 md:pl-4">
            @if (authService.currentUser()?.avatar) {
              <button routerLink="/settings" title="Profile Settings" class="group relative">
                <img [src]="authService.currentUser()?.avatar" class="w-11 h-11 rounded-[1.25rem] border-2 border-white/20 shadow-md group-hover:border-cyan-400 transition-all object-cover">
                <div class="absolute inset-0 rounded-[1.25rem] bg-indigo-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
              </button>
            }
            <button (click)="logout()" class="w-11 h-11 rounded-[1.25rem] bg-[#130E2A] border border-white/10 text-indigo-300 hover:text-red-400 hover:border-red-400/50 hover:bg-red-500/10 flex items-center justify-center transition-all shadow-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </div>
      </header>
      
      <!-- Massive Premium Hero Section -->
      <div class="text-center max-w-4xl mx-auto mb-16 pt-4 animate-fade-in-up">
        <h2 class="text-6xl md:text-[5rem] font-black text-white tracking-tight mb-6 leading-[1.1]">
          Unlock the value of <br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 drop-shadow-lg">Shared Access</span>
        </h2>
        <p class="text-xl text-indigo-200/80 max-w-2xl mx-auto font-medium leading-relaxed">Join Tunisia's most trusted P2P marketplace. Rent what you need for a day, or list your gear and start earning passively.</p>
      </div>

      <!-- Search Bar (Dark Glass) -->
      <div class="glass mx-auto max-w-4xl rounded-full p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 mb-16 flex flex-col md:flex-row items-center relative z-20 animate-fade-in-up" style="animation-delay: 100ms">
        
        <div class="flex-1 w-full relative px-6 py-3 hover:bg-white/5 rounded-full cursor-text transition-colors group">
          <label class="block text-[11px] font-extrabold text-indigo-300 uppercase tracking-wider mb-1">Looking for</label>
          <input type="text" [(ngModel)]="searchCategory" placeholder="e.g. Cameras, Tents, Tools" 
                 class="w-full bg-transparent border-none p-0 focus:ring-0 text-white font-semibold placeholder-indigo-300/40 outline-none truncate">
        </div>
        
        <div class="w-full md:w-px h-px md:h-12 bg-white/10 my-2 md:my-0"></div>
        
        <div class="flex-1 w-full relative px-6 py-3 hover:bg-white/5 rounded-full cursor-text transition-colors group">
          <label class="block text-[11px] font-extrabold text-indigo-300 uppercase tracking-wider mb-1">Location</label>
          <input type="text" [(ngModel)]="searchCity" placeholder="Where do you need it?" 
                 class="w-full bg-transparent border-none p-0 focus:ring-0 text-white font-semibold placeholder-indigo-300/40 outline-none truncate">
        </div>

        <button (click)="loadPosts()" class="w-full md:w-auto mt-2 md:mt-0 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-5 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <span class="font-bold text-lg">Search</span>
        </button>
      </div>

      <!-- Segmented Control Tabs -->
      <div class="flex justify-center mb-12 animate-fade-in-up" style="animation-delay: 200ms">
        <div class="bg-[#130E2A]/80 backdrop-blur-md p-1.5 rounded-[1.5rem] inline-flex shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10">
          <button (click)="setTab('OFFER')" 
                  [ngClass]="activeTab() === 'OFFER' ? 'bg-white/10 shadow text-cyan-400 border border-white/10' : 'text-indigo-300 hover:text-white border-transparent'"
                  class="px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2.5 text-sm border">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" *ngIf="activeTab() === 'OFFER'"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
            Available Offers
          </button>
          <button (click)="setTab('REQUEST')" 
                  [ngClass]="activeTab() === 'REQUEST' ? 'bg-white/10 shadow text-purple-400 border border-white/10' : 'text-indigo-300 hover:text-white border-transparent'"
                  class="px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2.5 text-sm border">
             <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" *ngIf="activeTab() === 'REQUEST'"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
            Community Requests
          </button>
        </div>
      </div>

      <!-- Feed Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        @for (post of filteredPosts(); track post.id; let i = $index) {
          <div class="glass border border-white/10 rounded-[2rem] overflow-hidden relative flex flex-col h-[420px] animate-fade-in-up hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] hover:border-white/20 transition-all duration-300" [ngClass]="'delay-' + (i % 12)">
            
            <!-- Cover Image (or placeholder) -->
            <div class="h-56 w-full relative overflow-hidden shrink-0 group bg-[#0A061E]/50">
              @if (post.image) {
                <img [src]="apiUrl + post.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100">
              } @else {
                <div class="w-full h-full flex flex-col items-center justify-center opacity-30">
                  <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-2">
                    <span class="text-2xl font-black text-white/50">K</span>
                  </div>
                </div>
              }
              <div class="absolute inset-0 bg-gradient-to-t from-[#130E2A] via-[#130E2A]/40 to-transparent pointer-events-none"></div>
              
              <!-- Floating Price Badge over image -->
              <div class="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center shadow-lg">
                @if (post.price) {
                  <span class="font-black text-cyan-400 text-sm">{{ post.price }}<span class="text-[10px] text-cyan-400/70 ml-0.5">TND/d</span></span>
                } @else {
                  <span class="font-bold text-purple-400 text-xs shadow-purple-500">Negotiable</span>
                }
              </div>

              <!-- Category Badge -->
              <div class="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg shadow-sm">
                <span class="text-[10px] font-black text-white uppercase tracking-widest">{{ post.category }}</span>
              </div>
            </div>
            
            <!-- Card Body -->
            <div class="p-6 flex-1 flex flex-col bg-[#130E2A]/60">
              <div class="flex justify-between items-start mb-2 gap-4">
                <h3 class="text-xl font-black text-white line-clamp-2 leading-tight drop-shadow-md">{{ post.title }}</h3>
                
                <!-- Avatar -->
                <div class="w-10 h-10 rounded-full border-2 border-[#130E2A] shadow-[0_0_10px_rgba(0,0,0,0.5)] shrink-0 relative -mt-10 z-10 bg-[#0A061E]">
                  @if (post.owner?.avatar) {
                    <img [src]="post.owner?.avatar" class="w-full h-full rounded-full object-cover" [title]="post.owner?.fullName">
                  } @else {
                    <div class="w-full h-full rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs" [title]="post.owner?.fullName">
                      {{ post.owner?.fullName?.charAt(0) }}
                    </div>
                  }
                </div>
              </div>

              <p class="text-indigo-200/60 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">{{ post.description }}</p>
              
              <div class="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
                <div class="flex items-center text-indigo-300 text-xs font-bold">
                  <svg class="w-4 h-4 mr-1 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                  {{ post.location }}
                </div>
                
                <button (click)="openContact(post)" class="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all">
                  Contact
                </button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-24 px-4 text-center animate-fade-in-up">
            <div class="w-32 h-32 mx-auto bg-[#130E2A]/50 border border-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <svg class="h-16 w-16 text-indigo-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 class="text-3xl font-black text-white mb-2">No listings found</h3>
            <p class="text-indigo-300 max-w-md mx-auto text-lg font-medium">Be the first to create a post in this area and get the community started!</p>
            <button (click)="searchCategory=''; searchCity=''; loadPosts()" class="mt-8 text-cyan-400 font-bold hover:underline hover:text-cyan-300 transition-colors">Clear Filters</button>
          </div>
        }
      </div>

      <!-- Chat Modal -->
      @if (selectedPost()) {
        <div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4" (click)="closeContact()">
          <div class="absolute inset-0 bg-[#0A061E]/80 backdrop-blur-md"></div>
          <div class="glass border border-white/10 w-full max-w-md rounded-[2.5rem] flex flex-col relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-slide-up overflow-hidden" style="max-height: 85vh" (click)="$event.stopPropagation()">
            <!-- Chat Header -->
            <div class="flex items-center gap-4 p-5 border-b border-white/10 bg-[#130E2A]/80 shrink-0">
              <div class="relative">
                @if (selectedPost()?.owner?.avatar) {
                  <img [src]="selectedPost()?.owner?.avatar" class="w-12 h-12 rounded-[1rem] object-cover border-2 border-[#130E2A] shadow-sm">
                } @else {
                  <div class="w-12 h-12 rounded-[1rem] border-2 border-[#130E2A] bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {{ selectedPost()?.owner?.fullName?.charAt(0) }}
                  </div>
                }
                <span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#130E2A] shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
              </div>
              <div class="flex-1">
                <p class="font-black text-white text-lg leading-tight">{{ selectedPost()?.owner?.fullName }}</p>
                <p class="text-[11px] font-bold text-cyan-400 uppercase tracking-wider truncate">{{ selectedPost()?.title }}</p>
              </div>
              <button (click)="closeContact()" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-indigo-300 hover:bg-white/10 hover:text-white transition-all shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <!-- Messages Area -->
            <div #chatScroll class="flex-1 overflow-y-auto p-5 space-y-4 bg-[#0A061E]/90" style="min-height:300px; max-height:400px">
              @if (messages().length === 0) {
                <div class="flex flex-col items-center justify-center h-full text-center">
                  <div class="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                    <span class="text-2xl drop-shadow-md">👋</span>
                  </div>
                  <p class="text-indigo-300 font-bold text-sm">Say hi to start the conversation!</p>
                </div>
              }
              @for (msg of messages(); track msg.id) {
                <div class="flex" [class.justify-end]="msg.senderId === myUserId()">
                  @if (msg.senderId !== myUserId()) {
                    <div class="w-8 h-8 rounded-full mr-2 self-end shrink-0 shadow-md border border-white/10 bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center object-cover text-white font-bold text-xs">
                      {{ msg.senderAvatar ? '' : msg.senderId }}
                    </div>
                  }
                  <div class="max-w-[75%] px-4 py-3 rounded-2xl text-sm font-semibold shadow-md"
                       [ngClass]="msg.senderId === myUserId() ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-br-sm' : 'bg-[#130E2A] text-indigo-100 rounded-bl-sm border border-white/10'">
                    {{ msg.content }}
                    <span class="block text-[10px] mt-1.5 font-bold" [class.opacity-70]="msg.senderId === myUserId()" [class.text-indigo-400]="msg.senderId !== myUserId()" [class.text-right]="msg.senderId === myUserId()">{{ msg.createdAt }}</span>
                  </div>
                </div>
              }
            </div>

            <!-- Message Input -->
            <div class="p-4 bg-[#130E2A]/90 shrink-0 border-t border-white/10">
              <form (ngSubmit)="sendMessage()" class="flex items-center gap-3">
                <input type="text" [(ngModel)]="newMessage" name="newMsg" placeholder="Type a message..."
                       class="flex-1 px-5 py-4 rounded-full bg-[#0A061E] border border-white/10 text-white placeholder-indigo-300/50 font-semibold outline-none text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all">
                <button type="submit" [disabled]="!newMessage.trim() || isSending()"
                        class="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all disabled:opacity-50 shrink-0 border border-white/10">
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
    public apiUrl = environment.apiUrl;
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
