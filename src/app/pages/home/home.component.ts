import { RouterLink } from '@angular/router';
import { FooterComponent } from '@shared/footer/footer.component';
import { HomeCardComponent } from '@shared/home-card/home-card.component';
import { UserSessionService } from '@auth/services/user-session.service';
import { Component, HostListener, inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HomeCardComponent, FooterComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private userSessionService = inject(UserSessionService);

  isScrolled: boolean = false;
  scrollThreshold: number = 550;

  ngOnInit(){
    this.userSessionService.clearUserId();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    this.isScrolled = scrollPosition > this.scrollThreshold;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


}
