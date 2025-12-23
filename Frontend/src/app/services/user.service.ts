import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models/item.model';

export interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    username?: string;
    email?: string | null; // Null if hidden by privacy settings
    phoneNumber?: string | null; // Null if hidden by privacy settings
    profileImageUrl?: string;
    rating: number;
    bio?: string | null;
    city?: string;
    state?: string;
    address?: string | null; // Null if hidden by privacy settings
    totalItemsPosted: number;
    joinedDate?: string;
    blocked?: boolean;
    verified?: boolean;
    // Privacy settings info
    profileVisibility?: string;
    isRestricted?: boolean; // True if viewer cannot see full profile
}

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:8080';

    getUserProfile(id: number): Observable<UserProfile> {
        // The auth interceptor will automatically add the Authorization header if logged in
        return this.http.get<UserProfile>(`${this.baseUrl}/users/${id}`);
    }

    getUserItems(id: number): Observable<Item[]> {
        return this.http.get<Item[]>(`${this.baseUrl}/users/${id}/items`);
    }

    getUserByUsername(username: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/users/username/${username}`);
    }
}
