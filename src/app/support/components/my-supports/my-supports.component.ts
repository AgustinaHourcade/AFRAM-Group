import Swal from 'sweetalert2';
import { Thread } from '@support/interface/thread';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageService } from '@support/service/messages.service';
import { SupportService } from '@support/service/support.service';
import { NavbarComponent } from '@shared/navbar/navbar.component';
import { UserSessionService } from '@auth/services/user-session.service';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-supports',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './my-supports.component.html',
  styleUrl: './my-supports.component.css'
})
export class MySupportsComponent implements OnInit{

  private fb = inject(FormBuilder);
  private supportService = inject(SupportService);
  private messageService = inject(MessageService);
  private sessionService = inject(UserSessionService);


  id: number = this.sessionService.getUserId();
  new: boolean = false;
  threads: Thread[] = [];
  pageSize: number = 4 ;
  activesThreads: Thread[] = [];
  finishedThreads: Thread[] = [];
  selectedAccountId!: number;
  currentPageActive: number = 1;
  currentCharacters: number = 0;
  currentPageFinished: number = 1;
  
  formulario = this.fb.nonNullable.group({
    support_subject: ['',Validators.required],
    message: ['',[Validators.required, Validators.maxLength(140)]]
  })
  
  ngOnInit(): void {
    this.loadThreads();
    this.trackCharacterCount();
  }

  trackCharacterCount(): void {
    this.formulario.get('message')?.valueChanges.subscribe((value: string) => {
      this.currentCharacters = value ? value.length : 0;
    });
  }

  get totalPagesActives(): number {
    return Math.ceil(this.activesThreads.length / this.pageSize);
  }

  get paginatedActivesThreads() {
    const startIndex = (this.currentPageActive - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.activesThreads.slice(startIndex, endIndex);
  }

  changePageActive(page: number): void {
    if (page >= 1 && page <= this.totalPagesActives) {
      this.currentPageActive = page;
    }
  }

  get totalPagesFinished(): number {
    return Math.ceil(this.finishedThreads.length / this.pageSize);
  }

  get paginatedThreadsFinished() {
    const startIndex = (this.currentPageFinished - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.finishedThreads.slice(startIndex, endIndex);
  }

  changePageFinished(page: number): void {
    if (page >= 1 && page <= this.totalPagesFinished) {
      this.currentPageFinished = page;
    }
  }

  loadThreads(){
    this.activesThreads = [];
    this.finishedThreads = [];
    this.supportService.getThreadsByUserId(this.id).subscribe({
      next: (threads) =>{
        this.threads = threads;
        this.threads.forEach(thread => {
          if (thread.support_status === 'open') {
            this.activesThreads.push(thread);
          } else if (thread.support_status === 'closed') {
            this.finishedThreads.push(thread);
          }
        });
      },
      error: (e: Error) => console.log(e.message)
    })
  }

  // Function to post a new thread
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
                  this.loadThreads();
                  this.new = false;
                }
              });
            }
          },
          error: (e: Error) => console.log(e.message)
        });
      },
      error: (e: Error) => console.log(e.message)
    });
  }

  // Function to delete a thread
  deleteThread(event: MouseEvent, id: number) {
    event.stopPropagation();  // Detener la propagación del evento
    this.supportService.deleteThread(id).subscribe({
      next: () => this.loadThreads(),
      error: (e: Error) => console.log(e.message)
    });
  }

  // Funtion to delete all threads
  deleteAllThreads(){
    this.supportService.deleteAllThreads(Number(this.id)).subscribe({
      next: () => this.loadThreads(),
      error: (e: Error) => console.log(e.message)
    })
  }
}
