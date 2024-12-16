import Swal from 'sweetalert2';
import { UserService } from '@users/services/user.service';
import { Notification } from '@notifications/interface/notification';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserSessionService } from '@auth/services/user-session.service';
import { NotificationsService } from '@notifications/service/notifications.service';
import { Component, HostListener, inject, OnInit, ElementRef, Renderer2 } from '@angular/core';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit{

  private router = inject(Router);
  private userService = inject(UserService);
  private userSessionService = inject(UserSessionService);
  private notificationsService = inject(NotificationsService);

  id: number = 0;
  type !: string;
  activeMenu: string | null = null;
  isNavbarOpen = false;
  notifications: Notification[] = [];
  isDropdownOpen = false;
  unreadNotifications: Notification[] = [];
  selectedNotifications: number[] = [];
  isResponsiveMenuVisible = false;

  isSubmenuOpen = {
    fixedTerms: false,
    loans: false,
  };
  
  ngOnInit(): void {
    this.getUserById();
  }

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    this.renderer.listen('document', 'click', (event: Event) => {
      const targetElement = event.target as HTMLElement;
      if (!this.elementRef.nativeElement.contains(targetElement)) {
        this.isDropdownOpen = false;
      }
    });
  }

  // Toggle para el menú responsive
  toggleMenu(menu?: string): void {
    if (menu) {
      this.activeMenu = this.activeMenu === menu ? null : menu;
    } else {
      this.isResponsiveMenuVisible = !this.isResponsiveMenuVisible;
      this.activeMenu = null;
    }
  }

  logout(): void {
    this.userSessionService.logOut();
    this.userSessionService.clearUserId();
    localStorage.clear();

    Swal.fire({
      title: "¿Estás seguro de que desea cerrar sesión?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#00b4d8",
      cancelButtonColor: "#e63946",
      confirmButtonText: "Cerrar sesión",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/home']);
      }
    });
  }

  getUserById(){
    this.userService.getUser(this.userSessionService.getUserId()).subscribe({
      next: (user) => {
        this.type = user.user_type as string;
        this.id = Number (user.id)
        this.getNotification(this.id);
      },
      error: (error: Error) => console.error('Error: ', error)
    });
  }

  // Cambiar de User a Admin y viceversa
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
      error: (e: Error) => console.log(e.message)
    });
  }

  // Agrega esta propiedad para determinar si todas las notificaciones están seleccionadas
get isAllSelected(): boolean {
  return (
    this.notifications.length > 0 &&
    this.selectedNotifications.length === this.notifications.length
  );
}

// Método para alternar la selección de todas las notificaciones
toggleSelectAll(): void {
  if (this.isAllSelected) {
    // Desmarcar todas
    this.selectedNotifications = [];
  } else {
    // Seleccionar todas
    this.selectedNotifications = this.notifications.map(
      (notification) => notification.id
    );
  }
}


  // Mark a notification as read
  markAsRead(id:number, user_id: number){
    this.notificationsService.markAsRead(id).subscribe({
      next: (flag)=>{
        if(flag){
          this.getNotification(user_id);
        }
      },
      error: (e: Error) => console.log(e.message)
    })
  }

  // Mark all notifications as read
  markAllAsRead(user_id: number){
    this.notificationsService.markAllAsRead(user_id).subscribe({
      next: (flag)=>{
        if(flag){
          this.getNotification(user_id);
        }
      },
      error: (e: Error) => console.log(e.message)
    })
  }

  // Delete a notification
  deleteNotification(id:number, user_id: number){
    this.notificationsService.deleteNotification(id).subscribe({
      next:() => this.getNotification(user_id),
      error:(err:Error) => console.log(err.message)
    })
  }

  // Delete all notifications
  deleteAllNotifications(user_id: number){
    this.notificationsService.deleteAllNotifications(user_id).subscribe({
      next:() => this.getNotification(user_id),
      error:(err:Error) => console.log(err.message)
    })
  }

  // Open a notification in a new tab
  toggleNotificationsDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const target = event.target as HTMLElement;
    console.log('Document click detected');

    // Busca tanto en la campana como en el contenedor de notificaciones
    const isInsideNotification =
      target.closest('.notification-icon') || target.closest('.notification-dropdown');

    if (!isInsideNotification && this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }

  toggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen;
  }

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

  toggleNotificationSelection(notificationId: number) {
    const index = this.selectedNotifications.indexOf(notificationId);
    if (index === -1) {
      this.selectedNotifications.push(notificationId);
    } else {
      this.selectedNotifications.splice(index, 1);
    }
  }


  deleteSelectedNotifications() {
    this.selectedNotifications.forEach((notification) =>{
      this.deleteNotification(notification, this.id)
    })

  }

  // Function to mark selected notifications as read
  markSelectedAsRead() {
    this.notificationsService.markSelectedAsRead(this.selectedNotifications).subscribe(() => {
      this.notifications.forEach((notification) => {
        if (this.selectedNotifications.includes(notification.id)) {
          notification.is_read = 'yes';
        }
      });
      this.selectedNotifications = [];
      this.getNotification(this.id);
    });
  }


}
