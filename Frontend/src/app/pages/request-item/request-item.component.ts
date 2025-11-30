import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
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
  categories = ['Tools', 'Kitchen', 'Cleaning', 'Electronics', 'Sports', 'Garden', 'Other'];

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