import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Compass, Package, Handshake, Shield, HelpCircle, MessageCircle, Clock, CheckCircle, ArrowLeft, BookOpen, LucideIconData } from 'lucide-angular';
import { RouterLink } from '@angular/router';

interface GuideSection {
  title: string;
  description: string;
  bullets: string[];
  icon: LucideIconData;
}

interface GuideStep {
  title: string;
  detail: string;
  icon: LucideIconData;
}

@Component({
  selector: 'app-user-guide',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './user-guide.html',
  styleUrl: './user-guide.css'
})
export class UserGuide {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly HeroIcon = BookOpen;

  readonly overviewSections: GuideSection[] = [
    {
      title: 'Discover Agarly',
      description: 'Agarly connects neighbors so everyday items can be shared safely and quickly.',
      bullets: [
        'Browse items nearby or search for something specific',
        'Filter by category, availability window, and price',
        'Save favorites so you can revisit them later'
      ],
      icon: Compass
    },
    {
      title: 'List Something You Own',
      description: 'Turn underused items into helpful resources for your community in just a few minutes.',
      bullets: [
        'Add clear photos and write a friendly description',
        'Set your availability and choose a fair price or lending terms',
        'Publish listings instantly or save them as drafts to revisit later'
      ],
      icon: Package
    },
    {
      title: 'Borrow with Confidence',
      description: 'Make requests, chat with owners, and keep track of upcoming pickups in one dashboard.',
      bullets: [
        'Send a booking request with optional notes for the owner',
        'Coordinate through secure in-app messages',
        'Monitor approvals and returns on your Dashboard timeline'
      ],
      icon: Handshake
    }
  ];

  readonly safetySteps: GuideStep[] = [
    {
      title: 'Verify Your Profile',
      detail: 'Complete email, phone, and address verification for the trusted badge that appears on your profile.',
      icon: Shield
    },
    {
      title: 'Schedule the Exchange',
      detail: 'Use in-app messaging to confirm when and where you will meet. Always pick well-lit public locations.',
      icon: Clock
    },
    {
      title: 'Confirm the Condition',
      detail: 'Capture a quick photo before handoff, note any wear, and keep an in-app record for reference.',
      icon: CheckCircle
    }
  ];

  readonly helpCards: Array<{
    title: string;
    description: string;
    icon: LucideIconData;
    link: string;
    cta: string;
  }> = [
    {
      title: 'Need extra assistance?',
      description: 'Reach support directly from Settings > Help & Support or open a ticket using the button below.',
      icon: HelpCircle,
      link: '/support',
      cta: 'Contact Support'
    },
    {
      title: 'Join the community tips feed',
      description: 'Share lending stories, get advice from experienced neighbors, and learn best practices.',
      icon: MessageCircle,
      link: '/dashboard',
      cta: 'Open Dashboard'
    }
  ];
}
