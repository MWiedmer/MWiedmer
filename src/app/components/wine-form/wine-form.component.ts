import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Wine } from '../../models/wine.model';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-wine-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2>Add New Wine</h2>
      <form (ngSubmit)="onSubmit()" #wineForm="ngForm">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="name" class="form-label">Wine Name</label>
            <input type="text" class="form-control" id="name" name="name" [(ngModel)]="wine.name" required>
          </div>
          <div class="col-md-6 mb-3">
            <label for="producer" class="form-label">Producer</label>
            <input type="text" class="form-control" id="producer" name="producer" [(ngModel)]="wine.producer" required>
          </div>
        </div>

        <div class="row">
          <div class="col-md-4 mb-3">
            <label for="vintage" class="form-label">Vintage</label>
            <input type="number" class="form-control" id="vintage" name="vintage" [(ngModel)]="wine.vintage" required>
          </div>
          <div class="col-md-4 mb-3">
            <label for="type" class="form-label">Type</label>
            <select class="form-select" id="type" name="type" [(ngModel)]="wine.type" required>
              <option value="">Select Type</option>
              <option value="Red">Red</option>
              <option value="White">White</option>
              <option value="Rosé">Rosé</option>
              <option value="Sparkling">Sparkling</option>
              <option value="Dessert">Dessert</option>
            </select>
          </div>
          <div class="col-md-4 mb-3">
            <label for="grape_id" class="form-label">Grape Variety</label>
            <select class="form-select" id="grape_id" name="grape_id" [(ngModel)]="wine.grape_id" required>
              <option value="">Select Grape</option>
              <option *ngFor="let grape of grapes" [value]="grape.id">{{ grape.name }}</option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="col-md-4 mb-3">
            <label for="cost" class="form-label">Cost ($)</label>
            <input type="number" class="form-control" id="cost" name="cost" [(ngModel)]="wine.cost" step="0.01" required>
          </div>
          <div class="col-md-4 mb-3">
            <label for="rating" class="form-label">Rating (0-100)</label>
            <input type="number" class="form-control" id="rating" name="rating" [(ngModel)]="wine.rating" min="0" max="100" required>
          </div>
          <div class="col-md-4 mb-3">
            <label for="quantity" class="form-label">Quantity</label>
            <input type="number" class="form-control" id="quantity" name="quantity" [(ngModel)]="wine.quantity" min="0" required>
          </div>
          <div class="col-md-4 mb-3">
            <label for="labels" class="form-label">Labels (comma-separated)</label>
            <input type="text" class="form-control" id="labels" name="labels" [(ngModel)]="labelsInput" placeholder="e.g., Bordeaux, First Growth">
          </div>
        </div>

        <div class="mb-3">
          <button type="submit" class="btn btn-primary" [disabled]="!wineForm.form.valid">Add Wine</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-label {
      font-weight: 500;
    }
    .form-control:focus, .form-select:focus {
      border-color: #6c757d;
      box-shadow: 0 0 0 0.25rem rgba(108, 117, 125, 0.25);
    }
  `]
})
export class WineFormComponent {
  wine: Wine = {
    name: '',
    producer: '',
    vintage: new Date().getFullYear(),
    type: '',
    cost: 0,
    rating: 0,
    grape_id: 0,
    quantity: 0,
    labels: []
  };
  
  labelsInput: string = '';
  grapes: { id: number; name: string; }[] = [];

  constructor(private databaseService: DatabaseService) {
    this.loadGrapes();
  }

  loadGrapes() {
    this.databaseService.getGrapes().subscribe(grapes => {
      this.grapes = grapes;
    });
  }

  onSubmit() {
    // Convert comma-separated labels to array
    this.wine.labels = this.labelsInput
      .split(',')
      .map(label => label.trim())
      .filter(label => label.length > 0);

    this.databaseService.addWine(this.wine).subscribe({
      next: (response) => {
        // Reset form
        this.wine = {
          name: '',
          producer: '',
          vintage: new Date().getFullYear(),
          type: '',
          cost: 0,
          rating: 0,
          grape_id: 0,
          quantity: 0,
          labels: []
        };
        this.labelsInput = '';
        alert('Wine added successfully!');
      },
      error: (error) => {
        console.error('Error adding wine:', error);
        alert('Error adding wine. Please try again.');
      }
    });
  }
}