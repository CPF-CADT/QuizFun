// import { Schema,model,Document, Types } from "mongoose";
// export interface IFileUpload extends Document{
//     title:string;
//     type: string;
//     url: string;
// }
// const FileUpload = new Schema<IFileUpload>({
//     title:{type:String,required:true},
//     url:{type:String,required:true},
//     type:{type:String,required:true},
//     category:{type:String,required:true}
// },{
//     timestamps:true,
//     collection:'FilesImageUpload'
// })
// export const FileUploadModel = model<IFileUpload>('FileUpload',FileUpload);