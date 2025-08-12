import { profile } from 'console';
import Joi from 'joi';
//user
export const userRegister= Joi.object({
    name:Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    profileUrl:Joi.string()
});

export const userlogin = Joi.object({
    email: Joi.string().email().required(),
    password:Joi.string().min(6).required(),
});
//quizz
export const quizzCreate = Joi.object({
    title: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(1000),
    
})

