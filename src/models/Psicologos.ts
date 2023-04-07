import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose"
import { User } from "./User"

@modelOptions({schemaOptions: {_id: false}})
class DatosPersonalesPsicologo{
    @prop({enum: ["bachillerato"]})
    nivelAcademico: string
}

@modelOptions({options: {allowMixed: 0}})
class Psicologo extends User {
  @prop()
  datosPersonales: DatosPersonalesPsicologo
}



const PsicologoModel = getModelForClass(Psicologo,{schemaOptions: {timestamps: true}})
export{Psicologo}
export default PsicologoModel