import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Image as ImageIcon, X, MapPin } from 'lucide-angular';
import { LocationPickerComponent } from '../../components/location-picker/location-picker.component';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';

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
  itemService = inject(ItemService);
  categories = ['TOOLS', 'KITCHEN', 'CLEANING', 'ELECTRONICS', 'SPORTS', 'GARDEN', 'OTHER'];

  formData = {
    title: '',
    category: 'TOOLS',
    description: '',
    condition: 'EXCELLENT',
    pricePerDay: null as number | null,
    priceUnit: 'DAY',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null
  };

  images: string[] = [];
  isMapOpen = false;

  handleSubmit() {
    if (!this.formData.title || !this.formData.pricePerDay || !this.formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    const newItem: Item = {
      title: this.formData.title,
      category: this.formData.category as any,
      description: this.formData.description,
      condition: this.formData.condition as any,
      pricePerDay: this.formData.pricePerDay,
      priceUnit: this.formData.priceUnit as any,
      location: this.formData.location,
      latitude: this.formData.latitude!,
      longitude: this.formData.longitude!,
      imageUrls: this.images
    };

    console.log('Submitting item:', newItem);
    this.itemService.create(newItem).subscribe({
      next: (id) => {
        console.log('Item created with ID:', id);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error creating item:', err);
        alert('Failed to create item. Please try again.');
      }
    });
  }

  handleImageUpload(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        this.itemService.uploadImage(file).subscribe({
          next: (url) => {
            console.log('Image uploaded:', url);
            this.images.push(url);
          },
          error: (err) => {
            console.error('Error uploading image:', err);
            alert('Failed to upload image');
          }
        });
      });
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