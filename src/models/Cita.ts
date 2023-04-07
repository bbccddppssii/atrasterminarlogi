import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { Estudiante } from "./Estudiante";
import { Psicologo } from "./Psicologos";
enum TipoCaso{
    AC="academico",
    SE="socioemocional"
}
class Cita{
    @prop({ref: ()=> Estudiante, required:true})
    estudiante: Ref<Estudiante>

    @prop({required: true})
    fecha: Date

    @prop({enum: TipoCaso, required: true})
    tipoCaso: string

    @prop({ref:()=> Psicologo})
    psicologosColaboradores: Ref<Psicologo>[]

    @prop({ref: ()=>Psicologo, required: true})
    psicologoPrincipal: Ref<Psicologo>
    
    @prop({default: false})
    sesion: boolean
}

const CitaModel = getModelForClass(Cita, {schemaOptions: {timestamps: true}})
export {Cita, TipoCaso}
export default CitaModel