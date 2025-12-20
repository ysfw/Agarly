import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { LucideAngularModule, LifeBuoy, Search, Mail, User, Clock, X } from 'lucide-angular';
import { AdminService, AdminSupportTicketDto, AdminTicketStatus } from '../../services/admin.service';

type TicketStatus = AdminTicketStatus;

interface AdminSupportTicket {
  id: number;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: Date;
  user: {
    name: string;
    email: string;
  };
}

@Component({
  selector: 'app-admin-tickets',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-tickets.html',
  styleUrl: './admin-tickets.css',
})
export class AdminTickets implements OnInit {
  readonly LifeBuoyIcon = LifeBuoy;
  readonly SearchIcon = Search;
  readonly MailIcon = Mail;
  readonly UserIcon = User;
  readonly ClockIcon = Clock;
  readonly CloseIcon = X;

  private adminService = inject(AdminService);

  private readonly allTickets = signal<AdminSupportTicket[]>([]);

  statusFilter = signal<'ALL' | TicketStatus>('ALL');
  searchQuery = signal('');
  selectedTicket = signal<AdminSupportTicket | null>(null);

  loading = signal(false);
  error = signal<string | null>(null);

  readonly filteredTickets = computed(() => {
    const filter = this.statusFilter();
    const query = this.searchQuery().toLowerCase().trim();

    return this.allTickets().filter((ticket) => {
      if (filter !== 'ALL' && ticket.status !== filter) {
        return false;
      }

      if (!query) return true;

      const inId = ticket.id.toString().includes(query);
      const inSubject = ticket.subject.toLowerCase().includes(query);
      const inUser = (
        ticket.user.name.toLowerCase().includes(query) ||
        ticket.user.email.toLowerCase().includes(query)
      );

      return inId || inSubject || inUser;
    });
  });

  ngOnInit(): void {
    this.loadTicketsForFilter(this.statusFilter());
  }

  setFilter(filter: 'ALL' | TicketStatus): void {
    this.statusFilter.set(filter);
    this.loadTicketsForFilter(filter);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  viewTicket(ticket: AdminSupportTicket): void {
    // Always fetch the latest data for this ticket
    this.adminService.getSupportTicket(ticket.id).subscribe({
      next: (dto) => {
        this.selectedTicket.set(this.mapDtoToTicket(dto));
      },
      error: () => {
        // Fallback to current ticket data if API fails
        this.selectedTicket.set(ticket);
      },
    });
  }

  closeDetail(): void {
    this.selectedTicket.set(null);
  }

  closeTicket(ticket: AdminSupportTicket): void {
    if (ticket.status === 'CLOSED') return;
    this.adminService.closeSupportTicket(ticket.id).subscribe({
      next: (dto) => {
        const updated = this.mapDtoToTicket(dto);
        this.replaceTicketInList(updated);
        const current = this.selectedTicket();
        if (current && current.id === updated.id) {
          this.selectedTicket.set(updated);
        }
      },
      error: () => {
        // Optionally set an error message
      },
    });
  }

  reopenTicket(ticket: AdminSupportTicket): void {
    if (ticket.status !== 'CLOSED') return;
    this.adminService.reopenSupportTicket(ticket.id).subscribe({
      next: (dto) => {
        const updated = this.mapDtoToTicket(dto);
        this.replaceTicketInList(updated);
        const current = this.selectedTicket();
        if (current && current.id === updated.id) {
          this.selectedTicket.set(updated);
        }
      }
    });
  }

  private updateTicketStatus(id: number, status: TicketStatus): void {
    this.allTickets.update((list) =>
      list.map((t) => (t.id === id ? { ...t, status } : t))
    );

    const current = this.selectedTicket();
    if (current && current.id === id) {
      this.selectedTicket.set({ ...current, status });
    }
  }

   private loadTicketsForFilter(filter: 'ALL' | TicketStatus): void {
    this.loading.set(true);
    this.error.set(null);

    let source$;
    switch (filter) {
      case 'PENDING':
        source$ = this.adminService.getPendingSupportTickets();
        break;
      case 'OPEN':
        source$ = this.adminService.getOpenSupportTickets();
        break;
      case 'CLOSED':
        source$ = this.adminService.getClosedSupportTickets();
        break;
      case 'ALL':
      default:
        source$ = this.adminService.getAllSupportTickets();
        break;
    }

    source$.subscribe({
      next: (dtos) => {
        const mapped = dtos.map((dto) => this.mapDtoToTicket(dto));
        this.allTickets.set(mapped);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load support tickets.');
        this.loading.set(false);
      },
    });
  }

  private mapDtoToTicket(dto: AdminSupportTicketDto): AdminSupportTicket {
    const name = dto.createdBy?.username || dto.createdBy?.email || 'Unknown user';

    const email = dto.createdBy?.email ?? 'Unknown';

    return {
      id: dto.id,
      subject: dto.subject,
      message: dto.message,
      status: (dto.status as TicketStatus) ?? 'PENDING',
      createdAt: new Date(dto.createdAt),
      user: {
        name,
        email,
      },
    };
  }

  private replaceTicketInList(updated: AdminSupportTicket): void {
    this.allTickets.update((list) =>
      list.map((t) => (t.id === updated.id ? updated : t))
    );
  }

  statusBadgeClass(status: TicketStatus): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'CLOSED':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
}
