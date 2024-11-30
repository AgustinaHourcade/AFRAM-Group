import { Component, inject, OnInit } from '@angular/core';
import { NavbarAdminComponent } from "../../shared/navbar-admin/navbar-admin.component";
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Message, Thread } from '../../../support/interface/thread';
import { MessageService } from '../../../support/service/messages.service';
import { SupportService } from '../../../support/service/support.service';
import Swal from 'sweetalert2';
import { User } from '../../../users/interface/user.interface';
import { UserService } from '../../../users/services/user.service';
import { AccountService } from '../../../accounts/services/account.service';
import { NotificationsService } from '../../../notifications/service/notifications.service';

@Component({
  selector: 'app-chat-support-admin',
  standalone: true,
  imports: [NavbarAdminComponent, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './chat-support-admin.component.html',
  styleUrl: './chat-support-admin.component.css'
})
export class ChatSupportAdminComponent implements OnInit{

  private activatedRoute = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private notificationService = inject(NotificationsService);
  private messageService = inject(MessageService);
  private supportService = inject(SupportService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private route = inject(Router);

  messages: Array<Message> = [];
  user ?: User;
  thread ?: Thread;
  id ?: number;
  flag = false;

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        this.id = Number (params.get('thread_id'));
        this.loadMessages();
        this.loadThread();
      },
      error: (error: Error) =>{
        console.log(error.message);
      }
    });
  }

  loadUser(id: number){
    this.userService.getUser(id).subscribe({
      next: (user) =>{
        this.user = user;
      },
      error: (error: Error) =>{
        console.log(error.message);
      }
    })
  }

  loadThread(){
    this.supportService.getThreadById(Number (this.id)).subscribe({
      next: (thread: Thread) => {
        this.thread = thread;
        this.loadUser(thread.user_id);
      },
      error: (e: Error) =>{
        console.log(e.message);
      }
    })
  }

  loadMessages(){
    this.messageService.getMessages(Number(this.id)).subscribe({
      next: (messages) => {
        this.messages = messages;
      },
      error: (e: Error) => {
        console.log(e.message);
      },
    });
  }

  formulario = this.fb.nonNullable.group({
    message: ['', Validators.required]
  })

  postThread() {
    const message = this.formulario.get('message')?.value;
    this.messageService.postMessage(Number (this.id), 'support', message as string).subscribe({
      next: (data) => {
            if(data){
              this.loadMessages();
              this.sendNotification();
            }
          },
          error: (e: Error) => {
            console.log(e.message);
          }
        });
        this.formulario.reset();
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
  }

  toggleThread(){
    this.supportService.updateStatus(Number (this.id), 'closed').subscribe({
      next: (data) => {
        if(data){Swal.fire({
          title: `Consulta finalizada`,
          icon: 'success',
        }).then((result) => {
          if (result.isConfirmed) {
            this.route.navigate(['admin-support']);
          }
        })
      }
      },
      error: (e: Error) => {
        console.log(e.message);
      }
    })
  }

  sendNotification() {
    if(this.flag) return;

    const notification = {
      title: 'Recibio una respuesta de soporte.',
      message: `Puede ver el contenido en la seccion "Soporte".`,
      user_id: this.thread?.user_id
    }

    this.postNotification(notification)
    this.flag = true;
  }

  postNotification(notification: any){
    this.notificationService.postNotification(notification).subscribe({
      next: (flag) =>{
        if(flag){
          console.log('Notificacion enviada');
        }
      },
      error: (e: Error)=>{
        console.log(e.message);
      }
    })
  }

  scrollToBottom() {
    const lastElement = document.querySelector('.message:last-child');
    if (lastElement) {
      lastElement.scrollIntoView({ behavior: 'instant', block: 'end' });
    }
  }

}

