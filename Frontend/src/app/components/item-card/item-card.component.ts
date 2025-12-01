import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, MapPin } from 'lucide-angular';
import { AuthService } from 'src/app/services/auth.service';

export interface Item {
  id: number;
  name: string;
  category: string;
  distance: string;
  status: string;
  image: string;
}

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div (click)="navigateToItem()" class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div class="relative">
        <img [src]="item.image" [alt]="item.name" class="w-full h-48 object-cover" />
        <span class="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-semibold"
              [ngClass]="item.status === 'Available' ? 'bg-[#C6FF00] text-[#1A237E]' : 'bg-gray-200 text-gray-600'">
          {{ item.status }}
        </span>
      </div>
      <div class="p-4">
        <h3 class="text-lg font-semibold text-[#1A237E] mb-2">
          {{ item.name }}
        </h3>
        <div class="flex items-center justify-between text-sm text-gray-600">
          <span class="text-[#3949AB] font-medium">{{ item.category }}</span>
          <div class="flex items-center gap-1">
            <lucide-icon [img]="MapPinIcon" class="w-4 h-4"></lucide-icon>
            <span>{{ item.distance }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ItemCardComponent {
  @Input({ required: true }) item!: Item;
  private router = inject(Router);
  private authService = inject(AuthService);

  readonly MapPinIcon = MapPin;

  navigateToItem() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/item', this.item.id]);
  }
}
