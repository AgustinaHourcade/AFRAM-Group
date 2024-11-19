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
  isMenuOpen = false;
  isAccountOpen = false;
  isFixedTermsOpen = false;
  isProfileMenuOpen = false;
  isTransfersMenuOpen = false;
  isCardsMenuOpen = false;
  router = inject(Router);
  userSessionService = inject(UserSessionService);

  activeMenu: string | null = null;

  toggleMenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  openAccountMenu() {
    this.isAccountOpen = true;
  }
  closeAccountMenu() {
    this.isAccountOpen = false;
  }

  openProfileMenu() {
    this.isProfileMenuOpen = true;
  }
  closeProfileMenu() {
    this.isProfileMenuOpen = false;
  }

  openFixedTermsMenu() {
    this.isFixedTermsOpen = true;
  }
  closeFixedTermsMenu() {
    this.isFixedTermsOpen = false;
  }

  openTransfersMenu(){
    this.isTransfersMenuOpen = true;
  }

  closeTrasnfersMenu(){
    this.isTransfersMenuOpen = false;
  }

  openCardsMenu(){
    this.isCardsMenuOpen = true;
  }

  closeCardsMenu(){
    this.isCardsMenuOpen = false;
  }

  logout(): void {
    this.userSessionService.logOut();
    this.userSessionService.clearUserId();
    localStorage.clear();
    this.router.navigate(['/home']);
  }
}
