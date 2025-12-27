import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentMethod {
    id: number;
    provider?: string;
    displayName: string;
    lastFourDigits: string;
    cardType: string;
    expiryMonth: number;
    expiryYear: number;
    phoneNumber?: string;
    isDefault: boolean;
    isActive: boolean;
}

export interface Transaction {
    id: number;
    amount: number;
    type: 'PAYMENT' | 'PAYOUT' | 'REFUND' | 'DEPOSIT' | 'WITHDRAWAL';
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

export interface InitiatePaymentRequest {
    amount: number;
    method: 'CARD' | 'WALLET' | 'FAWRY' | 'INTERNAL_WALLET';
    phoneNumber?: string;  // Required for WALLET payments
    bookingId?: number;
    description: string;
}

export interface InitiatePaymentResponse {
    success: boolean;
    errorMessage?: string;
    method: string;
    orderId: string;
    // For CARD payments
    paymentKey?: string;
    iframeId?: string;
    // For WALLET payments
    redirectUrl?: string;
    // For FAWRY payments
    fawryReference?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentApiService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:8080/payments';

    initiatePayment(request: InitiatePaymentRequest): Observable<InitiatePaymentResponse> {
        return this.http.post<InitiatePaymentResponse>(`${this.baseUrl}/initiate`, request);
    }

    getPaymobIframeUrl(iframeId: string, paymentKey: string): string {
        return `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;
    }

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

    charge(request: ChargeRequest): Observable<Transaction> {
        return this.http.post<Transaction>(`${this.baseUrl}/charge`, request);
    }

    verifyPayment(params: any): Observable<any> {
        const url = `${this.baseUrl}/verify`;
        return this.http.get<any>(url, { params });
    }

    getTransactionHistory(page: number = 0, size: number = 10): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/history`, {
            params: { page: page.toString(), size: size.toString() }
        });
    }
}
