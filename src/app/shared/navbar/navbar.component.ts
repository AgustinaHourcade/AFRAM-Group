import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserSessionService } from '../../auth/services/user-session.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../users/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit{

  ngOnInit(): void {
    this.getUserById();
  }

  private router = inject(Router);
  private userSessionService = inject(UserSessionService);
  private userService = inject(UserService);

  // activeMenu: string | null = null;
  type !: string;
  
  activeMenu: string = '';

  toggleMenu(menu: string): void {
    this.activeMenu = this.activeMenu === menu ? '' : menu;
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
      title: "Ingresando como administrador",
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
        this.userSessionService.setUserType('admin');
        this.router.navigate(['/admin-main']);
      }
    });
  }
}
