"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => (req, res, next) => {
    let combinedErrorDetails = [];
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
exports.validate = validate;
