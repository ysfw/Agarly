import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LucideAngularModule, ArrowLeft, CreditCard, Lock, Wallet, Plus, Check, Trash2, Smartphone, Store } from 'lucide-angular';
import { PaymentApiService, PaymentMethod, InitiatePaymentRequest, InitiatePaymentResponse } from '../../services/payment-api.service';

type PaymentMethodType = 'CARD' | 'WALLET' | 'FAWRY';

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

  // Rental summary (would come from route params in real app)
  rentalSummary = {
    itemName: 'Power Drill',
    itemImage: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    duration: '3 days',
    rentalFee: 75.00,
    serviceFee: 5.00,
    securityDeposit: 20.00
  };

  totalAmount = computed(() =>
    this.rentalSummary.rentalFee + this.rentalSummary.serviceFee + this.rentalSummary.securityDeposit
  );

  ngOnInit() {
    this.loadSavedCards();
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

    this.isProcessing.set(true);
    this.errorMessage.set('');
    this.fawryReference.set(null);

    // Build payment request
    const request: InitiatePaymentRequest = {
      amount: this.totalAmount(),
      method: method,
      description: `Rental: ${this.rentalSummary.itemName} - ${this.rentalSummary.duration}`,
      phoneNumber: method === 'WALLET' ? this.walletPhoneNumber() : undefined
    };

    // Call the API
    this.paymentService.initiatePayment(request).subscribe({
      next: (response) => {
        this.isProcessing.set(false);
        this.handlePaymentResponse(response);
      },
      error: (err) => {
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