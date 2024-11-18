import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar-home',
  standalone: true,
  imports: [RouterModule, RouterLink],
  templateUrl: './navbar-home.component.html',
  styleUrl: './navbar-home.component.css'
})
export class NavbarHomeComponent {
  isScrolled = false;
  private scrollThreshold = 100;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition = document.documentElement.scrollTop || document.documentElement.scrollTop;
    this.isScrolled = scrollPosition > this.scrollThreshold;
  }
}
