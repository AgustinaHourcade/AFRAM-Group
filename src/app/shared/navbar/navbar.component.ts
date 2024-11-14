import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserSessionService } from '../../auth/services/user-session.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isMenuOpen = false;
  isAccountOpen = false;
  router = inject(Router);
  userSessionService = inject(UserSessionService);

  isProfileMenuOpen = false;

  // Métodos para abrir los menús cuando el mouse entra
  openAccountMenu() {
    this.isAccountOpen = true;
  }

  openProfileMenu() {
    this.isProfileMenuOpen = true;
  }

  // Métodos para cerrar los menús cuando el mouse sale
  closeAccountMenu() {
    this.isAccountOpen = false;
  }

  closeProfileMenu() {
    this.isProfileMenuOpen = false;
  }

  logout(): void {
    this.userSessionService.clearUserId();
    this.router.navigate(['/home']);
  }

}
