import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { MessagesService } from 'src/app/services/messages.service';
import { NavigationService } from '../../../services/navigation.service';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.scss'],
})
export class AdminMenuComponent implements OnInit {
  constructor(
    public navigationService: NavigationService,
    public authService: AuthService,
    public messagesService: MessagesService
  ) {}

  ngOnInit(): void {}
}
