import { JwtPayload } from 'jwt-decode';
import { UserRole } from '../enums/user-role.enum';

export interface IDecodedToken extends JwtPayload {
  exp: number;
  iat: number;
  id: string;
  role: UserRole;
  unitsOwnedIds: string[];
}
