import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, ArrowRight, Check, MapPin, Package, Image as ImageIcon, Loader2 } from 'lucide-angular';
import { LocationPickerComponent } from '../../components/location-picker/location-picker.component';
import { ImageUploaderComponent } from '../../components/image-uploader/image-uploader.component';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, LocationPickerComponent, ImageUploaderComponent],
  templateUrl: './add-item.component.html',
  styleUrl: './add-item.component.css'
})
export class AddItemComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly ArrowRightIcon = ArrowRight;
  readonly CheckIcon = Check;
  readonly MapPinIcon = MapPin;
  readonly PackageIcon = Package;
  readonly ImageIcon = ImageIcon;
  readonly LoaderIcon = Loader2;

  router = inject(Router);
  route = inject(ActivatedRoute);
  location = inject(Location);
  itemService = inject(ItemService);
  modalService = inject(ModalService);

  // Edit mode
  isEditMode = false;
  editItemId: number | null = null;

  // Wizard state
  currentStep = 1;
  totalSteps = 3;
  isSubmitting = false;

  steps = [
    { number: 1, title: 'Details', icon: Package },
    { number: 2, title: 'Location', icon: MapPin },
    { number: 3, title: 'Images', icon: ImageIcon }
  ];

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

  ngOnInit(): void {
    const editId = this.route.snapshot.queryParams['edit'];
    if (editId) {
      this.editItemId = Number(editId);
      this.isEditMode = true;
      this.loadItemForEdit(this.editItemId);
    }
  }

  private loadItemForEdit(id: number): void {
    this.itemService.getById(id).subscribe({
      next: (item) => {
        // Only PENDING items can be edited
        if (item.status && item.status !== 'PENDING') {
          this.modalService.alert('Only pending items can be edited.', 'Cannot Edit');
          this.router.navigate(['/dashboard']);
          return;
        }
        // Populate form with existing data
        this.formData = {
          title: item.title,
          category: item.category,
          description: item.description,
          condition: item.condition,
          pricePerDay: item.pricePerDay,
          priceUnit: item.priceUnit,
          location: item.location,
          latitude: item.latitude,
          longitude: item.longitude
        };
        this.images = item.imageUrls || [];
      },
      error: () => {
        this.modalService.alert('Failed to load item for editing.', 'Error');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  goBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
    } else {
      this.location.back();
    }
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    }
  }

  goToStep(step: number) {
    // Only allow going back or to validated steps
    if (step < this.currentStep) {
      this.currentStep = step;
    } else if (step === this.currentStep + 1 && this.validateCurrentStep()) {
      this.currentStep = step;
    }
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1: // Details
        if (!this.formData.title || !this.formData.pricePerDay) {
          this.modalService.alert('Please fill in the title and price.', 'Validation Error');
          return false;
        }
        return true;
      case 2: // Location
        if (!this.formData.location) {
          this.modalService.alert('Please select a location.', 'Validation Error');
          return false;
        }
        return true;
      case 3: // Images
        return true; // Images are optional
      default:
        return true;
    }
  }

  isStepComplete(step: number): boolean {
    switch (step) {
      case 1:
        return !!(this.formData.title && this.formData.pricePerDay);
      case 2:
        return !!(this.formData.location);
      case 3:
        return this.images.length > 0;
      default:
        return false;
    }
  }

  handleSubmit() {
    if (!this.formData.title || !this.formData.pricePerDay || !this.formData.location) {
      this.modalService.alert('Please fill in all required fields', 'Validation Error');
      return;
    }

    this.isSubmitting = true;

    const itemData: Item = {
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

    if (this.isEditMode && this.editItemId) {
      // UPDATE existing item
      console.log('Updating item:', this.editItemId, itemData);
      this.itemService.update(this.editItemId, itemData).subscribe({
        next: () => {
          console.log('Item updated successfully');
          this.isSubmitting = false;
          this.modalService.alert('Item updated successfully!', 'Success').then(() => {
            this.router.navigate(['/dashboard']);
          });
        },
        error: (err) => {
          console.error('Error updating item:', err);
          this.isSubmitting = false;
          this.modalService.alert('Failed to update item. Please try again.', 'Error');
        }
      });
    } else {
      // CREATE new item
      console.log('Creating item:', itemData);
      this.itemService.create(itemData).subscribe({
        next: (id) => {
          console.log('Item created with ID:', id);
          this.isSubmitting = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Error creating item:', err);
          this.isSubmitting = false;
          this.modalService.alert('Failed to create item. Please try again.', 'Error');
        }
      });
    }
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

  onImagesChange(images: string[]) {
    this.images = images;
  }
}