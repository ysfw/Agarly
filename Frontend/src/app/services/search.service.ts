import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models/item.model';
import { SearchCriteria} from '../models/search.criteria.model';
import { ItemCategory} from '../models/enums/item.category.enum';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/items';

  search(criteria: SearchCriteria): Observable<Item[]> {
    return this.http.post<Item[]>(`${this.baseUrl}/search`, criteria);
  }

  searchByCategory(category: ItemCategory): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.baseUrl}/category/{category}`);
  }

  getFeed(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.baseUrl}/feed`);
  }

}
