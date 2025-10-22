import 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      ip: string;
      roles: string[];
    }
  }
}
