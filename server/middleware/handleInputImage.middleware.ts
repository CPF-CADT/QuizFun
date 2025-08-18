import { Request,Response,NextFunction } from "express";
export function validateImageType(req:Request,res:Response,next:NextFunction){
    let {category }= req.body
    if(!category){ return res.status(400).json({message: 'can not catch type'});}
    if(category !== 'quizz_image' && category !=='user_profilePic'){category='N/A';}
    req.body.category=  category;
    next()
}