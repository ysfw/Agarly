import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Calendar, User } from 'lucide-angular';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  activeTab: 'borrowed' | 'lent' = 'borrowed';

  readonly CalendarIcon = Calendar;
  readonly UserIcon = User;

  borrowedItems = [
    {
      id: 1,
      name: 'Power Drill',
      dueDate: 'Jan 28, 2025',
      owner: 'John Doe',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'
    },
    {
      id: 2,
      name: 'Ladder',
      dueDate: 'Jan 30, 2025',
      owner: 'Sarah Smith',
      image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400'
    }
  ];

  lentItems = [
    {
      id: 3,
      name: 'Stand Mixer',
      dueDate: 'Jan 29, 2025',
      borrower: 'Mike Johnson',
      image: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=400'
    }
  ];
}
