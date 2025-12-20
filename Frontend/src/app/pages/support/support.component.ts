import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowLeft, HelpCircle, MessageCircle, BookOpen, Mail, Send } from 'lucide-angular';
import { SupportService } from '../../services/support.service';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css'
})
export class SupportComponent {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly HelpCircleIcon = HelpCircle;
  readonly MessageCircleIcon = MessageCircle;
  readonly BookOpenIcon = BookOpen;
  readonly MailIcon = Mail;
  readonly SendIcon = Send;

  subject = '';
  message = '';
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  private router = inject(Router);
  private supportService = inject(SupportService);

  goBack() {
    this.router.navigate(['/settings']);
  }

  handleSubmit(form: NgForm) {
    if (form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const subject = this.subject.trim();
    const message = this.message.trim();

    this.supportService.createTicket(subject, message).subscribe({
      next: (ticket) => {
        this.successMessage = `Support request sent!`;
        this.isSubmitting = false;
        form.resetForm();
      },
      error: () => {
        this.errorMessage = 'Something went wrong while sending your request. Please try again later.';
        this.isSubmitting = false;
      }
    });
  }

  viewTickets() {
    this.router.navigate(['/tickets']);
  }
}