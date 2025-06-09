import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { DatabaseService } from './app/services/database.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    DatabaseService
  ]
}).catch(err => console.error(err));
