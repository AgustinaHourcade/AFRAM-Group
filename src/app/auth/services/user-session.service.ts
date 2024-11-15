import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserSessionService {
  private userIdKey: number = 0;
  constructor() {}

  setUserId(id: number): void {
    this.userIdKey = id;
  }

  clearUserId(): void {
    this.userIdKey = 0;
  }

  getUserId(): number {
    return this.userIdKey;
  }
}
