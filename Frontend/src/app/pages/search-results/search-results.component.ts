import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowLeft, SlidersHorizontal, Search, MapPin } from 'lucide-angular';
import { ItemCardComponent } from '../../components/item-card/item-card.component';
import { LocationPickerComponent } from '../../components/location-picker/location-picker.component';

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

  sampleItems = [{
    id: 1,
    name: 'Power Drill',
    category: 'Tools',
    distance: '0.3 mi',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'
  }, {
    id: 2,
    name: 'Stand Mixer',
    category: 'Kitchen',
    distance: '0.5 mi',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=400'
  }, {
    id: 4,
    name: 'Pressure Washer',
    category: 'Cleaning',
    distance: '1.2 mi',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400'
  }, {
    id: 5,
    name: 'Projector',
    category: 'Electronics',
    distance: '0.6 mi',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400'
  }];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        console.log('Search query:', params['q']);
        // TODO: Filter items by name
      }
      if (params['lat'] && params['lng']) {
        this.filters.latitude = parseFloat(params['lat']);
        this.filters.longitude = parseFloat(params['lng']);
        this.filters.distance = 10; // Default radius
        console.log('Search location:', this.filters.latitude, this.filters.longitude);
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
    // For now, we'll just toggle the filters closed to simulate action
    this.showFilters = false;
  }
}