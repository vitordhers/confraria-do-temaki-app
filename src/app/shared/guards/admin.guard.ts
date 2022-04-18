import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AdminGuard implements CanActivate {
  isBrowser = false;
  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // return this.authService.isUserAdmin$.pipe(
    //   map((isAdmin) => {
    //     console.log({ isAdmin });
    //     if (!isAdmin) {
    //       this.router.navigateByUrl('/home');
    //     }
    //     return isAdmin;
    //   })
    // );
    return of(true);
  }
}
