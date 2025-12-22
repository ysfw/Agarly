import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
           (click)="onBackdropClick()">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all"
             (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-xl font-semibold text-gray-900">{{ title }}</h3>
          </div>

          <!-- Body -->
          <div class="px-6 py-4">
            <p class="text-gray-700 leading-relaxed">{{ message }}</p>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            @if (showCancel) {
              <button (click)="onCancel()"
                      class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                {{ cancelText }}
              </button>
            }
            <button (click)="onConfirm()"
                    class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class AlertModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Alert';
  @Input() message = '';
  @Input() confirmText = 'OK';
  @Input() cancelText = 'Cancel';
  @Input() showCancel = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
    this.close.emit();
  }

  onCancel() {
    this.cancel.emit();
    this.close.emit();
  }

  onBackdropClick() {
    this.close.emit();
  }
}
