import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, map, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IResponse } from '../shared/interfaces/response.interface';
import { IUser } from '../shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  resourceUrl = `${environment.apiUrl}/users`;
  // users$ = new BehaviorSubject<IUser[]>([]);
  usersState: IUser[];

  constructor(private http: HttpClient) {}

  get users$() {
    return this.usersState && this.usersState.length
      ? of(this.usersState)
      : this.getUsers();
  }

  createUser(user: IUser) {
    return this.http.post<IResponse<IUser>>(this.resourceUrl, user).pipe(
      tap((response) => {
        if (response.success && response.payload) {
          this.usersState.push(response.payload);
        }
      })
    );
  }

  getUsers() {
    return this.http.get<IResponse<IUser[]>>(this.resourceUrl).pipe(
      map((res) => (res.success ? res.payload : [])),
      tap((users) => {
        this.usersState = users;
      })
    );
  }

  async getUser(id: number) {
    try {
      const source$ = this.http
        .get<IResponse<IUser>>(`${this.resourceUrl}/${id}`)
        .pipe(map((res) => (res.success ? res.payload : undefined)));
      return await firstValueFrom(source$);
    } catch (e) {
      console.log(e);
      return undefined;
    }
  }

  updateUser(user: Partial<IUser>) {
    return this.http.patch<IResponse<IUser>>(this.resourceUrl, user).pipe(
      tap((result) => {
        if (result.success && result.payload) {
          const updatedUser = result.payload;
          const index = this.usersState.findIndex(
            (u) => u.id === updatedUser.id
          );
          if (index !== -1) {
            this.usersState.splice(index, 1, updatedUser);
          }
        }
      })
    );
  }

  updateUserPassword(
    id: string,
    { password, recaptcha }: { password: string; recaptcha: string }
  ) {
    return this.http.patch<IResponse<void>>(`${this.resourceUrl}/${id}`, {
      password,
      recaptcha,
    });
  }

  deleteUser(id: string) {
    return this.http.delete<IResponse<void>>(`${this.resourceUrl}/${id}`).pipe(
      tap((result) => {
        if (result.success) {
          const index = this.usersState.findIndex((u) => u.id === id);
          if (index !== -1) {
            this.usersState.splice(index, 1);
          }
        }
      })
    );
  }
}
