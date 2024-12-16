import { Thread } from '@support/interface/thread';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupportService } from '@support/service/support.service';
import { NavbarAdminComponent } from "@admin/shared/navbar-admin/navbar-admin.component";
import { Component, inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-support-threads',
  standalone: true,
  imports: [NavbarAdminComponent, CommonModule, RouterLink],
  templateUrl: './support-threads.component.html',
  styleUrl: './support-threads.component.css'
})
export class SupportThreadsComponent implements OnInit{

  private supportService = inject(SupportService);

  new: boolean = false;
  threads: Thread[] = [];
  pageSize: number = 4 ;
  activesThreads: Thread[] = [];
  finishedThreads: Thread[] = [];
  currentPageActive: number = 1;
  currentPageFinished: number = 1;

  ngOnInit(): void {
    this.supportService.getAllThreads().subscribe({
      next: (threads) =>{
        this.threads = threads;
        this.loadThreads();
      },
      error: (e: Error) => console.log(e.message)
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

}

