import { UserDocument } from '../models/UserModel';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}
