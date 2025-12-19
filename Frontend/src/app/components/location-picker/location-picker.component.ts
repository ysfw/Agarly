import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Search, MapPin } from 'lucide-angular';
import * as L from 'leaflet';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.css']
})
export class LocationPickerComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() initialLat?: number;
  @Input() initialLng?: number;
  @Output() closePicker = new EventEmitter<void>();
  @Output() locationPicked = new EventEmitter<{ lat: number, lng: number, address: string }>();

  readonly XIcon = X;
  readonly SearchIcon = Search;
  readonly MapPinIcon = MapPin;
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;

  selectedLat?: number;
  selectedLng?: number;
  selectedAddress?: string;

  searchQuery = '';
  searchResults: any[] = [];
  isSearching = false;
  suggestions: any[] = [];
  private searchTimeout: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit() {
    // Map init is handled in ngOnChanges or when isOpen becomes true
  }

  ngOnChanges() {
    if (this.isOpen && isPlatformBrowser(this.platformId)) {
      // Small timeout to ensure DOM is ready
      setTimeout(() => {
        this.initMap();
      }, 100);
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  onSearchInput() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (!this.searchQuery.trim()) {
      this.suggestions = [];
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.fetchSuggestions();
    }, 300);
  }

  async fetchSuggestions() {
    this.isSearching = true;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}&addressdetails=1&limit=5`);
      const data = await response.json();
      this.suggestions = data;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      this.isSearching = false;
    }
  }

  selectSuggestion(suggestion: any) {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);

    // User wants the full address. suggestion.display_name contains the full string 
    // (e.g. "Doctor Mahmoud Selim Street, Miami, Alexandria, 21614, Egypt")
    const fullAddress = suggestion.display_name;

    this.selectLocation(lat, lng, fullAddress);
    this.map?.flyTo([lat, lng], 16);

    this.searchQuery = fullAddress;
    this.suggestions = [];
  }

  async searchAddress() {
    // Fallback if user hits enter without selecting a suggestion
    if (this.suggestions.length > 0) {
      this.selectSuggestion(this.suggestions[0]);
    } else {
      this.fetchSuggestions().then(() => {
        if (this.suggestions.length > 0) {
          this.selectSuggestion(this.suggestions[0]);
        }
      });
    }
  }

  async selectLocation(lat: number, lng: number, addressOverride?: string) {
    this.selectedLat = lat;
    this.selectedLng = lng;

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else if (this.map) {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    }

    if (addressOverride) {
      this.selectedAddress = addressOverride;
      return;
    }

    // Reverse Geocoding
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      const data = await response.json();

      // Use the full display name as requested
      this.selectedAddress = data.display_name;

    } catch (error) {
      console.error('Error reverse geocoding:', error);
      this.selectedAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  private initMap(): void {
    if (this.map) return; // Already initialized

    const defaultLat = 30.0444; // Cairo
    const defaultLng = 31.2357;

    this.selectedLat = this.initialLat || defaultLat;
    this.selectedLng = this.initialLng || defaultLng;

    this.map = L.map('map').setView([this.selectedLat, this.selectedLng], 13);

    // Use Google Maps Standard Road Map tiles
    L.tileLayer('http://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
      maxZoom: 20
    }).addTo(this.map);

    // Fix marker icon issue in Angular/Webpack
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    // Add initial marker if we have coords
    if (this.initialLat && this.initialLng) {
      this.marker = L.marker([this.initialLat, this.initialLng]).addTo(this.map);
    } else {
      // Try to get user location
      this.locateUser();
    }

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.selectLocation(e.latlng.lat, e.latlng.lng);
    });
  }

  locateUser() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.selectLocation(lat, lng);
        this.map?.setView([lat, lng], 13);
      }, (error) => {
        console.warn('Geolocation denied or failed', error);
      });
    }
  }

  close() {
    this.isOpen = false;
    this.closePicker.emit();
    // Destroy map to clean up
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  confirm() {
    if (this.selectedLat && this.selectedLng) {
      this.locationPicked.emit({
        lat: this.selectedLat,
        lng: this.selectedLng,
        address: this.selectedAddress || `${this.selectedLat}, ${this.selectedLng}`
      });
      this.close();
    }
  }
}
