import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LayoutService } from '../../services/layout.service';
import { ProductService } from '../../services/product.service';
import { UnitService } from '../../services/unit.service';
import { navigateExternalLink } from '../../shared/functions/navigate-external-link.function';
import { ProductDisplay } from '../../shared/models/product-display.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild(IonSlides) public slides!: IonSlides;
  public requestedProducts$!: Observable<ProductDisplay[]>;
  public sliderOptions = {
    initialSlide: 0,
    // slidesPerView: 4,
    spaceBetween: 25,
    loop: true,
    breakpoints: {
      320: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 3,
      },
      992: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    },
    freeMode: true,
    freeModeMomentumVelocityRatio: 0.5,
  };

  public navigateExternalLink = navigateExternalLink;

  constructor(
    private unitService: UnitService,
    public layoutService: LayoutService,
    private productsService: ProductService
  ) {}

  ngOnInit() {
    this.requestedProducts$ = combineLatest([
      this.productsService.products$,
      this.unitService.currentUnitId$,
    ]).pipe(
      map(([products, currentUnitId]) =>
        products
          .filter(
            (product) =>
              product.unitsAvailable.includes(currentUnitId) &&
              product.requested
          )
          .map((p) => this.productsService.mapProductToProductDisplay(p))
      )
    );
  }
}
