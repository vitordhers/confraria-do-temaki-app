import { UserRole } from '../enums/user-role.enum';

export class User {
  constructor(
    public id: string,
    public role: UserRole,
    public tokenDuration: number,
    public accessToken: string,
    public unitsOwnedIds: string[],
    public refreshToken?: string
  ) {}
}
