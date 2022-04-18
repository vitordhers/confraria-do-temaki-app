import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IMessageContact } from 'src/app/pages/admin/messages/interfaces/contact-message.interface';
import { MessagesService } from 'src/app/services/messages.service';
import { fireToast } from 'src/app/shared/functions/fire-toast.function';

@Component({
  selector: 'app-message-modal',
  templateUrl: './message-modal.component.html',
  styleUrls: ['./message-modal.component.scss'],
})
export class MessageModalComponent implements OnInit {
  @Input() message: IMessageContact;

  constructor(
    private modalController: ModalController,
    private messagesService: MessagesService
  ) {}

  ngOnInit(): void {
    if (this.message.readAt) {
      return;
    }
    this.messagesService.updateReadMessage(this.message.id).subscribe((res) => {
      if (res.success) {
        return fireToast('Successo', 'Mensagem marcada como lida.', 'success');
      }
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
