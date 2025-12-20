import { Component, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Search, Plus, MapPin } from 'lucide-angular';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-home-explore',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: 'home-explore.component.html'
})
export class HomeExploreComponent implements OnInit {
  @Output() onItemClick = new EventEmitter<string>();
  @Output() onAddItem = new EventEmitter<void>();

  private itemService = inject(ItemService);
  private router = inject(Router);

  readonly SearchIcon = Search;
  readonly PlusIcon = Plus;
  readonly MapPinIcon = MapPin;

  categories = ["All", "Tools", "Kitchen", "Cleaning", "Electronics", "Outdoor"];

  items: Item[] = [];

  ngOnInit() {
    this.itemService.getAll().subscribe({
      next: (items) => {
        if (Array.isArray(items)) {
          this.items = items;
        } else {
          console.error('HomeExplore: Expected array, got:', items);
          this.items = [];
        }
      },
      error: (err) => {
        console.error('HomeExplore: Error fetching items:', err);
        this.items = [];
      }
    });
  }

  handleItemClick(id: number) {
    this.router.navigate(['/item', id]);
    this.onItemClick.emit(id.toString());
  }

  handleAddItem() {
    this.router.navigate(['/add-item']);
    this.onAddItem.emit();
  }

  handleImageError(event: any) {
    event.target.src = 'assets/fallback-image.png';
  }
}