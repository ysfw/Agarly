import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { LucideAngularModule, ArrowLeft, Calendar, CheckCircle, AlertCircle } from 'lucide-angular';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-book-item',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './book-item.component.html',
  styleUrl: './book-item.component.css'
})
export class BookItemComponent {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CalendarIcon = Calendar;
  readonly CheckCircleIcon = CheckCircle;
  readonly AlertCircleIcon = AlertCircle;

  step = 1;
  bookingData = {
    startDate: '',
    endDate: '',
    notes: '',
    agreeToTerms: false
  };

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private modalService = inject(ModalService);

  // You can access route params here if needed:
  // itemId = this.route.snapshot.params['id'];

  handleBack() {
    if (this.step > 1) {
      this.step--;
    } else {
      this.location.back();
    }
  }

  handleSubmit() {
    if (this.step === 1) {
      this.step = 2;
    } else if (this.step === 2) {
      this.step = 3;
    }
  }

  handleConfirm() {
    this.modalService.alert('Booking request sent! The owner will review and respond.', 'Success');
    this.router.navigate(['/dashboard']);
  }
}