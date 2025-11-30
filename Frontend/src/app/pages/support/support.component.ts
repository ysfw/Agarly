import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, HelpCircle, MessageCircle, BookOpen, Mail, Send } from 'lucide-angular';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
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

  message = '';

  private router = inject(Router);

  goBack() {
    this.router.navigate(['/settings']);
  }

  handleSubmit() {
    alert('Support request sent! We will get back to you soon.');
    this.message = '';
  }
}