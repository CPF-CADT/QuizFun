import * as multer from 'multer';
interface UserPayload {
  id: string;
  role?: string;
  email?: string;
  name?:string;
}

interface ValidatedData {
  body?: any;
  params?: any;
  query?: any;
}
declare global {
  namespace Express {
    interface Request {
      file?: multer.File;
      files?: multer.File[] | { [fieldname: string]: multer.File[] };
      user?: UserPayload;
      validated?: ValidatedData;
    }
  }
}
