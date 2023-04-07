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
exports.deleteMultipleCitas = exports.postPoneCitas = exports.getCita = exports.getAllMyCitas = exports.deleteCita = exports.updateCita = exports.createCita = void 0;
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = require("mongoose");
const zod_1 = __importStar(require("zod"));
const listZodErrors_1 = require("../helpers/listZodErrors");
const Cita_1 = __importStar(require("../models/Cita"));
const Estudiante_1 = __importDefault(require("../models/Estudiante"));
const Psicologos_1 = __importDefault(require("../models/Psicologos"));
const MINUTES = 30;
const now = new Date();
const CitaSchema = zod_1.default.object({
    estudiante: zod_1.default.string({ required_error: 'El estudiante es obligatorio' }),
    fecha: zod_1.default.date().min(now).default(now),
    tipoCaso: zod_1.default.nativeEnum(Cita_1.TipoCaso, { errorMap: () => ({ message: 'Tipo de caso es invalido' }) }),
    psicologosColaboradores: zod_1.default.string().array().optional(),
    psicologoPrincipal: zod_1.default.string(),
    sesion: zod_1.default.boolean().default(false)
});
const UpdateCitaSchema = zod_1.default.object({
    estudiante: zod_1.default.string({ required_error: 'El estudiante es obligatorio' }).optional(),
    fecha: zod_1.default.date().min(now).default(now).optional(),
    tipoCaso: zod_1.default.nativeEnum(Cita_1.TipoCaso, { errorMap: () => ({ message: 'Tipo de caso es invalido' }) }).optional(),
    psicologosColaboradores: zod_1.default.string().array().optional(),
    sesion: zod_1.default.boolean().default(false).optional()
});
//TODO Avisar a los estudiantes acerca de esta cita Notificacion
const createCita = async (req, res) => {
    try {
        const cita = new Cita_1.default(CitaSchema.parse({
            ...req.body,
            fecha: new Date(req.body.fecha || Date.now()),
            psicologoPrincipal: req.psicologo?._id.toString()
        }));
        //Check if there are valid ObjectID if not avoid a query in DB
        if (cita.psicologosColaboradores.length) {
            //Search if there are any Psicologos in DB
            const psicologosCita = await Psicologos_1.default.find({ id: { $in: cita.psicologosColaboradores } }).select("-password -createdAt -updatedAt -__v");
            if (!psicologosCita.length)
                return res.status(400).json({ message: 'No existen ningun psiclogo colaborador valido' });
        }
        if (!cita.estudiante) {
            return res.status(400).json({ message: "Estudiante no valido" });
        }
        //Search if the student exist in DB
        const estudianteCita = await Estudiante_1.default.findById(cita.estudiante).select("-password -createdAt -updatedAt -__v");
        if (!estudianteCita?._id)
            return res.status(400).json({ message: 'Psicologo o estudiante no valido' });
        //Check if there isnt any date that has the same hour
        const now = new Date(cita.fecha);
        const dateHour = now.getHours();
        //Imagine 9:00
        //Before: 8:30 (9:00 - 30 Minutes)
        //After: 9:30 (9:00 + 30 Minutes)
        const beforeTime = new Date(now.getTime() - MINUTES * 60 * 1000);
        const afterTime = new Date(now.getTime() + MINUTES * 60 * 1000);
        if (dateHour < 7 || dateHour > 16) {
            return res.status(400).json({ message: "La fecha esta fuera del horario !" });
        }
        const sameRangeHourCita = await Cita_1.default.find({
            fecha: {
                $gte: beforeTime,
                $lt: afterTime,
            }
        });
        if (sameRangeHourCita.length) {
            return res.status(400).json({ message: `Ya hay una cita en ese rango de tiempo ${MINUTES}` });
        }
        //If there are not errors save
        await cita.save();
        return res.json(cita);
    }
    catch (error) {
        console.log(error);
        if (error instanceof zod_1.ZodError) {
            return res.status(500).json((0, listZodErrors_1.listZodErrors)(error));
        }
    }
};
exports.createCita = createCita;
const updateCita = async (req, res) => {
    try {
        const { id } = req.params;
        const cita = req.body.fecha ? UpdateCitaSchema.parse({ ...req.body, fecha: new Date(req.body.fecha) }) : UpdateCitaSchema.parse(req.body);
        if (cita.psicologosColaboradores?.length) {
            if (!cita.psicologosColaboradores?.every(psicologoID => (0, mongoose_1.isValidObjectId)(psicologoID)))
                return res.status(400).json({ message: "Psicologo o Psicologos no son validos" });
            //Search if there are any Psicologos in DB
            const psicologosCita = await Psicologos_1.default.find({ id: { $in: cita.psicologosColaboradores } }).select("-password -createdAt -updatedAt -__v");
            if (psicologosCita.length == 0)
                return res.status(400).json({ message: 'Psicologo no valido' });
        }
        if (cita.estudiante) {
            if (!(0, mongoose_1.isValidObjectId)(cita.estudiante))
                return res.status(400).json({ message: "Estudiante no valido" });
            //Search if the student exist in DB
            const estudianteCita = await Estudiante_1.default.findById(cita.estudiante).select("-password -createdAt -updatedAt -__v");
            if (!estudianteCita)
                return res.status(400).json({ message: 'Estudiante no valido' });
        }
        //Check if there isnt any date that has the same hour
        if (cita.fecha) {
            const now = new Date(cita.fecha);
            const beforeTime = new Date(now.getTime() - MINUTES * 60 * 1000);
            const afterTime = new Date(now.getTime() + MINUTES * 60 * 1000);
            const dateHour = now.getHours();
            if (dateHour < 7 || dateHour > 16) {
                return res.status(400).json({ message: "La fecha esta fuera del horario !" });
            }
            const sameRangeHourCita = await Cita_1.default.find({
                fecha: {
                    $gte: beforeTime,
                    $lt: afterTime,
                }
            });
            if (sameRangeHourCita.length) {
                return res.status(400).json({ message: 'Ya hay una cita para esa fecha y hora' });
            }
        }
        const citaFounded = await Cita_1.default.findOneAndUpdate({
            id,
            $or: [
                { psicologoPrincipal: req.psicologo?.id },
                { psicologosColaboradores: { $in: [req.psicologo?.id] } }
            ]
        }, cita, { new: true });
        if (!citaFounded) {
            return res.status(404).json({ message: "No se a encontrado esa cita" });
        }
        return res.json(citaFounded);
    }
    catch (error) {
        console.log(error);
        if (error instanceof zod_1.ZodError) {
            return res.status(500).json((0, listZodErrors_1.listZodErrors)(error));
        }
    }
};
exports.updateCita = updateCita;
const deleteCita = async (req, res) => {
    try {
        const { id } = req.params;
        const cita = await Cita_1.default.findOneAndDelete({
            _id: id,
            psicologoPrincipal: req.psicologo?._id
        });
        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada para eliminar" });
        }
        return res.status(200).json({ message: "Cita eliminada !" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
};
exports.deleteCita = deleteCita;
const getAllMyCitas = async (req, res) => {
    try {
        const { daily } = req.query;
        console.log(daily);
        const now = new Date();
        const nowLimit = new Date(now.setHours(24));
        const query = daily ? {
            $or: [
                { psicologoPrincipal: req.psicologo?.id },
                { psicologosColaboradores: { $in: [req.psicologo?.id] } }
            ],
            fecha: {
                $gte: now,
                $lte: nowLimit
            }
        } : {
            $or: [{ psicologoPrincipal: req.psicologo?.id }, { psicologosColaboradores: { $in: [req.psicologo?.id] } }]
        };
        const citas = await Cita_1.default.find(query);
        if (!citas) {
            return res.status(404).json({ message: "No se han encotrado citas !" });
        }
        return res.status(200).json(citas);
    }
    catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
};
exports.getAllMyCitas = getAllMyCitas;
const getCita = async (req, res) => {
    try {
        const { id } = req.params;
        const cita = await Cita_1.default.findOne({
            _id: id,
            $or: [{ psicologoPrincipal: req.psicologo?.id }, { psicologosColaboradores: { $in: [req.psicologo?.id] } }]
        });
        if (!cita) {
            return res.status(404).json({ message: "No se han encotrado citas !" });
        }
        return res.status(200).json(cita);
    }
    catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
};
exports.getCita = getCita;
const validateCitas = async (fechas, citas) => {
    let citaID;
    //Check if some date is not avaible in the schedule
    const notDateAvaible = fechas.some(fechaCita => {
        const fechaHour = new Date(fechaCita.fecha).getHours();
        if (fechaHour < 7 || fechaHour > 16) {
            return true;
        }
    });
    if (notDateAvaible)
        return { error: true, message: "Hay una cita " };
    //Check if one date from the array (fechas) is making conflicts in the schedule
    const sameDateFechasRange = fechas.some(citaFecha => {
        return citas.some(scheduleCita => {
            const now = new Date(scheduleCita.fecha);
            const beforeTime = new Date(now.getTime() - MINUTES * 60 * 1000);
            const afterTime = new Date(now.getTime() + MINUTES * 60 * 1000);
            if (citaFecha.fecha >= beforeTime && citaFecha.fecha < afterTime && scheduleCita.id !== citaFecha.id) {
                citaID = scheduleCita.id;
                return true;
            }
            return false;
        });
    });
    if (sameDateFechasRange) {
        return {
            error: true, message: "Hay una fecha que choca con el calendario !", citaId: citaID
        };
    }
    return { error: false, message: "" };
};
const postPoneCitas = async (req, res) => {
    try {
        const { citas, dias, horas, minutos, segundos } = req.body;
        if (!citas || !citas.length) {
            return res.status(404).json({ message: "Debes agregar citas para posponerlas" });
        }
        if (!citas.every((cita) => (0, mongoose_1.isValidObjectId)(cita))) {
            return res.status(400).json({ message: "Verifique que todas las citas sean validas" });
        }
        const allMyCitas = await Cita_1.default.find({
            $or: [
                { psicologoPrincipal: req.psicologo?._id },
                { psicologosColaboradores: { $in: [req.psicologo?._id] } }
            ]
        });
        const allCitasID = allMyCitas.map(cita => cita.id);
        const isAnyIdCita = citas.some(id => !allCitasID.includes(id));
        if (!allMyCitas.length || isAnyIdCita) {
            return res.status(404).json({ message: "No se encontro ninguna cita para posponer" });
        }
        const citasFecha = allMyCitas.filter(cita => citas.includes(cita.id)).map(cita => ({
            fecha: new Date((0, moment_1.default)(cita.fecha)
                .add(dias || 0, 'days')
                .add(horas || 0, 'hours')
                .add(minutos || 0, 'minutes')
                .add(segundos || 0, 'seconds').toString()),
            id: cita.id
        }));
        const validateDate = await validateCitas(citasFecha, allMyCitas);
        if (validateDate.error) {
            return res.status(400).json(validateDate);
        }
        const update = citasFecha.map(cita => ({
            updateOne: {
                filter: { _id: cita.id },
                update: { $set: { fecha: cita.fecha } }
            }
        }));
        await Cita_1.default.bulkWrite(update);
        const updatedCitas = await Cita_1.default.find({
            _id: { $in: citas },
            $or: [
                { psicologoPrincipal: req.psicologo?._id },
                { psicologosColaboradores: { $in: [req.psicologo?._id] } }
            ]
        });
        return res.status(200).json(updatedCitas);
    }
    catch (error) {
        console.log(error);
        return res.status(404).json(error);
    }
};
exports.postPoneCitas = postPoneCitas;
const deleteMultipleCitas = async (req, res) => {
    try {
        const { citas } = req.body;
        //Check if citas id are valid
        const validIDs = citas.every((id) => (0, mongoose_1.isValidObjectId)(id));
        if (!validIDs) {
            return res.status(400).json({ message: "Alguna cita no tiene un id valido" });
        }
        await Cita_1.default.deleteMany({
            _id: { $in: citas }
        });
        return res.status(200).json({ message: "Citas eliminadas !" });
    }
    catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
};
exports.deleteMultipleCitas = deleteMultipleCitas;
