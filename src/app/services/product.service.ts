import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  tap,
  throwError,
} from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ProductDisplay } from '../shared/models/product-display.model';
import { IProduct } from '../shared/interfaces/product.interface';
import { IResponse } from '../shared/interfaces/response.interface';
import { ProductDetail } from '../shared/models/product-detail.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  products$ = new BehaviorSubject<IProduct[]>([]);
  productsLoaded$ = new BehaviorSubject(false);
  endpoint = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {
    this.init();
  }

  init() {
    this.http
      .get<IResponse<IProduct[]>>(this.endpoint)
      .pipe(
        map((res) => {
          if (res.success && res.payload?.length) {
            return res.payload;
          }
          return [];
        })
      )
      .subscribe((products) => {
        this.products$.next(
          products.sort((a, b) => (a?.rank || 9999) - (b?.rank || 9999))
        );
        this.productsLoaded$.next(true);
      });
  }

  public mapProductToProductDisplay({
    id,
    name,
    categoriesIds,
    unitsAvailable,
    price,
    slug,
    imageUrl,
    description,
    rank,
  }: IProduct) {
    return new ProductDisplay(
      id,
      name,
      categoriesIds,
      unitsAvailable,
      price,
      slug,
      imageUrl,
      description,
      rank
    );
  }

  public mapProductToProductDetail({
    id,
    name,
    categoriesIds,
    unitsAvailable,
    price,
    slug,
    imageUrl,
    description,
    attributes,
    requested,
    conditions,
    notes,
    ingredients,
    rank,
  }: IProduct) {
    return new ProductDetail(
      id,
      name,
      categoriesIds,
      unitsAvailable,
      price,
      slug,
      imageUrl,
      description,
      attributes,
      requested,
      conditions,
      notes,
      ingredients,
      rank
    );
  }

  createProduct(product: IProduct) {
    return this.http
      .post<IResponse<IProduct>>(this.endpoint, {
        ...product,
      })
      .pipe(
        tap((response) => {
          if (response.success && response.payload) {
            const currentProducts = [...this.products$.value];
            const newProduct = response.payload;
            currentProducts.push(newProduct);
            this.products$.next(
              currentProducts.sort(
                (a, b) => (a?.rank || 9999) - (b?.rank || 9999)
              )
            );
          }
        })
      );
  }

  updateProduct(product: IProduct) {
    return this.http
      .put<IResponse<IProduct>>(this.endpoint, {
        ...product,
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            const currentProducts = [...this.products$.value];
            const updatedProduct = response.payload;
            const index = currentProducts.findIndex(
              (p) => p.id === updatedProduct.id
            );
            if (index !== -1) {
              currentProducts.splice(index, 1, updatedProduct);
              this.products$.next(
                currentProducts.sort(
                  (a, b) => (a?.rank || 9999) - (b?.rank || 9999)
                )
              );
            }
          }
        })
      );
  }

  updateProductUnits(id: string, unitsAvailable: string[]) {
    return this.http
      .patch<IResponse<IProduct>>(`${this.endpoint}/units`, {
        id,
        unitsAvailable,
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            const currentProducts = [...this.products$.value];
            const updatedProduct = response.payload;
            const index = currentProducts.findIndex(
              (p) => p.id === updatedProduct.id
            );
            if (index !== -1) {
              currentProducts.splice(index, 1, updatedProduct);
              this.products$.next(
                currentProducts.sort(
                  (a, b) => (a?.rank || 9999) - (b?.rank || 9999)
                )
              );
            }
          }
        })
      );
  }

  deleteProduct(productId: string) {
    return this.http
      .delete<IResponse<IProduct>>(
        `${environment.apiUrl}/products/${productId}`
      )
      .pipe(
        tap((response) => {
          if (response.success) {
            const currentProducts = [...this.products$.value];
            const index = currentProducts.findIndex((p) => p.id === productId);
            if (index !== -1) {
              currentProducts.splice(index, 1);
              this.products$.next(
                currentProducts.sort(
                  (a, b) => (a?.rank || 9999) - (b?.rank || 9999)
                )
              );
            }
          }
        })
      );
  }

  uploadImageAndThumbnail(imageBlob: Blob, thumbnailBlob: Blob) {
    const formData = new FormData();
    formData.append('image', imageBlob);
    formData.append('thumbnail', thumbnailBlob);
    return this.http
      .post(`${environment.apiUrl}/products/upload-image`, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(catchError(this.errorMgmt));
  }

  errorMgmt(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
