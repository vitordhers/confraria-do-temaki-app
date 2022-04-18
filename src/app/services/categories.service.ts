import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ICategory } from '../shared/interfaces/category.interface';
import { IResponse } from '../shared/interfaces/response.interface';
import { Category } from '../shared/models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  currentUnitId$ = new BehaviorSubject<string>(
    'a8293d39-01bc-4f43-bb80-2f0c528422d1'
  );

  endpoint = `${environment.apiUrl}/categories`;

  categories$ = new BehaviorSubject<Category[]>([]);

  constructor(private http: HttpClient) {
    this.init();
  }

  init() {
    this.http
      .get<IResponse<ICategory[]>>(this.endpoint)
      .pipe(
        map((res) => {
          if (res.success && res.payload) {
            return res.payload.map(
              (c) => new Category(c.id, c.name, c.slug, c.rank, c.description)
            );
          }
          return [];
        })
      )
      .subscribe((categories) => {
        this.categories$.next(
          categories.sort((a, b) => (a?.rank || 9999) - (b?.rank || 9999))
        );
      });
  }

  createCategory(payload: Partial<ICategory>) {
    return this.http
      .post<IResponse<ICategory>>(this.endpoint, { ...payload })
      .pipe(
        tap((response) => {
          if (!response.success || !response.payload) {
            return;
          }
          const newCategory = response.payload;
          const currentCategories = [...this.categories$.value, newCategory];
          this.categories$.next(
            currentCategories.sort((a, b) => a?.rank || 9999 - b?.rank || 9999)
          );
        })
      );
  }

  updateCategory(payload: Partial<ICategory>) {
    return this.http
      .put<IResponse<ICategory>>(this.endpoint, { ...payload })
      .pipe(
        tap((response) => {
          if (!response.success || response.payload) {
            return;
          }
          const updatedCategory = response.payload;
          const currentCategories = [...this.categories$.value];
          const updatedCategoryIndex = currentCategories.findIndex(
            (c) => c.id === updatedCategory.id
          );

          if (updatedCategoryIndex === -1) {
            return;
          }

          currentCategories.splice(updatedCategoryIndex, 1, updatedCategory);
          this.categories$.next(
            currentCategories.sort(
              (a, b) => (a?.rank || 9999) - (b?.rank || 9999)
            )
          );
        })
      );
  }

  deleteCategory(id: string) {
    return this.http.delete<IResponse<void>>(`${this.endpoint}/${id}`).pipe(
      tap((response) => {
        if (!response.success) {
          return;
        }
        const currentCategories = [...this.categories$.value];
        const deletedCategoryIndex = currentCategories.findIndex(
          (c) => c.id === id
        );

        if (deletedCategoryIndex === -1) {
          return;
        }

        currentCategories.splice(deletedCategoryIndex, 1);
        this.categories$.next(
          currentCategories.sort(
            (a, b) => (a?.rank || 9999) - (b?.rank || 9999)
          )
        );
      })
    );
  }
}
