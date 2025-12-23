import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowLeft, MapPin, CheckCircle, MessageCircle, ChevronLeft, ChevronRight, User, Edit } from 'lucide-angular';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';
import { MapDisplayComponent } from '../../components/map-display/map-display.component';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, MapDisplayComponent],
  templateUrl: 'item-details.component.html'
})
export class ItemDetailsComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly MapPinIcon = MapPin;
  readonly CheckCircleIcon = CheckCircle;
  readonly MessageCircleIcon = MessageCircle;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly UserIcon = User;
  readonly EditIcon = Edit;

  router = inject(Router);
  route = inject(ActivatedRoute);
  location = inject(Location);
  itemService = inject(ItemService);

  item: Item | undefined;
  id: string | null = null;

  // Image gallery state
  currentImageIndex = signal(0);

  goBack() {
    this.location.back();
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.itemService.getById(Number(this.id)).subscribe(item => {
        this.item = item;
      });
    }
  }

  navigateToBook() {
    if (this.id) {
      this.router.navigate([`/book-item/${this.id}`]);
    }
  }

  openMap() {
    if (this.item?.latitude && this.item?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${this.item.latitude},${this.item.longitude}`;
      window.open(url, '_blank');
    }
  }

  // Image gallery methods
  get currentImage(): string {
    if (this.item?.imageUrls && this.item.imageUrls.length > 0) {
      return this.item.imageUrls[this.currentImageIndex()];
    }
    return 'assets/placeholder-image.jpg';
  }

  get hasMultipleImages(): boolean {
    return (this.item?.imageUrls?.length ?? 0) > 1;
  }

  get totalImages(): number {
    return this.item?.imageUrls?.length ?? 0;
  }

  previousImage(): void {
    if (this.item?.imageUrls) {
      const newIndex = this.currentImageIndex() - 1;
      this.currentImageIndex.set(newIndex < 0 ? this.item.imageUrls.length - 1 : newIndex);
    }
  }

  nextImage(): void {
    if (this.item?.imageUrls) {
      const newIndex = this.currentImageIndex() + 1;
      this.currentImageIndex.set(newIndex >= this.item.imageUrls.length ? 0 : newIndex);
    }
  }

  goToImage(index: number): void {
    this.currentImageIndex.set(index);
  }

  viewOwnerProfile(): void {
    if (this.item?.owner?.id) {
      this.router.navigate(['/user', this.item.owner.id]);
    }
  }

  // Check if current user is the owner of this item
  get isOwner(): boolean {
    const currentUsername = localStorage.getItem('username');
    return !!this.item?.owner?.username && this.item.owner.username === currentUsername;
  }

  // Check if item can be edited (only PENDING items can be edited)
  get canEdit(): boolean {
    return this.isOwner && this.item?.status === 'PENDING';
  }

  editItem(): void {
    if (this.id) {
      this.router.navigate(['/add-item'], { queryParams: { edit: this.id } });
    }
  }
}