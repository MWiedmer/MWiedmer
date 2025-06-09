import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Wine } from '../../models/wine.model';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-wine-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wine-list.component.html',
  styles: [`
    .list-group-item {
      margin-bottom: 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .badge {
      font-size: 0.8rem;
      padding: 0.4em 0.8em;
    }
    .input-group {
      width: 150px;
    }
    .input-group .form-control {
      text-align: center;
    }
  `]
})
export class WineListComponent {
  wines: Wine[] = [];
  
  constructor(private databaseService: DatabaseService) {
    this.loadWines();
  }

  loadWines() {
    this.databaseService.getWines().subscribe(wines => {
      this.wines = wines;
    });
  }

  updateQuantity(wine: Wine, change: number) {
    const newQuantity = wine.quantity + change;
    if (newQuantity >= 0) {
      const updatedWine = { ...wine, quantity: newQuantity };
      this.databaseService.updateWine(updatedWine).subscribe({
        next: () => {
          wine.quantity = newQuantity;
        },
        error: (error) => {
          console.error('Error updating wine quantity:', error);
          alert('Error updating wine quantity. Please try again.');
        }
      });
    }
  }
} 