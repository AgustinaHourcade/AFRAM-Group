import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserSessionService } from '../../auth/services/user-session.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isMenuOpen = false;
  router = inject(Router);
  userSessionService = inject(UserSessionService);


  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen; 
  }
  
  logout(): void{
    this.userSessionService.clearUserId();
    this.router.navigate(['/home']);
  }
  
}
