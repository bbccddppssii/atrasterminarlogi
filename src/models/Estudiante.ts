import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose"
import { User } from "./User"

@modelOptions({schemaOptions: {_id: false}})
class DatosPersonalesEstudiante{
    @prop()
    codigo: number

    @prop({enum: ['A','B','C','D','E','F','G','H','I']})
    seccion: string

    @prop({enum: ['DSW','ATPS','ECA','EMCA','MNTO','DG']})
    especialidad: string

    @prop({enum: [0,1,2,3]})
    nivelBachiller: number


  }

@modelOptions({options: {allowMixed: 0}})
class Estudiante extends User {
  @prop()
  datosPersonales: DatosPersonalesEstudiante

  @prop()
  defaultPassword: string
}



const EstudianteModel = getModelForClass(Estudiante,{schemaOptions: {timestamps: true}})
export{Estudiante}
export default EstudianteModel