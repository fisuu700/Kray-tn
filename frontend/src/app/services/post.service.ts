import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, PostCreateDto } from '../models/post.model';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class PostService {
    private apiUrl = 'http://127.0.0.1:8000/api/posts';
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    private getAuthHeaders(): HttpHeaders {
        let headers = new HttpHeaders();
        const userId = this.authService.getUserId();
        if (userId) headers = headers.set('X-User-Id', userId.toString());
        return headers;
    }

    getPosts(filters?: { type?: string; category?: string; city?: string }): Observable<{ message: string, data: Post[] }> {
        let params = new HttpParams();
        if (filters?.type) params = params.set('type', filters.type);
        if (filters?.category) params = params.set('category', filters.category);
        if (filters?.city) params = params.set('city', filters.city);
        return this.http.get<{ message: string, data: Post[] }>(this.apiUrl, { params, headers: this.getAuthHeaders() });
    }

    createPost(post: PostCreateDto, imageFile?: File): Observable<{ message: string, postId: number }> {
        // Use FormData to support file upload
        const formData = new FormData();
        formData.append('type', post.type);
        formData.append('title', post.title);
        formData.append('description', post.description);
        formData.append('category', post.category);
        formData.append('location', post.location);
        if (post.price != null) formData.append('price', post.price.toString());
        if (imageFile) formData.append('image', imageFile, imageFile.name);

        return this.http.post<{ message: string, postId: number }>(this.apiUrl, formData, { headers: this.getAuthHeaders() });
    }
}
