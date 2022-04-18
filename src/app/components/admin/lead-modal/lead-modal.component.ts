import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IFranchisingLead } from 'src/app/pages/admin/messages/interfaces/franchising-lead.interface';
import { MessagesService } from 'src/app/services/messages.service';
import { fireToast } from 'src/app/shared/functions/fire-toast.function';

@Component({
  selector: 'app-lead-modal',
  templateUrl: './lead-modal.component.html',
  styleUrls: ['./lead-modal.component.scss'],
})
export class LeadModalComponent implements OnInit {
  @Input() lead: IFranchisingLead;

  constructor(
    private modalController: ModalController,
    private messagesService: MessagesService
  ) {}

  ngOnInit(): void {
    if (this.lead.readAt) {
      return;
    }
    this.messagesService.updateReadLead(this.lead.id).subscribe((res) => {
      if (res.success) {
        return fireToast('Successo', 'Mensagem marcada como lida.', 'success');
      }
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
