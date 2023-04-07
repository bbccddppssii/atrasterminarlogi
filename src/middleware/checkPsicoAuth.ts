
import { NextFunction, RequestHandler,Response,Request } from "express";
import jwt from "jsonwebtoken"
import { Schema } from "zod";
import PsicologoModel, { Psicologo } from "../models/Psicologos";


interface TokenJWT extends jwt.JwtPayload{
    id: string
}

export const checkPsicoAuth : RequestHandler = async (req,res,next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {

            const jwtToken = req.headers.authorization.split(" ")[1];
            token = jwt.verify(jwtToken, process.env.JWT_SECRET as string) as TokenJWT;

            const psicologo = await PsicologoModel.findById(token.id).where("role").equals("psicologo").select("-password -createdAt -updatedAt -__v");
            
            req.psicologo = psicologo
            if (psicologo) return next();

        } catch (error) {
            console.log(error)
            return res.status(404).json({
                msg: "hubo un error",
            });
        }
    }

    return res.status(400).json({
        status: "error",
        msg: "No estas autenticado como psicologo !",
    });
};