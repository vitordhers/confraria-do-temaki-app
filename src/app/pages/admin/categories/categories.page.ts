import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { catchError, EMPTY, from, Observable, of, switchMap, tap } from 'rxjs';
import { CategoryModalComponent } from 'src/app/components/admin/category-modal/category-modal.component';
import { CategoriesService } from 'src/app/services/categories.service';
import { fireError } from 'src/app/shared/functions/fire-error.function';
import { fireSuccess } from 'src/app/shared/functions/fire-success.function';
import { ICategory } from 'src/app/shared/interfaces/category.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {
  queryError = false;
  categories$: Observable<ICategory[]>;
  constructor(
    private modalController: ModalController,
    private categoriesService: CategoriesService,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Carregando...',
    });
    await loading.present();
    this.categories$ = this.categoriesService.categories$.pipe(
      tap(async () => await loading.dismiss()),
      catchError((err) => {
        this.queryError = true;
        this.loadingController.dismiss();
        return of(err);
      })
    );
  }

  async openCategoryModal(category?: ICategory) {
    const modal = await this.modalController.create({
      component: CategoryModalComponent,
      componentProps: { category },
    });
    return await modal.present();
  }

  deleteCategory(category: ICategory) {
    from(
      Swal.fire({
        title: 'Tem certeza?',
        icon: 'question',
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        heightAuto: false,
      })
    )
      .pipe(
        switchMap(({ isConfirmed }) => {
          if (!isConfirmed) {
            return EMPTY;
          }
          return this.categoriesService.deleteCategory(category.id);
        })
      )
      .subscribe({
        next: (result) => {
          if (result.success) {
            return fireSuccess(category, 'A Categoria', 'deletada');
          }
          fireError(category, 'A Categoria', 'deletada');
        },
        error: (err) => {
          fireError(category, 'A Categoria', 'deletada', err);
        },
      });
  }
}
