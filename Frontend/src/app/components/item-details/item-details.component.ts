import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule, 
  ArrowLeft, 
  MapPin, 
  Shield, 
  Calendar, 
} from 'lucide-angular';
import { ApiService } from '../../services/api.service';
import { Item } from '../../models/item.model';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item-details-component',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: 'item-details.component.html'
})
export class ItemDetailsComponent implements OnChanges {
  @Input({ required: true }) itemId!: string;
  @Output() onBack = new EventEmitter<void>();
  @Output() onRequestToBorrow = new EventEmitter<void>();

  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly ArrowLeftIcon = ArrowLeft;
  readonly MapPinIcon = MapPin;
  readonly ShieldIcon = Shield;
  readonly CalendarIcon = Calendar;

  item: Item | undefined;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['itemId'] && this.itemId) {
      this.apiService.getItemById(Number(this.itemId)).subscribe(item => {
        this.item = item;
      });
    }
  }

  handleImageError(event: any) {
    event.target.src = 'assets/fallback-image.png';
  }
  
  getOwnerInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}