import Swal from 'sweetalert2';
import { User } from '@users/interface/user.interface';
import { UserService } from '@users/services/user.service';
import { CommonModule } from '@angular/common';
import { SupportService } from '@support/service/support.service';
import { MessageService } from '@support/service/messages.service';
import { Message, Thread } from '@support/interface/thread';
import { NotificationsService } from '@notifications/service/notifications.service';
import { NavbarAdminComponent } from "@admin/shared/navbar-admin/navbar-admin.component";
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-chat-support-admin',
  standalone: true,
  imports: [NavbarAdminComponent, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './chat-support-admin.component.html',
  styleUrl: './chat-support-admin.component.css'
})
export class ChatSupportAdminComponent implements OnInit{
  // Dependency injection
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userService = inject(UserService);
  private activatedRoute = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private supportService = inject(SupportService);
  private notificationService = inject(NotificationsService);

  // Variables
  id?: number; // Stores the thread ID from the route parameters
  flag: boolean = false; // Prevents multiple notifications for a single thread
  user?: User;
  thread?: Thread;
  messages: Message[] = [];

  // Form control for message input
  form = this.fb.nonNullable.group({
    message: ['', Validators.required]
  })

  // Functions
  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        this.id = Number (params.get('thread_id'));
        this.loadMessages();
        this.loadThread();
      },
      error: (error: Error) => console.log(error.message)
    });

  }

  // Fetches user data based on their ID
  loadUser(id: number){
    this.userService.getUser(id).subscribe({
      next: (user) => this.user = user,
      error: (error: Error) => console.log(error.message)
    })
  }

  // Fetches thread details and associated user information
  loadThread(){
    this.supportService.getThreadById(Number (this.id)).subscribe({
      next: (thread: Thread) => {
        this.thread = thread;
        this.loadUser(thread.user_id);
      },
      error: () => this.router.navigate(['/not-found'])
    })
  }

  // Loads all messages associated with the thread
  loadMessages(){
    this.messageService.getMessages(Number(this.id)).subscribe({
      next: (messages) => {
        this.messages = messages;

        setTimeout(() => {
          this.scrollToBottom(); // Ensures the latest message is visible
        }, 100);
      },
      error: (e: Error) => console.log(e.message)
    });
  }

  // Sends a message in the current thread
  postThread() {
    const message = this.form.get('message')?.value;
    this.messageService.postMessage(Number (this.id), 'support', message as string).subscribe({
      next: (data) => {
        if(data){
          this.loadMessages();
          this.sendNotification();
        }
      },
      error: (e: Error) => console.log(e.message)
    });
    this.form.reset();
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }

  // Toggles the thread status to closed
  toggleThread(){
    this.supportService.updateStatus(Number (this.id), 'closed').subscribe({
      next: (data) => {
        if(data){
          Swal.fire({
          title: `Consulta finalizada`,
          icon: 'success',
          confirmButtonColor: '#00b4d8'
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['admin-support']); // Redirects after confirmation
          }})
        }
      },
      error: (e: Error) => console.log(e.message)
    })
  }

  // Sends a notification to the user
  sendNotification() {
    if(this.flag) return; // Ensures notifications are not sent multiple times

    const notification = {
      title: 'Recibió una respuesta de soporte.',
      message: `Puede ver el contenido en la seccion "Soporte".`,
      user_id: this.thread?.user_id
    }

    this.postNotification(notification)
    this.flag = true; // Prevents further notifications
  }

  // Posts a notification using the notification service
  postNotification(notification: any){
    this.notificationService.postNotification(notification).subscribe({
      error: (e: Error)=> console.log(e.message)
    })
  }

  // Scrolls to the bottom of the message list
  scrollToBottom() {
    const lastElement = document.querySelector('.message:last-child');
    if (lastElement) {
      lastElement.scrollIntoView({ behavior: 'instant', block: 'end' }); // Ensures smooth scrolling
    }
  }
}

