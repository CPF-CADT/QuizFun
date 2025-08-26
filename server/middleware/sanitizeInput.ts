import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
        return xss(value.trim());
    }
    if (Array.isArray(value)) {
        return value.map(item => sanitizeValue(item));
    }
    if (typeof value === 'object' && value !== null) {
        const sanitizedObject: { [key: string]: any } = {};
        for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                sanitizedObject[key] = sanitizeValue(value[key]);
            }
        }
        return sanitizedObject;
    }
    return value;
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
    if (req.body) req.body = sanitizeValue(req.body);
    if (req.query) req.query = sanitizeValue(req.query);
    if (req.params) req.params = sanitizeValue(req.params);
    if (req.user) req.user = sanitizeValue(req.user);

    next();
};