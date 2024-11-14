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

  toggleAccountMenu() {
    this.isAccountOpen = !this.isAccountOpen;
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }
  
  closeAccountMenu() {
    this.isAccountOpen = false;
  }

  closeProfileMenu() {
    this.isProfileMenuOpen = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen; 
  }
  
  logout(): void{
    this.userSessionService.clearUserId();
    this.router.navigate(['/home']);
  }
  
}
