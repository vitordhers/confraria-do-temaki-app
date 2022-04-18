import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { combineLatest, of, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ProductDisplay } from 'src/app/shared/models/product-display.model';
import { ProductDetailComponent } from '../product-detail/product-detail.component';

@Component({
  selector: 'app-display-product',
  templateUrl: './display-product.component.html',
  styleUrls: ['./display-product.component.scss'],
})
export class DisplayProductComponent implements OnInit {
  @Input() product!: ProductDisplay;
  @Input() editable = false;
  private destroyModal$ = new Subject<boolean>();

  constructor(
    private modalController: ModalController,
    private authService: AuthService
  ) {}

  ngOnInit() {}

  async presentModal(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    combineLatest(
      event
        ? [this.authService.isUserAuthenticated$, this.authService.isUserAdmin$]
        : [of(false), of(false)]
    )
      .pipe(takeUntil(this.destroyModal$))
      .subscribe(async ([isAuthenticated, isAdmin]) => {
        const modal = await this.modalController.create({
          component: ProductDetailComponent,
          componentProps: {
            id: this.product.id,
            isAdmin,
            editable: isAuthenticated,
          },
        });

        await modal.present();
        await modal.onDidDismiss();
        return this.destroyModal$.next(true);
      });
  }
}
