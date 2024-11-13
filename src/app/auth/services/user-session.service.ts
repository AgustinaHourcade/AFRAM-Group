import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class UserSessionService {
  private userIdKey: number = 0;
  constructor() { }

  setUserId(id: number): void {
    this.userIdKey =  id;
    console.log('el id seteado es ' + this.userIdKey);
  }

  clearUserId(): void {
    this.userIdKey =  0; 
  }

  getUserId(): number{
    console.log('GET USER ID' + this.userIdKey);
    return this.userIdKey;
  }
  
}
