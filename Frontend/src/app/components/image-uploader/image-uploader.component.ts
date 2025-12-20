import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Image as ImageIcon, X, Upload, Loader2 } from 'lucide-angular';
import { ItemService } from '../../services/item.service';

@Component({
    selector: 'app-image-uploader',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './image-uploader.component.html',
    styleUrl: './image-uploader.component.css'
})
export class ImageUploaderComponent {
    readonly ImageIcon = ImageIcon;
    readonly XIcon = X;
    readonly UploadIcon = Upload;
    readonly LoaderIcon = Loader2;

    private itemService = inject(ItemService);

    @Input() images: string[] = [];
    @Input() maxImages: number = 6;
    @Output() imagesChange = new EventEmitter<string[]>();

    isUploading = false;
    isDragOver = false;

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = true;
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            this.uploadFiles(Array.from(files));
        }
    }

    onFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.uploadFiles(Array.from(input.files));
        }
    }

    private uploadFiles(files: File[]) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        const remainingSlots = this.maxImages - this.images.length;
        const filesToUpload = imageFiles.slice(0, remainingSlots);

        if (filesToUpload.length === 0) {
            if (imageFiles.length === 0) {
                alert('Please select only image files.');
            } else {
                alert(`Maximum ${this.maxImages} images allowed.`);
            }
            return;
        }

        this.isUploading = true;
        let uploadedCount = 0;
        const totalToUpload = filesToUpload.length;

        filesToUpload.forEach(file => {
            this.itemService.uploadImage(file).subscribe({
                next: (url) => {
                    const newImages = [...this.images, url];
                    this.images = newImages;
                    this.imagesChange.emit(newImages);
                    uploadedCount++;
                    if (uploadedCount === totalToUpload) {
                        this.isUploading = false;
                    }
                },
                error: (err) => {
                    console.error('Error uploading image:', err);
                    uploadedCount++;
                    if (uploadedCount === totalToUpload) {
                        this.isUploading = false;
                    }
                }
            });
        });
    }

    removeImage(index: number) {
        const newImages = this.images.filter((_, i) => i !== index);
        this.images = newImages;
        this.imagesChange.emit(newImages);
    }

    get canAddMore(): boolean {
        return this.images.length < this.maxImages;
    }
}
