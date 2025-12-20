import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Calendar, User, Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Clock, CreditCard, ChevronRight, Package, Eye, Edit, Trash2, AlertCircle, CheckCircle, XCircle, Plus } from 'lucide-angular';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { NavbarLoggedInComponent } from 'src/app/components/navbar-logged-in/navbar-logged-in.component';
import { ReviewService } from '../../services/review.service';
import { PaymentApiService, Transaction } from '../../services/payment-api.service';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, NavbarComponent, NavbarLoggedInComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  activeTab: 'myitems' | 'pending' | 'borrowed' | 'lent' | 'wallet' = 'myitems';
  authService = inject(AuthService);
  reviewService = inject(ReviewService);
  paymentService = inject(PaymentApiService);
  itemService = inject(ItemService);
  router = inject(Router);
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

  // State - using real API data
  transactions = signal<Transaction[]>([]);
  myItems = signal<Item[]>([]); // Items I OWN (lent out)
  pendingItems = signal<Item[]>([]); // My items pending approval
  borrowedItems = signal<Item[]>([]); // Items I BORROWED from others
  lentItems = signal<Item[]>([]); // Items currently lent to others (with borrower)

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

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.loading.set(true);
    this.loadMyItems();
    this.loadPendingItems();
    this.loadBorrowedItems();
    this.loadTransactions();
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
    this.paymentService.getMockTransactionHistory().subscribe({
      next: (transactions) => this.transactions.set(transactions),
      error: (err) => console.error('Error loading transactions:', err)
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
          alert('Failed to delete item');
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

  markAsReturned(item: Item) {
    if (item.id && confirm(`Mark "${item.title}" as returned?`)) {
      this.itemService.returnItem(item.id).subscribe({
        next: () => {
          this.loadAllData(); // Refresh all data
        },
        error: (err) => {
          console.error('Error marking as returned:', err);
          alert('Failed to mark as returned');
        }
      });
    }
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
      case 'REFUND': return 'text-blue-500 bg-blue-50';
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
      case 'REFUNDED': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  navigateToPayment() {
    this.router.navigate(['/payment']);
  }

  // Review modal
  openReviewModal(item: Item) {
    this.showReviewModal = true;
    this.reviewBorrowerName = item.borrower?.firstName || item.borrower?.name || 'Borrower';
    this.reviewBorrowerId = item.borrower?.id || null;
    this.reviewItemId = item.id || null;
    this.reviewStars = 0;
  }

  closeReviewModal() {
    this.showReviewModal = false;
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
          this.markAsReturned({ id: this.reviewItemId } as Item);
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
}
