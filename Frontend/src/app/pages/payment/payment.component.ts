import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, CreditCard, Lock } from 'lucide-angular';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CreditCardIcon = CreditCard;
  readonly LockIcon = Lock;
  
  router = inject(Router);
  route = inject(ActivatedRoute);
  location = inject(Location);

  formData = {
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  };

  handleSubmit() {
    alert('Payment processed successfully!');
    this.router.navigate(['/dashboard']);
  }
}