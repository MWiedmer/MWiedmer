import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { WineListComponent } from './components/wine-list/wine-list.component';
import { WineFormComponent } from './components/wine-form/wine-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, WineListComponent, WineFormComponent],
  template: `
    <div class="container mt-4">
      <h1 class="text-center mb-4">VinoDB</h1>
      <app-wine-form></app-wine-form>
      <hr class="my-4">
      <app-wine-list></app-wine-list>
    </div>
  `,
  styles: [`
    h1 {
      color: #6c757d;
      font-weight: 600;
    }
  `]
})
export class AppComponent {
  title = 'vino-db';
} 