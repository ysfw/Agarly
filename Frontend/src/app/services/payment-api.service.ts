import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface PaymentMethod {
    id: number;
    displayName: string;
    lastFourDigits: string;
    cardType: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
    isActive: boolean;
}

export interface Transaction {
    id: number;
    amount: number;
    type: 'PAYMENT' | 'EARNING' | 'REFUND' | 'DEPOSIT';
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    description: string;
    createdAt: string;
    referenceNumber: string;
}

export interface ChargeRequest {
    paymentMethodId: number;
    amount: number;
    bookingId?: number;
    description: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentApiService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:8080/payments';

    // Payment Methods
    getPaymentMethods(): Observable<PaymentMethod[]> {
        return this.http.get<PaymentMethod[]>(`${this.baseUrl}/methods`);
    }

    addPaymentMethod(cardData: any): Observable<PaymentMethod> {
        return this.http.post<PaymentMethod>(`${this.baseUrl}/methods`, cardData);
    }

    removePaymentMethod(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/methods/${id}`);
    }

    setDefaultPaymentMethod(id: number): Observable<PaymentMethod> {
        return this.http.patch<PaymentMethod>(`${this.baseUrl}/methods/${id}/default`, {});
    }

    // Transactions
    charge(request: ChargeRequest): Observable<Transaction> {
        return this.http.post<Transaction>(`${this.baseUrl}/charge`, request);
    }

    getTransactionHistory(page: number = 0, size: number = 10): Observable<Transaction[]> {
        return this.http.get<Transaction[]>(`${this.baseUrl}/history`, {
            params: { page: page.toString(), size: size.toString() }
        });
    }

    // Mock data for demo (until backend is ready)
    getMockPaymentMethods(): Observable<PaymentMethod[]> {
        return of([
            {
                id: 1,
                displayName: 'Visa •••• 4242',
                lastFourDigits: '4242',
                cardType: 'VISA',
                expiryMonth: 12,
                expiryYear: 2026,
                isDefault: true,
                isActive: true
            },
            {
                id: 2,
                displayName: 'Mastercard •••• 8888',
                lastFourDigits: '8888',
                cardType: 'MASTERCARD',
                expiryMonth: 6,
                expiryYear: 2025,
                isDefault: false,
                isActive: true
            }
        ]);
    }

    getMockTransactionHistory(): Observable<Transaction[]> {
        return of([
            {
                id: 1,
                amount: 25.00,
                type: 'PAYMENT',
                status: 'COMPLETED',
                description: 'Rental: Power Drill - 3 days',
                createdAt: '2025-01-15T10:30:00',
                referenceNumber: 'TXN-001234'
            },
            {
                id: 2,
                amount: 15.00,
                type: 'EARNING',
                status: 'COMPLETED',
                description: 'Rental Income: Stand Mixer',
                createdAt: '2025-01-14T14:20:00',
                referenceNumber: 'TXN-001233'
            },
            {
                id: 3,
                amount: 50.00,
                type: 'DEPOSIT',
                status: 'PENDING',
                description: 'Security Deposit Held',
                createdAt: '2025-01-13T09:15:00',
                referenceNumber: 'TXN-001232'
            },
            {
                id: 4,
                amount: 10.00,
                type: 'REFUND',
                status: 'COMPLETED',
                description: 'Deposit Refund: Ladder',
                createdAt: '2025-01-12T16:45:00',
                referenceNumber: 'TXN-001231'
            }
        ]);
    }
}
