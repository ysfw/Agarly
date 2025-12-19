import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Search, Plus, Wrench, Utensils, Sparkles, Monitor, MessageSquare, ArrowUp, MapPin } from 'lucide-angular';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ItemCardComponent } from '../../components/item-card/item-card.component';
import { LocationPickerComponent } from '../../components/location-picker/location-picker.component';
import { ApiService } from '../../services/api.service';
import { Item } from '../../models/item.model';
import { NavbarLoggedInComponent } from 'src/app/components/navbar-logged-in/navbar-logged-in.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ItemCardComponent, NavbarLoggedInComponent, NavbarComponent, LocationPickerComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  auth = this.authService.isLoggedIn;

  searchQuery = '';
  searchLocation = '';
  searchLat: number | null = null;
  searchLng: number | null = null;

  selectedCategory: string | null = null;
  items: Item[] = [];
  isMapOpen = false;

  readonly SearchIcon = Search;
  readonly PlusIcon = Plus;
  readonly MessageSquareIcon = MessageSquare;
  readonly ArrowUpIcon = ArrowUp;
  readonly MapPinIcon = MapPin;

  categories = [
    { name: 'Tools', icon: Wrench },
    { name: 'Kitchen', icon: Utensils },
    { name: 'Cleaning', icon: Sparkles },
    { name: 'Electronics', icon: Monitor }
  ];

  ngOnInit() {
    this.apiService.getItems().subscribe(items => {
      this.items = items;
    });
  }

  get filteredItems() {
    return this.selectedCategory
      ? this.items.filter(item => item.category === this.selectedCategory)
      : this.items;
  }

  handleSearch() {
    this.router.navigate(['/search'], {
      queryParams: {
        q: this.searchQuery,
        location: this.searchLocation,
        lat: this.searchLat,
        lng: this.searchLng
      }
    });
  }

  toggleCategory(category: string) {
    this.selectedCategory = this.selectedCategory === category ? null : category;
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

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
}
