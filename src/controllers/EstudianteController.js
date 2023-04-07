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
exports.getAllEstudiante = exports.getEstudianteCodigo = exports.getEstudiante = exports.deleteEstudiante = exports.updateEstudiante = exports.createEstudiante = void 0;
const zod_1 = __importStar(require("zod"));
const Estudiante_1 = __importDefault(require("../models/Estudiante"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const transformUpdateEstudiante_1 = __importDefault(require("../helpers/transformUpdateEstudiante"));
const EstudianteSchema = zod_1.default.object({
    nombre: zod_1.default.string({ required_error: "El nombre es obligatorio" }).min(1, "El Nombre no puede estar vacio"),
    apellido: zod_1.default.string({ required_error: "El apellido es obligatorio" }).min(1, "El apellido no puede estar vacio"),
    email: zod_1.default.string({ required_error: "El email es obligatorio" }).min(1, "El Email esta vacio").email("Debe ser un email").regex(/@cdb.edu.sv\s*$/, "El correo no es de la institucion"),
    password: zod_1.default.string().min(6, "La contraseña debe ser minimo de 6 caracteres").optional(),
    role: zod_1.default.enum(["estudiante"], {
        errorMap: () => { return { message: "El rol no existe o debe ser 'estudiante'" }; }
    }),
    datosPersonales: zod_1.default.object({
        nivelBachiller: zod_1.default.number().min(0, 'Nivel de bachiller invalido').max(3, 'Nivel de bachiller invalido'),
        especialidad: zod_1.default.enum(['DSW', 'ATPS', 'ECA', 'EMCA', 'MNTO', 'DG'], {
            errorMap: () => { return { message: `La especialidad no es valida  ['DSW', 'ATPS', 'ECA', 'EMCA', 'MNTO', 'DG']` }; }
        }).optional(),
        seccion: zod_1.default.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'], {
            errorMap: () => { return { message: 'La seccion no es valida' }; }
        }),
        codigo: zod_1.default.number({ required_error: "El codigo es obligatorio" }).min(20000000, "El codigo es invalido").max(99999999, "El codigo es invalido")
    }, { required_error: "Datos personales son obligatorios" })
}).refine(({ datosPersonales }) => datosPersonales.nivelBachiller > 0 ? !!datosPersonales.especialidad : true, { message: 'La especialidad es necesaria si esta en un nivel de bachillerato' });
const UpdateEstudianteSchema = zod_1.default.object({
    nombre: zod_1.default.string({ required_error: "El nombre es obligatorio" }).min(1, "El Nombre no puede estar vacio").optional(),
    apellido: zod_1.default.string({ required_error: "El apellido es obligatorio" }).min(1, "El apellido no puede estar vacio").optional(),
    email: zod_1.default.string({ required_error: "El email es obligatorio" }).min(1, "El Email esta vacio").email("Debe ser un email").regex(/@cdb.edu.sv\s*$/, "El correo no es de la institucion").optional(),
    password: zod_1.default.string({ required_error: "La contraseña es obligatoria" }).min(6, "La contraseña debe ser minimo de 6 caracteres").optional(),
    role: zod_1.default.enum(["estudiante"], {
        errorMap: () => { return { message: "El rol no existe o debe ser 'estudiante'  " }; }
    }).optional(),
    datosPersonales: zod_1.default.object({
        nivelBachiller: zod_1.default.number().min(0, 'Nivel de bachiller invalido').max(3, 'Nivel de bachiller invalido').optional(),
        especialidad: zod_1.default.enum(['DSW', 'ATPS', 'ECA', 'EMCA', 'MNTO', 'DG'], {
            errorMap: () => { return { message: 'La especialidad no es valida' }; }
        }).optional(),
        seccion: zod_1.default.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'], {
            errorMap: () => { return { message: 'La seccion no es valida' }; }
        }).optional(),
        codigo: zod_1.default.number({ required_error: "El codigo es obligatorio" }).min(1, "El codigo no puede estar vacio").max(99999999, "El codigo es invalido").optional()
    }, { required_error: "Datos personales son obligatorios" }).optional()
}).refine((schema) => schema.datosPersonales?.nivelBachiller && schema.datosPersonales?.nivelBachiller > 0 ? !!schema.datosPersonales?.especialidad : true, { message: 'La especialidad es necesaria si esta en un nivel de bachillerato' });
const createEstudiante = async (req, res) => {
    try {
        const newEstudiante = new Estudiante_1.default(EstudianteSchema.parse(req.body));
        if (await Estudiante_1.default.findOne({ $or: [{ email: newEstudiante.email }, { 'datosPersonales.codigo': newEstudiante.datosPersonales.codigo }] })) {
            return res.status(400).json({ message: "Ya existe un estudiante con ese correo electronico o ese codigo !" });
        }
        const estudiantePassword = Math.random().toString(36).slice(-8);
        //Hashing password (Was Very Buggy with @pre hooks)
        newEstudiante.password = await bcrypt_1.default.hash(estudiantePassword, 10);
        newEstudiante.defaultPassword = estudiantePassword;
        await newEstudiante.save();
        return res.status(200).json({
            newEstudiante,
        });
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
exports.createEstudiante = createEstudiante;
const updateEstudiante = async (req, res) => {
    try {
        const { id } = req.params;
        const isUpdated = UpdateEstudianteSchema.parse(req.body);
        if (isUpdated.password) {
            isUpdated.password = await bcrypt_1.default.hash(isUpdated.password, 10);
        }
        const sameEmailOrCode = await Estudiante_1.default.findOne({ $and: [{ _id: { $ne: id } }, { $or: [{ email: isUpdated.email }, { 'datosPersonales.codigo': isUpdated?.datosPersonales?.codigo }] }] });
        if ((isUpdated.email || isUpdated.datosPersonales?.codigo) && sameEmailOrCode) {
            return res.status(400).json({ message: "Ya existe un estudiante con ese correo electronico o ese codigo !" });
        }
        const payload = (0, transformUpdateEstudiante_1.default)(isUpdated);
        const updated = await Estudiante_1.default.findByIdAndUpdate(id, payload, { new: true });
        return res.status(200).json(updated);
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
exports.updateEstudiante = updateEstudiante;
const deleteEstudiante = async (req, res) => {
    try {
        const { id } = req.params;
        const estudiante = await Estudiante_1.default.findByIdAndDelete(id);
        if (!estudiante) {
            return res.status(404).json({ message: "Estudiante no encontrado !" });
        }
        return res.status(200).json({ message: "Estudiante eliminado !" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
};
exports.deleteEstudiante = deleteEstudiante;
const getEstudiante = async (req, res) => {
    try {
        const { id } = req.params;
        const estudiante = await Estudiante_1.default.findById(id);
        if (!estudiante) {
            return res.status(404).json({ message: "Estudiante no encontrado" });
        }
        return res.status(200).json(estudiante);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
};
exports.getEstudiante = getEstudiante;
const getEstudianteCodigo = async (req, res) => {
    try {
        const { codigo } = req.params;
        const estudiante = await Estudiante_1.default.findOne({ "datosPersonales.codigo": codigo });
        console.log(codigo);
        console.log(estudiante);
        if (!estudiante) {
            return res.status(404).json({ message: "Estudiante no encontrado" });
        }
        return res.status(200).json(estudiante);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
};
exports.getEstudianteCodigo = getEstudianteCodigo;
const getAllEstudiante = async (req, res) => {
    try {
        const estudiante = await Estudiante_1.default.find();
        if (!estudiante) {
            return res.status(404).json({ message: "No hay ningun estudiante" });
        }
        return res.status(200).json(estudiante);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
};
exports.getAllEstudiante = getAllEstudiante;
