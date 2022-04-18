import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { deburr } from 'lodash';
import { ProductDisplay } from '../../shared/models/product-display.model';
import { UnitService } from '../../services/unit.service';
import { ProductService } from '../../services/product.service';
import { IProduct } from '../../shared/interfaces/product.interface';
import { CategoriesService } from '../../services/categories.service';
import { IonContent } from '@ionic/angular';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  public initialValue?: string;
  public selectedCategory$ = new BehaviorSubject({
    id: 'd6e6aafb-4ba2-40fa-955f-ee6ddfa2502c',
    name: 'Temakis',
    slug: 'temakis',
  });
  public displayedProducts$: Observable<ProductDisplay[]>;
  public selectInitialValue: string;

  private storedCategoryId$ = new BehaviorSubject<string>('');

  constructor(
    public productService: ProductService,
    public categoriesService: CategoriesService,
    public navigationService: NavigationService,
    private unitService: UnitService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.displayedProducts$ = combineLatest([
      this.unitService.currentUnitId$,
      this.productService.products$,
      combineLatest([
        this.activatedRoute.fragment,
        this.categoriesService.categories$,
      ]).pipe(
        tap(([fragment, categories]) => {
          if (fragment && !fragment.startsWith('@')) {
            const selectedCategory = categories.find(
              (category) => category.slug === fragment
            );
            if (selectedCategory) {
              this.selectedCategory$.next(selectedCategory);
            }
          }

          return fragment || 'temakis';
        })
      ),
    ]).pipe(
      map(([currentUnitId, products, [fragment, categories]]) => {
        let displayedProducts: IProduct[] = !fragment
          ? products.filter(
              (p) =>
                p.categoriesIds.includes(this.selectedCategory$.value.id) &&
                p.unitsAvailable.includes(currentUnitId)
            )
          : [];
        if (fragment) {
          if (fragment.startsWith('@')) {
            this.initialValue = fragment.substring(1);

            displayedProducts = products.filter((product) =>
              deburr(
                product.name.concat(` ${product.description}`).toLowerCase()
              ).includes(this.initialValue)
            );

            this.selectedCategory$.next({
              id: '0',
              name: 'Resultados da pesquisa',
              slug: this.initialValue,
            });

            return displayedProducts.map((product) =>
              this.productService.mapProductToProductDisplay(product)
            );
          }

          const selectedCategory = categories.find(
            (category) => category.slug === fragment
          );

          if (selectedCategory) {
            if (this.selectedCategory$.value.id) {
              this.storedCategoryId$.next(this.selectedCategory$.value.id);
            }

            displayedProducts = products.filter(
              (product) =>
                product.categoriesIds.includes(selectedCategory.id) &&
                product.unitsAvailable.includes(currentUnitId)
            );
          }
        }

        return displayedProducts.map((product) =>
          this.productService.mapProductToProductDisplay(product)
        );
      })
    );
  }

  selectChange(e: any) {
    this.setFragment(e.detail.value);
  }

  setFragment(fragment: string, search = false) {
    this.router.navigate(['/cardapio'], {
      fragment: search ? `@${fragment}` : fragment,
    });
  }

  search(value: string) {
    if (value !== '') {
      // this.selectedCategory$.next({
      //   id: null,
      //   name: 'Resultados da pesquisa',
      //   slug: value,
      // });
      return this.setFragment(value, true);
    }

    const previousCategory = this.categoriesService.categories$.value.find(
      (cat) => cat.id === this.storedCategoryId$.value
    );
    if (previousCategory) {
      this.setFragment(previousCategory.slug);
    }
  }

  scrollToTop() {
    this.content.scrollToTop(400);
    // this.navigationService.headerState$.next({
    //   ...this.navigationService.headerState$.value,
    //   minimized: false,
    // });
  }
}
