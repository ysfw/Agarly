import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ModalConfig {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
}

export interface ModalState {
    isOpen: boolean;
    config: ModalConfig;
    resolve?: (value: boolean) => void;
}

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    private modalState = new BehaviorSubject<ModalState>({
        isOpen: false,
        config: {
            title: '',
            message: '',
            confirmText: 'OK',
            cancelText: 'Cancel',
            showCancel: false
        }
    });

    public modalState$ = this.modalState.asObservable();

    /**
     * Show an alert modal (OK button only)
     */
    alert(message: string, title: string = 'Alert'): Promise<boolean> {
        return new Promise((resolve) => {
            this.modalState.next({
                isOpen: true,
                config: {
                    title,
                    message,
                    confirmText: 'OK',
                    showCancel: false
                },
                resolve
            });
        });
    }

    /**
     * Show a confirmation modal (OK and Cancel buttons)
     */
    confirm(message: string, title: string = 'Confirm'): Promise<boolean> {
        return new Promise((resolve) => {
            this.modalState.next({
                isOpen: true,
                config: {
                    title,
                    message,
                    confirmText: 'Confirm',
                    cancelText: 'Cancel',
                    showCancel: true
                },
                resolve
            });
        });
    }

    /**
     * Custom modal with full configuration
     */
    show(config: ModalConfig): Promise<boolean> {
        return new Promise((resolve) => {
            this.modalState.next({
                isOpen: true,
                config: {
                    ...config,
                    confirmText: config.confirmText || 'OK',
                    cancelText: config.cancelText || 'Cancel',
                    showCancel: config.showCancel ?? false
                },
                resolve
            });
        });
    }

    /**
     * Handle confirm action
     */
    handleConfirm() {
        const current = this.modalState.value;
        if (current.resolve) {
            current.resolve(true);
        }
        this.close();
    }

    /**
     * Handle cancel action
     */
    handleCancel() {
        const current = this.modalState.value;
        if (current.resolve) {
            current.resolve(false);
        }
        this.close();
    }

    /**
     * Close the modal
     */
    close() {
        this.modalState.next({
            isOpen: false,
            config: {
                title: '',
                message: '',
                confirmText: 'OK',
                cancelText: 'Cancel',
                showCancel: false
            }
        });
    }
}
