import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Image as ImageIcon, X } from 'lucide-angular';

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './add-item.component.html',
  styleUrl: './add-item.component.css'
})
export class AddItemComponent {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly ImageIcon = ImageIcon;
  readonly XIcon = X;
  
  router = inject(Router);
  categories = ['Tools', 'Kitchen', 'Cleaning', 'Electronics', 'Sports', 'Garden', 'Other'];

  formData = {
    name: '',
    category: '',
    description: '',
    condition: 'excellent'
  };
  
  images: string[] = [];

  handleSubmit() {
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
}