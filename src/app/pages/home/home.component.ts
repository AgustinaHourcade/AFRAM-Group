import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeCardComponent } from '../../shared/home-card/home-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, HomeCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
}
