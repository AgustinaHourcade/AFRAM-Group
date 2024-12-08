import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from '@support/service/messages.service';
import { Message, Thread } from '@support/interface/thread';
import { SupportService } from '@support/service/support.service';
import { NavbarComponent } from '@shared/navbar/navbar.component';

@Component({
  selector: 'app-chat-support',
  standalone: true,
  imports: [NavbarComponent, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './chat-support.component.html',
  styleUrl: './chat-support.component.css'
})
export class ChatSupportComponent implements OnInit{

  private activatedRoute = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private supportService = inject(SupportService);
  private fb = inject(FormBuilder);

  messages: Array<Message> = [];
  thread ?: Thread;
  id ?: number;

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

  loadThread(){
    this.supportService.getThreadById(Number (this.id)).subscribe({
      next: (thread: Thread) => {
        this.thread = thread;
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
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
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
    this.messageService.postMessage(Number (this.id), 'user', message as string).subscribe({
      next: (data) => {
            if(data){
              this.loadMessages();
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

  scrollToBottom() {
    const lastElement = document.querySelector('.message:last-child');
    if (lastElement) {
      lastElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }

}
