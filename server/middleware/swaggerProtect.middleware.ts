import { Request, Response, NextFunction } from 'express';
import basicAuth, { BasicAuthResult } from 'basic-auth';

export function swaggerPasswordProtect(req: Request, res: Response, next: NextFunction): void {
  const user: BasicAuthResult | undefined = basicAuth(req);

  const username = process.env.SWAGGER_USER;
  const password = process.env.SWAGGER_PASSWORD;

  if (!user || user.name !== username || user.pass !== password) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Access"');
    res.status(401).send('Access denied');
    return;
  }

  next();
}
