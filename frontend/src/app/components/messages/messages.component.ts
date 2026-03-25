import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService, Message, Conversation } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-messages',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="min-h-screen px-4 py-6 md:px-10 max-w-6xl mx-auto">

      <!-- Navbar -->
      <header class="glass rounded-2xl flex justify-between items-center px-6 py-4 mb-8 sticky top-6 z-50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg">K</div>
          <h1 class="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Kray.tn</h1>
        </div>
        <div class="flex items-center gap-3">
          <button routerLink="/dashboard" class="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors text-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Dashboard
          </button>
        </div>
      </header>

      <div class="flex gap-6 h-[calc(100vh-160px)]">

        <!-- LEFT: Conversation List -->
        <div class="w-full md:w-80 lg:w-96 shrink-0 flex flex-col glass rounded-[2rem] overflow-hidden">
          <div class="p-5 border-b border-slate-100">
            <h2 class="text-xl font-black text-slate-800">Discussions</h2>
            <p class="text-sm text-slate-500 font-medium mt-0.5">{{ conversations().length }} active conversation{{ conversations().length !== 1 ? 's' : '' }}</p>
          </div>

          <div class="flex-1 overflow-y-auto divide-y divide-slate-50">
            @if (conversations().length === 0) {
              <div class="flex flex-col items-center justify-center h-full py-16 text-center px-6">
                <div class="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                  <svg class="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                </div>
                <p class="font-bold text-slate-700 mb-1">No conversations yet</p>
                <p class="text-sm text-slate-400">Contact a seller from the dashboard to start chatting!</p>
                <button routerLink="/dashboard" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-2xl font-semibold text-sm hover:bg-indigo-700 transition-colors">Browse Items</button>
              </div>
            }
            @for (conv of conversations(); track conv.postId + '_' + conv.otherId) {
              <button (click)="openConv(conv)" class="w-full flex items-center gap-3 px-5 py-4 hover:bg-indigo-50/60 transition-colors text-left"
                      [class.bg-indigo-50]="active()?.postId === conv.postId && active()?.otherId === conv.otherId">
                <div class="relative shrink-0">
                  <img [src]="conv.otherAvatar" class="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow">
                  <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-baseline mb-0.5">
                    <span class="font-black text-slate-800 text-sm truncate">{{ conv.otherName }}</span>
                    <span class="text-[10px] text-slate-400 font-medium shrink-0 ml-2">{{ conv.lastTime }}</span>
                  </div>
                  <p class="text-xs text-slate-400 truncate">
                    <span class="text-indigo-500 font-semibold">{{ conv.postTitle }}</span>
                  </p>
                  <p class="text-xs text-slate-500 truncate mt-0.5">
                    {{ conv.isMine ? 'You: ' : '' }}{{ conv.lastMessage }}
                  </p>
                </div>
              </button>
            }
          </div>
        </div>

        <!-- RIGHT: Active Chat -->
        <div class="flex-1 glass rounded-[2rem] flex flex-col overflow-hidden">
          @if (!active()) {
            <div class="flex flex-col items-center justify-center h-full text-center px-10">
              <div class="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
                <svg class="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              </div>
              <h3 class="text-2xl font-black text-slate-800 mb-2">Select a conversation</h3>
              <p class="text-slate-500 font-medium">Choose a chat from the left to start messaging</p>
            </div>
          } @else {
            <!-- Chat Header -->
            <div class="flex items-center gap-3 p-5 border-b border-slate-100 shrink-0">
              <div class="relative">
                <img [src]="active()?.otherAvatar" class="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow">
                <span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <p class="font-black text-slate-800 text-lg leading-tight">{{ active()?.otherName }}</p>
                <p class="text-xs text-slate-400 font-medium">Re: <span class="text-indigo-600 font-semibold">{{ active()?.postTitle }}</span></p>
              </div>
            </div>

            <!-- Messages Area -->
            <div #chatScroll class="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/40">
              @if (messages().length === 0) {
                <div class="flex flex-col items-center justify-center h-full py-10 text-center">
                  <p class="text-slate-400 font-medium">Loading messages...</p>
                </div>
              }
              @for (msg of messages(); track msg.id) {
                <div class="flex" [class.justify-end]="msg.senderId === myId()">
                  @if (msg.senderId !== myId()) {
                    <img [src]="msg.senderAvatar" class="w-8 h-8 rounded-xl object-cover mr-2 self-end shrink-0">
                  }
                  <div class="max-w-[65%] px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm"
                       [class.bg-indigo-600]="msg.senderId === myId()" [class.text-white]="msg.senderId === myId()" [class.rounded-br-sm]="msg.senderId === myId()"
                       [class.bg-white]="msg.senderId !== myId()" [class.text-slate-800]="msg.senderId !== myId()" [class.rounded-bl-sm]="msg.senderId !== myId()">
                    {{ msg.content }}
                    <span class="block text-[10px] mt-1" [class.text-indigo-200]="msg.senderId === myId()" [class.text-slate-400]="msg.senderId !== myId()">{{ msg.createdAt }}</span>
                  </div>
                </div>
              }
            </div>

            <!-- Input -->
            <div class="p-4 border-t border-slate-100 bg-white shrink-0">
              <form (ngSubmit)="send()" class="flex items-center gap-3">
                <input type="text" [(ngModel)]="newMsg" name="msg" placeholder="Type a message..."
                       class="flex-1 px-4 py-3 rounded-2xl bg-slate-100 text-slate-800 placeholder-slate-400 font-medium outline-none text-sm focus:ring-2 focus:ring-indigo-300 transition-all">
                <button type="submit" [disabled]="!newMsg.trim() || sending()"
                        class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/30">
                  @if (sending()) {
                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  }
                </button>
              </form>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class MessagesComponent implements OnInit, AfterViewChecked {
    @ViewChild('chatScroll') private chatEl!: ElementRef;
    private msgService = inject(MessageService);
    private authService = inject(AuthService);

    conversations = signal<Conversation[]>([]);
    active = signal<Conversation | null>(null);
    messages = signal<Message[]>([]);
    newMsg = '';
    sending = signal(false);

    myId = computed(() => this.authService.getUserId());

    ngOnInit() {
        this.msgService.getInbox().subscribe(res => this.conversations.set(res.data || []));
    }

    openConv(conv: Conversation) {
        this.active.set(conv);
        this.messages.set([]);
        this.msgService.getConversation(conv.postId, conv.otherId).subscribe(res => {
            this.messages.set(res.data || []);
        });
    }

    send() {
        const conv = this.active();
        const content = this.newMsg.trim();
        if (!content || !conv) return;
        this.sending.set(true);
        this.msgService.sendMessage(conv.postId, conv.otherId, content).subscribe({
            next: (msg) => {
                this.messages.update(m => [...m, msg]);
                // update last message in sidebar
                this.conversations.update(list => list.map(c =>
                    c.postId === conv.postId && c.otherId === conv.otherId
                        ? { ...c, lastMessage: content, lastTime: msg.createdAt, isMine: true }
                        : c
                ));
                this.newMsg = '';
                this.sending.set(false);
            },
            error: () => this.sending.set(false)
        });
    }

    ngAfterViewChecked() {
        try {
            if (this.chatEl) {
                const el = this.chatEl.nativeElement;
                el.scrollTop = el.scrollHeight;
            }
        } catch {}
    }
}
