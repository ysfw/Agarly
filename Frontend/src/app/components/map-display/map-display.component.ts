import { Component, Input, OnChanges, SimpleChanges, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';

@Component({
    selector: 'app-map-display',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './map-display.component.html',
    styleUrls: ['./map-display.component.css']
})
export class MapDisplayComponent implements OnChanges, OnDestroy {
    @Input() lat!: number;
    @Input() lng!: number;

    private map: L.Map | undefined;
    private marker: L.Marker | undefined;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    ngOnChanges(changes: SimpleChanges) {
        if (isPlatformBrowser(this.platformId)) {
            if (changes['lat'] || changes['lng']) {
                this.updateMap();
            }
        }
    }

    ngOnDestroy() {
        if (this.map) {
            this.map.remove();
        }
    }

    private updateMap() {
        if (!this.lat || !this.lng) return;

        if (!this.map) {
            this.initMap();
        } else {
            this.map.setView([this.lat, this.lng], 15);
            if (this.marker) {
                this.marker.setLatLng([this.lat, this.lng]);
            } else {
                this.marker = L.marker([this.lat, this.lng]).addTo(this.map);
            }
        }
    }

    private initMap(): void {
        // Ensure container exists
        const container = document.getElementById('read-only-map');
        if (!container) return;

        this.map = L.map('read-only-map', {
            zoomControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false
        }).setView([this.lat, this.lng], 15);

        L.tileLayer('http://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
            maxZoom: 20
        }).addTo(this.map);

        // Fix marker icon
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

        this.marker = L.marker([this.lat, this.lng]).addTo(this.map);
    }
}
