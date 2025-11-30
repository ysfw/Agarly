import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowLeft, Calendar, User } from 'lucide-angular';

@Component({
  selector: 'app-my-items',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: 'my-items.component.html'
})
export class MyItemsComponent {
  @Output() onBack = new EventEmitter<void>();
  activeTab = 'borrowed';

  readonly ArrowLeftIcon = ArrowLeft;
  readonly CalendarIcon = Calendar;
  readonly UserIcon = User;

  borrowedItems = [
    {
      id: "b1",
      title: "Power Drill Set",
      image: "https://images.unsplash.com/photo-1502343019212-cc6a09783255?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3dlciUyMGRyaWxsJTIwdG9vbHxlbnwxfHx8fDE3NjE0MTYzNjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      owner: "Sarah M.",
      ownerInitials: "SM",
      dueDate: "Oct 28, 2025",
      status: "active"
    },
    {
      id: "b2",
      title: "Extension Ladder",
      image: "https://images.unsplash.com/photo-1686569388385-15ecc5c9d498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWRkZXIlMjBob21lJTIwdG9vbHxlbnwxfHx8fDE3NjE0MTcxMDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      owner: "David L.",
      ownerInitials: "DL",
      dueDate: "Oct 27, 2025",
      status: "due-soon"
    }
  ];

  lentItems = [
    {
      id: "l1",
      title: "Vacuum Cleaner",
      image: "https://images.unsplash.com/photo-1722710070534-e31f0290d8de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YWN1dW0lMjBjbGVhbmVyfGVufDF8fHx8MTc2MTQxNzEwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      borrower: "Alex T.",
      borrowerInitials: "AT",
      dueDate: "Oct 29, 2025",
      status: "active"
    },
    {
      id: "l2",
      title: "4-Person Tent",
      image: "https://images.unsplash.com/photo-1731082627921-77d00a9e5ab7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1waW5nJTIwdGVudCUyMG91dGRvb3J8ZW58MXx8fHwxNzYxNDE2MjY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      borrower: "Maria K.",
      borrowerInitials: "MK",
      dueDate: "Nov 2, 2025",
      status: "active"
    }
  ];

  handleImageError(event: any) {
    event.target.src = 'assets/fallback-image.png';
  }
}