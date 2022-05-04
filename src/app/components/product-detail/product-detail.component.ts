import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ModalController, PopoverController } from '@ionic/angular';
import { BehaviorSubject, combineLatest, Observable, Subject, zip } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { CategoriesService } from '../../services/categories.service';
import { LayoutService } from '../../services/layout.service';
import { ProductService } from '../../services/product.service';
import { UnitService } from '../../services/unit.service';
import { ProductDetail } from '../../shared/models/product-detail.model';
import { IPrice } from '../../shared/interfaces/price.interface';
import { IProduct } from '../../shared/interfaces/product.interface';
import { IIngredient } from '../../shared/interfaces/ingredient.interface';
import { IResponse } from '../../shared/interfaces/response.interface';
import { EditModalComponent } from '../admin/edit-modal/edit-modal.component';
import { AddModalComponent } from '../admin/add-modal/add-modal.component';
import { fireToast } from '../../shared/functions/fire-toast.function';
import { fireSuccess } from 'src/app/shared/functions/fire-success.function';
import { fireError } from 'src/app/shared/functions/fire-error.function';
import { IUnit } from 'src/app/shared/interfaces/unit.interface';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

  @Input() id: string | undefined;
  @Input() editable = false;
  @Input() isAdmin = false;
  @Input() unitsOwnedIds: string[];
  product$: Observable<ProductDetail>;
  destroy$ = new Subject<boolean>();

  editableUnits$: Observable<IUnit[]>;

  isAddingIndexes: {
    [key: string]: boolean;
  } = {
    categoriesIds: false,
    unitsAvailable: false,
    price: false,
    attributes: false,
    conditions: false,
    notes: false,
    ingredients: false,
  };

  isEditingIndexes: {
    [key: string]: number | undefined;
  } = {
    categoriesIds: undefined,
    unitsAvailable: undefined,
    price: undefined,
    attributes: undefined,
    conditions: undefined,
    notes: undefined,
    ingredients: undefined,
  };

  canSave = true;

  newProduct = new ProductDetail(
    undefined,
    '',
    [],
    [],
    [],
    '',
    'assets/img/products/none.jpg'
  );

  currentUnitId$ = new BehaviorSubject(this.unitService.currentUnitId$.value);
  unitList$ = this.unitService.units$.pipe(
    map((unit) => unit.map((u) => ({ title: u.name, value: u.id })))
  );

  imgSrc: string;
  imageHovered = false;
  acceptedExtensions = ['image/png', 'image/jpeg', 'image/jpg'];
  fileMaxSizeInBytes = 26214400;

  progress = 0;
  displayProgressBar = false;

  editProductForm = new FormGroup({});
  addPriceForm: FormGroup;
  editPriceForm: FormGroup;

  addIngredientsForm: FormGroup;
  editIngredientsForm: FormGroup;

  addStringArrayForm: FormGroup;
  editStringArrayForm: FormGroup;

  constructor(
    private productService: ProductService,
    public categoriesService: CategoriesService,
    public unitService: UnitService,
    public layoutService: LayoutService,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.editable) {
      this.editableUnits$ = combineLatest([
        this.authService.user$,
        this.unitService.units$,
      ]).pipe(
        map(([user, units]) => {
          if (this.isAdmin) {
            return units;
          }
          return user.unitsOwnedIds.map((unitId) =>
            units.find((u) => u.id === unitId)
          );
        })
      );
    }
    this.product$ = this.productService.products$.pipe(
      map((products) => {
        let product = this.newProduct;
        this.imgSrc = product.imageUrl;
        const p = products.find((pr) => pr.id === this.id);
        if (p) {
          product = this.productService.mapProductToProductDetail(p);
          let imageSrc = `assets/img/products/${product.slug}_lg.jpg`;
          if (product.imageUrl) {
            const uris = product.imageUrl.split('.');
            const ext = uris.pop();
            imageSrc = `${uris.join('.')}_lg.${ext}`;
          }
          this.imgSrc = imageSrc;
        }
        return product;
      })
    );

    if (this.editable) {
      this.addStringArrayForm = new FormGroup({});
      this.editStringArrayForm = new FormGroup({});

      zip([
        this.product$,
        this.categoriesService.categories$,
        this.unitService.units$,
      ])
        .pipe(takeUntil(this.destroy$))
        .subscribe(([product, categories, units]) => {
          // set edit product form with product properties
          this.editProductForm = new FormGroup({
            id: new FormControl(
              product.id || null,
              product.id ? [Validators.required] : []
            ),
            name: new FormControl(product.name, [
              Validators.required,
              Validators.minLength(5),
              Validators.maxLength(100),
            ]),
            rank: new FormControl(product?.rank, [
              Validators.min(1),
              Validators.max(9998),
            ]),
            categoriesIds: new FormArray([], [Validators.required]), // array of strings
            unitsAvailable: new FormArray([], [Validators.required]), // array of strings
            price: new FormArray([], [Validators.required]), // array of formGroup
            slug: new FormControl(product.slug, [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(50),
            ]),
            imageUrl: new FormControl(product.imageUrl),
            description: new FormControl(product?.description),
            attributes: new FormArray([]), // array of strings
            requested: new FormControl(product?.requested),
            conditions: new FormArray([]), // array of strings
            notes: new FormArray([]), // array of strings
            ingredients: new FormArray([]), // array of formGroup
          });

          this.addPriceForm = new FormGroup({
            price: new FormControl(0, [Validators.required, Validators.min(0)]),
            size: new FormControl('', [Validators.maxLength(50)]),
          });

          this.editPriceForm = new FormGroup({
            price: new FormControl(0, [Validators.required, Validators.min(0)]),
            size: new FormControl('', [Validators.maxLength(50)]),
          });

          this.addIngredientsForm = new FormGroup({
            display: new FormControl(true),
            title: new FormControl(null, [Validators.required]),
            options: new FormArray([]),
          });

          this.editIngredientsForm = new FormGroup({
            display: new FormControl(true),
            title: new FormControl(null, [Validators.required]),
            options: new FormArray([]),
          });

          product.price.map((price) => {
            const formGroup = this.mapPriceToFormGroup(price);
            this.getControlFormArray('price').push(formGroup);
          });

          product.unitsAvailable?.map((id) => {
            const formControl = this.mapValueToFormControl(id);
            this.getControlFormArray('unitsAvailable').push(formControl);
          });

          product.categoriesIds?.map((id) => {
            const formControl = this.mapValueToFormControl(id);
            this.getControlFormArray('categoriesIds').push(formControl);
          });

          product.notes?.map((note) => {
            const formControl = this.mapValueToFormControl(note);
            this.getControlFormArray('notes').push(formControl);
          });

          product.conditions?.map((condition) => {
            const formControl = this.mapValueToFormControl(condition);
            this.getControlFormArray('conditions').push(formControl);
          });

          product.ingredients?.map((ingredient) => {
            const formControls = ingredient.options?.map((option) =>
              this.mapValueToFormControl(option)
            );
            const formGroup = this.mapIngredientToFormGroup(
              ingredient,
              formControls
            );
            this.getControlFormArray('ingredients').push(formGroup);
          });
        });
    }
  }

  close() {
    this.modalController.dismiss();
  }

  addPrice() {
    this.isAddingIndexes.price = !this.isAddingIndexes.price;
    this.isEditingIndexes.price = undefined;
    this.canSave = !this.isAddingIndexes.price;
  }

  changeProductControl(control: string, value: any) {
    const ctrl = this.editProductForm.get(control);
    if (ctrl) {
      if (!ctrl.touched) {
        ctrl.markAsTouched();
      }
      if (!ctrl.dirty) {
        ctrl.markAsDirty();
      }
      ctrl.patchValue(value);
      ctrl.updateValueAndValidity();
    }
  }

  changeStringArrayControl(
    mode: 'edit' | 'add' = 'add',
    controlName: string,
    value: any
  ) {
    if (mode === 'add') {
      this.addStringArrayForm.get(controlName)?.patchValue(value);
      return this.addStringArrayForm.get(controlName)?.updateValueAndValidity();
    }
    this.editStringArrayForm.get(controlName)?.patchValue(value);
    this.editStringArrayForm.get(controlName)?.updateValueAndValidity();
  }

  addStringArray(controlName: string) {
    this.isAddingIndexes[controlName] = !this.isAddingIndexes[controlName];
    if (this.isAddingIndexes[controlName]) {
      this.isEditingIndexes[controlName] = undefined;
      this.canSave = false;
      this.clearStringArrayControls('add');
      return this.addStringArrayControls('add', controlName);
    }
    this.canSave = true;
  }

  editStringArrayByIndex(i: number, controlName: string) {
    this.clearStringArrayControls('edit');
    this.addStringArrayControls('edit', controlName);
    this.isEditingIndexes[controlName] = i;
    this.isAddingIndexes[controlName] = false;
    this.canSave = false;
  }

  addStringArrayControls(
    mode: 'edit' | 'add',
    controlName: string,
    value: any = null
  ) {
    const form =
      mode === 'add' ? this.addStringArrayForm : this.editStringArrayForm;
    const control = this.mapValueToFormControl(value);
    form.addControl(controlName, control);
  }

  clearStringArrayControls(mode: 'edit' | 'add') {
    const form =
      mode === 'add' ? this.addStringArrayForm : this.editStringArrayForm;
    for (const controlName in form.controls) {
      if (Object.prototype.hasOwnProperty.call(form.controls, controlName)) {
        this.addStringArrayForm.removeControl(controlName);
      }
    }
  }

  markChip(controlName: string, value: any) {
    for (const key in this.isEditingIndexes) {
      if (Object.prototype.hasOwnProperty.call(this.isEditingIndexes, key)) {
        this.isAddingIndexes[key] = false;
      }
    }
    const formControl = this.mapValueToFormControl(value);
    this.getControlFormArray(controlName).push(formControl);
  }

  getControlFormArray(controlName: string) {
    return this.editProductForm.get(controlName) as FormArray;
  }

  mapPriceToFormGroup(p: IPrice) {
    const { size, price, unitId } = p;
    return new FormGroup({
      price: new FormControl(price, [Validators.required]),
      unitId: new FormControl(unitId, [Validators.required]),
      size: new FormControl(size),
    });
  }

  mapIngredientToFormGroup(i: IIngredient, options: FormControl[] = []) {
    const { display, title } = i;
    return new FormGroup({
      display: new FormControl(display, [Validators.required]),
      title: new FormControl(title),
      options: new FormArray(options?.length ? options : []),
    });
  }

  mapValueToFormControl(value: any) {
    return new FormControl(value);
  }

  getFormByControlName(controlName: string, mode: 'add' | 'edit') {
    if (mode === 'add') {
      switch (controlName) {
        case 'price':
          return this.addPriceForm;
        case 'ingredients':
          return this.addIngredientsForm;
        default:
          return this.addStringArrayForm;
      }
    }
    switch (controlName) {
      case 'price':
        return this.editPriceForm;
      case 'ingredients':
        return this.editIngredientsForm;
      default:
        return this.editStringArrayForm;
    }
  }

  updateEditedByIndex(index: number, controlName: string) {
    const form = this.getFormByControlName(controlName, 'edit');
    let value = { ...form.value };

    if (controlName !== 'price' && controlName !== 'ingredients') {
      value = value[controlName];
    }

    form.markAllAsTouched();

    if (form.valid) {
      const formArray = this.getControlFormArray(controlName);

      formArray.controls[index].patchValue(value);
      if (controlName === 'ingredients') {
        const optionsFormArray = formArray.controls[index].get(
          'options'
        ) as FormArray;
        optionsFormArray.clear();
        (value.options as string[]).map((opt) => {
          const control = this.mapValueToFormControl(opt);
          optionsFormArray.push(control);
        });
      }

      this.isEditingIndexes[controlName] = undefined;
      this.canSave = true;
      form.reset();
      if (controlName === 'ingredients') {
        const optionsFormArray = form.get('options') as FormArray;
        optionsFormArray.clear();
      }
    }
  }

  editControlByIndex(index: number, controlName: string) {
    this.isEditingIndexes[controlName] = index;
    this.isAddingIndexes[controlName] = false;
    this.canSave = false;
    if (controlName !== 'price' && controlName !== 'ingredients') {
      this.editStringArrayByIndex(index, controlName);
    }
    const value = this.getControlFormArray(controlName).value[index];

    const form = this.getFormByControlName(controlName, 'edit');
    form.get(controlName)?.markAsTouched();
    form.patchValue(value);
    if (controlName === 'ingredients') {
      const optionsFormArray = form.get('options') as FormArray;
      (value.options as string[]).map((opt) => {
        const control = this.mapValueToFormControl(opt);
        optionsFormArray.push(control);
      });
    }

    form.updateValueAndValidity();
  }

  async deleteByIndex(i: number, controlName: string, confirm = true) {
    let confirmed = !confirm;
    if (confirm) {
      const { isConfirmed } = await Swal.fire({
        title: 'Tem certeza?',
        icon: 'question',
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        heightAuto: false,
      });
      confirmed = isConfirmed;
    }
    if (confirmed) {
      this.getControlFormArray(controlName).removeAt(i);
    }
  }

  addNewPrice() {
    this.addPriceForm.markAllAsTouched();
    if (this.addPriceForm.valid) {
      const formGroup = this.mapPriceToFormGroup({
        ...this.addPriceForm.value,
        unitId: this.currentUnitId$.value,
      });

      this.getControlFormArray('price').push(formGroup);
      this.editProductForm.get('price')?.markAsTouched();
      this.isAddingIndexes.price = false;
      this.canSave = true;
      this.addPriceForm.reset();
    }
  }

  addNewIngredient() {
    this.addPriceForm.markAllAsTouched();
    if (this.addIngredientsForm.valid) {
      const formControls: FormControl[] =
        this.addIngredientsForm.value.options?.map((option) =>
          this.mapValueToFormControl(option)
        );
      const formGroup = this.mapIngredientToFormGroup(
        {
          ...this.addIngredientsForm.value,
        },
        formControls
      );

      this.getControlFormArray('ingredients').push(formGroup);
      this.editProductForm.get('ingredients')?.markAsTouched();
      this.isAddingIndexes.ingredients = false;
      this.canSave = true;
      this.addIngredientsForm.reset();
    }
  }

  addNewStringArray(controlName: string) {
    if (this.addStringArrayForm.valid) {
      const formControl = this.mapValueToFormControl(
        this.addStringArrayForm.get(controlName)?.value
      );

      this.getControlFormArray(controlName).push(formControl);
      this.isAddingIndexes[controlName] = false;
      this.isEditingIndexes[controlName] = undefined;
      this.canSave = true;
      this.addStringArrayForm.reset();
      this.clearStringArrayControls('add');
    }
  }

  async openEditPopover(evt: any, index: number, controlName: string) {
    const form = this.getFormByControlName(controlName, 'edit');

    const popover = await this.popoverController.create({
      arrow: true,
      showBackdrop: false,
      component: EditModalComponent,
      event: evt,
      translucent: true,
      componentProps: {
        valid: form.valid,
        isEditing: this.isEditingIndexes[controlName] === index,
      },
    });
    await popover.present();

    const { role } = await popover.onDidDismiss();
    switch (role) {
      case 'update':
        return this.updateEditedByIndex(index, controlName);
      case 'edit':
        return this.editControlByIndex(index, controlName);
      case 'cancel':
        this.isEditingIndexes[controlName] = undefined;
        this.canSave = true;
        return;
      case 'delete':
        return this.deleteByIndex(index, controlName);
    }
  }

  async openAddPopover(evt: any, index: string, controlName: string) {
    const form = this.getFormByControlName(controlName, 'add');

    const popover = await this.popoverController.create({
      arrow: true,
      showBackdrop: false,
      component: AddModalComponent,
      event: evt,
      translucent: true,
      componentProps: {
        valid: form.valid,
      },
    });
    await popover.present();

    const { role } = await popover.onDidDismiss();
    if (role === 'cancel') {
      this.isAddingIndexes[controlName] = false;
      this.canSave = false;
      return;
    }
    switch (controlName) {
      case 'price':
        return this.addNewPrice();
      case 'ingredients':
        return this.addNewIngredient();
      default:
        return this.addNewStringArray(controlName);
    }
  }

  addOptionChip(mode: 'add' | 'edit', value: string) {
    const form =
      mode === 'add' ? this.addIngredientsForm : this.editIngredientsForm;
    const control = this.mapValueToFormControl(value);
    const formArray = form.get('options') as FormArray;
    formArray.push(control);
  }

  removeOptionChip(mode: 'add' | 'edit', index: number) {
    const form =
      mode === 'add' ? this.addIngredientsForm : this.editIngredientsForm;
    const formArray = form.get('options') as FormArray;
    formArray.removeAt(index);
  }

  save() {
    if (this.editProductForm.valid) {
      const payload = this.editProductForm.value;
      const source$ = payload.id
        ? this.isAdmin
          ? this.productService.updateProduct({
              ...payload,
              rank: parseInt(payload.rank, 10),
            })
          : this.productService.updateProductUnits(
              payload.id,
              payload.unitsAvailable
            )
        : this.productService.createProduct({
            ...payload,
            rank: parseInt(payload.rank, 10),
          });
      source$.subscribe({
        next: (result) => {
          if (result.success && result.payload) {
            fireSuccess(
              payload,
              'O Produto',
              payload.id ? 'atualizado' : 'criado'
            );
            return this.modalController.dismiss();
          }
          fireError(payload, 'O Produto', payload.id ? 'atualizado' : 'criado');
        },
        error: (err) =>
          fireError(
            payload,
            'O Produto',
            payload.id ? 'atualizado' : 'criado',
            err
          ),
      });
    }
    this.editProductForm.markAllAsTouched();
  }

  changeCurrentUnit(id: string) {
    this.currentUnitId$.next(id);
  }

  imageHover(hovered: boolean) {
    this.imageHovered = hovered;
  }

  handleFileUpload() {
    this.fileInput.nativeElement.click();
  }

  handleFileInput(target?: any) {
    if (target) {
      const fileList = target.files;
      const file = fileList[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async (arg) => {
        if (!this.acceptedExtensions.includes(file.type)) {
          return fireToast(
            'Arquivo inválido',
            `Por favor, selecione uma imagem com extensão ${this.acceptedExtensions.join(
              ' ou '
            )}.`,
            'error'
          );
        }

        if (file.size > this.fileMaxSizeInBytes) {
          return fireToast(
            'Arquivo inválido',
            `Por favor, selecione uma imagem menos de ${Math.round(
              this.fileMaxSizeInBytes / 1048576
            )} Mb.`,
            'error'
          );
        }
        // validate file format
        // validate file size
        // create canvas for thumbnail
        this.imgSrc = reader.result as string;
        const thumbSrc = await resizeBase64Img(
          reader.result as string,
          file.type,
          248,
          230
        );

        this.uploadImage(reader.result as string, thumbSrc as string);
      };
      reader.onerror = (error) => {
        console.log('Error: ', error);
      };
    }
  }

  async uploadImage(imageDataUrl: string, thumbnailDataUrl: string) {
    const imageBlob = await (await fetch(imageDataUrl)).blob();
    const thumbnailBlob = await (await fetch(thumbnailDataUrl)).blob();

    this.productService
      .uploadImageAndThumbnail(imageBlob, thumbnailBlob)
      .subscribe(
        (
          event: HttpEvent<
            IResponse<
              { ext: string; name: string; url: string; type: string }[]
            >
          >
        ) => {
          switch (event.type) {
            case HttpEventType.Sent:
              this.displayProgressBar = true;
              break;
            case HttpEventType.UploadProgress:
              this.progress = Math.round(
                (event.loaded / (event.total as number)) * 100
              );
              break;
            case HttpEventType.Response:
              if (event.body.success) {
                fireToast(
                  'Imagem enviada com sucesso',
                  'Não esqueça de salvar para atualizar a imagem do produto',
                  'success'
                );
                const url = event.body.payload.find(
                  (r) => r.type === 'thumbnail'
                ).url;
                this.editProductForm.get('imageUrl').patchValue(url);
                return setTimeout(() => {
                  this.progress = 0;
                  this.displayProgressBar = false;
                }, 300);
              }
              fireToast('Erro no upload', 'Favor comunicar', 'error');
              this.displayProgressBar = false;
          }
        }
      );
  }

  async exclude() {
    const { isConfirmed } = await Swal.fire({
      title: 'Tem certeza que deseja excluir esse produto do banco de dados?',
      icon: 'question',
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não',
      heightAuto: false,
    });
    if (isConfirmed) {
      const payload = this.editProductForm.value;
      this.productService.deleteProduct(payload.id).subscribe({
        next: (result) => {
          if (result.success && result.payload) {
            fireSuccess(result.payload, 'O Produto', 'deletado');
            return this.modalController.dismiss();
          }
          fireError(payload, 'O Produto', 'deletado');
        },
        error: (err) => fireError(payload, 'O Produto', 'deletado', err),
      });
    }
  }

  // getFormErrors(form: FormGroup) {
  //   for (const key in form.controls) {
  //     if (Object.prototype.hasOwnProperty.call(form.controls, key)) {
  //       console.log(key, form.controls[key].valid, form.controls[key].errors);
  //     }
  //   }
  // }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

const resizeBase64Img = (
  base64: string, // image base64
  type: string, // image mime type
  newWidth: number, // new image width
  newHeight: number // new image height
) =>
  new Promise<string>((resolve, reject) => {
    // rejects promise if no document variable
    if (!document) {
      reject('document is not available');
    }
    // create a brand new canvas element
    const canvasElement = document.createElement('canvas');
    // set its width
    canvasElement.width = newWidth;
    // and height
    canvasElement.height = newHeight;
    // adjust style for width
    canvasElement.style.width = newWidth.toString() + 'px';
    // and height
    canvasElement.style.height = newHeight.toString() + 'px';
    // get canvas context
    const context = canvasElement.getContext('2d') as CanvasRenderingContext2D;
    // create nem image
    const img = new Image();
    // set it's source from base64 argument
    img.src = base64;
    // when it loads
    img.onload = () => {
      // get the imgRatioType: landscape or portrait
      const imgRatioType =
        img.width / img.height >= 1 ? 'landscape' : 'portrait'; // 1 > landscape ; 1 < portrait

      // if image is a portrait, then what's limiting it's sWidth is the img width. Otherwise it'll be the img height
      const sWidth = imgRatioType === 'portrait' ? img.width : img.height;
      // if image is a landscape, then what's limiting it's sHeight is the img height. Otherwise it'll be the img width
      const sHeight = imgRatioType === 'landscape' ? img.height : img.width;
      // if landscape, the image width is equals to 2 equal sx plus the sWidth. Otherwise, it should be 0.
      const sx = imgRatioType === 'landscape' ? (img.width - sWidth) / 2 : 0;
      // if portrait, the image height is equals to 2 equal sy plus the sHeight. Otherwise, it should be 0.
      const sy = imgRatioType === 'portrait' ? (img.height - sHeight) / 2 : 0;

      // destination canvas should have no space on dx
      const dx = 0;
      // neither on dy
      const dy = 0;
      // it's dWidth should be equal to the canvas width
      const dWidth = canvasElement.width;
      // and the same applies to dHeight with height
      const dHeight = canvasElement.height;
      // use clearRect for setting pixels in a clear rectangle with defined width and height
      context.clearRect(0, 0, canvasElement.width, canvasElement.height);
      // then draws the image
      context.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

      // resolve the promise with canvas toDataUrl method using type argument for mime
      resolve(canvasElement.toDataURL(type));
    };
    img.onerror = (err) => {
      // if image fails to load, rejects promise
      reject(err);
    };
  });
