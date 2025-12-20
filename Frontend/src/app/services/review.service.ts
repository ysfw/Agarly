import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/reviews';

  addUserReview(targetUserId: number, rating: number): Observable<any> {
    const params = new HttpParams()
      .set('rating', rating.toString());
    
    return this.http.post(`${this.baseUrl}/user/${targetUserId}`, null, { params });
  }
}
