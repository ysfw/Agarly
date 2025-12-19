import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Image as ImageIcon, X, MapPin } from 'lucide-angular';
import { LocationPickerComponent } from '../../components/location-picker/location-picker.component';

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, LocationPickerComponent],
  templateUrl: './add-item.component.html',
  styleUrl: './add-item.component.css'
})
export class AddItemComponent {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly ImageIcon = ImageIcon;
  readonly XIcon = X;
  readonly MapPinIcon = MapPin;

  router = inject(Router);
  categories = ['Tools', 'Kitchen', 'Cleaning', 'Electronics', 'Sports', 'Garden', 'Other'];

  formData = {
    name: '',
    category: '',
    description: '',
    condition: 'excellent',
    price: null as number | null,
    priceUnit: 'day',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null
  };

  images: string[] = [];
  isMapOpen = false;

  handleSubmit() {
    // TODO: Send formData to backend
    console.log('Submitting form:', this.formData);
    this.router.navigate(['/home']);
  }

  handleImageUpload(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newImages = Array.from(input.files).map(file => URL.createObjectURL(file));
      this.images = [...this.images, ...newImages];
    }
  }

  removeImage(index: number) {
    this.images = this.images.filter((_, i) => i !== index);
  }

  openMap() {
    this.isMapOpen = true;
  }

  closeMap() {
    this.isMapOpen = false;
  }

  onLocationPicked(coords: { lat: number, lng: number, address: string }) {
    this.formData.latitude = coords.lat;
    this.formData.longitude = coords.lng;
    this.formData.location = coords.address;
  }
}