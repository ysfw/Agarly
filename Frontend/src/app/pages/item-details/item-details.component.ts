import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowLeft, MapPin, CheckCircle, MessageCircle } from 'lucide-angular';
import { ApiService } from '../../services/api.service';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: 'item-details.component.html'
})
export class ItemDetailsComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly MapPinIcon = MapPin;
  readonly CheckCircleIcon = CheckCircle;
  readonly MessageCircleIcon = MessageCircle;

  router = inject(Router);
  route = inject(ActivatedRoute);
  apiService = inject(ApiService);
  
  item: Item | undefined;
  id: string | null = null;

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.apiService.getItemById(Number(this.id)).subscribe(item => {
        this.item = item;
      });
    }
  }

  navigateToBook() {
    if (this.id) {
      this.router.navigate([`/book-item/${this.id}`]);
    }
  }
}