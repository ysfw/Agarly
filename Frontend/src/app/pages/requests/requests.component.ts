import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, Calendar, User, Clock, Plus } from 'lucide-angular';
import { NavbarComponent } from '../../components/navbar/navbar.component'; // Adjust path as needed
import { NavbarLoggedInComponent } from 'src/app/components/navbar-logged-in/navbar-logged-in.component';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [LucideAngularModule, NavbarComponent, NavbarLoggedInComponent, CommonModule],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.css'
})
export class RequestsComponent {
  readonly CalendarIcon = Calendar;
  readonly UserIcon = User;
  readonly ClockIcon = Clock;
  readonly PlusIcon = Plus;
  
  router = inject(Router);
  authService = inject(AuthService);
  auth = this.authService.isLoggedIn;

  requests = [{
    id: 1,
    title: 'Pressure Washer',
    category: 'Cleaning',
    description: 'Need to clean my driveway and patio this weekend',
    requester: 'Mike Johnson',
    startDate: 'Jan 27, 2025',
    endDate: 'Jan 28, 2025',
    urgency: 'soon',
    responses: 3,
    postedTime: '2 hours ago'
  }, {
    id: 2,
    title: 'Table Saw',
    category: 'Tools',
    description: 'Building a bookshelf and need a table saw for cutting wood',
    requester: 'Emma Wilson',
    startDate: 'Feb 1, 2025',
    endDate: 'Feb 3, 2025',
    urgency: 'flexible',
    responses: 1,
    postedTime: '5 hours ago'
  }, {
    id: 3,
    title: 'Camping Tent (4-person)',
    category: 'Sports',
    description: 'Family camping trip next weekend',
    requester: 'David Lee',
    startDate: 'Feb 5, 2025',
    endDate: 'Feb 7, 2025',
    urgency: 'urgent',
    responses: 5,
    postedTime: '1 day ago'
  }];

  getUrgencyColor(urgency: string) {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'soon': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  }

  getUrgencyText(urgency: string) {
    switch (urgency) {
      case 'urgent': return 'Urgent';
      case 'soon': return 'Soon';
      default: return 'Flexible';
    }
  }
}