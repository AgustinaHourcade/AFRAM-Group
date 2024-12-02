import { Component, HostListener, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeCardComponent } from '@shared/home-card/home-card.component';
import { FooterComponent } from '@shared/footer/footer.component';
import { UserSessionService } from '@auth/services/user-session.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HomeCardComponent, FooterComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  isScrolled = false;
  private scrollThreshold = 100;
  private userSessionService = inject(UserSessionService);

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    this.isScrolled = scrollPosition > this.scrollThreshold;
  }

  ngOnInit(){
    this.userSessionService.clearUserId();
  }
}
