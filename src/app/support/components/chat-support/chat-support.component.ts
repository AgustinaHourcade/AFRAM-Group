import { CommonModule } from '@angular/common';
import { SupportService } from '@support/service/support.service';
import { MessageService } from '@support/service/messages.service';
import { Message, Thread } from '@support/interface/thread';
import { NavbarComponent } from '@shared/navbar/navbar.component';
import { UserSessionService } from '@auth/services/user-session.service';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-chat-support',
  standalone: true,
  imports: [NavbarComponent, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './chat-support.component.html',
  styleUrl: './chat-support.component.css'
})
export class ChatSupportComponent implements OnInit{
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private supportService = inject(SupportService);
  private userSessionService = inject(UserSessionService);

  messages: Message[] = [];
  thread ?: Thread;
  id ?: number;

  formulario = this.fb.nonNullable.group({
    message: ['', Validators.required]
  })

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

  loadThread(){
    this.supportService.getThreadById(Number (this.id)).subscribe({
      next: (thread: Thread) => {
        const userId = this.userSessionService.getUserId();
        if (thread.user_id !== userId) {
          this.router.navigate(['/access-denied']); // Redirige si el usuario no tiene acceso
        } else {
          this.thread = thread;
        }
      },
      error: () => this.router.navigate(['/not-found'])
    })
  }

  loadMessages(){
    this.messageService.getMessages(Number(this.id)).subscribe({
      next: (messages) => {
        this.messages = messages;
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
      },
      error: (e: Error) => console.log(e.message)
    });
  }

  postThread() {
    const message = this.formulario.get('message')?.value;
    this.messageService.postMessage(Number (this.id), 'user', message as string).subscribe({
      next: (data) => {
        if(data){
          this.loadMessages();
        }
      },
      error: (e: Error) => console.log(e.message)
    });
    this.formulario.reset();
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }

  scrollToBottom() {
    const lastElement = document.querySelector('.message:last-child');
    if (lastElement) {
      lastElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }
}
