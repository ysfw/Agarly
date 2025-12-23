import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { ArrowLeft, LucideAngularModule, MapPin, Search, SlidersHorizontal } from 'lucide-angular';
import { ItemCardComponent } from '../../components/item-card/item-card.component';
import { LocationPickerComponent } from '../../components/location-picker/location-picker.component';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';
import { SearchService } from 'src/app/services/search.service';
import { ItemCategory } from '../../models/enums/item.category.enum';
import { SearchCriteria } from '../../models/search.criteria.model';
import { PriceUnit } from '../../models/enums/price-unit-enum';
import { ItemStatus } from '../../models/enums/item-status.emun';
import { ModalService } from '../../services/modal.service';


import { ItemRentalStatus } from '../../models/enums/item-rental-status.enum';

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
  protected readonly ItemCategory = ItemCategory;
  protected readonly ItemStatus = ItemStatus;
  protected readonly ItemRentalStatus = ItemRentalStatus;

  router = inject(Router);
  route = inject(ActivatedRoute);
  location = inject(Location);
  itemService = inject(ItemService);
  searchService = inject(SearchService);
  modalService = inject(ModalService);

  goBack() {
    this.location.back();
  }

  showFilters = false;
  isMapOpen = false;
  isNearMeActive = false;

  filters: SearchCriteria = {
    keyword: '',
    category: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    priceUnit: undefined,
    latitude: undefined,
    longitude: undefined,
    radius: 5,
    approvalStatus: ItemStatus.APPROVED, // Default to APPROVED items only
    rentalStatus: undefined,
    sortBy: 'newest',
    sortDirection: 'desc'
  };

  items: Item[] = [];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.filters.category = params['category'] as ItemCategory;
      }
      if (params['q']) {
        this.filters.keyword = params['q'];
      }
      if (params['lat'] && params['lng']) {
        this.filters.latitude = parseFloat(params['lat']);
        this.filters.longitude = parseFloat(params['lng']);
        this.filters.radius = 10;      // Default radius
      }
      this.loadItems();
    });
  }

  loadItems() {
    this.searchService.search(this.filters).subscribe({
      next: items => this.items = items ?? [],
      error: err => {
        console.log('SearchResults: Error fetching items:', err);
        this.items = [];
      }
    })
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
    this.isNearMeActive = false;
    this.loadItems();
  }

  useCurrentLocation() {
    // If already active turn it off
    if (this.isNearMeActive) {
      this.clearLocation();
      return;
    }

    // Otherwise turn on
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.filters.latitude = position.coords.latitude;
          this.filters.longitude = position.coords.longitude;
          this.isNearMeActive = true;
        },
        (error) => {
          console.error('Error getting location', error);
          this.modalService.alert(
            'Could not get your location. Please allow location access.',
            'Location Error'
          );
        }
      );
    } else {
      this.modalService.alert(
        'Geolocation is not supported by this browser.',
        'Not Supported'
      );
    }
  }

  clearLocation() {
    this.filters.latitude = undefined;
    this.filters.longitude = undefined;
    this.isNearMeActive = false;
    this.loadItems();
  }

  applyFilters() {
    this.loadItems();
    this.showFilters = false;
  }

}
