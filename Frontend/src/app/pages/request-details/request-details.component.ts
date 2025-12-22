import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Calendar, User, CheckCircle } from 'lucide-angular';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './request-details.component.html',
  styleUrl: './request-details.component.css'
})
export class RequestDetailsComponent {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CalendarIcon = Calendar;
  readonly UserIcon = User;
  readonly CheckCircleIcon = CheckCircle;

  router = inject(Router);
  route = inject(ActivatedRoute);
  modalService = inject(ModalService);

  showOfferForm = false;
  offerMessage = '';

  handleSubmitOffer() {
    this.modalService.alert('Your offer has been sent!', 'Success');
    this.router.navigate(['/requests']);
  }
}