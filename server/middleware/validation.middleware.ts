import { error } from "console";
import { Response,Request,NextFunction,RequestHandler } from "express";
import Joi from "joi";
export function validationBody(schema: Joi.ObjectSchema): RequestHandler{
    return async (req:Request,res:Response,next:NextFunction) => {
        try {
            const value= await schema.validateAsync(req.body,{
                abortEarly: false, 
                 stripUnknown: true,
            });
            req.body=value;
            next();
        } catch (err) {
            const details= ( err as any).details || [];
            return res.status(400).json({
                message:'Validation failed',
                error: details.map((a:any)=>a.message)
            });
            
        };
    };
}