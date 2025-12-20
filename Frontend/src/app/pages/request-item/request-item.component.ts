import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Calendar } from 'lucide-angular';

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
    alert('Request posted! Neighbors will be notified.');
    this.router.navigate(['/requests']);
  }
}