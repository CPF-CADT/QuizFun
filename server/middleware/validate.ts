import { Request, Response, NextFunction } from 'express'; // Use the standard Request type
import Joi from 'joi';

interface ValidationSchema {
    body?: Joi.ObjectSchema;
    params?: Joi.ObjectSchema;
    query?: Joi.ObjectSchema;
}

export const validate = (schema: ValidationSchema) => (req: Request, res: Response, next: NextFunction) => {
    let combinedErrorDetails: Joi.ValidationErrorItem[] = [];

    req.validated = {};

    if (schema.body) {
        const { error, value } = schema.body.validate(req.body, { abortEarly: false, stripUnknown: true, convert: true });
        if (error) {
            combinedErrorDetails.push(...error.details);
        }
        req.body = value;
        req.validated.body = value;
    }

    if (schema.params) {
        const { error, value } = schema.params.validate(req.params, { abortEarly: false, stripUnknown: true, convert: true });
        if (error) {
            combinedErrorDetails.push(...error.details);
        }
        req.validated.params = value;
    }

    if (schema.query) {
        const { error, value } = schema.query.validate(req.query, { abortEarly: false, stripUnknown: true, convert: true });
        if (error) {
            combinedErrorDetails.push(...error.details);
        }
        req.validated.query = value;
    }

    if (combinedErrorDetails.length > 0) {
        const errors = combinedErrorDetails.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, ''),
        }));
        return res.status(400).json({ message: 'Validation failed', errors });
    }

    return next();
};