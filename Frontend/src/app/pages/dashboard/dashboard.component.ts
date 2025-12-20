import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Calendar, User } from 'lucide-angular';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { NavbarLoggedInComponent } from 'src/app/components/navbar-logged-in/navbar-logged-in.component';
import { ReviewService } from '../../services/review.service';

import { Item } from '../../models/item.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, NavbarComponent, NavbarLoggedInComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  activeTab: 'borrowed' | 'lent' = 'borrowed';
  authService = inject(AuthService);
  reviewService = inject(ReviewService);
  auth = this.authService.isLoggedIn;

  readonly CalendarIcon = Calendar;
  readonly UserIcon = User;

  borrowedItems: any[] = [
    {
      id: 1,
      title: 'Power Drill',
      dueDate: 'Jan 28, 2025',
      owner: 'John Doe',
      imageUrls: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400']
    },
    {
      id: 2,
      title: 'Ladder',
      dueDate: 'Jan 30, 2025',
      owner: 'Sarah Smith',
      imageUrls: ['https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400']
    }
  ];

  lentItems: any[] = [
    {
      id: 3,
      title: 'Stand Mixer',
      dueDate: 'Jan 29, 2025',
      borrower: 'Mike Johnson',
      borrowerId: 101, // placeholder borrower ID
      imageUrls: ['https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=400']
    }
  ];

  showReviewModal = false;
  reviewBorrowerName: string = '';
  reviewStars: number = 0;
  reviewItemId: number | null = null;
  reviewBorrowerId: number | null = null;

  openReviewModal(item: any) {
    this.showReviewModal = true;
    this.reviewBorrowerName = item.borrower;
    this.reviewBorrowerId = item.borrowerId;
    this.reviewItemId = item.id;
    this.reviewStars = 0;
  }

  closeReviewModal() {
    this.showReviewModal = false;
    this.reviewBorrowerName = '';
    this.reviewBorrowerId = null;
    this.reviewItemId = null;
    this.reviewStars = 0;
  }

  setReviewStars(stars: number) {
    this.reviewStars = stars;
  }

  rateByHover(event: MouseEvent, i: number) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    this.reviewStars = i - (isHalf ? 0.5 : 0);
  }

  getStarFillPercent(i: number): number {
    if (this.reviewStars >= i) {
      return 100;
    } else if (this.reviewStars >= i - 0.5) {
      return 50;
    } else {
      return 0;
    }
  }

  submitReview() {
    if (this.reviewBorrowerId !== null && this.reviewStars > 0) {
      this.reviewService.addUserReview(this.reviewBorrowerId, this.reviewStars).subscribe({
        next: () => {
          console.log('Review submitted successfully');
          this.closeReviewModal();
        },
        error: (err) => {
          console.error('Error submitting review', err);
        }
      });
    } else {
      this.closeReviewModal();
    }
  }

  round(n: number): number {
    return Math.round(n);
  }
}
