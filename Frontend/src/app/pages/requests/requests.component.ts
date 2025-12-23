import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, Calendar, User, Clock, Plus, Loader2 } from 'lucide-angular';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { NavbarLoggedInComponent } from 'src/app/components/navbar-logged-in/navbar-logged-in.component';
import { AuthService } from 'src/app/services/auth.service';
import { ItemRequestService, ItemRequest } from 'src/app/services/item-request.service';
import { OfferService, Offer } from 'src/app/services/offer.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [LucideAngularModule, NavbarComponent, NavbarLoggedInComponent, CommonModule],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.css'
})
export class RequestsComponent implements OnInit {
  readonly CalendarIcon = Calendar;
  readonly UserIcon = User;
  readonly ClockIcon = Clock;
  readonly PlusIcon = Plus;
  readonly LoaderIcon = Loader2;

  router = inject(Router);
  authService = inject(AuthService);
  itemRequestService = inject(ItemRequestService);
  offerService = inject(OfferService);

  auth = this.authService.isLoggedIn;
  requests = signal<ItemRequest[]>([]);
  offers = signal<Offer[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  activeTab = signal<'all' | 'mine' | 'offers'>('all');

  ngOnInit() {
    this.loadRequests('all');
  }

  loadRequests(tab: 'all' | 'mine' | 'offers' = this.activeTab()) {
    this.activeTab.set(tab);
    this.loading.set(true);
    this.error.set(null);
    this.requests.set([]);
    this.offers.set([]);

    if (tab === 'offers') {
      this.offerService.getMyOffers().subscribe({
        next: (data) => {
          this.offers.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading offers:', err);
          this.error.set('Failed to load your offers. Please try again later.');
          this.loading.set(false);
        }
      });
      return;
    }

    const request$ = tab === 'mine'
      ? this.itemRequestService.getMyRequests()
      : this.itemRequestService.getAllRequests();

    request$.subscribe({
      next: (data) => {
        this.requests.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading requests:', err);
        this.error.set('Failed to load requests. Please try again later.');
        this.loading.set(false);
      }
    });
  }

  selectTab(tab: 'all' | 'mine' | 'offers') {
    if (this.activeTab() === tab && !this.loading()) {
      return;
    }
    this.loadRequests(tab);
  }

  getRequesterName(request: ItemRequest): string {
    if (request.requester) {
      const first = (request.requester.firstName || '').trim();
      const last = (request.requester.lastName || '').trim();
      const full = `${first} ${last}`.trim();
      if (full) {
        return full;
      }
      if (request.requester.username) {
        return request.requester.username;
      }
    }
    return 'Requester';
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getOfferCount(request: ItemRequest): number {
    if (Array.isArray(request.offers)) {
      return request.offers.length;
    }
    if (typeof request.responses === 'number') {
      return request.responses;
    }
    return 0;
  }

  openRequestDetails(request: ItemRequest, event?: MouseEvent) {
    if (!request?.id) {
      return;
    }

    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    this.router.navigate(['/request', request.id]);
  }

  openOfferRequest(offer: Offer, event?: MouseEvent) {
    const requestId = offer.request?.id ?? offer.requestId;
    if (!requestId) {
      return;
    }

    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    this.router.navigate(['/request', requestId]);
  }

  getUrgencyColor(urgency?: string) {
    switch (urgency?.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'soon': return 'bg-orange-100 text-orange-700';
      default: return 'bg-[#E8EAF6] text-[#3949AB]';
    }
  }

  getUrgencyText(urgency?: string) {
    switch (urgency?.toLowerCase()) {
      case 'urgent': return 'Urgent';
      case 'soon': return 'Soon';
      default: return 'Flexible';
    }
  }

  getOfferStatusBadgeClass(status?: string) {
    switch ((status || 'PENDING').toUpperCase()) {
      case 'ACCEPTED':
        return 'bg-emerald-100 text-emerald-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }

  getOfferStatusText(status?: string) {
    const normalized = (status || 'PENDING').toUpperCase();
    if (normalized === 'ACCEPTED') {
      return 'Accepted';
    }
    if (normalized === 'REJECTED') {
      return 'Rejected';
    }
    return 'Pending';
  }

  getOfferRequestTitle(offer: Offer): string {
    return offer.request?.title || 'Request';
  }

  getOfferRequestOwnerName(offer: Offer): string {
    const requester = offer.request?.requester;
    if (requester) {
      const first = (requester.firstName || '').trim();
      const last = (requester.lastName || '').trim();
      const full = `${first} ${last}`.trim();
      if (full) {
        return full;
      }
      if (requester.username) {
        return requester.username;
      }
    }
    return 'Requester';
  }

  getOfferRequestDates(offer: Offer): string {
    const start = offer.request?.startDate;
    const end = offer.request?.endDate;
    if (!start || !end) {
      return 'Dates not provided';
    }
    return `${this.getFormattedDate(start)} - ${this.getFormattedDate(end)}`;
  }

  formatOfferTimestamp(timestamp?: string): string {
    if (!timestamp) {
      return '';
    }
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}