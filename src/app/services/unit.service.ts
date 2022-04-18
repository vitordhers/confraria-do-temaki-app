import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IResponse } from '../shared/interfaces/response.interface';
import { IUnit } from '../shared/interfaces/unit.interface';
import { Unit } from '../shared/models/unit.model';

@Injectable({
  providedIn: 'root',
})
export class UnitService {
  currentUnitId$ = new BehaviorSubject<string>(
    'a8293d39-01bc-4f43-bb80-2f0c528422d1'
  );

  units$ = new BehaviorSubject<Unit[]>([]);
  resourceUrl = `${environment.apiUrl}/units`;

  constructor(private http: HttpClient) {
    this.init();
  }

  init() {
    this.http
      .get<IResponse<IUnit[]>>(this.resourceUrl)
      .pipe(
        map((res) => {
          if (res.success && res.payload) {
            return res.payload.map(
              (u) =>
                new Unit(
                  u.id,
                  u.name,
                  u.location,
                  u.address,
                  u.telephone,
                  u.workingHours,
                  u.lat,
                  u.lng,
                  u?.whatsapp
                )
            );
          }
          return [];
        })
      )
      .subscribe((units) => {
        this.units$.next(units);
      });
  }

  createUnit(data: Partial<IUnit>) {
    return this.http.post<IResponse<IUnit>>(`${this.resourceUrl}`, data).pipe(
      tap((response) => {
        if (response.success && response.payload) {
          const u = response.payload;
          const newUnit = new Unit(
            u.id,
            u.name,
            u.location,
            u.address,
            u.telephone,
            u.workingHours,
            u.lat,
            u.lng,
            u?.whatsapp
          );
          const updatedUnits = [...this.units$.value, newUnit];
          this.units$.next(updatedUnits);
        }
      })
    );
  }

  updateUnit(data: Partial<IUnit>) {
    return this.http.patch<IResponse<IUnit>>(`${this.resourceUrl}`, data).pipe(
      tap((response) => {
        if (response.success && response.payload) {
          const u = response.payload;
          const updatedUnits = [...this.units$.value];
          const index = updatedUnits.findIndex((unit) => unit.id === u.id);
          if (index !== -1) {
            const newUnit = new Unit(
              u.id,
              u.name,
              u.location,
              u.address,
              u.telephone,
              u.workingHours,
              u.lat,
              u.lng,
              u?.whatsapp
            );
            updatedUnits.splice(index, 1, newUnit);
            this.units$.next(updatedUnits);
          }
        }
      })
    );
  }

  deleteUnit(id: string) {
    return this.http.delete<IResponse<void>>(`${this.resourceUrl}/${id}`).pipe(
      tap((response) => {
        if (response.success) {
          const updatedUnits = [...this.units$.value];
          const index = updatedUnits.findIndex((unit) => unit.id === id);
          if (index !== -1) {
            updatedUnits.splice(index, 1);
            this.units$.next(updatedUnits);
          }
        }
      })
    );
  }
}
