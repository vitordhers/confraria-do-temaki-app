import { isPlatformBrowser } from '@angular/common';
import { ElementRef, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivationEnd, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { hideGoogleRecaptcha } from '../shared/functions/hide-google-recaptcha.function';
import { showGoogleRecaptcha } from '../shared/functions/show-google-recaptcha.function';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  public appPages = [
    { title: 'Home', url: '/home', icon: 'mail' },
    { title: 'Cardápio', url: '/cardapio', icon: 'heart' },
    {
      title: 'Seja Um Franqueado',
      url: '/seja-um-franqueado',
      icon: 'paper-plane',
    },
    { title: 'Contato', url: '/contato', icon: 'archive' },
  ];

  public adminPages = [
    {
      title: 'Painel',
      url: 'painel',
      icon: 'analytics-sharp',
      adminOnly: true,
    },
    {
      title: 'Unidades',
      url: 'unidades',
      icon: 'storefront-sharp',
      adminOnly: true,
    },
    {
      title: 'Franqueados',
      url: 'franqueados',
      icon: 'people-sharp',
      adminOnly: true,
    },
    {
      title: 'Produtos',
      url: 'produtos',
      icon: 'apps-sharp',
      adminOnly: false,
    },
    {
      title: 'Categorias',
      url: 'categorias',
      icon: 'grid-sharp',
      adminOnly: true,
    },
    {
      title: 'Mensagens',
      url: 'mensagens',
      icon: 'chatbubbles-sharp',
      adminOnly: true,
    },
  ];

  currentPage = '/home';

  headerState$ = new BehaviorSubject({
    color: `#00000000`,
    minimized: false,
  });

  currentHeader$ = new BehaviorSubject('regular');

  private observer!: IntersectionObserver;
  private elementRefMap: { [index: string]: ElementRef<HTMLDivElement> } = {};

  constructor(
    private router: Router,
    private titleService: Title,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.currentHeader$.subscribe((c) => {});
    this.router.events
      .pipe(
        filter(
          (evt) =>
            evt instanceof ActivationEnd &&
            !!Object.keys(evt.snapshot.data).length
        )
      )
      .subscribe((evt: any) => {
        if (
          'headerTrigger' in evt.snapshot.data &&
          evt.snapshot.data.headerTrigger in this.elementRefMap
        ) {
          this.observeElement(
            undefined,
            false,
            evt.snapshot.data.headerTrigger
          );
        }

        hideGoogleRecaptcha(this.platformId);

        if ('showRecaptcha' in evt.snapshot.data) {
          showGoogleRecaptcha(this.platformId);
        }
      });

    this.router.events
      .pipe(
        filter(
          (evt) => evt instanceof ActivationEnd && 'routeConfig' in evt.snapshot
        )
      )
      .subscribe((evt: any) => {
        const page = [...this.appPages, ...this.adminPages].find(
          (pg) => pg.url.substring(1) === evt.snapshot.routeConfig.path
        );
        if (page) {
          this.currentPage = page.url;
          this.titleService.setTitle(`${page.title} - Confraria do Temaki`);
        }

        if ('adminRoute' in evt.snapshot.data) {
          return this.currentHeader$.next(
            evt.snapshot.data.adminRoute ? 'admin' : 'regular'
          );
        }
      });
  }

  navigate(url: string) {
    this.router.navigate([url]);
  }

  observeElement(
    elementRef?: ElementRef<HTMLDivElement>,
    addToMap = true,
    key?: string
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.unobserveAll();
      if (elementRef && addToMap) {
        this.elementRefMap = {
          ...this.elementRefMap,
          [elementRef?.nativeElement?.parentElement?.id]: elementRef,
        };
      }
      if (key) {
        elementRef = this.elementRefMap[key];
      }
      this.updateObserver(elementRef);
      this.observer.observe(elementRef.nativeElement);
    }
  }

  unobserveAll() {
    for (const ref in this.elementRefMap) {
      if (ref in this.elementRefMap) {
        this.observer.unobserve(this.elementRefMap[ref].nativeElement);
      }
    }
  }
  updateObserver(elementRef: ElementRef<HTMLDivElement>) {
    if (isPlatformBrowser(this.platformId)) {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.intersectionRatio === 0) {
            return;
          }
          this.setHeaderState(entry.intersectionRatio);
        },
        {
          root: elementRef?.nativeElement?.parentElement?.parentElement,
          rootMargin: '0px',
          threshold: [
            0, 0.05, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6,
            0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1,
          ],
        }
      );
    }
  }

  public setHeaderState(trigger: number) {
    const no = 255 - Math.round((Math.round(trigger * 100) * 255) / 100);
    const minimized = no > 128;
    this.headerState$.next({
      color: `#000000${no.toString(16)}`,
      minimized,
    });
  }
}
