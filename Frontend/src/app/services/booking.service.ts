import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateBookingRequest {
    itemId: number;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
}

export interface Booking {
    id: number;
    borrowerId: number;
    itemId: number;
    startDate: string;
    endDate: string;
    status?: string;
    createdAt?: string;
    notes?: string;
    borrowerName?: string;
    ownerName?: string;
    itemTitle?: string;
    itemImageUrl?: string;
    borrower?: BookingParticipant;
    owner?: BookingParticipant;
    item?: BookingItemSummary;
}

export interface BookingParticipant {
    id?: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
}

export interface BookingItemSummary {
    id?: number;
    title?: string;
    imageUrl?: string;
    imageUrls?: string[];
    primaryImageUrl?: string;
    owner?: BookingParticipant;
}

export interface UpdateBookingRequest {
    status: string;
}

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/bookings`;

    createBooking(request: CreateBookingRequest): Observable<Booking> {
        return this.http.post<Booking>(this.baseUrl, request);
    }

    getReceivedRequests(): Observable<Booking[]> {
        return this.http.get<Booking[]>(this.baseUrl);
    }

    getSentRequests(): Observable<Booking[]> {
        return this.http.get<Booking[]>(`${this.baseUrl}/sent`);
    }

    updateStatus(bookingId: number, status: string): Observable<Booking> {
        const payload: UpdateBookingRequest = { status };
        return this.http.put<Booking>(`${this.baseUrl}/${bookingId}/status`, payload);
    }
}
