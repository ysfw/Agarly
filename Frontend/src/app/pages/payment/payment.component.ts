import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LucideAngularModule, ArrowLeft, CreditCard, Lock, Wallet, Plus, Check, Trash2, Smartphone, Store } from 'lucide-angular';
import { PaymentApiService, PaymentMethod, InitiatePaymentRequest, InitiatePaymentResponse } from '../../services/payment-api.service';
import { UserService } from '../../services/user.service';
import { ModalService } from '../../services/modal.service';

type PaymentMethodType = 'CARD' | 'WALLET' | 'FAWRY' | 'INTERNAL_WALLET';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, CommonModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  // Icons
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CreditCardIcon = CreditCard;
  readonly LockIcon = Lock;
  readonly WalletIcon = Wallet;
  readonly PlusIcon = Plus;
  readonly CheckIcon = Check;
  readonly TrashIcon = Trash2;
  readonly SmartphoneIcon = Smartphone;
  readonly StoreIcon = Store;

  // Injected services
  router = inject(Router);
  route = inject(ActivatedRoute);
  location = inject(Location);
  paymentService = inject(PaymentApiService);
  sanitizer = inject(DomSanitizer);
  modalService = inject(ModalService);
  userService = inject(UserService);

  // State
  savedCards = signal<PaymentMethod[]>([]);
  selectedCardId = signal<number | null>(null);
  selectedPaymentMethod = signal<PaymentMethodType>('CARD');
  showAddCard = signal(false);
  isProcessing = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // Fawry result
  fawryReference = signal<string | null>(null);

  // Wallet phone number
  walletPhoneNumber = signal('');

  // Wallet Balance
  walletBalance = signal<number>(0);

  // Paymob iframe
  showPaymobIframe = signal(false);
  paymobIframeUrl = signal<SafeResourceUrl | null>(null);

  // New card form
  newCard = {
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: true
  };

  // Booking ID (from navigation state)
  bookingId: number | null = null;

  // Rental summary - populated from route state
  rentalSummary = {
    itemName: 'Item',
    itemImage: 'https://via.placeholder.com/400',
    duration: '1 day',
    rentalFee: 0,
    serviceFee: 0,
    securityDeposit: 0
  };

  totalAmount = computed(() =>
    this.rentalSummary.rentalFee + this.rentalSummary.serviceFee + this.rentalSummary.securityDeposit
  );

  ngOnInit() {
    // Load booking data from router state
    const state = history.state;
    if (state?.bookingId) {
      this.bookingId = state.bookingId;
      const totalAmount = state.totalAmount || 0;
      const serviceFee = Math.round(totalAmount * 0.05 * 100) / 100; // 5% platform fee

      this.rentalSummary = {
        itemName: state.itemTitle || 'Item',
        itemImage: state.itemImage || 'https://via.placeholder.com/400',
        duration: `${state.totalDays || 1} ${state.totalDays === 1 ? 'day' : 'days'}`,
        rentalFee: totalAmount,
        serviceFee: serviceFee,
        securityDeposit: 0 // No deposit per business model
      };
    } else {
      // Manage Mode (Add Card from Dashboard)
      this.showAddCard.set(true); // Default to adding card
    }

    this.loadSavedCards();
    this.loadWalletBalance();
  }

  loadWalletBalance() {
    const username = localStorage.getItem('username');
    if (username) {
      this.userService.getUserByUsername(username).subscribe({
        next: (user) => {
          if (user && user.walletBalance !== undefined) {
            this.walletBalance.set(user.walletBalance);
          }
        },
        error: (err) => console.error('Failed to load wallet balance', err)
      });
    }
  }

  loadSavedCards() {
    // Use real API
    this.paymentService.getPaymentMethods().subscribe({
      next: (cards: PaymentMethod[]) => {
        this.savedCards.set(cards);
        const defaultCard = cards.find(c => c.isDefault);
        if (defaultCard) this.selectedCardId.set(defaultCard.id);
      },
      error: (err) => {
        console.error('Failed to load payment methods:', err);
        // No saved cards available - user can still use Fawry or enter new card
        this.savedCards.set([]);
      }
    });
  }

  selectPaymentMethod(method: PaymentMethodType) {
    this.selectedPaymentMethod.set(method);
    this.showAddCard.set(false);
    this.fawryReference.set(null);
    this.showPaymobIframe.set(false);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  selectCard(id: number) {
    this.selectedCardId.set(id);
    this.showAddCard.set(false);
  }

  toggleAddCard() {
    this.showAddCard.update(v => !v);
    if (this.showAddCard()) this.selectedCardId.set(null);
  }

  removeCard(id: number, event: Event) {
    event.stopPropagation();
    this.paymentService.removePaymentMethod(id).subscribe({
      next: () => {
        this.savedCards.update(cards => cards.filter(c => c.id !== id));
        if (this.selectedCardId() === id) this.selectedCardId.set(null);
      },
      error: (err) => {
        console.error('Failed to remove card:', err);
        // Fallback: just remove from UI
        this.savedCards.update(cards => cards.filter(c => c.id !== id));
        if (this.selectedCardId() === id) this.selectedCardId.set(null);
      }
    });
  }

  onCardNumberInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim();
    this.newCard.cardNumber = value.substring(0, 19);
  }

  onExpiryInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2, 4);
    this.newCard.expiryDate = value;
  }

  handleSubmit() {
    const method = this.selectedPaymentMethod();

    // Validate based on payment method
    if (method === 'CARD' && !this.selectedCardId() && !this.showAddCard()) {
      this.errorMessage.set('Please select a card or add a new one');
      return;
    }

    if (method === 'WALLET' && !this.walletPhoneNumber()) {
      this.errorMessage.set('Please enter your Vodafone Cash phone number');
      return;
    }

    // If in manage mode (no booking), we can't pay yet without a dedicated 'Save Card' flow
    if (!this.bookingId) {
      if (this.showPaymobIframe()) {
        // If iframe is already open, do nothing
        return;
      }
      // Temporary workaround: Alert user that they cannot pay/save purely from here yet
      // OR better: Implement a 1 EGP auth request.
      this.modalService.alert('To save a card, please clear a booking transaction. Card management without booking is coming soon.', 'Feature Unavailable');
      return;
    }

    this.isProcessing.set(true);
    this.errorMessage.set('');
    this.fawryReference.set(null);

    // Build payment request
    const request: InitiatePaymentRequest = {
      amount: this.totalAmount(),
      method: method,
      description: `Rental: ${this.rentalSummary.itemName} - ${this.rentalSummary.duration}`,
      bookingId: this.bookingId || undefined,
      phoneNumber: method === 'WALLET' ? this.walletPhoneNumber() : undefined
    };

    // Call the API
    this.paymentService.initiatePayment(request).subscribe({
      next: (response) => {
        this.isProcessing.set(false);
        this.handlePaymentResponse(response);
      },
      error: (err: any) => {
        this.isProcessing.set(false);
        this.errorMessage.set(err.error?.errorMessage || 'Payment failed. Please try again.');
        console.error('Payment error:', err);
      }
    });
  }

  private handlePaymentResponse(response: InitiatePaymentResponse) {
    if (!response.success) {
      this.errorMessage.set(response.errorMessage || 'Payment failed');
      return;
    }

    switch (response.method) {
      case 'CARD':
        // Open Paymob iframe
        if (response.paymentKey && response.iframeId) {
          const url = this.paymentService.getPaymobIframeUrl(response.iframeId, response.paymentKey);
          this.paymobIframeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
          this.showPaymobIframe.set(true);
          this.successMessage.set('Card payment form opened. Complete payment in the form below.');
        }
        break;

      case 'WALLET':
        // Redirect to wallet payment page
        if (response.redirectUrl) {
          this.successMessage.set('Redirecting to Vodafone Cash...');
          setTimeout(() => {
            window.location.href = response.redirectUrl!;
          }, 1000);
        }
        break;

      case 'FAWRY':
        // Show Fawry reference number
        if (response.fawryReference) {
          this.fawryReference.set(response.fawryReference);
          this.successMessage.set('Fawry payment initiated! Use the reference below at any Fawry store.');
        }
        break;

      case 'INTERNAL_WALLET':
        // Immediate success
        this.successMessage.set('Payment successful!');
        this.modalService.alert('Payment successful using your wallet balance!', 'Success');
        // Redirect to dashboard or bookings
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
        break;
    }
  }

  copyFawryReference() {
    const ref = this.fawryReference();
    if (ref) {
      navigator.clipboard.writeText(ref);
      this.successMessage.set('Reference number copied to clipboard!');
    }
  }

  closeIframe() {
    this.showPaymobIframe.set(false);
    this.paymobIframeUrl.set(null);
  }
}