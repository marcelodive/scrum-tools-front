import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor() { }

  generateRandomString() {
    return Math.random().toString(36).substr(2, 5);
  }
}
