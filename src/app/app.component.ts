import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from './services/auth.service';
import { NavigationService } from './services/navigation.service';
import { navigateExternalLink } from './shared/functions/navigate-external-link.function';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  isBrowser: boolean;
  navigateExternalLink = navigateExternalLink;

  constructor(
    public navigationService: NavigationService,
    public authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    isPlatformBrowser(this.platformId);
  }
}
