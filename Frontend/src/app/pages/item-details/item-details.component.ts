import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { LucideAngularModule, ArrowLeft, MapPin, CheckCircle, Heart, Share2, Star, MessageCircle } from 'lucide-angular';
import { ApiService } from '../../services/api.service';
import { Item } from '../../models/item.model';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [LucideAngularModule, NavbarComponent],
  templateUrl: './item-details.component.html',
  styleUrl: './item-details.component.css'
})
export class ItemDetailsComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private location = inject(Location);

  item: Item | undefined;

  readonly ArrowLeftIcon = ArrowLeft;
  readonly MapPinIcon = MapPin;
  readonly CheckCircleIcon = CheckCircle;
  readonly HeartIcon = Heart;
  readonly Share2Icon = Share2;
  readonly StarIcon = Star;
  readonly MessageCircleIcon = MessageCircle;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.apiService.getItemById(id).subscribe(item => {
        this.item = item;
      });
    }
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToBookItem() {
    if (this.item) {
      this.router.navigate(['/book-item', this.item.id]);
    }
  }

  goBack() {
    this.location.back();
  }

  startChat() {
    this.router.navigate(['/chat']);
  }

  getInitials(name?: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}
