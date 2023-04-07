"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPerfil = exports.loginAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Estudiante_1 = __importDefault(require("../models/Estudiante"));
const Psicologos_1 = __importDefault(require("../models/Psicologos"));
const User_1 = __importDefault(require("../models/User"));
const loginAuth = async (req, res) => {
    try {
        const { email: emailUser, password: passwordUser } = req.body;
        //User is admin
        let user = await User_1.default.findOne({ email: emailUser }).select("-__v -createdAt -updatedAt");
        let isUser = await user?.comprobarPassword(passwordUser);
        //Check if is Psicologo
        if (!isUser) {
            user = await Psicologos_1.default.findOne({ email: emailUser }).select("-__v -createdAt -updatedAt");
            isUser = await user?.comprobarPassword(passwordUser);
        }
        if (!isUser) {
            user = await Estudiante_1.default.findOne({ email: emailUser }).select("-__v -createdAt -updatedAt");
            isUser = await user?.comprobarPassword(passwordUser);
        }
        if (isUser) {
            const token = jsonwebtoken_1.default.sign({
                id: user?.id
            }, process.env.JWT_SECRET);
            return res.status(200).json({
                user,
                token
            });
        }
        return res.status(400).send({
            message: "Email o login no es correcto"
        });
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({
            message: "Error en la autentificacion"
        });
    }
};
exports.loginAuth = loginAuth;
const getPerfil = async (req, res) => {
    try {
        const { accessToken } = req.body;
        const { id: idUser } = jsonwebtoken_1.default.verify(accessToken, process.env.JWT_SECRET);
        console.log(idUser);
        const isPsicologo = await Psicologos_1.default.findById(idUser);
        if (isPsicologo?._id) {
            return res.status(200).json(isPsicologo);
        }
        const isEstudiante = await Estudiante_1.default.findById(idUser);
        if (isEstudiante?._id) {
            return res.status(200).json(isEstudiante);
        }
        const isAdmin = await User_1.default.findById(idUser);
        if (isAdmin?._id) {
            return res.status(200).json(isAdmin);
        }
        return res.status(403).json({ message: "No estas autenticado" });
    }
    catch (error) {
        console.log(error);
        return res.status(403).json({ message: "No estas autenticado o el token es invalido" });
    }
};
exports.getPerfil = getPerfil;
