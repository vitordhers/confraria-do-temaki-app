import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  IonInfiniteScroll,
  LoadingController,
  ModalController,
} from '@ionic/angular';
import { BehaviorSubject, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { LeadModalComponent } from 'src/app/components/admin/lead-modal/lead-modal.component';
import { MessageModalComponent } from 'src/app/components/admin/message-modal/message-modal.component';
import { MessagesService } from 'src/app/services/messages.service';
import { IMessageContact } from './interfaces/contact-message.interface';
import { IFranchisingLead } from './interfaces/franchising-lead.interface';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
})
export class MessagesPage implements OnInit, OnDestroy {
  @ViewChild('leadsScroll', { static: false })
  leadsScroll: IonInfiniteScroll;
  @ViewChild('messagesScroll', { static: false })
  messagesScroll: IonInfiniteScroll;

  currentMessageType: 'leads' | 'messages' = 'leads';

  fetchLeadsAfter$ = new BehaviorSubject<number>(null);
  fetchMessagesAfter$ = new Subject<number>();

  storedLastLeadTimestamp: number;
  storedLastMessageTimestamp: number;

  disableLeadsPagination = false;
  disableMessagesPagination = false;

  messagesFirstLoad = false;

  destroy$ = new Subject<boolean>();

  loader: HTMLIonLoadingElement;

  constructor(
    public messageService: MessagesService,
    private modalController: ModalController,
    public loadingController: LoadingController
  ) {}

  async ngOnInit() {
    this.loader = await this.loadingController.create({
      message: 'Carregando...',
    });

    await this.loader.present();

    this.fetchLeadsAfter$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((after) => this.messageService.getFranchisingLeads(20, after))
      )
      .subscribe((response) => {
        this.loader.dismiss();
        this.leadsScroll.complete();
        if (!response.success || !response.payload) {
          return;
        }

        const results = response.payload;
        const sameLastTimestamp =
          results.length === 20
            ? this.storedLastLeadTimestamp ===
              results[results.length - 1].sentAt
            : true;
        this.storedLastLeadTimestamp =
          sameLastTimestamp || results.length < 20
            ? null
            : results[results.length - 1].sentAt;
        this.disableLeadsPagination = sameLastTimestamp;
      });

    this.fetchMessagesAfter$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((after) => this.messageService.getContactMessages(20, after))
      )
      .subscribe((response) => {
        this.loader.dismiss();
        this.messagesScroll.complete();
        if (!response.success || !response.payload) {
          return;
        }

        const results = response.payload;
        const sameLastTimestamp =
          results.length === 20
            ? this.storedLastMessageTimestamp ===
              results[results.length - 1].sentAt
            : true;
        this.storedLastMessageTimestamp =
          sameLastTimestamp || results.length < 20
            ? null
            : results[results.length - 1].sentAt;
        this.disableMessagesPagination = sameLastTimestamp;
      });
  }

  async displayMessageModal(payload: IFranchisingLead | IMessageContact) {
    const modal = await this.modalController.create(
      this.currentMessageType === 'leads'
        ? {
            component: LeadModalComponent,
            componentProps: { lead: payload },
          }
        : {
            component: MessageModalComponent,
            componentProps: { message: payload },
          }
    );

    return await modal.present();
  }

  async segmentChanged(e: any) {
    this.currentMessageType = e.detail.value;
    if (this.currentMessageType === 'messages' && !this.messagesFirstLoad) {
      this.loader = await this.loadingController.create({
        message: 'Carregando...',
      });

      await this.loader.present();
      this.messagesFirstLoad = true;
      this.fetchMessagesAfter$.next(null);
    }
  }

  loadData(load: 'messages' | 'leads') {
    if (load === 'leads') {
      return this.fetchLeadsAfter$.next(this.storedLastLeadTimestamp);
    }
    this.fetchMessagesAfter$.next(this.storedLastMessageTimestamp);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
