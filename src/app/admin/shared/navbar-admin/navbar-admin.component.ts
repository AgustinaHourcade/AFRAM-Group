import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar-admin',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar-admin.component.html',
  styleUrl: './navbar-admin.component.css'
})
export class NavbarAdminComponent {
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
