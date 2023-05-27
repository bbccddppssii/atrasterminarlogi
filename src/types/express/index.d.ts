import { Psicologo } from "../../models/Psicologos";
import { BeAnObject } from "@typegoose/typegoose/lib/types";
import { Document } from "mongoose";
import { IObjectWithTypegooseFunction } from "@typegoose/typegoose/lib/types";
import { Types } from "mongoose";
import { Estudiante } from "../../models/Estudiante";
declare global{
    namespace Express{
       export interface Request{
            psicologo?: (Document<any, BeAnObject, Psicologo> & Psicologo & IObjectWithTypegooseFunction & {
                _id: Types.ObjectId;
            }) | null,
            estudiante?: (Document<any, BeAnObject, Estudiante> & Estudiante & IObjectWithTypegooseFunction & {
                _id: Types.ObjectId;
            }) | null
        }
    }
}
