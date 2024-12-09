import { Component, OnInit, inject } from '@angular/core';
import { UserSessionService } from '@auth/services/user-session.service';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.css'
})
export class AccessDeniedComponent implements OnInit {
  
  private userSessionService = inject(UserSessionService);

  ngOnInit(): void {
    this.userSessionService.logOut();
    this.userSessionService.clearUserId();
    localStorage.clear();
  }
}
