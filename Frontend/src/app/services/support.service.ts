import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface SupportTicket {
  id: number;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class SupportService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly baseUrl = 'http://localhost:8080/support/tickets';

  createTicket(subject: string, message: string): Observable<SupportTicket> {
    const token = this.authService.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    const payload = { subject, message };

    return this.http.post<SupportTicket>(this.baseUrl, payload, { headers });
  }

  getTickets(): Observable<SupportTicket[]> {
    const token = this.authService.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.get<SupportTicket[]>(this.baseUrl, { headers });
  }
}
