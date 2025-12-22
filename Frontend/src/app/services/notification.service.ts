import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { EventService } from './event-service';
import { sseEvent } from '../models/sse-event.model';

export interface NotificationToast {
    id: number;
    type: 'success' | 'info' | 'warning' | 'error';
    title: string;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private eventService = inject(EventService);
    private toastIdCounter = 0;

    // Observable for components to subscribe to
    toasts$ = new Subject<NotificationToast>();

    // Observable for data refresh events - components can subscribe to know when to refresh
    refreshBookings$ = new Subject<void>();
    refreshItems$ = new Subject<void>();
    refreshRequests$ = new Subject<void>();
    refreshProfile$ = new Subject<void>();

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.eventService.getEvents().subscribe({
            next: (event: sseEvent) => {
                this.handleEvent(event);
            },
            error: (err) => {
                console.error('SSE Error in NotificationService:', err);
            }
        });
    }

    private handleEvent(event: sseEvent) {
        console.log('NotificationService received event:', event);

        switch (event.type) {
            case 'BOOKING_CREATED':
                this.showToast('info', 'New Booking Request', 'Someone wants to borrow one of your items!');
                this.refreshBookings$.next();
                break;

            case 'BOOKING_APPROVED':
                this.showToast('success', 'Booking Approved', 'Your booking request has been approved!');
                this.refreshBookings$.next();
                break;

            case 'BOOKING_REJECTED':
                this.showToast('warning', 'Booking Declined', 'Your booking request was declined.');
                this.refreshBookings$.next();
                break;

            case 'ITEM_APPROVED':
                this.showToast('success', 'Item Approved', 'Your item listing has been approved and is now visible!');
                this.refreshItems$.next();
                break;

            case 'ITEM_REJECTED':
                this.showToast('error', 'Item Not Approved', 'Your item listing was not approved. Please review our guidelines.');
                this.refreshItems$.next();
                break;

            case 'ITEM_RETURNED':
                this.showToast('success', 'Item Returned', 'An item has been marked as returned!');
                this.refreshItems$.next();
                this.refreshBookings$.next();
                break;

            case 'REQUEST_APPROVED':
                this.showToast('success', 'Request Approved', 'Your item request has been approved!');
                this.refreshRequests$.next();
                break;

            case 'USER_VERIFIED':
                this.showToast('success', 'Account Verified', 'Your account has been verified!');
                this.refreshProfile$.next();
                break;

            case 'Banned':
                this.showToast('error', 'Account Suspended', 'Your account has been suspended.');
                break;

            default:
                console.log('Unknown event type:', event.type);
        }
    }

    showToast(type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) {
        const toast: NotificationToast = {
            id: ++this.toastIdCounter,
            type,
            title,
            message
        };
        this.toasts$.next(toast);
    }
}
