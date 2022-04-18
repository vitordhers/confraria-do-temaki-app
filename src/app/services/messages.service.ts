import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IMessageContact } from '../pages/admin/messages/interfaces/contact-message.interface';
import { IFranchisingLead } from '../pages/admin/messages/interfaces/franchising-lead.interface';
import { InvestmentRange } from '../shared/enums/investment-range.enum';
import { IResponse } from '../shared/interfaces/response.interface';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  endpoint = `${environment.apiUrl}/messages`;
  loadedFranchisingLeads$ = new BehaviorSubject<IFranchisingLead[]>([]);
  loadedMessageContacts$ = new BehaviorSubject<IMessageContact[]>([]);
  newLeads = 0;
  newMessages = 0;

  constructor(private http: HttpClient) {}

  submitFranchisingForm(value: {
    name: string;
    email: string;
    celphone: string;
    telephone: string;
    state: string;
    city: string;
    reference: string;
    investment: InvestmentRange;
    message: string;
    recaptcha: string;
  }) {
    return this.http.post<IResponse>(`${this.endpoint}/lead`, value);
  }

  submitContactForm(value: {
    name: string;
    email: string;
    message: string;
    recaptcha: string;
  }) {
    return this.http.post<IResponse>(`${this.endpoint}/message`, value);
  }

  getFranchisingLeads(size: number, after?: number) {
    return this.http
      .get<IResponse<IFranchisingLead[]>>(
        `${this.endpoint}/leads?size=${size}${after ? '&after=' + after : ''}`
      )
      .pipe(
        tap((res) => {
          if (!res.success || !res.payload) {
            return;
          }
          const currentLeads = this.loadedFranchisingLeads$.value;
          this.loadedFranchisingLeads$.next([...currentLeads, ...res.payload]);
        })
      );
  }

  getContactMessages(size: number, after?: number) {
    return this.http
      .get<IResponse<IMessageContact[]>>(
        `${this.endpoint}/messages?size=${size}${
          after ? '&after=' + after : ''
        }`
      )
      .pipe(
        tap((res) => {
          if (!res.success || !res.payload) {
            return;
          }
          const currentMessages = this.loadedMessageContacts$.value;
          this.loadedMessageContacts$.next([
            ...currentMessages,
            ...res.payload,
          ]);
        })
      );
  }

  updateReadLead(id: string) {
    return this.http
      .put<IResponse<IFranchisingLead>>(`${this.endpoint}/lead`, {
        id,
        readAt: new Date(),
      })
      .pipe(
        tap((response) => {
          if (!response.success || !response.payload) {
            return;
          }
          const currentLeads = [...this.loadedFranchisingLeads$.value];
          const updatedLeadIndex = currentLeads.findIndex(
            (l) => l.id === response.payload.id
          );
          if (updatedLeadIndex === -1) {
            return;
          }
          currentLeads.splice(updatedLeadIndex, 1, response.payload);
          this.newLeads -= 1;
          this.loadedFranchisingLeads$.next(currentLeads);
        })
      );
  }

  updateReadMessage(id: string) {
    return this.http
      .put<IResponse<IMessageContact>>(`${this.endpoint}/message`, {
        id,
        readAt: new Date(),
      })
      .pipe(
        tap((response) => {
          if (!response.success || !response.payload) {
            return;
          }
          const currentMessages = [...this.loadedMessageContacts$.value];
          const updatedMessageIndex = currentMessages.findIndex(
            (l) => l.id === response.payload.id
          );
          if (updatedMessageIndex === -1) {
            return;
          }
          currentMessages.splice(updatedMessageIndex, 1, response.payload);
          this.newMessages -= 1;
          this.loadedMessageContacts$.next(currentMessages);
        })
      );
  }

  fetchNewMessages() {
    return this.http
      .get<IResponse<{ newLeads: number; newMessages: number }>>(
        `${this.endpoint}/new`
      )
      .pipe(
        map((response) => {
          if (!response.success || !response.payload) {
            return;
          }
          this.newLeads = response.payload.newLeads;
          this.newMessages = response.payload.newMessages;
          return this.newLeads + this.newMessages;
        })
      );
  }
}
