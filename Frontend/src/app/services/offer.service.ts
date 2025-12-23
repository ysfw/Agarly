import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Offer {
    id?: number;
    description: string;
    createdAt?: string;
    requestId?: number;
    responderId?: number;
    status?: string;
    user?: {
        id?: number;
        username?: string;
        firstName?: string;
        lastName?: string;
        profileImageUrl?: string;
    };
    request?: {
        id?: number;
        title?: string;
        category?: string;
        startDate?: string;
        endDate?: string;
        requester?: {
            id?: number;
            username?: string;
            firstName?: string;
            lastName?: string;
        };
    };
}

@Injectable({
    providedIn: 'root'
})
export class OfferService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/offers';

    addOffer(requestId: number, description: string): Observable<Offer> {
        return this.http.post<Offer>(`${this.apiUrl}/request/${requestId}`, { description });
    }

    updateOfferStatus(offerId: number, status: 'ACCEPTED' | 'REJECTED', borrowerUserId?: number): Observable<Offer> {
        let params = new HttpParams().set('status', status);
        if (borrowerUserId) {
            params = params.set('borrowerUserId', borrowerUserId.toString());
        }
        return this.http.patch<Offer>(`${this.apiUrl}/${offerId}/status`, null, { params });
    }

    getMyOffers(): Observable<Offer[]> {
        return this.http.get<Offer[]>(this.apiUrl);
    }
}
