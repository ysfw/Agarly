import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { LucideAngularModule, ArrowLeft, Calendar, CheckCircle, AlertCircle } from 'lucide-angular';
import { ModalService } from '../../services/modal.service';
import { BookingService, CreateBookingRequest } from '../../services/booking.service';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-book-item',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './book-item.component.html',
  styleUrl: './book-item.component.css'
})
export class BookItemComponent implements OnInit {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CalendarIcon = Calendar;
  readonly CheckCircleIcon = CheckCircle;
  readonly AlertCircleIcon = AlertCircle;

  step = 1;
  bookingData = {
    startDate: '',
    endDate: '',
    notes: '',
    agreeToTerms: false
  };

  item: Item | null = null;
  itemId: number | null = null;
  isSubmitting = false;
  private readonly fallbackImage = 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=100';

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private modalService = inject(ModalService);
  private bookingService = inject(BookingService);
  private itemService = inject(ItemService);

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      const parsedId = Number(paramId);
      if (!Number.isNaN(parsedId)) {
        this.itemId = parsedId;
        this.loadItem(parsedId);
      }
    }
  }

  private loadItem(id: number): void {
    this.itemService.getById(id).subscribe({
      next: (item) => {
        this.item = item;
      },
      error: () => {
        this.modalService.alert('Unable to load item details. Please try again later.', 'Error');
      }
    });
  }

  handleBack(): void {
    if (this.step > 1) {
      this.step--;
    } else {
      this.location.back();
    }
  }

  handleSubmit(): void {
    if (this.step === 1) {
      if (!this.bookingData.startDate || !this.bookingData.endDate) {
        this.modalService.alert('Select both start and end dates before continuing.', 'Missing Dates');
        return;
      }

      if (!this.isDateRangeValid()) {
        this.modalService.alert('End date must be on or after the start date.', 'Invalid Dates');
        return;
      }

      this.step = 2;
    } else if (this.step === 2) {
      this.step = 3;
    }
  }

  handleConfirm(): void {
    if (this.isSubmitting) {
      return;
    }

    if (!this.itemId) {
      this.modalService.alert('The selected item is unavailable. Please return and try again.', 'Booking Unavailable');
      return;
    }

    if (!this.isDateRangeValid()) {
      this.modalService.alert('The booking dates are invalid. Please review them before submitting.', 'Invalid Dates');
      return;
    }

    const payload: CreateBookingRequest = {
      itemId: this.itemId,
      startDate: this.bookingData.startDate,
      endDate: this.bookingData.endDate
    };

    this.isSubmitting = true;
    this.bookingService.createBooking(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.modalService.alert('Booking request sent! The owner will review and respond.', 'Success')
          .then(() => this.router.navigate(['/dashboard']));
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Booking request failed', error);
        let message = 'Unable to send booking request. Please try again.';
        if (error?.status === 400) {
          message = 'Please check the booking details and try again.';
        } else if (error?.status === 409) {
          message = 'The selected dates are no longer available. Choose different dates.';
        }
        this.modalService.alert(message, 'Booking Failed');
      }
    });
  }

  private isDateRangeValid(): boolean {
    const { startDate, endDate } = this.bookingData;
    if (!startDate || !endDate) {
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  }

  get ownerDisplayName(): string {
    if (!this.item?.owner) {
      return 'Owner details unavailable';
    }

    const first = this.item.owner.firstName ?? '';
    const last = this.item.owner.lastName ?? '';
    const username = this.item.owner.username ?? '';
    const fullName = `${first} ${last}`.trim();
    return fullName || username || 'Owner';
  }

  get itemPrimaryImage(): string {
    if (this.item?.imageUrls?.length) {
      return this.item.imageUrls[0];
    }

    return this.fallbackImage;
  }
}