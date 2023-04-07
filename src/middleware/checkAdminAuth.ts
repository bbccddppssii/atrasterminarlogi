import { RequestHandler } from "express";
import jwt from "jsonwebtoken"
import User from "../models/User";


interface TokenJWT extends jwt.JwtPayload{
    id: string
}

export const checkAdminAuth: RequestHandler = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {

            const jwtToken = req.headers.authorization.split(" ")[1];
            token = jwt.verify(jwtToken, process.env.JWT_SECRET as string) as TokenJWT;

            const admin = await User.findById(token.id).where("role").equals("admin");

            if (admin) return next();

        } catch (error) {
            return res.status(404).json({
                msg: "hubo un error",
            });
        }
    }

    return res.status(400).json({
        status: "error",
        msg: "No estas autenticado como administrador !",
    });
};