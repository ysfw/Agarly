import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';

export interface AdminLoginCredentials {
    email: string;
    password: string;
}

export interface AdminItem {
    id: number;
    title: string;
    description: string;
    category: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    pricePerDay: number;
    priceUnit: string;
    location: string;
    imageUrls: string[];
    owner: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export interface AdminRequest {
    id: number;
    title: string;
    description: string;
    category: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    urgency: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    requester: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export interface DashboardStats {
    pendingPosts: number;
    pendingRequests: number;
    totalPosts: number;
    totalRequests: number;
    openTickets: number;
    totalTickets: number;
}

export type AdminTicketStatus = 'PENDING' | 'OPEN' | 'CLOSED';

export interface AdminSupportTicketDto {
    id: number;
    subject: string;
    message: string;
    status: AdminTicketStatus | string;
    createdAt: string;
    createdBy?: {
        username?: string;
        email?: string;
    };
}

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private baseUrl = 'http://localhost:8080';

    // Admin authentication state
    private adminToken = signal<string | null>(localStorage.getItem('adminToken'));
    isAdminLoggedIn = signal<boolean>(!!localStorage.getItem('adminToken'));

    private getAuthHeaders(): HttpHeaders {
        const token = this.adminToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        });
    }

    // ==================== Authentication ====================

    login(credentials: AdminLoginCredentials): Observable<{ Token: string }> {
        return this.http.post<{ Token: string }>(
            `${this.baseUrl}/account/Admin-login`,
            credentials,
            { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
        ).pipe(
            tap(response => {
                // Backend returns "Token" with capital T
                const token = response.Token;
                console.log('Admin token received:', token ? 'yes' : 'no');
                localStorage.setItem('adminToken', token);
                this.adminToken.set(token);
                this.isAdminLoggedIn.set(true);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('adminToken');
        this.adminToken.set(null);
        this.isAdminLoggedIn.set(false);
        this.router.navigate(['/admin-login']);
    }

    isAuthenticated(): boolean {
        return this.isAdminLoggedIn();
    }

    // ==================== Dashboard Stats ====================

    getDashboardStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(
            `${this.baseUrl}/admin/stats`,
            { headers: this.getAuthHeaders() }
        );
    }

    // ==================== Item (Post) Management ====================

    getItems(): Observable<AdminItem[]> {
        return this.http.get<AdminItem[]>(
            `${this.baseUrl}/admin/items`,
            { headers: this.getAuthHeaders() }
        );
    }

    getPendingItems(): Observable<AdminItem[]> {
        return this.http.get<AdminItem[]>(
            `${this.baseUrl}/admin/items/pending`,
            { headers: this.getAuthHeaders() }
        );
    }

    approveItem(id: number): Observable<string> {
        return this.http.put(
            `${this.baseUrl}/admin/items/${id}/approve`,
            {},
            { headers: this.getAuthHeaders(), responseType: 'text' }
        );
    }

    rejectItem(id: number): Observable<string> {
        return this.http.put(
            `${this.baseUrl}/admin/items/${id}/reject`,
            {},
            { headers: this.getAuthHeaders(), responseType: 'text' }
        );
    }

    deleteItem(id: number): Observable<string> {
        return this.http.delete(
            `${this.baseUrl}/admin/items/${id}`,
            { headers: this.getAuthHeaders(), responseType: 'text' }
        );
    }

    // ==================== Request Management ====================

    getRequests(): Observable<AdminRequest[]> {
        return this.http.get<AdminRequest[]>(
            `${this.baseUrl}/admin/requests`,
            { headers: this.getAuthHeaders() }
        );
    }

    getPendingRequests(): Observable<AdminRequest[]> {
        return this.http.get<AdminRequest[]>(
            `${this.baseUrl}/admin/requests/pending`,
            { headers: this.getAuthHeaders() }
        );
    }

    approveRequest(id: number): Observable<string> {
        return this.http.put(
            `${this.baseUrl}/admin/requests/${id}/approve`,
            {},
            { headers: this.getAuthHeaders(), responseType: 'text' }
        );
    }

    rejectRequest(id: number): Observable<string> {
        return this.http.put(
            `${this.baseUrl}/admin/requests/${id}/reject`,
            {},
            { headers: this.getAuthHeaders(), responseType: 'text' }
        );
    }

    deleteRequest(id: number): Observable<string> {
        return this.http.delete(
            `${this.baseUrl}/admin/requests/${id}`,
            { headers: this.getAuthHeaders(), responseType: 'text' }
        );
    }

    // ==================== User Management ====================

    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(
            `${this.baseUrl}/admin/users`,
            { headers: this.getAuthHeaders() }
        );
    }

    searchUsers(query: string): Observable<any[]> {
        return this.http.get<any[]>(
            `${this.baseUrl}/admin/users/search?q=${encodeURIComponent(query)}`,
            { headers: this.getAuthHeaders() }
        );
    }

    banUser(userId: number): Observable<string> {
        return this.http.put(
            `${this.baseUrl}/admin/users/${userId}/ban`,
            {},
            { headers: this.getAuthHeaders(), responseType: 'text' }
        );
    }

    unbanUser(userId: number): Observable<string> {
        return this.http.put(
            `${this.baseUrl}/admin/users/${userId}/unban`,
            {},
            { headers: this.getAuthHeaders(), responseType: 'text' }
        );
    }

    // ==================== Support Tickets ====================
    
    getAllSupportTickets(): Observable<AdminSupportTicketDto[]> {
        return this.http.get<AdminSupportTicketDto[]>(
            `${this.baseUrl}/admin/tickets`,
            { headers: this.getAuthHeaders() }
        );
    }

    getSupportTicket(id: number): Observable<AdminSupportTicketDto> {
        return this.http.get<AdminSupportTicketDto>(
            `${this.baseUrl}/admin/tickets/${id}`,
            { headers: this.getAuthHeaders() }
        );
    }

    closeSupportTicket(id: number): Observable<AdminSupportTicketDto> {
        return this.http.put<AdminSupportTicketDto>(
            `${this.baseUrl}/admin/tickets/${id}/close`,
            {},
            { headers: this.getAuthHeaders() }
        );
    }

    reopenSupportTicket(id: number): Observable<AdminSupportTicketDto> {
        return this.http.put<AdminSupportTicketDto>(
            `${this.baseUrl}/admin/tickets/${id}/reopen`,
            {},
            { headers: this.getAuthHeaders() }
        );
    }

    getPendingSupportTickets(): Observable<AdminSupportTicketDto[]> {
        return this.http.get<AdminSupportTicketDto[]>(
            `${this.baseUrl}/admin/tickets/pending`,
            { headers: this.getAuthHeaders() }
        );
    }

    getOpenSupportTickets(): Observable<AdminSupportTicketDto[]> {
        return this.http.get<AdminSupportTicketDto[]>(
            `${this.baseUrl}/admin/tickets/open`,
            { headers: this.getAuthHeaders() }
        );
    }

    getClosedSupportTickets(): Observable<AdminSupportTicketDto[]> {
        return this.http.get<AdminSupportTicketDto[]>(
            `${this.baseUrl}/admin/tickets/closed`,
            { headers: this.getAuthHeaders() }
        );
    }
}

