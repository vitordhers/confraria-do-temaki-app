import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-add-modal',
  templateUrl: './add-modal.component.html',
  styleUrls: ['./add-modal.component.sass'],
})
export class AddModalComponent {
  @Input() valid: boolean;
  constructor(private popoverController: PopoverController) {}

  add() {
    this.popoverController.dismiss(null, 'add');
  }

  cancel() {
    this.popoverController.dismiss(null, 'cancel');
  }
}
