import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose"
import bcrypt from "bcrypt"
@modelOptions({options: {allowMixed: 0}})
class User {

    @prop({ trim: true, required: true })
    nombre: string

    @prop({ trim: true, required: true })
    apellido: string

    @prop({ trim: true, required: true })
    email: string

    @prop({ trim: true, required: true })
    password: string

    @prop({ required: true })
    datosPersonales: object

    @prop({ enum: ['admin', 'psicologo', 'maestro', 'estudiante'], required: true })
    role: string

    public async comprobarPassword(password: string) {
        console.log(await bcrypt.compare(password, this.password))
        return await bcrypt.compare(password, this.password)
    }
}

const UserModel = getModelForClass(User, { schemaOptions: { timestamps: true } })
export default UserModel
export {User}