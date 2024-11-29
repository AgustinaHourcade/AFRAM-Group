import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserSessionService } from '../../auth/services/user-session.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../users/services/user.service';
import Swal from 'sweetalert2';
import { NotificationsService } from '../../notifications/service/notifications.service';
import { Notification } from '../../notifications/interface/notification';


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

  id : number = 0;
  type !: string;
  activeMenu: string = '';
  notifications: Array<Notification> = [];
  unreadNotifications: Array<Notification> = [];
  isDropdownOpen: boolean = false;


  toggleMenu(menu: string): void {
    this.activeMenu = this.activeMenu === menu ? '' : menu;
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

  deleteNotification(id:number, user_id: number){
    this.notificationsService.deleteNotification(id).subscribe({
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



}
