import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { catchError, EMPTY, from, Observable, of, switchMap, tap } from 'rxjs';
import { ChangePasswordModalComponent } from 'src/app/components/admin/change-password-modal/change-password-modal.component';
import { FranchiseeModalComponent } from 'src/app/components/admin/franchisee-modal/franchisee-modal.component';
import { UserService } from 'src/app/services/user.service';
import { UserRole } from 'src/app/shared/enums/user-role.enum';
import { fireError } from 'src/app/shared/functions/fire-error.function';
import { fireSuccess } from 'src/app/shared/functions/fire-success.function';
import { IUser } from 'src/app/shared/interfaces/user.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-franchisees',
  templateUrl: './franchisees.page.html',
  styleUrls: ['./franchisees.page.scss'],
})
export class FranchiseesPage implements OnInit {
  users$: Observable<IUser[]>;
  userRole = UserRole;
  queryError = false;

  constructor(
    private userService: UserService,
    private modalController: ModalController,
    public loadingController: LoadingController
  ) {}

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Carregando...',
    });
    await loading.present();
    this.users$ = this.userService.users$.pipe(
      tap(async () => await loading.dismiss()),
      catchError((err) => {
        this.queryError = true;
        this.loadingController.dismiss();
        return of(err);
      })
    );
  }

  async openFranchiseeModal(franchisee?: IUser) {
    const modal = await this.modalController.create({
      component: FranchiseeModalComponent,
      componentProps: { franchisee },
    });
    return await modal.present();
  }

  async openEditPasswordModal(franchisee: IUser) {
    const modal = await this.modalController.create({
      component: ChangePasswordModalComponent,
      componentProps: { franchisee },
    });
    return await modal.present();
  }

  deleteUser(user: IUser) {
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
          return this.userService.deleteUser(user.id);
        })
      )
      .subscribe({
        next: (result) => {
          if (result.success) {
            return fireSuccess(user, 'O Usuário', 'deletado');
          }
          fireError(user, 'O Usuário', 'deletado');
        },
        error: (err) => {
          fireError(user, 'O Usuário', 'deletado', err);
        },
      });
  }
}
