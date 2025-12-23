import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Calendar } from 'lucide-angular';
import { ModalService } from '../../services/modal.service';
import { ItemRequestService, ItemRequest } from '../../services/item-request.service';

@Component({
  selector: 'app-request-item',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './request-item.component.html',
  styleUrl: './request-item.component.css'
})
export class RequestItemComponent {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CalendarIcon = Calendar;

  router = inject(Router);
  location = inject(Location);
  modalService = inject(ModalService);
  itemRequestService = inject(ItemRequestService);
  categories = ['Tools', 'Kitchen', 'Cleaning', 'Electronics', 'Sports', 'Garden', 'Other'];

  goBack() {
    this.location.back();
  }

  formData: ItemRequest = {
    title: '',
    category: '',
    description: '',
    startDate: '',
    endDate: '',
    urgency: 'flexible'
  };

  handleSubmit() {
    this.itemRequestService.createRequest(this.formData).subscribe({
      next: () => {
        this.modalService.alert('Request posted! Neighbors will be notified.', 'Success');
        this.router.navigate(['/requests']);
      },
      error: (err) => {
        console.error('Failed to create request', err);
        this.modalService.alert('Something went wrong while posting your request. Please try again.', 'Error');
      }
    });
  }

}
