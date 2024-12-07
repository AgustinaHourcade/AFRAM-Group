import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../users/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar-admin',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar-admin.component.html',
  styleUrl: './navbar-admin.component.css'
})
export class NavbarAdminComponent implements OnInit {

  type !: string;
  activeMenu: string | null = null;
  isResponsiveMenuVisible: boolean = false;

  private router = inject(Router);
  private userService = inject(UserService);
  private userSessionService = inject(UserSessionService);

  ngOnInit(): void {
    this.getUserById();
  }

  logout(): void {
    this.userSessionService.logOut();
    this.userSessionService.clearUserId();
    localStorage.clear();
    this.router.navigate(['/home']);
  }

  getUserById(){
    this.userService.getUser(this.userSessionService.getUserId()).subscribe({
      next: (user) => {
        this.type = user.user_type as string;
      },
      error: (error: Error) => {
        console.error('Error: ', error);
      }
    });
  }

  changeType(){
    let timerInterval: any;
    Swal.fire({
      title: "Ingresando como cliente",
      timer: 1500,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const timer = Swal.getPopup()?.querySelector("b");
        if (timer) {
        timerInterval = setInterval(() => {
          timer.textContent = `${Swal.getTimerLeft()}`;
        }, 100);}
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.timer) {
        this.userSessionService.setUserType('user');
        this.router.navigate(['/main']);
      }
    });
  }

  // Toggle for responsive menu
  toggleMenu(menu?: string): void {
    if (menu) {
      this.activeMenu = this.activeMenu === menu ? null : menu;
    } else {
      this.isResponsiveMenuVisible = !this.isResponsiveMenuVisible;
      this.activeMenu = null;
    }
  }

}

