import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeCardComponent } from '../../shared/home-card/home-card.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavbarHomeComponent } from "../../shared/navbar-home/navbar-home.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HomeCardComponent, FooterComponent, NavbarHomeComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  isScrolled = false;
  private scrollThreshold = 100;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    this.isScrolled = scrollPosition > this.scrollThreshold;
  }
}
