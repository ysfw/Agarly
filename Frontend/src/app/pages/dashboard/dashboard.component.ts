import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Calendar, User, Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Clock, CreditCard, ChevronRight, Package, Eye, Edit, Trash2, AlertCircle, CheckCircle, XCircle, Plus, Mail } from 'lucide-angular';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { NavbarLoggedInComponent } from 'src/app/components/navbar-logged-in/navbar-logged-in.component';
import { ReviewService } from '../../services/review.service';
import { PaymentApiService, Transaction } from '../../services/payment-api.service';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';
import { ModalService } from '../../services/modal.service';
import { BookingService, Booking } from '../../services/booking.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, NavbarComponent, NavbarLoggedInComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  activeTab: 'myitems' | 'pending' | 'borrowed' | 'lent' | 'requestsReceived' | 'requestsSent' | 'wallet' = 'myitems';
  authService = inject(AuthService);
  reviewService = inject(ReviewService);
  paymentService = inject(PaymentApiService);
  itemService = inject(ItemService);
  router = inject(Router);
  modalService = inject(ModalService);
  bookingService = inject(BookingService);
  auth = this.authService.isLoggedIn;

  // Icons
  readonly CalendarIcon = Calendar;
  readonly UserIcon = User;
  readonly WalletIcon = Wallet;
  readonly TrendingUpIcon = TrendingUp;
  readonly TrendingDownIcon = TrendingDown;
  readonly ArrowUpRightIcon = ArrowUpRight;
  readonly ArrowDownLeftIcon = ArrowDownLeft;
  readonly ClockIcon = Clock;
  readonly CreditCardIcon = CreditCard;
  readonly ChevronRightIcon = ChevronRight;
  readonly PackageIcon = Package;
  readonly EyeIcon = Eye;
  readonly EditIcon = Edit;
  readonly TrashIcon = Trash2;
  readonly AlertIcon = AlertCircle;
  readonly CheckIcon = CheckCircle;
  readonly XIcon = XCircle;
  readonly PlusIcon = Plus;
  readonly MailIcon = Mail;

  // State - using real API data
  transactions = signal<Transaction[]>([]);
  myItems = signal<Item[]>([]); // Items I OWN (lent out)
  pendingItems = signal<Item[]>([]); // My items pending approval
  borrowedItems = signal<Item[]>([]); // Items I BORROWED from others
  lentItems = signal<Item[]>([]); // Items currently lent to others (with borrower)
  receivedRequests = signal<Booking[]>([]);
  sentRequests = signal<Booking[]>([]);
  selectedRequest = signal<Booking | null>(null);
  showRequestModal = signal(false);
  requestActionLoading = signal(false);
  showReturnConfirmModal = signal(false);
  returnConfirmationItem = signal<Item | null>(null);
  returningItemId = signal<number | null>(null);

  walletBalance = signal(125.50);
  totalEarnings = signal(450.00);
  totalSpent = signal(324.50);

  loading = signal(false);

  showReviewModal = false;
  showDeleteModal = false;
  reviewBorrowerName: string = '';
  reviewStars: number = 0;
  reviewItemId: number | null = null;
  reviewBorrowerId: number | null = null;
  itemToDelete: Item | null = null;
  itemBeingReviewed: Item | null = null;

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.loading.set(true);
    this.loadMyItems();
    this.loadPendingItems();
    this.loadBorrowedItems();
    this.loadTransactions();
    this.loadReceivedRequests();
    this.loadSentRequests();
  }

  loadMyItems() {
    // GET /api/items/lent - items owned by me
    this.itemService.getMyLentItems().subscribe({
      next: (items) => {
        // All items I own
        this.myItems.set(items.filter(item => !item.borrower)); // Available items
        this.lentItems.set(items.filter(item => item.borrower)); // Currently lent out
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading my items:', err);
        this.loading.set(false);
      }
    });
  }

  loadPendingItems() {
    // GET /api/items/pending - my items pending approval
    this.itemService.getPendingItems().subscribe({
      next: (items) => this.pendingItems.set(items),
      error: (err) => console.error('Error loading pending items:', err)
    });
  }

  loadBorrowedItems() {
    // GET /api/items/borrowed - items I borrowed FROM others
    this.itemService.getMyBorrowedItems().subscribe({
      next: (items) => this.borrowedItems.set(items),
      error: (err) => console.error('Error loading borrowed items:', err)
    });
  }

  loadTransactions() {
    this.paymentService.getTransactionHistory().subscribe({
      next: (response: any) => {
        // Backend returns paginated response with 'content' array
        const transactions: Transaction[] = response.content || response || [];
        this.transactions.set(transactions);
      },
      error: (err: any) => console.error('Error loading transactions:', err)
    });
  }

  loadReceivedRequests() {
    this.bookingService.getReceivedRequests().subscribe({
      next: (requests) => {
        const pending = requests.filter(req => (req.status || '').toUpperCase() === 'PENDING');
        const others = requests.filter(req => (req.status || '').toUpperCase() !== 'PENDING');
        this.receivedRequests.set([...pending, ...others]);
      },
      error: (err) => console.error('Error loading received booking requests:', err)
    });
  }

  getPendingReceivedCount(): number {
    return this.receivedRequests().filter(req => (req.status || '').toUpperCase() === 'PENDING').length;
  }

  loadSentRequests() {
    this.bookingService.getSentRequests().subscribe({
      next: (requests) => this.sentRequests.set(requests),
      error: (err) => console.error('Error loading sent booking requests:', err)
    });
  }

  // Item status helpers
  getItemStatusBadge(status: string | undefined): { class: string; text: string } {
    switch (status) {
      case 'APPROVED': return { class: 'bg-emerald-100 text-emerald-700', text: 'Active' };
      case 'PENDING': return { class: 'bg-amber-100 text-amber-700', text: 'Pending Review' };
      case 'REJECTED': return { class: 'bg-red-100 text-red-700', text: 'Rejected' };
      default: return { class: 'bg-gray-100 text-gray-700', text: status || 'Unknown' };
    }
  }

  isRented(item: Item): boolean {
    return !!item.borrower;
  }

  viewItem(item: Item) {
    this.router.navigate(['/item', item.id]);
  }

  editItem(item: Item) {
    this.router.navigate(['/add-item'], { queryParams: { edit: item.id } });
  }

  confirmDeleteItem(item: Item) {
    this.itemToDelete = item;
    this.showDeleteModal = true;
  }

  deleteItem() {
    if (this.itemToDelete && this.itemToDelete.id) {
      this.itemService.delete(this.itemToDelete.id).subscribe({
        next: () => {
          this.myItems.update(items => items.filter(i => i.id !== this.itemToDelete!.id));
          this.showDeleteModal = false;
          this.itemToDelete = null;
        },
        error: (err) => {
          console.error('Error deleting item:', err);
          this.modalService.alert('Failed to delete item', 'Error');
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  navigateToAddItem() {
    this.router.navigate(['/add-item']);
  }

  promptReturnConfirmation(item: Item): void {
    if (!item?.id) {
      return;
    }

    this.returnConfirmationItem.set(item);
    this.showReturnConfirmModal.set(true);
  }

  cancelReturnConfirmation(): void {
    this.showReturnConfirmModal.set(false);
    this.returnConfirmationItem.set(null);
  }

  confirmReturn(): void {
    const pendingItem = this.returnConfirmationItem();
    if (!pendingItem) {
      this.cancelReturnConfirmation();
      return;
    }

    this.showReturnConfirmModal.set(false);
    this.returnConfirmationItem.set(null);
    this.openReviewModal(pendingItem);
  }

  isAwaitingReturnConfirmation(item: Item): boolean {
    const pendingItem = this.returnConfirmationItem();
    return !!pendingItem?.id && pendingItem.id === item.id;
  }

  markAsReturned(item: Item, options: { skipConfirm?: boolean; skipStatusUpdate?: boolean } = {}) {
    const { skipStatusUpdate = false } = options;

    if (!item?.id) {
      return;
    }

    const proceed = () => {
      const booking = this.findActiveBookingForItem(item);
      this.returningItemId.set(item.id!);

      const finalizeItemReturn = () => {
        this.itemService.returnItem(item.id!).subscribe({
          next: () => {
            this.returningItemId.set(null);
            this.loadAllData();
            this.modalService.alert('Item marked as returned successfully', 'Success');
          },
          error: (err) => {
            console.error('Error marking as returned:', err);
            this.returningItemId.set(null);
            this.modalService.alert('Failed to mark as returned', 'Error');
          }
        });
      };

      if (!skipStatusUpdate && booking?.id) {
        this.bookingService.updateStatus(booking.id, 'COMPLETED').subscribe({
          next: () => finalizeItemReturn(),
          error: (err) => {
            console.error('Error updating booking status to RETURNED:', err);
            this.returningItemId.set(null);
            this.modalService.alert('Failed to update booking status. Please try again.', 'Error');
          }
        });
      } else {
        finalizeItemReturn();
      }
    };

    proceed();
  }

  // Transaction helpers
  getTransactionIcon(type: string) {
    switch (type) {
      case 'PAYMENT': return this.ArrowUpRightIcon;
      case 'EARNING': return this.ArrowDownLeftIcon;
      case 'REFUND': return this.ArrowDownLeftIcon;
      case 'DEPOSIT': return this.ClockIcon;
      default: return this.WalletIcon;
    }
  }

  getTransactionColor(type: string): string {
    switch (type) {
      case 'PAYMENT': return 'text-red-500 bg-red-50';
      case 'EARNING': return 'text-emerald-500 bg-emerald-50';
      case 'REFUND': return 'text-[#3949AB] bg-[#E8EAF6]';
      case 'DEPOSIT': return 'text-amber-500 bg-amber-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  }

  getAmountPrefix(type: string): string {
    switch (type) {
      case 'PAYMENT': return '-';
      case 'EARNING': return '+';
      case 'REFUND': return '+';
      default: return '';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      case 'REFUNDED': return 'bg-[#E8EAF6] text-[#3949AB]';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getRequestStatusBadge(status?: string): { class: string; text: string } {
    switch (status) {
      case 'APPROVED':
        return { class: 'bg-emerald-100 text-emerald-700', text: 'Approved' };
      case 'COMPLETED':
        return { class: 'bg-blue-100 text-blue-700', text: 'Completed' };
      case 'DECLINED':
        return { class: 'bg-red-100 text-red-700', text: 'Declined' };
      case 'REJECTED':
        return { class: 'bg-red-100 text-red-700', text: 'Rejected' };
      case 'CANCELLED':
        return { class: 'bg-gray-100 text-gray-600', text: 'Cancelled' };
      case 'PENDING':
      default:
        return { class: 'bg-amber-100 text-amber-700', text: status || 'Pending' };
    }
  }

  formatDateRange(start?: string, end?: string): string {
    if (!start || !end) {
      return 'Dates unavailable';
    }

    const startDate = this.formatDate(start);
    const endDate = this.formatDate(end);
    return `${startDate} – ${endDate}`;
  }

  getBorrowerName(booking: Booking): string {
    const participant = booking.borrower;
    if (participant) {
      const first = participant.firstName?.trim() || '';
      const last = participant.lastName?.trim() || '';
      const full = `${first} ${last}`.trim();
      if (full) {
        return full;
      }
      if (participant.username) {
        return participant.username;
      }
    }

    if (booking.borrowerName) {
      return booking.borrowerName;
    }

    return 'Borrower';
  }

  getOwnerName(booking: Booking): string {
    const participant = booking.owner || booking.item?.owner;
    if (participant) {
      const first = participant.firstName?.trim() || '';
      const last = participant.lastName?.trim() || '';
      const full = `${first} ${last}`.trim();
      if (full) {
        return full;
      }
      if (participant.username) {
        return participant.username;
      }
    }

    if (booking.ownerName) {
      return booking.ownerName;
    }

    return 'Owner';
  }

  getBorrowerEmail(booking: Booking): string | undefined {
    return booking.borrower?.email;
  }

  getOwnerEmail(booking: Booking): string | undefined {
    return booking.owner?.email || booking.item?.owner?.email;
  }

  getItemTitle(booking: Booking): string {
    return booking.itemTitle || booking.item?.title || 'Requested Item';
  }

  getItemImage(booking: Booking): string {
    if (booking.itemImageUrl) {
      return booking.itemImageUrl;
    }

    const item = booking.item;
    if (item) {
      if (item.primaryImageUrl) {
        return item.primaryImageUrl;
      }
      if (item.imageUrl) {
        return item.imageUrl;
      }
      if (item.imageUrls && item.imageUrls.length > 0) {
        return item.imageUrls[0];
      }
    }

    return 'https://via.placeholder.com/80';
  }

  canRespondToRequest(booking: Booking | null | undefined): boolean {
    if (!booking) {
      return false;
    }

    const status = booking.status?.toUpperCase() || 'PENDING';
    return status === 'PENDING';
  }

  openRequestModal(request: Booking): void {
    this.selectedRequest.set(request);
    this.showRequestModal.set(true);
  }

  closeRequestModal(): void {
    this.showRequestModal.set(false);
    this.selectedRequest.set(null);
  }

  acceptRequest(request: Booking): void {
    if (!request?.id || this.requestActionLoading()) {
      return;
    }

    this.requestActionLoading.set(true);
    this.bookingService.updateStatus(request.id, 'APPROVED').subscribe({
      next: () => {
        this.requestActionLoading.set(false);
        this.modalService.alert('Booking request accepted.', 'Success');
        this.closeRequestModal();
        this.loadReceivedRequests();
      },
      error: (err) => {
        console.error('Error accepting booking request:', err);
        this.requestActionLoading.set(false);
        this.modalService.alert('Failed to accept booking request. Please try again.', 'Error');
      }
    });
  }

  rejectRequest(request: Booking): void {
    if (!request?.id || this.requestActionLoading()) {
      return;
    }

    this.modalService.confirm('Reject this booking request?', 'Confirm Rejection').then((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.requestActionLoading.set(true);
      this.bookingService.updateStatus(request.id, 'REJECTED').subscribe({
        next: () => {
          this.requestActionLoading.set(false);
          this.modalService.alert('Booking request rejected.', 'Success');
          this.closeRequestModal();
          this.loadReceivedRequests();
        },
        error: (err) => {
          console.error('Error rejecting booking request:', err);
          this.requestActionLoading.set(false);
          this.modalService.alert('Failed to reject booking request. Please try again.', 'Error');
        }
      });
    });
  }

  goToBorrowerProfile(request: Booking): void {
    const borrowerId = request.borrower?.id;
    if (borrowerId) {
      this.closeRequestModal();
      this.router.navigate(['/user', borrowerId]);
    } else {
      this.modalService.alert('Borrower profile is unavailable for this request.', 'Profile Unavailable');
    }
  }

  navigateToPayment() {
    this.router.navigate(['/payment']);
  }

  // Review modal
  openReviewModal(item: Item) {
    if (!item?.id) {
      return;
    }

    const booking = this.findActiveBookingForItem(item);
    if (!booking?.id) {
      this.presentReviewModal(item);
      return;
    }

    if (this.returningItemId() === item.id) {
      return;
    }

    this.returningItemId.set(item.id);
    this.bookingService.updateStatus(booking.id, 'COMPLETED').subscribe({
      next: () => {
        this.returningItemId.set(null);
        this.presentReviewModal(item);
      },
      error: (err) => {
        console.error('Error updating booking status before review:', err);
        this.returningItemId.set(null);
        this.modalService.alert('Failed to update booking status. Please try again.', 'Error');
      }
    });
  }

  closeReviewModal() {
    this.showReviewModal = false;
    this.itemBeingReviewed = null;
    this.reviewBorrowerName = '';
    this.reviewBorrowerId = null;
    this.reviewItemId = null;
    this.reviewStars = 0;
  }

  setReviewStars(stars: number) {
    this.reviewStars = stars;
  }

  rateByHover(event: MouseEvent, i: number) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    this.reviewStars = i - (isHalf ? 0.5 : 0);
  }

  getStarFillPercent(i: number): number {
    if (this.reviewStars >= i) return 100;
    if (this.reviewStars >= i - 0.5) return 50;
    return 0;
  }

  submitReview() {
    if (this.reviewBorrowerId !== null && this.reviewStars > 0) {
      this.reviewService.addUserReview(this.reviewBorrowerId, this.reviewStars).subscribe({
        next: () => {
          console.log('Review submitted successfully');
          if (this.itemBeingReviewed) {
            this.markAsReturned(this.itemBeingReviewed, { skipConfirm: true, skipStatusUpdate: true });
          } else if (this.reviewItemId) {
            this.markAsReturned({ id: this.reviewItemId } as Item, { skipConfirm: true, skipStatusUpdate: true });
          }
          this.closeReviewModal();
        },
        error: (err) => console.error('Error submitting review', err)
      });
    } else {
      this.closeReviewModal();
    }
  }

  round(n: number): number {
    return Math.round(n);
  }

  private findActiveBookingForItem(item: Item): Booking | undefined {
    const itemId = item.id;
    if (!itemId) {
      return undefined;
    }

    const borrowerId = item.borrower?.id ?? this.reviewBorrowerId ?? undefined;

    return this.receivedRequests().find((request) => {
      const sameItem = request.itemId === itemId || request.item?.id === itemId;
      if (!sameItem) {
        return false;
      }

      if (borrowerId && request.borrower?.id && request.borrower.id !== borrowerId) {
        return false;
      }

      const status = request.status?.toUpperCase() || 'PENDING';
      return status === 'APPROVED' || status === 'RETURNED';
    });
  }

  private presentReviewModal(item: Item): void {
    this.itemBeingReviewed = item;
    this.reviewBorrowerName = item.borrower?.firstName || item.borrower?.name || 'Borrower';
    this.reviewBorrowerId = item.borrower?.id || null;
    this.reviewItemId = item.id || null;
    this.reviewStars = 0;
    this.showReviewModal = true;
  }
}
