import mongoose from "mongoose";
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import UserModel from "./src/models/User";
dotenv.config();

mongoose.connect(process.env.MONGOURI as string)


interface Admin{
    email: string,
    password: string,
    nombre: string,
    apellido: string,
    datosPersonales: object,
    role: string,
}

const newAdmin = {
    email: "correo@correo.com",
    password: "123",
    nombre: "Admin",
    apellido: "Psicologia",
    datosPersonales: {

    },
    role: 'admin',
}

const createNewAdmin = async (newAdmin: Admin)=>{
   newAdmin.password = await bcrypt.hash(newAdmin.password, 10);
   const admin = await UserModel.create(newAdmin)
   console.log("Admin Creado")
   console.log(admin)
}

createNewAdmin(newAdmin);