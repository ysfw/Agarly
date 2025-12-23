import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowLeft, Calendar, User, CheckCircle } from 'lucide-angular';
import { ModalService } from '../../services/modal.service';
import { ItemRequestService, ItemRequest } from '../../services/item-request.service';
import { OfferService, Offer } from '../../services/offer.service';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './request-details.component.html',
  styleUrl: './request-details.component.css'
})
export class RequestDetailsComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CalendarIcon = Calendar;
  readonly UserIcon = User;
  readonly CheckCircleIcon = CheckCircle;

  router = inject(Router);
  route = inject(ActivatedRoute);
  modalService = inject(ModalService);
  itemRequestService = inject(ItemRequestService);
  offerService = inject(OfferService);

  request = signal<ItemRequest | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  submittingOffer = signal(false);
  processingOfferId = signal<number | null>(null);

  showOfferForm = false;
  offerMessage = '';

  ngOnInit(): void {
    this.loadRequestDetails();
  }

  private loadRequestDetails(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!id || Number.isNaN(id)) {
      this.error.set('Request not found.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.itemRequestService.getRequestById(id).subscribe({
      next: (data) => {
        this.request.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading request details:', err);
        this.error.set('Failed to load request details. Please try again later.');
        this.loading.set(false);
      }
    });
  }

  handleSubmitOffer() {
    const currentRequest = this.request();
    const message = this.offerMessage.trim();

    if (!currentRequest?.id || !message || this.submittingOffer()) {
      return;
    }

    this.submittingOffer.set(true);

    this.offerService.addOffer(currentRequest.id, message).subscribe({
      next: () => {
        this.submittingOffer.set(false);
        this.modalService.alert('Your offer has been sent!', 'Success');
        this.offerMessage = '';
        this.showOfferForm = false;
        this.router.navigate(['/requests']);
      },
      error: (err) => {
        console.error('Error sending offer:', err);
        this.submittingOffer.set(false);
        this.modalService.alert('Failed to send your offer. Please try again.', 'Error');
      }
    });
  }

  isRequestOwner(): boolean {
    const request = this.request();
    if (!request?.requester) {
      return false;
    }

    const requesterUsername = (request.requester.username || '').toLowerCase();
    if (requesterUsername) {
      const storedUsername = (localStorage.getItem('username') || '').toLowerCase();
      if (storedUsername && storedUsername === requesterUsername) {
        return true;
      }
    }

    const requesterId = request.requester.id;
    if (requesterId) {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        try {
          const parsed = JSON.parse(currentUser);
          if (parsed?.id && Number(parsed.id) === Number(requesterId)) {
            return true;
          }
        } catch (error) {
          console.error('Failed to parse currentUser from localStorage:', error);
        }
      }
    }

    return false;
  }

  getRequesterName(request: ItemRequest | null): string {
    if (request?.requester) {
      const { firstName = '', lastName = '' } = request.requester;
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || request.requester.username || 'Requester';
    }
    return 'Requester';
  }

  getUrgencyText(urgency?: string): string {
    switch (urgency?.toLowerCase()) {
      case 'urgent':
        return 'Urgent';
      case 'soon':
        return 'Soon';
      default:
        return 'Flexible';
    }
  }

  getUrgencyBadgeClass(urgency?: string): string {
    switch (urgency?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-700';
      case 'soon':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-[#E8EAF6] text-[#3949AB]';
    }
  }

  getStatusBadgeClass(status?: string): string {
    switch ((status || '').toUpperCase()) {
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-700';
      case 'DECLINED':
        return 'bg-red-100 text-red-700';
      case 'PENDING':
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) {
      return 'TBD';
    }
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'TBD';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getOffers(): Offer[] {
    return this.request()?.offers ?? [];
  }

  getOfferResponderName(offer: Offer): string {
    const responder = offer.user;
    if (responder) {
      const first = responder.firstName?.trim() || '';
      const last = responder.lastName?.trim() || '';
      const full = `${first} ${last}`.trim();
      if (full) {
        return full;
      }
      if (responder.username) {
        return responder.username;
      }
    }

    return 'Neighbor';
  }

  getOfferInitials(offer: Offer): string {
    const responder = offer.user;
    if (responder) {
      const firstInitial = responder.firstName?.[0] || responder.username?.[0] || '';
      const lastInitial = responder.lastName?.[0] || '';
      const initials = `${firstInitial}${lastInitial}`.toUpperCase();
      if (initials.trim()) {
        return initials;
      }
    }

    return 'NB';
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

  getOfferStatusBadgeClass(status?: string): string {
    switch ((status || 'PENDING').toUpperCase()) {
      case 'ACCEPTED':
        return 'bg-emerald-100 text-emerald-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }

  getOfferStatusText(status?: string): string {
    const normalized = (status || 'PENDING').toUpperCase();
    if (normalized === 'ACCEPTED') {
      return 'Accepted';
    }
    if (normalized === 'REJECTED') {
      return 'Rejected';
    }
    return 'Pending';
  }

  isOfferProcessing(offer: Offer): boolean {
    return !!offer.id && this.processingOfferId() === offer.id;
  }

  handleOfferStatusChange(offer: Offer, status: 'ACCEPTED' | 'REJECTED'): void {
    if (!offer.id || this.isOfferProcessing(offer)) {
      return;
    }

    const borrowerId = status === 'ACCEPTED' ? offer.user?.id : undefined;

    this.processingOfferId.set(offer.id);

    this.offerService.updateOfferStatus(offer.id, status, borrowerId).subscribe({
      next: () => {
        this.processingOfferId.set(null);
        const successMessage = status === 'ACCEPTED'
          ? 'Offer accepted successfully.'
          : 'Offer rejected successfully.';
        this.modalService.alert(successMessage, 'Success');
        this.loadRequestDetails();
      },
      error: (err) => {
        console.error('Error updating offer status:', err);
        this.processingOfferId.set(null);
        this.modalService.alert('Failed to update the offer status. Please try again.', 'Error');
      }
    });
  }
}