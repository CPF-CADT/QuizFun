import { Request, Response, NextFunction } from 'express';

import { config } from '../config/config';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errHandle = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({
        message: err.message || 'Internal Server Error',
        stack: config.nodeEnv === 'production' ? undefined : err.stack
    });
};
