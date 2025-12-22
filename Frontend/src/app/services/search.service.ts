import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models/item.model';
import { SearchCriteria } from '../models/search.criteria.model';
import { ItemCategory } from '../models/enums/item.category.enum';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/items';

  search(criteria: SearchCriteria): Observable<Item[]> {
    const params: any = {};

    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });

    return this.http.get<Item[]>(`${this.baseUrl}/search`, { params });
  }

  searchByCategory(category: ItemCategory): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.baseUrl}/category/${category}`);
  }

  getFeed(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.baseUrl}/feed`);
  }

}
