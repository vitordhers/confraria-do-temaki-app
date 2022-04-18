import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NavigationService } from '../../services/navigation.service';
import { navigateExternalLink } from '../../shared/functions/navigate-external-link.function';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  navigateExternalLink = navigateExternalLink;

  constructor(
    public navigationService: NavigationService,
    public authService: AuthService
  ) {}
}
