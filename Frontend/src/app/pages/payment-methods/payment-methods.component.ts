
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LucideAngularModule, ArrowLeft, CreditCard, Trash2, Plus, Wallet, ShieldCheck } from 'lucide-angular';
import { PaymentApiService, PaymentMethod, InitiatePaymentResponse, InitiatePaymentRequest } from '../../services/payment-api.service';
import { ModalService } from '../../services/modal.service';
import { Location } from '@angular/common';

@Component({
    selector: 'app-payment-methods',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
    <div class="min-h-screen bg-gray-50 pb-12">
      <!-- Header -->
      <div class="bg-white shadow-sm sticky top-0 z-10">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <button (click)="goBack()" class="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
              <lucide-icon [name]="ArrowLeftIcon" class="w-6 h-6 text-gray-600"></lucide-icon>
            </button>
            <h1 class="text-lg font-semibold text-gray-900">Payment Methods</h1>
            <div class="w-10"></div> <!-- Spacer for centering -->
          </div>
        </div>
      </div>

      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        <!-- Saved Cards Section -->
        <section>
          <h2 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Saved Cards</h2>
          
          <div class="space-y-4">
            <!-- Loading State -->
            <div *ngIf="isLoading()" class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <!-- Empty State -->
            <div *ngIf="!isLoading() && savedCards().length === 0" class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <lucide-icon [name]="CreditCardIcon" class="w-6 h-6 text-gray-400"></lucide-icon>
              </div>
              <h3 class="text-base font-medium text-gray-900 mb-1">No saved cards</h3>
              <p class="text-sm text-gray-500 mb-6">Add a card to make faster payments.</p>
              <button (click)="showAddCard.set(true)" class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-all">
                Add New Card
              </button>
            </div>

            <!-- Cards List -->
            <div *ngFor="let card of savedCards()" class="group relative bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div class="flex items-start justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-8 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                    <img *ngIf="getCardIcon(card.cardType)" [src]="getCardIcon(card.cardType)" class="h-5 w-auto" alt="Card Logo">
                    <lucide-icon *ngIf="!getCardIcon(card.cardType)" [name]="CreditCardIcon" class="w-5 h-5 text-gray-400"></lucide-icon>
                  </div>
                  <div>
                    <div class="flex items-center space-x-2">
                       <p class="font-medium text-gray-900">{{ card.cardType }} ending in {{ card.lastFourDigits }}</p>
                       <span *ngIf="card.isDefault" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700">
                         Default
                       </span>
                    </div>
                    <p class="text-sm text-gray-500">Expires {{ card.expiryMonth }}/{{ card.expiryYear }}</p>
                  </div>
                </div>
                
                <button (click)="removeCard(card.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                  <lucide-icon [name]="TrashIcon" class="w-5 h-5"></lucide-icon>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- New Card / Add Button -->
        <section *ngIf="savedCards().length > 0 && !showAddCard()">
           <button (click)="showAddCard.set(true)" class="w-full flex items-center justify-center px-4 py-4 border-2 border-dashed border-gray-300 rounded-2xl text-sm font-medium text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all">
             <lucide-icon [name]="PlusIcon" class="w-5 h-5 mr-2"></lucide-icon>
             Add Payment Method
           </button>
        </section>

        <!-- Add Card Form (Iframe container) -->
        <section *ngIf="showAddCard()" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide">Add New Card</h3>
               <button (click)="closeAddCard()" class="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
            
            <div class="p-6">
                 <!-- Instructions/Warning -->
                 <div class="flex items-start mb-6 p-4 bg-blue-50 rounded-xl">
                    <lucide-icon [name]="ShieldCheckIcon" class="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"></lucide-icon>
                    <p class="text-sm text-blue-800">
                      To verify and save your card, a temporary <strong>1.00 EGP</strong> transaction will be initiated. 
                      It will be refunded automatically.
                    </p>
                 </div>

                 <!-- Determine what to show: Verify Button or Iframe -->
                 <div *ngIf="!showPaymobIframe()" class="text-center py-4">
                     <button 
                       [disabled]="isProcessing()" 
                       (click)="initiateVerificationTransaction()"
                       class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
                       <span *ngIf="isProcessing()" class="mr-2">
                         <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                       </span>
                       Proceed to Secure Verification
                     </button>
                     <p *ngIf="errorMessage()" class="mt-3 text-sm text-red-600">{{ errorMessage() }}</p>
                 </div>

                 <!-- Iframe -->
                 <div *ngIf="showPaymobIframe()" class="w-full">
                    <iframe [src]="paymobIframeUrl()" class="w-full h-[600px] border-0 rounded-lg" allowpaymentrequest></iframe>
                 </div>
            </div>
        </section>

      </div>
    </div>
  `,
    styles: []
})
export class PaymentMethodsComponent implements OnInit {
    // Icons
    readonly ArrowLeftIcon = ArrowLeft;
    readonly CreditCardIcon = CreditCard;
    readonly TrashIcon = Trash2;
    readonly PlusIcon = Plus;
    readonly ShieldCheckIcon = ShieldCheck;

    // Injections
    paymentService = inject(PaymentApiService);
    modalService = inject(ModalService);
    location = inject(Location);
    sanitizer = inject(DomSanitizer);

    // State
    savedCards = signal<PaymentMethod[]>([]);
    isLoading = signal(true);
    showAddCard = signal(false);
    isProcessing = signal(false);
    errorMessage = signal('');

    // Iframe
    showPaymobIframe = signal(false);
    paymobIframeUrl = signal<SafeResourceUrl | null>(null);

    ngOnInit() {
        this.loadCards();
    }

    loadCards() {
        this.isLoading.set(true);
        this.paymentService.getPaymentMethods().subscribe({
            next: (cards) => {
                this.savedCards.set(cards);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Failed to load cards:', err);
                this.isLoading.set(false);
            }
        });
    }

    goBack() {
        this.location.back();
    }

    closeAddCard() {
        this.showAddCard.set(false);
        this.showPaymobIframe.set(false);
        this.paymobIframeUrl.set(null);
        this.errorMessage.set('');
    }

    removeCard(id: number) {
        if (!confirm('Are you sure you want to remove this card?')) return;

        this.paymentService.removePaymentMethod(id).subscribe({
            next: () => {
                this.savedCards.update(cards => cards.filter(c => c.id !== id));
                this.modalService.alert('Payment method removed successfully', 'Success');
            },
            error: (err) => {
                this.modalService.alert('Failed to remove payment method', 'Error');
            }
        });
    }

    initiateVerificationTransaction() {
        this.isProcessing.set(true);
        this.errorMessage.set('');

        // Initiate a dummy payment of 1 EGP to save card
        // Tokenizing cards usually requires a transaction in many gateways (like Paymob)
        // Or we can use a dedicated 'tokenize' API if available, but initiatePayment is what we have.
        const request: InitiatePaymentRequest = {
            amount: 1.00, // 1 EGP verification
            method: 'CARD', // We only save cards
            description: 'Card Verification Check',
            // No booking ID
        };

        this.paymentService.initiatePayment(request).subscribe({
            next: (response) => {
                this.isProcessing.set(false);
                if (response.success && response.paymentKey && response.iframeId) {
                    const url = this.paymentService.getPaymobIframeUrl(response.iframeId, response.paymentKey);
                    this.paymobIframeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
                    this.showPaymobIframe.set(true);
                } else {
                    this.errorMessage.set(response.errorMessage || 'Failed to initiate verification');
                }
            },
            error: (err) => {
                this.isProcessing.set(false);
                this.errorMessage.set(err.error?.errorMessage || 'System error occurred');
            }
        });
    }

    getCardIcon(type: string | undefined): string {
        if (!type) return '';
        const t = type.toLowerCase();
        if (t.includes('visa')) return 'assets/icons/visa.svg'; // Placeholder paths
        if (t.includes('master')) return 'assets/icons/mastercard.svg';
        return '';
    }
}
