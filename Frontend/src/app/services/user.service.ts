import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
    rating: number;
    bio?: string;
    city?: string;
    state?: string;
    totalItemsPosted: number;
    joinedDate?: string;
}

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:8080';

    getUserProfile(id: number): Observable<UserProfile> {
        return this.http.get<UserProfile>(`${this.baseUrl}/users/${id}`);
    }

    // Note: User items are fetched from ItemService.getItems() with owner filter
}
