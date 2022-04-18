import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { deburr } from 'lodash';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { ProductDetailComponent } from 'src/app/components/product-detail/product-detail.component';
import { AuthService } from 'src/app/services/auth.service';
import { CategoriesService } from 'src/app/services/categories.service';
import { ProductService } from 'src/app/services/product.service';
import { UnitService } from 'src/app/services/unit.service';
import { IProduct } from 'src/app/shared/interfaces/product.interface';
import { ProductDisplay } from 'src/app/shared/models/product-display.model';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {
  public initialValue: string;
  public selectedCategory$ = new BehaviorSubject<{
    id?: string;
    name: string;
    slug: string;
  }>({
    id: undefined,
    name: '',
    slug: '',
  });
  public displayedProducts$!: Observable<ProductDisplay[]>;
  public selectInitialValue: string;

  private result$ = new BehaviorSubject('');
  private storedCategoryId$ = new BehaviorSubject<string>('');
  private firstLoad = true;
  private destroyModal$ = new Subject<boolean>();

  constructor(
    private productService: ProductService,
    private unitService: UnitService,
    public authService: AuthService,
    public categoriesService: CategoriesService,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.displayedProducts$ = combineLatest([
      this.unitService.currentUnitId$,
      this.productService.products$,
      combineLatest([this.result$, this.categoriesService.categories$]).pipe(
        tap(([fragment, categories]) => {
          if (fragment && !fragment.startsWith('@')) {
            const selectedCategory = categories.find(
              (category) => category.slug === fragment
            );
            if (selectedCategory) {
              this.selectedCategory$.next(selectedCategory);
            }
          }

          if (this.firstLoad) {
            this.firstLoad = false;
            this.selectInitialValue = fragment || 'promocoes';
          }

          return fragment || 'promocoes';
        })
      ),
    ]).pipe(
      map(([currentUnitId, products, [fragment, categories]]) => {
        let displayedProducts: IProduct[] = !fragment
          ? products.filter((p) =>
              p.categoriesIds.includes(this.selectedCategory$.value.id)
            )
          : [];
        if (fragment.startsWith('@')) {
          this.initialValue = fragment.substring(1);

          displayedProducts = products.filter((product) =>
            deburr(
              product.name.concat(` ${product.description}`).toLowerCase()
            ).includes(this.initialValue)
          );

          this.selectedCategory$.next({
            id: undefined,
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

        return displayedProducts.map((product) =>
          this.productService.mapProductToProductDisplay(product)
        );
      })
    );
  }

  search(value: string) {
    if (value !== '') {
      // this.selectedCategory$.next({
      //   id: null,
      //   name: 'Resultados da pesquisa',
      //   slug: value,
      // });
      return this.setResult(value, true);
    }

    const previousCategory = this.categoriesService.categories$.value.find(
      (cat) => cat.id === this.storedCategoryId$.value
    );
    if (previousCategory) {
      this.setResult(previousCategory.slug);
    }
  }

  setResult(fragment: any, search = false) {
    let result = fragment;
    if (typeof fragment !== 'string') {
      result = fragment.detail.value;
    }
    this.result$.next(search ? `@${result}` : result);
  }

  async presentModal(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.authService.isUserAdmin$
      .pipe(takeUntil(this.destroyModal$))
      .subscribe(async (isAdmin) => {
        const modal = await this.modalController.create({
          component: ProductDetailComponent,
          componentProps: { isAdmin, editable: true },
        });

        await modal.present();
        await modal.onDidDismiss();
        return this.destroyModal$.next(true);
      });
  }
}
