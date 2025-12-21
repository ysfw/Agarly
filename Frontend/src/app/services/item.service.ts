import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models/item.model';

@Injectable({
    providedIn: 'root'
})
export class ItemService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:8080/api/items';

    create(item: Item): Observable<number> {
        return this.http.post<number>(this.baseUrl, item);
    }

    update(id: number, item: Item): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/${id}`, item);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    getAll(): Observable<Item[]> {
        return this.http.get<Item[]>(this.baseUrl);
    }

    getMyLentItems(): Observable<Item[]> {
        return this.http.get<Item[]>(`${this.baseUrl}/lent`);
    }

    getMyBorrowedItems(): Observable<Item[]> {
        return this.http.get<Item[]>(`${this.baseUrl}/borrowed`);
    }

    getById(id: number): Observable<Item> {
        return this.http.get<Item>(`${this.baseUrl}/${id}`);
    }

    getByCategory(category: string): Observable<Item[]> {
        return this.http.get<Item[]>(`${this.baseUrl}/category/${category}`);
    }

    getPendingItems(): Observable<Item[]> {
        return this.http.get<Item[]>(`${this.baseUrl}/pending`);
    }

    getApprovedItems(): Observable<Item[]> {
        return this.http.get<Item[]>(`${this.baseUrl}/approved`);
    }

    uploadImage(file: File): Observable<string> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post('http://localhost:8080/api/images/upload', formData, { responseType: 'text' });
    }

    lend(id: number, borrowerEmail: string, dueDate?: string): Observable<void> {
        const params: any = { borrowerEmail };
        if (dueDate) {
            params.dueDate = dueDate;
        }
        return this.http.post<void>(`${this.baseUrl}/${id}/lend`, null, { params });
    }

    returnItem(id: number): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/${id}/return`, null);
    }

}
