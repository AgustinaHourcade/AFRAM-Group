import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserSessionService } from '../../auth/services/user-session.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {

  router = inject(Router);
  userSessionService = inject(UserSessionService);

  activeMenu: string | null = null;

  toggleMenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  logout(): void {
    this.userSessionService.logOut();
    this.userSessionService.clearUserId();
    localStorage.clear();
    this.router.navigate(['/home']);
  }
}
