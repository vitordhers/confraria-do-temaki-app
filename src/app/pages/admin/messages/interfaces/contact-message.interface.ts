export class IMessageContact {
  id: string;
  name: string;
  email: string;
  message: string;
  sentAt: number; // timestamp
  readAt?: number; // timestamp
}
