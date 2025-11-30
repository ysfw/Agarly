import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Search, Plus, Wrench, Utensils, Sparkles, Monitor, MessageSquare } from 'lucide-angular';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ItemCardComponent } from '../../components/item-card/item-card.component';
import { ApiService } from '../../services/api.service';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, NavbarComponent, ItemCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);
  
  searchQuery = '';
  selectedCategory: string | null = null;
  items: Item[] = [];

  readonly SearchIcon = Search;
  readonly PlusIcon = Plus;
  readonly MessageSquareIcon = MessageSquare;

  categories = [
    { name: 'Tools', icon: Wrench },
    { name: 'Kitchen', icon: Utensils },
    { name: 'Cleaning', icon: Sparkles },
    { name: 'Electronics', icon: Monitor }
  ];

  ngOnInit() {
    this.apiService.getItems().subscribe(items => {
      this.items = items;
    });
  }

  get filteredItems() {
    return this.selectedCategory
      ? this.items.filter(item => item.category === this.selectedCategory)
      : this.items;
  }

  handleSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search']);
    }
  }

  toggleCategory(category: string) {
    this.selectedCategory = this.selectedCategory === category ? null : category;
  }

  navigateToRequestItem() {
    this.router.navigate(['/request-item']);
  }

  navigateToAddItem() {
    this.router.navigate(['/add-item']);
  }
}
