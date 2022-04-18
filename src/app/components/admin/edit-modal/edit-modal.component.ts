import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.sass'],
})
export class EditModalComponent {
  @Input() isEditing: boolean;
  @Input() valid: boolean;
  constructor(private popoverController: PopoverController) {}

  update() {
    this.popoverController.dismiss(null, 'update');
  }

  edit() {
    this.popoverController.dismiss(null, 'edit');
  }

  delete() {
    this.popoverController.dismiss(null, 'delete');
  }

  cancel() {
    this.popoverController.dismiss(null, 'cancel');
  }
}
