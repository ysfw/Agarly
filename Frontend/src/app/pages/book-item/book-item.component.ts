import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, FormsModule, LucideAngularModule],
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
    startTime: '09:00',
    endTime: '17:00',
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

      if (this.item?.priceUnit === 'HOUR') {
        if (!this.bookingData.startTime || !this.bookingData.endTime) {
          this.modalService.alert('Select both start and end times before continuing.', 'Missing Times');
          return;
        }
        // Validate time range if needed, e.g. start < end on same day
        if (this.bookingData.startDate === this.bookingData.endDate) {
          if (this.bookingData.startTime >= this.bookingData.endTime) {
            this.modalService.alert('End time must be after start time on the same day.', 'Invalid Times');
            return;
          }
        }
      }

      const validRange = this.item?.priceUnit === 'HOUR' ? this.isDateTimeRangeValid() : this.isDateRangeValid();

      if (!validRange) {
        this.modalService.alert('End date/time must be on or after the start date/time.', 'Invalid Dates');
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

    const validRange = this.item?.priceUnit === 'HOUR' ? this.isDateTimeRangeValid() : this.isDateRangeValid();
    if (!validRange) {
      this.modalService.alert('The booking dates are invalid. Please review them before submitting.', 'Invalid Dates');
      return;
    }

    const payload: CreateBookingRequest = {
      itemId: this.itemId,
      startDate: this.bookingData.startDate,
      endDate: this.bookingData.endDate,
      startTime: this.item?.priceUnit === 'HOUR' ? this.bookingData.startTime : undefined,
      endTime: this.item?.priceUnit === 'HOUR' ? this.bookingData.endTime : undefined
    };

    this.isSubmitting = true;
    this.bookingService.createBooking(payload).subscribe({
      next: (booking) => {
        this.isSubmitting = false;

        const duration = this.calculateDuration();

        // Navigate to payment page with booking details
        this.router.navigate(['/payment'], {
          state: {
            bookingId: booking.id,
            itemId: this.itemId,
            itemTitle: this.item?.title,
            itemImage: this.itemPrimaryImage,
            ownerName: this.ownerDisplayName,
            startDate: this.bookingData.startDate,
            endDate: this.bookingData.endDate,
            pricePerDay: this.item?.priceUnit === 'HOUR' ? this.item?.pricePerDay : this.item?.pricePerDay, // pricePerDay variable name reuse for rate
            priceUnit: this.item?.priceUnit || 'DAY',
            totalDays: duration.value, // Reuse totalDays field for quantity/hours
            totalAmount: this.calculateTotalAmount()
          }
        });
      },
      error: (error: any) => {
        this.isSubmitting = false;
        console.error('Booking request failed', error);
        let message = 'Unable to send booking request. Please try again.';
        if (error?.status === 400) {
          message = error.error?.message || 'Please check the booking details and try again.';
        } else if (error?.status === 409) {
          message = 'The selected dates are no longer available. Choose different dates.';
        }
        this.modalService.alert(message, 'Booking Failed');
      }
    });
  }

  calculateDuration(): { value: number; unit: string } {
    if (!this.bookingData.startDate || !this.bookingData.endDate) {
      return { value: 0, unit: 'days' };
    }

    if (this.item?.priceUnit === 'HOUR') {
      const start = new Date(`${this.bookingData.startDate}T${this.bookingData.startTime}`);
      const end = new Date(`${this.bookingData.endDate}T${this.bookingData.endTime}`);
      const diffTime = end.getTime() - start.getTime();
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      return { value: Math.max(1, diffHours), unit: 'Hour(s)' };
    } else {
      const start = new Date(this.bookingData.startDate);
      const end = new Date(this.bookingData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return { value: Math.max(1, diffDays), unit: 'Day(s)' };
    }
  }

  calculateTotalAmount(): number {
    const duration = this.calculateDuration();
    return duration.value * (this.item?.pricePerDay || 0);
  }

  private isDateTimeRangeValid(): boolean {
    if (!this.bookingData.startDate || !this.bookingData.endDate || !this.bookingData.startTime || !this.bookingData.endTime) return false;
    const start = new Date(`${this.bookingData.startDate}T${this.bookingData.startTime}`);
    const end = new Date(`${this.bookingData.endDate}T${this.bookingData.endTime}`);
    return end > start;
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