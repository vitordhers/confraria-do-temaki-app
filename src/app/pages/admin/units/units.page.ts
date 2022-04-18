import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { catchError, EMPTY, from, Observable, of, switchMap, tap } from 'rxjs';
import { UnitModalComponent } from 'src/app/components/admin/unit-modal/unit-modal.component';
import { UnitService } from 'src/app/services/unit.service';
import { fireError } from 'src/app/shared/functions/fire-error.function';
import { fireSuccess } from 'src/app/shared/functions/fire-success.function';
import { IUnit } from 'src/app/shared/interfaces/unit.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-units',
  templateUrl: './units.page.html',
  styleUrls: ['./units.page.scss'],
})
export class UnitsPage implements OnInit {
  units$: Observable<IUnit[]>;
  queryError = false;
  constructor(
    private unitsService: UnitService,
    private modalController: ModalController,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Carregando...',
    });
    await loading.present();

    this.units$ = this.unitsService.units$.pipe(
      tap(async () => await loading.dismiss()),
      catchError((err) => {
        this.queryError = true;
        this.loadingController.dismiss();
        return of(err);
      })
    );
  }

  async openUnitModal(unit?: IUnit) {
    const modal = await this.modalController.create({
      component: UnitModalComponent,
      componentProps: { unit },
    });
    return await modal.present();
  }

  deleteUnit(unit: IUnit) {
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
          return this.unitsService.deleteUnit(unit.id);
        })
      )
      .subscribe({
        next: (result) => {
          if (result.success) {
            return fireSuccess(unit, 'A unidade', 'deletada');
          }
          fireError(unit, 'A unidade', 'deletada');
        },
        error: (err) => {
          fireError(unit, 'A unidade', 'deletada', err);
        },
      });
  }
}
