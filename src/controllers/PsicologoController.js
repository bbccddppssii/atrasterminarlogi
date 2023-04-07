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
exports.getPsicologosColaboradores = exports.getAllPsicologos = exports.getPsicologo = exports.deletePsicologo = exports.updatePsicologo = exports.createPsicologo = void 0;
const zod_1 = __importStar(require("zod"));
const Psicologos_1 = __importDefault(require("../models/Psicologos"));
const bcrypt_1 = __importDefault(require("bcrypt"));
var NivelAcademico;
(function (NivelAcademico) {
    NivelAcademico["Bachillerato"] = "bachillerato";
})(NivelAcademico || (NivelAcademico = {}));
const PsicologoSchema = zod_1.default.object({
    nombre: zod_1.default.string({ required_error: "El nombre es obligatorio" }).min(1, "El Nombre no puede estar vacio"),
    apellido: zod_1.default.string({ required_error: "El apellido es obligatorio" }).min(1, "El apellido no puede estar vacio"),
    email: zod_1.default.string({ required_error: "El email es obligatorio" }).min(1, "El Email esta vacio").email("Debe ser un email").regex(/@cdb.edu.sv\s*$/, "El correo no es de la institucion"),
    password: zod_1.default.string({ required_error: "La contraseña es obligatoria" }).min(6, "La contraseña debe ser minimo de 6 caracteres"),
    role: zod_1.default.enum(["psicologo"], {
        errorMap: () => { return { message: "El rol no existe o debe ser 'psicologo'" }; }
    }),
    datosPersonales: zod_1.default.object({
        nivelAcademico: zod_1.default.nativeEnum(NivelAcademico, {
            errorMap: () => { return { message: 'El nivel academico no es valido' }; }
        })
    }, { required_error: "Datos personales son obligatorios" })
});
const UpdatePsicologoSchema = zod_1.default.object({
    nombre: zod_1.default.string({ required_error: "El nombre es obligatorio" }).min(1, "El Nombre no puede estar vacio").optional(),
    apellido: zod_1.default.string({ required_error: "El apellido es obligatorio" }).min(1, "El apellido no puede estar vacio").optional(),
    email: zod_1.default.string({ required_error: "El email es obligatorio" }).min(1, "El Email esta vacio").email("Debe ser un email").regex(/@cdb.edu.sv\s*$/, "El correo no es de la institucion").optional(),
    password: zod_1.default.string({ required_error: "La contraseña es obligatoria" }).min(6, "La contraseña debe ser minimo de 6 caracteres").optional(),
    role: zod_1.default.enum(["psicologo"], {
        errorMap: () => { return { message: "El rol no existe o debe ser 'psicologo'" }; }
    }).optional(),
    datosPersonales: zod_1.default.object({
        nivelAcademico: zod_1.default.nativeEnum(NivelAcademico, {
            errorMap: () => { return { message: 'El nivel academico no es valido' }; }
        }).optional()
    }).optional()
});
const createPsicologo = async (req, res) => {
    try {
        const newPsicologo = new Psicologos_1.default(PsicologoSchema.parse(req.body));
        if (await Psicologos_1.default.findOne({ email: newPsicologo.email })) {
            return res.status(400).json({ message: "Ya existe un psicologo con ese correo electronico !" });
        }
        //Hashing password (Was Very Buggy with @pre hooks)
        newPsicologo.password = await bcrypt_1.default.hash(newPsicologo.password, 10);
        await newPsicologo.save();
        return res.status(200).json(newPsicologo);
    }
    catch (error) {
        console.log(error);
        if (error instanceof zod_1.ZodError) {
            const listError = error.issues.map((e) => {
                return {
                    path: e.path,
                    message: e.message,
                };
            });
            return res.status(500).json(listError);
        }
    }
};
exports.createPsicologo = createPsicologo;
const updatePsicologo = async (req, res) => {
    try {
        const { id } = req.params;
        const isUpdated = UpdatePsicologoSchema.parse(req.body);
        if (isUpdated.password) {
            isUpdated.password = await bcrypt_1.default.hash(isUpdated.password, 10);
        }
        const updatePsicologo = await Psicologos_1.default.findByIdAndUpdate(id, isUpdated, { new: true });
        return res.status(200).json(updatePsicologo);
    }
    catch (error) {
        console.log(error);
        if (error instanceof zod_1.ZodError) {
            const listError = error.issues.map((e) => {
                return {
                    path: e.path,
                    message: e.message,
                };
            });
            return res.status(500).json(listError);
        }
    }
};
exports.updatePsicologo = updatePsicologo;
const deletePsicologo = async (req, res) => {
    try {
        const { id } = req.params;
        const psicologo = await Psicologos_1.default.findByIdAndDelete(id);
        if (!psicologo) {
            return res.status(404).json({ message: "Psicologo no encontrado !" });
        }
        return res.status(200).json({ message: "Psicologo eliminado !" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
};
exports.deletePsicologo = deletePsicologo;
const getPsicologo = async (req, res) => {
    try {
        const { id } = req.params;
        const psicologo = await Psicologos_1.default.findById(id);
        if (!psicologo) {
            return res.status(404).json({ message: "Psicologo no encontrado" });
        }
        return res.status(200).json(psicologo);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
};
exports.getPsicologo = getPsicologo;
const getAllPsicologos = async (req, res) => {
    try {
        const psicologo = await Psicologos_1.default.find().select("-password -createdAt -updatedAt -__v -role -datosPersonales._id");
        if (!psicologo) {
            return res.status(404).json({ message: "No hay ningun psicologo" });
        }
        return res.status(200).json(psicologo);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
};
exports.getAllPsicologos = getAllPsicologos;
const getPsicologosColaboradores = async (req, res) => {
    try {
        const psicologo = await Psicologos_1.default.find().where("_id").ne(req.psicologo?._id).select("-password -createdAt -updatedAt -__v -role -datosPersonales._id");
        if (!psicologo) {
            return res.status(404).json({ message: "No hay ningun psicologo" });
        }
        return res.status(200).json(psicologo);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
};
exports.getPsicologosColaboradores = getPsicologosColaboradores;
