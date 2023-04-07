import { getModelForClass, post, pre, prop, Ref } from "@typegoose/typegoose";
import CitaModel, { Cita } from "./Cita";
import { Estudiante } from "./Estudiante";
import { Psicologo } from "./Psicologos";

class Sesiones{
    @prop({ref: ()=> Estudiante, required: true})
    estudiante: Ref<Estudiante>

    @prop({ref: ()=> Cita})
    citas: Ref<Cita>[]
 
    @prop({trim: true, required: true, enum: ["asesoria_psicopedagogica","orientacion_pedagogica","orientacion_vocacional","apoyo_academico","apoyo_socioemocional"]})
    tipo: string

    @prop({ref: ()=> Psicologo, required: true})
    psicologo: Ref<Psicologo>
}

const SesionesModel = getModelForClass(Sesiones,{schemaOptions: {timestamps: true}})
export {Sesiones}
export default SesionesModel