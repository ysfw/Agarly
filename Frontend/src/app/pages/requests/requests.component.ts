import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, Calendar, User, Clock, Plus, Loader2 } from 'lucide-angular';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { NavbarLoggedInComponent } from 'src/app/components/navbar-logged-in/navbar-logged-in.component';
import { AuthService } from 'src/app/services/auth.service';
import { ItemRequestService, ItemRequest } from 'src/app/services/item-request.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [LucideAngularModule, NavbarComponent, NavbarLoggedInComponent, CommonModule],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.css'
})
export class RequestsComponent implements OnInit {
  readonly CalendarIcon = Calendar;
  readonly UserIcon = User;
  readonly ClockIcon = Clock;
  readonly PlusIcon = Plus;
  readonly LoaderIcon = Loader2;

  router = inject(Router);
  authService = inject(AuthService);
  itemRequestService = inject(ItemRequestService);

  auth = this.authService.isLoggedIn;
  requests = signal<ItemRequest[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.loading.set(true);
    this.error.set(null);

    this.itemRequestService.getAllRequests().subscribe({
      next: (data) => {
        this.requests.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading requests:', err);
        this.error.set('Failed to load requests. Please try again later.');
        this.loading.set(false);
      }
    });
  }

  getRequesterName(request: ItemRequest): string {
    if (request.requester) {
      return `${request.requester.firstName} ${request.requester.lastName}`;
    }
    return 'Unknown';
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getUrgencyColor(urgency?: string) {
    switch (urgency?.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'soon': return 'bg-orange-100 text-orange-700';
      default: return 'bg-[#E8EAF6] text-[#3949AB]';
    }
  }

  getUrgencyText(urgency?: string) {
    switch (urgency?.toLowerCase()) {
      case 'urgent': return 'Urgent';
      case 'soon': return 'Soon';
      default: return 'Flexible';
    }
  }
}