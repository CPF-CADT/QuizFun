import { profile } from 'console';
import Joi from 'joi';
export const validateUserResgister = (register:{name:string,email:string,password:string,profileUrl:string})=>{
const userRegister= Joi.object({
    name:Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    profileUrl:Joi.string()
});
return userRegister.validate(register);
}
export const validateUserLogin = (login:{email:string,password:string})=>{
 const userlogin = Joi.object({
    email: Joi.string().email().required(),
    password:Joi.string().min(6).required(),
})
return userlogin.validate(login);
}
