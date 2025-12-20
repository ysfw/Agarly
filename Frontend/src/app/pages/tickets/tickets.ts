import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { SupportService, SupportTicket } from '../../services/support.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class TicketsComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  private supportService = inject(SupportService);
  private router = inject(Router);

  tickets = signal<SupportTicket[]>([]);
  isLoading = signal(true);
  error = signal('');
  selectedTicket = signal<SupportTicket | null>(null);

  ngOnInit(): void {
    this.fetchTickets();
  }

  fetchTickets(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.supportService.getTickets().subscribe({
      next: (data) => {
        this.tickets.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Unable to load tickets right now. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  statusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'status-badge pending';
      case 'OPEN':
        return 'status-badge open';
      case 'CLOSED':
        return 'status-badge closed';
      default:
        return 'status-badge';
    }
  }

  viewTicket(ticket: SupportTicket): void {
    this.selectedTicket.set(ticket);
  }

  trackTicket(_: number, ticket: SupportTicket): number {
    return ticket.id;
  }

  goBack(): void {
    this.router.navigate(['/support']);
  }
}
