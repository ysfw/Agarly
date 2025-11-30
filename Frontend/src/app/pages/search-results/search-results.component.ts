import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, SlidersHorizontal } from 'lucide-angular';
import { ItemCardComponent } from '../../components/item-card/item-card.component'; // Adjust path as needed

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, ItemCardComponent],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.css'
})
export class SearchResultsComponent {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly SlidersHorizontalIcon = SlidersHorizontal;
  
  router = inject(Router);
  
  showFilters = false;
  filters = {
    category: '',
    distance: '5',
    availability: 'all'
  };

  sampleItems = [{
    id: 1,
    name: 'Power Drill',
    category: 'Tools',
    distance: '0.3 mi',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'
  }, {
    id: 2,
    name: 'Stand Mixer',
    category: 'Kitchen',
    distance: '0.5 mi',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=400'
  }, {
    id: 4,
    name: 'Pressure Washer',
    category: 'Cleaning',
    distance: '1.2 mi',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400'
  }, {
    id: 5,
    name: 'Projector',
    category: 'Electronics',
    distance: '0.6 mi',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400'
  }];
}