import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { Thread } from '../../../support/interface/thread';
import { MessageService } from '../../../support/service/messages.service';
import { SupportService } from '../../../support/service/support.service';
import { NavbarAdminComponent } from "../../shared/navbar-admin/navbar-admin.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-support-threads',
  standalone: true,
  imports: [NavbarAdminComponent, CommonModule, RouterLink],
  templateUrl: './support-threads.component.html',
  styleUrl: './support-threads.component.css'
})
export class SupportThreadsComponent implements OnInit{

  private supportService = inject(SupportService);
  private messageService = inject(MessageService);
  private sessionService = inject(UserSessionService);
  private fb = inject(FormBuilder);
  private routes = inject(Router);


  threads : Array<Thread> = [];
  activesThreads: Array<Thread> = [];
  finishedThreads: Array<Thread> = [];
  new = false;

  ngOnInit(): void {
      this.supportService.getAllThreads().subscribe({
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




  }

