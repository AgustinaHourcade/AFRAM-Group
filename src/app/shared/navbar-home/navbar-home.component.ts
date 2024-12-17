import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { Component, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-navbar-home',
  standalone: true,
  imports: [RouterModule, RouterLink, CommonModule],
  templateUrl: './navbar-home.component.html',
  styleUrl: './navbar-home.component.css'
})
export class NavbarHomeComponent {
  @Input() backgroundColor = 'transparent';

  isScrolled: boolean = false;
  scrollThreshold = 100;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition = document.documentElement.scrollTop || document.documentElement.scrollTop;
    this.isScrolled = scrollPosition > this.scrollThreshold;
  }
}
