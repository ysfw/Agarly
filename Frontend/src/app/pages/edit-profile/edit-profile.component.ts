import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Camera } from 'lucide-angular';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CameraIcon = Camera;
  
  router = inject(Router);

  formData = {
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Apt 4B',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    bio: 'Friendly neighbor who loves sharing tools and kitchen equipment. Always happy to help out the community!'
  };

  handleSubmit() {
    alert('Profile updated successfully!');
    this.router.navigate(['/profile']);
  }
}