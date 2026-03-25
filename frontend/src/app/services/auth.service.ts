import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private apiUrl = 'http://127.0.0.1:8000/api/auth';
    
    private currentUserSignal = signal<User | null>(null);

    public currentUser = computed(() => this.currentUserSignal());
    public isAuthenticated = computed(() => !!this.currentUserSignal());

    constructor() {
        const storedUser = localStorage.getItem('kray_user');
        if (storedUser) {
            this.currentUserSignal.set(JSON.parse(storedUser));
        }
    }

    loginWithSocial(provider: 'facebook' | 'google', email: string, fullName: string, avatar: string): Observable<{ user: User }> {
        return this.http.post<{ user: User }>(`${this.apiUrl}/login`, { provider, email, fullName, avatar }).pipe(
            tap(res => {
                this.currentUserSignal.set(res.user);
                localStorage.setItem('kray_user', JSON.stringify(res.user));
            })
        );
    }

    logout() {
        this.currentUserSignal.set(null);
        localStorage.removeItem('kray_user');
    }

    getUserId(): number | null {
        const user = this.currentUserSignal();
        return user ? user.id : null;
    }
}
