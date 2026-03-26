import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Message {
    id: number;
    content: string;
    senderId: number;
    senderName: string;
    senderAvatar: string;
    createdAt: string;
}

export interface Conversation {
    postId: number;
    postTitle: string;
    otherId: number;
    otherName: string;
    otherAvatar: string;
    lastMessage: string;
    lastTime: string;
    isMine: boolean;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
    private apiUrl = environment.apiUrl + '/api/messages';
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    private headers(): HttpHeaders {
        const userId = this.authService.getUserId();
        return new HttpHeaders(userId ? { 'X-User-Id': userId.toString(), 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' });
    }

    getInbox(): Observable<{ data: Conversation[] }> {
        return this.http.get<{ data: Conversation[] }>(`${environment.apiUrl}/api/messages/conversations`, { headers: this.headers() });
    }

    getConversation(postId: number, ownerId: number): Observable<{ data: Message[] }> {
        return this.http.get<{ data: Message[] }>(`${this.apiUrl}/${postId}/${ownerId}`, { headers: this.headers() });
    }

    sendMessage(postId: number, receiverId: number, content: string): Observable<Message> {
        return this.http.post<Message>(`${this.apiUrl}/${postId}/${receiverId}`, { content }, { headers: this.headers() });
    }
}
