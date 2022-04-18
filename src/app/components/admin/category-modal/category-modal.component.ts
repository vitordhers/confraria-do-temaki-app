import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { CategoriesService } from 'src/app/services/categories.service';
import { fireError } from 'src/app/shared/functions/fire-error.function';
import { fireSuccess } from 'src/app/shared/functions/fire-success.function';
import { ICategory } from 'src/app/shared/interfaces/category.interface';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.scss'],
})
export class CategoryModalComponent implements OnInit {
  @Input() category?: ICategory;
  loaders = { submit: false };

  form: FormGroup;

  constructor(
    private modalController: ModalController,
    private categoriesService: CategoriesService
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      id: new FormControl(null),
      name: new FormControl(null, [
        Validators.required,
        Validators.maxLength(50),
        Validators.minLength(2),
      ]),
      slug: new FormControl(null, [
        Validators.required,
        Validators.maxLength(20),
        Validators.minLength(2),
      ]),
      rank: new FormControl(null, [Validators.min(1), Validators.max(9998)]),
      description: new FormControl(null, [
        Validators.maxLength(200),
        Validators.minLength(10),
      ]),
    });

    if (!this.category) {
      return;
    }

    this.form.patchValue(this.category);
  }

  dismiss() {
    this.modalController.dismiss();
  }

  changeControl(control: string, value: any) {
    this.form.get(control).markAsDirty();
    this.form.get(control).markAsTouched();
    this.form.get(control).patchValue(value);
    this.form.get(control).updateValueAndValidity();
  }

  submit() {
    if (this.form.valid) {
      const payload = { ...this.form.value };

      const source$ = this.category
        ? this.categoriesService.updateCategory({
            ...payload,
            rank: payload.rank ? parseInt(payload.rank, 10) : null,
          })
        : this.categoriesService.createCategory({
            ...payload,
            rank: payload.rank ? parseInt(payload.rank, 10) : null,
          });

      source$.subscribe({
        next: (result) => {
          this.loaders.submit = false;
          if (result.success && result.payload) {
            fireSuccess(
              payload,
              'A Categoria',
              this.category ? 'atualizada' : 'criada'
            );
            return this.modalController.dismiss();
          }
          fireError(
            payload,
            'A Categoria',
            payload.id ? 'atualizada' : 'criada'
          );
        },
        error: (err) => {
          this.loaders.submit = false;
          fireError(
            payload,
            'O Usuário',
            this.category ? 'atualizado' : 'criado',
            err
          );
        },
      });
    }
    this.form.markAllAsTouched();
  }
}
