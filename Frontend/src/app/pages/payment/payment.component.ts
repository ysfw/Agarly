import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, CreditCard, Lock, Wallet, Plus, Check, Trash2 } from 'lucide-angular';
import { PaymentApiService, PaymentMethod } from '../../services/payment-api.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, CommonModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CreditCardIcon = CreditCard;
  readonly LockIcon = Lock;
  readonly WalletIcon = Wallet;
  readonly PlusIcon = Plus;
  readonly CheckIcon = Check;
  readonly TrashIcon = Trash2;

  router = inject(Router);
  route = inject(ActivatedRoute);
  location = inject(Location);
  paymentService = inject(PaymentApiService);

  // State
  savedCards = signal<PaymentMethod[]>([]);
  selectedCardId = signal<number | null>(null);
  showAddCard = signal(false);
  isProcessing = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  newCard = {
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: true
  };

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
    this.paymentService.getMockPaymentMethods().subscribe({
      next: (cards) => {
        this.savedCards.set(cards);
        const defaultCard = cards.find(c => c.isDefault);
        if (defaultCard) this.selectedCardId.set(defaultCard.id);
      }
    });
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
    this.savedCards.update(cards => cards.filter(c => c.id !== id));
    if (this.selectedCardId() === id) this.selectedCardId.set(null);
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
    if (!this.selectedCardId() && !this.showAddCard()) {
      this.errorMessage.set('Please select a payment method or add a new card');
      return;
    }

    this.isProcessing.set(true);
    this.errorMessage.set('');

    setTimeout(() => {
      this.isProcessing.set(false);
      this.successMessage.set('Payment processed successfully!');

      if (this.showAddCard() && this.newCard.saveCard) {
        const lastFour = this.newCard.cardNumber.replace(/\s/g, '').slice(-4);
        const newPaymentMethod: PaymentMethod = {
          id: Date.now(),
          displayName: `Card •••• ${lastFour}`,
          lastFourDigits: lastFour,
          cardType: 'VISA',
          expiryMonth: parseInt(this.newCard.expiryDate.split('/')[0]),
          expiryYear: 2000 + parseInt(this.newCard.expiryDate.split('/')[1]),
          isDefault: false,
          isActive: true
        };
        this.savedCards.update(cards => [...cards, newPaymentMethod]);
      }

      setTimeout(() => this.router.navigate(['/dashboard']), 2000);
    }, 1500);
  }
}