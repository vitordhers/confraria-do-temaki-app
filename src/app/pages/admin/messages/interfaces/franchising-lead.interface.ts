import { InvestmentRange } from 'src/app/shared/enums/investment-range.enum';

export interface IFranchisingLead {
  id: string;
  name: string;
  email: string;
  celphone: string;
  telephone: string;
  city: string;
  state: string;
  investment: InvestmentRange;
  reference: string;
  message: string;
  sentAt: number; // timestamp
  readAt?: number; // timestamp
}
