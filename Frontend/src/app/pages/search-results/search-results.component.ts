import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { LucideAngularModule, ArrowLeft, SlidersHorizontal, Search, MapPin } from 'lucide-angular';
import { ItemCardComponent } from '../../components/item-card/item-card.component';
import { LocationPickerComponent } from '../../components/location-picker/location-picker.component';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ItemCardComponent, LocationPickerComponent],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.css'
})
export class SearchResultsComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly SlidersHorizontalIcon = SlidersHorizontal;
  readonly SearchIcon = Search;
  readonly MapPinIcon = MapPin;

  router = inject(Router);
  route = inject(ActivatedRoute);
  location = inject(Location);
  itemService = inject(ItemService);

  goBack() {
    this.location.back();
  }

  showFilters = false;
  isMapOpen = false;

  filters = {
    category: '',
    distance: 5,
    availability: 'all',
    minPrice: null as number | null,
    maxPrice: null as number | null,
    priceUnit: 'day',
    latitude: null as number | null,
    longitude: null as number | null
  };

  items: Item[] = [];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.filters.category = params['category'];
        this.itemService.getByCategory(this.filters.category).subscribe({
          next: (items) => {
            if (Array.isArray(items)) {
              this.items = items;
            } else {
              this.items = [];
            }
          },
          error: (err) => {
            console.error('SearchResults: Error fetching category items:', err);
            this.items = [];
          }
        });
      } else {
        this.itemService.getAll().subscribe({
          next: (items) => {
            if (Array.isArray(items)) {
              this.items = items;
              // Client-side filtering for now if needed, or implement backend search
              if (params['q']) {
                const query = params['q'].toLowerCase();
                this.items = this.items.filter(i => i.title.toLowerCase().includes(query));
              }
            } else {
              this.items = [];
            }
          },
          error: (err) => {
            console.error('SearchResults: Error fetching items:', err);
            this.items = [];
          }
        });
      }

      if (params['lat'] && params['lng']) {
        this.filters.latitude = parseFloat(params['lat']);
        this.filters.longitude = parseFloat(params['lng']);
        this.filters.distance = 10; // Default radius
      }
    });
  }

  openMap() {
    this.isMapOpen = true;
  }

  closeMap() {
    this.isMapOpen = false;
  }

  onLocationPicked(coords: { lat: number, lng: number }) {
    this.filters.latitude = coords.lat;
    this.filters.longitude = coords.lng;
  }

  useCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.filters.latitude = position.coords.latitude;
        this.filters.longitude = position.coords.longitude;
      }, (error) => {
        console.error('Error getting location', error);
        alert('Could not get your location. Please allow location access.');
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  applyFilters() {
    console.log('Applying filters:', this.filters);
    // In a real app, this would call the backend service with the filter parameters
    this.showFilters = false;
  }
}