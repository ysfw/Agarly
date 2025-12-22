import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Calendar } from 'lucide-angular';
import { ModalService } from '../../services/modal.service';

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
  categories = ['Tools', 'Kitchen', 'Cleaning', 'Electronics', 'Sports', 'Garden', 'Other'];

  goBack() {
    this.location.back();
  }

  formData = {
    title: '',
    category: '',
    description: '',
    startDate: '',
    endDate: '',
    urgency: 'flexible'
  };

  handleSubmit() {
    fetch('http://localhost:8080/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.formData)
    })
      .then(res => res.json())
      .then(data => {
        this.modalService.alert('Request posted! Neighbors will be notified.', 'Success');
        this.router.navigate(['/requests']);
      })
      .catch(err => console.error(err));
  }

}
