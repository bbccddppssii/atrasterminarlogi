"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdminAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const checkAdminAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            const jwtToken = req.headers.authorization.split(" ")[1];
            token = jsonwebtoken_1.default.verify(jwtToken, process.env.JWT_SECRET);
            const admin = await User_1.default.findById(token.id).where("role").equals("admin");
            if (admin)
                return next();
        }
        catch (error) {
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
exports.checkAdminAuth = checkAdminAuth;
