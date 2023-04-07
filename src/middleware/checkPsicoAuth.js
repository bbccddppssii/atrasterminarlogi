"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPsicoAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Psicologos_1 = __importDefault(require("../models/Psicologos"));
const checkPsicoAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            const jwtToken = req.headers.authorization.split(" ")[1];
            token = jsonwebtoken_1.default.verify(jwtToken, process.env.JWT_SECRET);
            const psicologo = await Psicologos_1.default.findById(token.id).where("role").equals("psicologo").select("-password -createdAt -updatedAt -__v");
            req.psicologo = psicologo;
            if (psicologo)
                return next();
        }
        catch (error) {
            console.log(error);
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
exports.checkPsicoAuth = checkPsicoAuth;
