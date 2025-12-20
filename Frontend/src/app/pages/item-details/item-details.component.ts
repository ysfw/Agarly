import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowLeft, MapPin, CheckCircle, MessageCircle } from 'lucide-angular';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';
import { MapDisplayComponent } from '../../components/map-display/map-display.component';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, MapDisplayComponent],
  templateUrl: 'item-details.component.html'
})
export class ItemDetailsComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly MapPinIcon = MapPin;
  readonly CheckCircleIcon = CheckCircle;
  readonly MessageCircleIcon = MessageCircle;

  router = inject(Router);
  route = inject(ActivatedRoute);
  itemService = inject(ItemService);

  item: Item | undefined;
  id: string | null = null;

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.itemService.getById(Number(this.id)).subscribe(item => {
        this.item = item;
      });
    }
  }

  navigateToBook() {
    if (this.id) {
      this.router.navigate([`/book-item/${this.id}`]);
    }
  }

  openMap() {
    if (this.item?.latitude && this.item?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${this.item.latitude},${this.item.longitude}`;
      window.open(url, '_blank');
    }
  }
}