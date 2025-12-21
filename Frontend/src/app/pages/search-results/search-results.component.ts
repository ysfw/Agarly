import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {CommonModule, Location} from '@angular/common';
import {ArrowLeft, LucideAngularModule, MapPin, Search, SlidersHorizontal} from 'lucide-angular';
import {ItemCardComponent} from '../../components/item-card/item-card.component';
import {LocationPickerComponent} from '../../components/location-picker/location-picker.component';
import {ItemService} from '../../services/item.service';
import {Item} from '../../models/item.model';
import {SearchService} from 'src/app/services/search.service';
import {ItemCategory} from '../../models/enums/item.category.enum';
import {SearchCriteria} from '../../models/search.criteria.model';
import {PriceUnit} from '../../models/enums/price-unit-enum';
import {ItemStatus} from '../../models/enums/item-status.emun';


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

  router = inject(Router);
  route = inject(ActivatedRoute);
  location = inject(Location);
  itemService = inject(ItemService);
  searchService = inject(SearchService);

  goBack() {
    this.location.back();
  }

  showFilters = false;
  isMapOpen = false;

  filters : SearchCriteria = {
    keyword: '',
    category: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    priceUnit: PriceUnit.DAY,
    latitude: undefined,
    longitude: undefined,
    radius: 5,
    approvalStatus: undefined,
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
        this.filters.radius =10;      // Default radius
      }
      this.loadItems();
    });
  }

  loadItems() {
    this.searchService.search(this.filters).subscribe({
      next: items => this.items = items ?? [],
      error: err => {
        console.log('SearchResults: Error fetching items:',err);
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

  applyFilters()  {
    if (this.filters.approvalStatus === undefined) {
      this.filters.approvalStatus = undefined;
    }
    this.loadItems();
    this.showFilters = false;
  }

}
