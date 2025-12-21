import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Search, Plus, Wrench, Utensils, Sparkles, Monitor, MessageSquare, ArrowUp, MapPin, Dumbbell, Sprout, Package } from 'lucide-angular';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ItemCardComponent } from '../../components/item-card/item-card.component';
import { LocationPickerComponent } from '../../components/location-picker/location-picker.component';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';
import { NavbarLoggedInComponent } from 'src/app/components/navbar-logged-in/navbar-logged-in.component';
import { AuthService } from 'src/app/services/auth.service';
import { SearchService } from 'src/app/services/search.service';
import { ItemCategory } from '../../models/enums/item.category.enum';
import { ItemStatus } from '../../models/enums/item-status.emun';
import {SearchCriteria} from '../../models/search.criteria.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ItemCardComponent, NavbarLoggedInComponent, NavbarComponent, LocationPickerComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private itemService = inject(ItemService);
  private authService = inject(AuthService);
  private searchService = inject(SearchService);

  auth = this.authService.isLoggedIn;

  searchQuery = '';
  searchLocation = '';
  searchLat: number | null = null;
  searchLng: number | null = null;

  selectedCategory: ItemCategory | undefined  = undefined;
  items: Item[] = [];
  isMapOpen = false;

  readonly SearchIcon = Search;
  readonly PlusIcon = Plus;
  readonly MessageSquareIcon = MessageSquare;
  readonly ArrowUpIcon = ArrowUp;
  readonly MapPinIcon = MapPin;

  categories = [
    { name: 'Tools', value: ItemCategory.TOOLS, icon: Wrench },
    { name: 'Kitchen', value: ItemCategory.KITCHEN, icon: Utensils },
    { name: 'Cleaning', value: ItemCategory.CLEANING, icon: Sparkles },
    { name: 'Electronics', value: ItemCategory.ELECTRONICS, icon: Monitor },
    { name: 'Sports', value: ItemCategory.SPORTS, icon: Dumbbell },
    { name: 'Garden', value: ItemCategory.GARDEN, icon: Sprout },
    { name: 'Other', value: ItemCategory.OTHER, icon: Package }
  ];

  ngOnInit() {
    this.searchService.getFeed().subscribe({
      next: (items) => {
        this.items = items ?? [];
      },
      error : () => {
        this.items = [];
      }
    });
  }

  get filteredItems() {
    return this.selectedCategory
      ? this.items.filter(item => item.category === this.selectedCategory)
      : this.items;
  }

  handleSearch() {
    const criteria: SearchCriteria = {
      keyword: this.searchQuery,
      latitude: this.searchLat ?? undefined,
      longitude: this.searchLng ?? undefined,
      radius: undefined,
      category: this.selectedCategory,
      approvalStatus: ItemStatus.APPROVED,
      rentalStatus: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      priceUnit: undefined,
      sortBy: 'newest',
      sortDirection: 'desc'
    };

    this.router.navigate(['/search'], {
      queryParams: {
        q: this.searchQuery,
        location: this.searchLocation,
        lat: this.searchLat,
        lng: this.searchLng
      }
    });

    this.searchService.search(criteria).subscribe(items => {
      this.items = items;
    });
  }

  toggleCategory(category: ItemCategory) {
    this.selectedCategory = this.selectedCategory === category ? undefined : category;

    if (!this.selectedCategory) {
      this.ngOnInit();    // reload feed, (when double click certain category)
      return;
    }

    const criteria: SearchCriteria = {
      category: this.selectedCategory,
      approvalStatus: ItemStatus.APPROVED,
      sortBy: 'newest',
      sortDirection: 'desc'
    };
    this.searchService.search(criteria).subscribe(items => {
      this.items = items;
    });
  }

  navigateToRequestItem() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/request-item']);
  }

  navigateToAddItem() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/add-item']);
  }

  openMap() {
    this.isMapOpen = true;
  }

  closeMap() {
    this.isMapOpen = false;
  }

  onLocationPicked(coords: { lat: number, lng: number, address: string }) {
    this.searchLat = coords.lat;
    this.searchLng = coords.lng;
    this.searchLocation = coords.address;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
