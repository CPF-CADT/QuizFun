import * as multer from 'multer';

declare global {
  namespace Express {
    interface Request {
      file?: multer.File;
      files?: multer.File[] | { [fieldname: string]: multer.File[] };
    }
  }
}
