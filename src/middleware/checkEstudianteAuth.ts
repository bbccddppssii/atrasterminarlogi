import { RequestHandler} from "express";
import jwt from "jsonwebtoken"
import EstudianteModel from "../models/Estudiante";


interface TokenJWT extends jwt.JwtPayload{
    id: string
}

export const checkEstudianteAuth : RequestHandler = async (req,res,next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {

            const jwtToken = req.headers.authorization.split(" ")[1];
            token = jwt.verify(jwtToken, process.env.JWT_SECRET as string) as TokenJWT;

            const estudiante = await EstudianteModel.findById(token.id).select("-password -createdAt -updatedAt -__v");
            
            req.estudiante = estudiante
            if (estudiante) return next();

        } catch (error) {
            console.log(error)
            return res.status(404).json({
                msg: "hubo un error",
            });
        }
    }

    return res.status(400).json({
        status: "error",
        msg: "No estas autenticado como estudiante !",
    });
};