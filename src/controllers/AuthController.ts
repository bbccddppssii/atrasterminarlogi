import { RequestHandler } from "express";
import jwt from "jsonwebtoken"
import EstudianteModel from "../models/Estudiante";
import PsicologoModel from "../models/Psicologos";
import UserModel from "../models/User";
const loginAuth: RequestHandler = async (req, res) => {
    try {
        const { email: emailUser, password: passwordUser } = req.body;

        //User is admin
        let user = await UserModel.findOne({ email: emailUser }).select("-__v -createdAt -updatedAt");
        let isUser = await user?.comprobarPassword(passwordUser);


        //Check if is Psicologo
        if (!isUser) {
            user = await PsicologoModel.findOne({ email: emailUser }).select("-__v -createdAt -updatedAt")
            isUser = await user?.comprobarPassword(passwordUser)
        }


        if(!isUser){
            user = await EstudianteModel.findOne({ email: emailUser }).select("-__v -createdAt -updatedAt")
            isUser = await user?.comprobarPassword(passwordUser)
        }


        if (isUser) {

            const token = jwt.sign({
                id: user?.id
            }, process.env.JWT_SECRET as string)

            return res.status(200).json({
                user,
                token
            });
        }

        return res.status(400).send({
            message: "Email o login no es correcto"
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: "Error en la autentificacion"
        });
    }
}

const getPerfil: RequestHandler = async (req, res) => {
    try {
        const { accessToken } = req.body;

        const {id: idUser} : {id: string} = jwt.verify(accessToken, process.env.JWT_SECRET as string) as {id: string}

        console.log(idUser);

        const isPsicologo = await PsicologoModel.findById(idUser)
        if (isPsicologo?._id) {
            return res.status(200).json(isPsicologo)
        }


        const isEstudiante = await EstudianteModel.findById(idUser)
        if (isEstudiante?._id) {
            return res.status(200).json(isEstudiante)
        }


        const isAdmin = await UserModel.findById(idUser);
        if (isAdmin?._id) {
            return res.status(200).json(isAdmin)
        }


        return res.status(403).json({ message: "No estas autenticado" })
    } catch (error) {
        console.log(error)
        return res.status(403).json({ message: "No estas autenticado o el token es invalido" })
    }
}

export {
    loginAuth,
    getPerfil
}