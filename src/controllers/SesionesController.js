"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSession = exports.getSession = exports.deleteSession = exports.createSession = void 0;
const zod_1 = __importStar(require("zod"));
const listZodErrors_1 = require("../helpers/listZodErrors");
const Cita_1 = __importStar(require("../models/Cita"));
const Sesiones_1 = __importDefault(require("../models/Sesiones"));
var TipoSession;
(function (TipoSession) {
    TipoSession["AP"] = "asesoria_psicopedagogica";
    TipoSession["OP"] = "orientacion_pedagogica";
    TipoSession["OV"] = "orientacion_vocacional";
    TipoSession["AA"] = "apoyo_academico";
    TipoSession["AS"] = "apoyo_socioemocional";
})(TipoSession || (TipoSession = {}));
const now = new Date();
const CitaSchema = zod_1.default.object({
    estudiante: zod_1.default.string({ required_error: 'El estudiante es obligatorio' }),
    fecha: zod_1.default.date().min(now).default(now),
    tipoCaso: zod_1.default.nativeEnum(Cita_1.TipoCaso, { errorMap: () => ({ message: 'Tipo de caso es invalido' }) }),
    psicologosColaboradores: zod_1.default.string().array().optional(),
    psicologoPrincipal: zod_1.default.string(),
    sesion: zod_1.default.boolean().default(true)
});
const SesionSchema = zod_1.default.object({
    estudiante: zod_1.default.string().min(1, "Debes agregar un estudiante"),
    citas: zod_1.default.string().array().optional(),
    fecha: zod_1.default.date().min(new Date()),
    tipo: zod_1.default.nativeEnum(TipoSession, { errorMap: () => ({ message: "El tipo de session no es valido" }) }),
    psicologo: zod_1.default.string()
});
const createSession = async (req, res) => {
    try {
        if (!req.body?.citas) {
            return res.status(400).json({ message: "Debes agregar el campo 'citas' " });
        }
        if (!req.body.citas.length) {
            return res.status(400).json({ message: "Debes agregar al menos una cita" });
        }
        const safeCitas = req.body?.citas.map((cita) => {
            return new Cita_1.default(CitaSchema.parse({
                ...cita,
                fecha: new Date(cita.fecha)
            }));
        });
        const citas = await Cita_1.default.insertMany(safeCitas);
        const citasId = citas.map(cita => cita.id);
        const session = await new Sesiones_1.default(SesionSchema.parse({
            ...req.body,
            citas: citasId,
            psicologo: req.psicologo?.id,
            fecha: new Date(req.body.fecha)
        })).save();
        return res.status(201).json(session);
    }
    catch (error) {
        console.log(error);
        if (error instanceof zod_1.ZodError)
            return res.status(400).json((0, listZodErrors_1.listZodErrors)(error));
        return res.status(400).json(error);
    }
};
exports.createSession = createSession;
const deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        const session = await Sesiones_1.default.findOneAndDelete({
            _id: id,
            psicologo: req.psicologo?._id,
        });
        if (!session) {
            return res.status(404).json({ message: "Esa session no se a encontrado" });
        }
        await Cita_1.default.deleteMany({ _id: { $in: session?.citas } });
        return res.status(200).json({ message: "La session ha sido eliminada !" });
    }
    catch (error) {
        console.log(error);
        if (error instanceof zod_1.ZodError)
            return res.status(400).json((0, listZodErrors_1.listZodErrors)(error));
        return res.status(400).json(error);
    }
};
exports.deleteSession = deleteSession;
const getSession = async (req, res) => {
    try {
        const { id } = req.params;
        const sesiones = await Sesiones_1.default.findOne({
            _id: id,
            psicologo: req.psicologo?.id
        });
        if (!sesiones) {
            return res.status(404).json({ message: "No se han encontrado sesiones !" });
        }
        return res.status(200).json(sesiones);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError)
            return res.status(400).json((0, listZodErrors_1.listZodErrors)(error));
        return res.status(400).json(error);
    }
};
exports.getSession = getSession;
const getAllSession = async (req, res) => {
    try {
        const sesiones = await Sesiones_1.default.findOne({ psicologo: req.psicologo?._id });
        if (!sesiones) {
            return res.status(404).json({ message: "No se han encontrado sesiones !" });
        }
    }
    catch (error) {
        if (error instanceof zod_1.ZodError)
            return res.status(400).json((0, listZodErrors_1.listZodErrors)(error));
        return res.status(400).json(error);
    }
};
exports.getAllSession = getAllSession;
