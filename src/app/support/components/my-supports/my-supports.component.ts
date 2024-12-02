import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
// import { NavbarComponent } from "../../../shared/navbar/navbar.component";
// import { SupportService } from '../../service/support.service';
// import { MessageService } from '../../service/messages.service';
// import { Thread } from '../../interface/thread';
// import { UserSessionService } from '../../../auth/services/user-session.service';
import { SupportService } from '@support/service/support.service';
import { MessageService } from '@support/service/messages.service';
import { Thread } from '@support/interface/thread';
import { UserSessionService } from '@auth/services/user-session.service';
import { NavbarComponent } from '@shared/navbar/navbar.component';

@Component({
  selector: 'app-my-supports',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './my-supports.component.html',
  styleUrl: './my-supports.component.css'
})
export class MySupportsComponent implements OnInit{

  private supportService = inject(SupportService);
  private messageService = inject(MessageService);
  private sessionService = inject(UserSessionService);
  private fb = inject(FormBuilder);
  private routes = inject(Router);
  id ?: number;

  threads : Array<Thread> = [];
  activesThreads: Array<Thread> = [];
  finishedThreads: Array<Thread> = [];
  new = false;

  ngOnInit(): void {
      this.id = this.sessionService.getUserId();

      this.supportService.getThreadsByUserId(this.id).subscribe({
        next: (threads) =>{
          this.threads = threads;
          this.loadThreads();
        },
        error: (e: Error) =>{
          console.log(e.message);
        }
      })
  }

  loadThreads(){
    this.threads.forEach(thread => {
      if (thread.support_status === 'open') {
        this.activesThreads.push(thread);
      } else if (thread.support_status === 'closed') {
        this.finishedThreads.push(thread);
      }
    });
  }

  formulario = this.fb.nonNullable.group({
    support_subject: ['',Validators.required],
    message: ['', Validators.required]
  })

  postThread() {
    const support_subject = this.formulario.get('support_subject')?.value;
    const message = this.formulario.get('message')?.value;
 
    this.supportService.createThread(Number(this.id), support_subject as string).subscribe({
      next: (threadId) => {
        this.messageService.postMessage(threadId, 'user', message as string).subscribe({
          next: (data) => {
            if(data){
              Swal.fire({
                title: 'Mensaje enviado con éxito!',
                text: 'En breve un agente de soporte le brindara una respuesta.',
                icon: 'success',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#00b4d8'
              }).then((result) => {
                if (result.isConfirmed) {
                  window.location.reload();
                }
              });
            }
          },
          error: (e: Error) => {
            console.log(e.message);
          }
        });
      },
      error: (e: Error) => {
        console.log(e.message);
      }
    });
  }


  }
