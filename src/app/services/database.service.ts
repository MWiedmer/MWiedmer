import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Wine } from '../models/wine.model';

export interface Grape {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private apiUrl = 'http://localhost:3000/api';
  private winesSubject = new BehaviorSubject<Wine[]>([]);
  wines$ = this.winesSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('DatabaseService constructor');
  }

  private loadWines() {
    this.http.get<Wine[]>(`${this.apiUrl}/wines`).subscribe(wines => {
      this.winesSubject.next(wines);
    });
  }

  getGrapes(): Observable<Grape[]> {
    console.log('Getting grapes...');
    return this.http.get<Grape[]>(`${this.apiUrl}/grapes`);
  }

  addGrape(name: string): Observable<Grape> {
    console.log('Adding grape:', name);
    return this.http.post<Grape>(`${this.apiUrl}/grapes`, { name });
  }

  getWines(): Observable<Wine[]> {
    console.log('Getting wines...');
    return this.http.get<Wine[]>(`${this.apiUrl}/wines`);
  }

  addWine(wine: Wine): Observable<Wine> {
    console.log('Adding wine:', wine);
    return this.http.post<Wine>(`${this.apiUrl}/wines`, wine);
  }

  updateWine(wine: Wine): Observable<Wine> {
    console.log('Updating wine:', wine);
    return this.http.put<Wine>(`${this.apiUrl}/wines/${wine.id}`, wine);
  }

  deleteWine(id: number): Observable<void> {
    console.log('Deleting wine:', id);
    return this.http.delete<void>(`${this.apiUrl}/wines/${id}`);
  }
} 