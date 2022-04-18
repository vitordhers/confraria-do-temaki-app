import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core';
import {
  EMPTY,
  from,
  map,
  Observable,
  of,
  ReplaySubject,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { Storage } from '@capacitor/storage';
// import { Credentials } from 'server/auth/interfaces/credentials.interface';
import { environment } from 'src/environments/environment';
import jwt_decode from 'jwt-decode';
import { User } from '../shared/models/user.model';
import { IResponse } from '../shared/interfaces/response.interface';
import { isPlatformBrowser } from '@angular/common';
import { Credentials } from '../shared/interfaces/credentials.interface';
import { IDecodedToken } from '../shared/interfaces/decoded-token.interface';
import { UserRole } from '../shared/enums/user-role.enum';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  isBrowser: boolean;
  user$?: Observable<User>;
  isUserAuthenticated$: Observable<boolean>;
  isUserAdmin$: Observable<boolean>;
  private userSubject$ = new ReplaySubject<User>(1);
  private activeRefreshTokenTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.user$ = this.userSubject$.pipe(
      switchMap((user) => {
        if (user) {
          return of(user);
        }
        return from(Storage.get({ key: 'confrariaAuthData' })).pipe(
          take(1),
          map((storedData) => {
            if (!storedData || !storedData.value) {
              return;
            }

            const credentials = JSON.parse(storedData.value) as Credentials;
            const decodedToken = this.decodeAccessToken(
              credentials.accessToken
            );

            if (!decodedToken || !decodedToken.exp || !decodedToken.iat) {
              this.logout();
              return;
            }

            return new User(
              decodedToken.id,
              decodedToken.role,
              decodedToken.exp - decodedToken.iat,
              credentials.accessToken,
              decodedToken.unitsOwnedIds,
              credentials.refreshToken
            );
          })
        );
      })
    );

    this.isUserAuthenticated$ = this.user$.pipe(map((user) => !!user));

    this.isUserAdmin$ = this.user$.pipe(
      map((user) => user?.role === UserRole.ADMIN)
    );

    this.autoLogin().subscribe();
    // this.isUserAuthenticated$.subscribe();
  }

  get accessToken() {
    if (this.isBrowser) {
      return from(Storage.get({ key: 'confrariaAuthData' })).pipe(
        take(1),
        map((storedData) => {
          if (!storedData || !storedData.value) {
            return null;
          }

          const parsedData = JSON.parse(storedData.value) as Credentials;

          return parsedData.accessToken;
        })
      );
    }
    return of(null);
  }

  get refreshToken() {
    if (this.isBrowser) {
      return from(Storage.get({ key: 'confrariaAuthData' })).pipe(
        take(1),
        map((storedData) => {
          if (!storedData || !storedData.value) {
            return undefined;
          }

          const parsedData = JSON.parse(storedData.value) as Credentials;

          return parsedData.refreshToken;
        })
      );
    }
    return undefined;
  }

  signIn(values: { email: string; password: string; recaptcha: string }) {
    return this.http
      .post<IResponse<Credentials>>(`${environment.apiUrl}/auth/signin`, values)
      .pipe(
        tap((response) => {
          if (response.success && response?.payload) {
            this.setUserData(response.payload);
          }
        })
      );
  }

  setUserData(credentials: Credentials) {
    const decodedToken = this.decodeAccessToken(credentials.accessToken);
    if (!decodedToken || !decodedToken.exp || !decodedToken.iat) {
      return this.logout();
    }

    const exp = decodedToken.exp;
    const now = Math.round(Date.now() / 1000);
    if (exp <= now) {
      this.onRefreshToken().subscribe();
      return;
    }

    const user = new User(
      decodedToken.id,
      decodedToken.role,
      exp - now,
      credentials.accessToken,
      decodedToken.unitsOwnedIds,
      credentials.refreshToken
    );

    this.userSubject$.next(user);
    this.storeAuthData(credentials);
    this.autoRefreshToken(user.tokenDuration);
    return user;
  }

  autoLogin() {
    if (this.isBrowser) {
      return from(Storage.get({ key: 'confrariaAuthData' })).pipe(
        take(1),
        map((storedData) => {
          if (!storedData || !storedData.value) {
            return null;
          }

          const credentials = JSON.parse(storedData.value) as Credentials;
          return this.setUserData(credentials);
        })
      );
    }
    return EMPTY;
  }

  autoRefreshToken(duration: number): void {
    if (this.activeRefreshTokenTimer) {
      clearTimeout(this.activeRefreshTokenTimer);
    }

    this.activeRefreshTokenTimer = setTimeout(() => {
      this.onRefreshToken().subscribe({
        complete: () => {},
        next: () => {},
        error: (e: any) => {
          if (e) {
            this.logout();
          }
        },
      });
    }, duration * 1000);
  }

  onRefreshToken() {
    return this.refreshToken?.pipe(
      switchMap((refreshToken) => {
        if (!refreshToken) {
          return EMPTY;
        }
        return this.http
          .get<IResponse<Credentials>>(`${environment.apiUrl}/auth/token`, {
            headers: {
              'x-refresh-token': refreshToken,
            },
          })
          .pipe(
            map((response) => {
              if (response?.success && response?.payload) {
                const credentials = response.payload;
                this.setUserData(credentials);
                return credentials;
              }
              return undefined;
            })
          );
      })
    );
  }

  logout() {
    if (this.isBrowser) {
      if (this.activeRefreshTokenTimer) {
        clearTimeout(this.activeRefreshTokenTimer);
      }
      Storage.remove({ key: 'confrariaAuthData' }).then((res) => {
        this.userSubject$.next(null);
        this.router.navigate(['/home']);
      });
    }
  }

  decodeAccessToken(accessToken: string) {
    try {
      return jwt_decode<IDecodedToken>(accessToken);
    } catch (e) {
      console.log('decodeAccessToken error');
    }
  }

  ngOnDestroy() {
    if (this.activeRefreshTokenTimer) {
      clearTimeout(this.activeRefreshTokenTimer);
    }
  }

  private storeAuthData(userData: Credentials): void {
    if (this.isBrowser) {
      const data = JSON.stringify({
        accessToken: userData.accessToken,
        refreshToken: userData.refreshToken,
      });
      Storage.set({ key: 'confrariaAuthData', value: data });
    }
  }
}
