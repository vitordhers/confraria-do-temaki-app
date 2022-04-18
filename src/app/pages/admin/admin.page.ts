import { Component, OnInit } from '@angular/core';
import { EMPTY, switchMap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { MessagesService } from 'src/app/services/messages.service';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  constructor(
    public authService: AuthService,
    public navigationService: NavigationService,
    public messagesService: MessagesService
  ) {}
  ngOnInit(): void {
    this.authService.isUserAdmin$
      .pipe(
        switchMap((isAdmin) => {
          if (!isAdmin) {
            return EMPTY;
          }
          return this.messagesService.fetchNewMessages();
        })
      )
      .subscribe();
  }
}
