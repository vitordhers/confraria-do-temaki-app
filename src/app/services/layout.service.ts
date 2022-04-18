import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  isMobile: boolean;

  constructor(public platform: Platform) {
    this.isMobile = this.platform.is('mobile');
  }
}
