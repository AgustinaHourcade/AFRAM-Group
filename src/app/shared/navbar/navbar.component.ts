import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { UserSessionService } from '@auth/services/user-session.service';
import { UserService } from '@users/services/user.service';
import { NotificationsService } from '@notifications/service/notifications.service';
import { Notification } from '@notifications/interface/notification';


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
  private notificationsService = inject(NotificationsService);

  isResponsiveMenuVisible: boolean = false;
  activeMenu: string | null = null;
  id : number = 0;
  type !: string;
  notifications: Array<Notification> = [];
  unreadNotifications: Array<Notification> = [];
  isDropdownOpen: boolean = false;

 // Toggle para el menú responsive
  toggleMenu(menu?: string): void {
  if (menu) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  } else {
    this.isResponsiveMenuVisible = !this.isResponsiveMenuVisible;
    this.activeMenu = null;
  }
}

  logout(): void {    this.userSessionService.logOut();this.userSessionService.clearUserId();
    localStorage.clear();
    this.router.navigate(['/home']);
  }

  getUserById(){

    this.userService.getUser(this.userSessionService.getUserId()).subscribe({
      next: (user) => {
        this.type = user.user_type as string;
        this.id = Number (user.id)
        this.getNotification(this.id);
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

  getNotification(id: number) {
    this.notificationsService.getNotificationsById(id).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.unreadNotifications = this.notifications.filter(
          (notification) => notification.is_read === 'no'
        );
      },
      error: (e: Error) => {
        console.log(e.message);
      },
    });
  }

  markAsRead(id:number, user_id: number){
    this.notificationsService.markAsRead(id).subscribe({
      next: (flag)=>{
        if(flag){
          this.getNotification(user_id);
        }
      },
      error: (e: Error) =>{
        console.log(e.message);
      }
    })
  }

  markAllAsRead(user_id: number){
    this.notificationsService.markAllAsRead(user_id).subscribe({
      next: (flag)=>{
        if(flag){
          this.getNotification(user_id);
        }
      },
      error: (e: Error) =>{
        console.log(e.message);
      }
    })
  }

  deleteNotification(id:number, user_id: number){
    this.notificationsService.deleteNotification(id).subscribe({
      next:()=>{
        this.getNotification(user_id);
      },error:(err:Error)=>{
        console.log(err.message);
      }
    })
  }

  deleteAllNotifications(user_id: number){
    this.notificationsService.deleteAllNotifications(user_id).subscribe({
      next:()=>{
        this.getNotification(user_id);
      },error:(err:Error)=>{
        console.log(err.message);
      }
    })
  }


  toggleNotificationsDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const target = event.target as HTMLElement;

    // Cierra el desplegable si el clic no está dentro del componente
    if (!target.closest('.notification-dropdown') && this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }

  isNavbarOpen = false;

toggleNavbar() {
  this.isNavbarOpen = !this.isNavbarOpen;
}

isSubmenuOpen = {
  fixedTerms: false,
  loans: false,
};

toggleSubmenu(menu: 'fixedTerms' | 'loans', event: Event) {
  event.stopPropagation(); // Evita que el evento cierre el menú inmediatamente
  // Alterna el estado del submenú seleccionado
  this.isSubmenuOpen[menu] = !this.isSubmenuOpen[menu];

  // Cierra los otros submenús
  Object.keys(this.isSubmenuOpen).forEach((key) => {
    if (key !== menu) {
      this.isSubmenuOpen[key as 'fixedTerms' | 'loans'] = false;
    }
  });
}

@HostListener('document:click')
closeAllSubmenus() {
  // Cierra todos los submenús al hacer clic fuera
  this.isSubmenuOpen.fixedTerms = false;
  this.isSubmenuOpen.loans = false;
}

}
