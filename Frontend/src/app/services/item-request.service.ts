import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ItemRequest {
    id?: number;
    title: string;
    description: string;
    category?: string;
    startDate: string; // ISO date string
    endDate: string;
    requester?: {
        id: number;
        username: string;
        firstName: string;
        lastName: string;
    };
    status?: string;
    urgency?: string; // 'urgent' | 'soon' | 'flexible'
    responses?: number; // Count of responses (if available from backend)
    postedTime?: string; // Calculated on frontend
}

@Injectable({
    providedIn: 'root'
})
export class ItemRequestService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/item-requests';

    getAllRequests(): Observable<ItemRequest[]> {
        return this.http.get<ItemRequest[]>(this.apiUrl);
    }

    getMyRequests(): Observable<ItemRequest[]> {
        return this.http.get<ItemRequest[]>(`${this.apiUrl}/my`);
    }

    createRequest(request: ItemRequest): Observable<ItemRequest> {
        return this.http.post<ItemRequest>(this.apiUrl, request);
    }

    deleteRequest(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
