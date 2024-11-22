import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../users/services/user.service';
import { User } from '../../../users/interface/user.interface';

@Component({
  selector: 'app-detail-admin',
  standalone: true,
  imports: [],
  templateUrl: './detail-admin.component.html',
  styleUrl: './detail-admin.component.css'
})
export class DetailAdminComponent implements OnInit{

  private activatedRoute = inject(ActivatedRoute);
  private userService = inject(UserService);
  admin ?: User;

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id');
        this.userService.getUser(Number(id)).subscribe({
          next: (user) => {
            this.admin = user;
          },
          error: (e :Error) =>{
            console.error(e.message);
          }
        })
      }
    })
  }
}
