import { BeAnObject, IObjectWithTypegooseFunction } from "@typegoose/typegoose/lib/types";
import { RequestHandler } from "express";
import moment from "moment";
import mongoose, { isValidObjectId, ObjectId } from "mongoose";
import { isAwaitExpression } from "typescript";
import z, { string, ZodError } from "zod"
import { listZodErrors } from "../helpers/listZodErrors";
import CitaModel, { Cita, TipoCaso } from "../models/Cita";
import EstudianteModel from "../models/Estudiante";
import PsicologoModel from "../models/Psicologos";

type CitasPsicologos = (mongoose.Document<any, BeAnObject, Cita> & Cita & IObjectWithTypegooseFunction & {
    _id: mongoose.Types.ObjectId;
})[]

interface CitaDate {
    id: mongoose.Types.ObjectId,
    fecha: Date
}
interface CitaValidate {
    error: boolean,
    message: string,
    citaId?: mongoose.Types.ObjectId
}
interface DeleteCitasBody{
    citas: Array<string>
}
interface PostPoneObject {
    citas: string[],
    dias: string | number,
    horas: string | number,
    minutos: string | number,
    segundos: string | number,
}

const MINUTES = 30
const now = new Date();

const CitaSchema = z.object({
    estudiante: z.string({ required_error: 'El estudiante es obligatorio' }),

    fecha: z.date().min(now).default(now),

    tipoCaso: z.nativeEnum(TipoCaso, { errorMap: () => ({ message: 'Tipo de caso es invalido' }) }),

    psicologosColaboradores: z.string().array().optional(),

    psicologoPrincipal: z.string(),

    sesion: z.boolean().default(false)
})

const UpdateCitaSchema = z.object({
    estudiante: z.string({ required_error: 'El estudiante es obligatorio' }).optional(),

    fecha: z.date().min(now).default(now).optional(),

    tipoCaso: z.nativeEnum(TipoCaso, { errorMap: () => ({ message: 'Tipo de caso es invalido' }) }).optional(),

    psicologosColaboradores: z.string().array().optional(),

    sesion: z.boolean().default(false).optional()
})


//TODO Avisar a los estudiantes acerca de esta cita Notificacion
const createCita: RequestHandler = async (req, res) => {
    try {
        const cita = new CitaModel(CitaSchema.parse({
            ...req.body,
            fecha: new Date(req.body.fecha || Date.now()),
            psicologoPrincipal: req.psicologo?._id.toString()
        }))

        //Check if there are valid ObjectID if not avoid a query in DB
        if (cita.psicologosColaboradores.length) {
            //Search if there are any Psicologos in DB

            const psicologosCita = await PsicologoModel.find({ id: { $in: cita.psicologosColaboradores } }).select("-password -createdAt -updatedAt -__v")

            if (!psicologosCita.length) return res.status(400).json({ message: 'No existen ningun psiclogo colaborador valido' })

        }

        if (!cita.estudiante) {
            return res.status(400).json({ message: "Estudiante no valido" })
        }

        //Search if the student exist in DB
        const estudianteCita = await EstudianteModel.findById(cita.estudiante).select("-password -createdAt -updatedAt -__v")
        if (!estudianteCita?._id) return res.status(400).json({ message: 'Psicologo o estudiante no valido' })

        //Check if there isnt any date that has the same hour
        const now = new Date(cita.fecha);
        const dateHour = now.getHours()

        //Imagine 9:00
        //Before: 8:30 (9:00 - 30 Minutes)
        //After: 9:30 (9:00 + 30 Minutes)
        const beforeTime = new Date(now.getTime() - MINUTES * 60 * 1000);
        const afterTime = new Date(now.getTime() + MINUTES * 60 * 1000);

        if (dateHour < 7 || dateHour > 16) {
            return res.status(400).json({ message: "La fecha esta fuera del horario !" })
        }

        const sameRangeHourCita = await CitaModel.find({
            fecha: {
                $gte: beforeTime,
                $lt: afterTime,
            }
        })
        if (sameRangeHourCita.length) {
            return res.status(400).json({ message: `Ya hay una cita en ese rango de tiempo ${MINUTES}` })
        }


        //If there are not errors save
        await cita.save();

        await cita.populate("estudiante");

        console.log(cita);

        return res.json(cita);
    } catch (error) {
        console.log(error)
        if (error instanceof ZodError) {
            return res.status(500).json(listZodErrors(error));
        }
    }
}
const updateCita: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params
        const cita = req.body.fecha ? UpdateCitaSchema.parse({ ...req.body, fecha: new Date(req.body.fecha) }) : UpdateCitaSchema.parse(req.body)


        if (cita.psicologosColaboradores?.length) {

            if (!cita.psicologosColaboradores?.every(psicologoID => isValidObjectId(psicologoID))) return res.status(400).json({ message: "Psicologo o Psicologos no son validos" })

            //Search if there are any Psicologos in DB
            const psicologosCita = await PsicologoModel.find({ id: { $in: cita.psicologosColaboradores } }).select("-password -createdAt -updatedAt -__v")


            if (psicologosCita.length == 0) return res.status(400).json({ message: 'Psicologo no valido' })

        }

        if (cita.estudiante) {
            if (!isValidObjectId(cita.estudiante)) return res.status(400).json({ message: "Estudiante no valido" })

            //Search if the student exist in DB
            const estudianteCita = await EstudianteModel.findById(cita.estudiante).select("-password -createdAt -updatedAt -__v")

            if (!estudianteCita) return res.status(400).json({ message: 'Estudiante no valido' })
        }

        //Check if there isnt any date that has the same hour
        if (cita.fecha) {
            const now = new Date(cita.fecha);

            const beforeTime = new Date(now.getTime() - MINUTES * 60 * 1000);
            const afterTime = new Date(now.getTime() + MINUTES * 60 * 1000);

            const dateHour = now.getHours()


            if (dateHour < 7 || dateHour > 16) {
                return res.status(400).json({ message: "La fecha esta fuera del horario !" })
            }

            const sameRangeHourCita = await CitaModel.find({
                fecha: {
                    $gte: beforeTime,
                    $lt: afterTime,
                }
            })

            if (sameRangeHourCita.length) {
                return res.status(400).json({ message: 'Ya hay una cita para esa fecha y hora' })
            }

        }


        const citaFounded = await CitaModel.findOneAndUpdate({
            id,
            $or: [
                { psicologoPrincipal: req.psicologo?.id },
                { psicologosColaboradores: { $in: [req.psicologo?.id] } }
            ]
        }, cita, { new: true })

        if (!citaFounded) {
            return res.status(404).json({ message: "No se a encontrado esa cita" })
        }

        return res.json(citaFounded);

    } catch (error) {
        console.log(error)
        if (error instanceof ZodError) {
            return res.status(500).json(listZodErrors(error));
        }
    }
}
const deleteCita: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params

        const cita = await CitaModel.findOneAndDelete({
            _id: id,
            psicologoPrincipal: req.psicologo?._id
        })

        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada para eliminar" })
        }

        return res.status(200).json({ message: "Cita eliminada !" })
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
}

const getAllMyCitas: RequestHandler = async (req, res) => {
    try {
        const { daily } = req.query;
        console.log(daily);

        const now = new Date();
        const nowLimit = new Date(now.setHours(24))

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
        }

        const citas = await CitaModel.find(query).populate("estudiante")

        if (!citas) {
            return res.status(404).json({ message: "No se han encotrado citas !" })
        }
        return res.status(200).json(citas)
    } catch (error) {
        console.log(error)
        return res.status(400).json(error)
    }
}

const getCita: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params

        const cita = await CitaModel.findOne({
            _id: id,
            $or: [{ psicologoPrincipal: req.psicologo?.id }, { psicologosColaboradores: { $in: [req.psicologo?.id] } }]
        })

        if (!cita) {
            return res.status(404).json({ message: "No se han encotrado citas !" })
        }

        return res.status(200).json(cita)
    } catch (error) {
        console.log(error)
        return res.status(400).json(error)
    }
}

const validateCitas = async (fechas: Array<CitaDate>, citas: CitasPsicologos): Promise<CitaValidate> => {
    let citaID;

    //Check if some date is not avaible in the schedule
    const notDateAvaible = fechas.some(fechaCita => {
        const fechaHour = new Date(fechaCita.fecha).getHours();
        if (fechaHour < 7 || fechaHour > 16) {
            return true
        }
    })

    if (notDateAvaible) return { error: true, message: "Hay una cita " }

    //Check if one date from the array (fechas) is making conflicts in the schedule
    const sameDateFechasRange = fechas.some(citaFecha => {


        return citas.some(scheduleCita => {

            const now = new Date(scheduleCita.fecha);


            const beforeTime = new Date(now.getTime() - MINUTES * 60 * 1000);
            const afterTime = new Date(now.getTime() + MINUTES * 60 * 1000);

            if (citaFecha.fecha >= beforeTime && citaFecha.fecha < afterTime && scheduleCita.id !== citaFecha.id) {
                citaID = scheduleCita.id;
                return true
            }
            return false
        })

    })

    if (sameDateFechasRange) {
        return {
            error: true, message: "Hay una fecha que choca con el calendario !", citaId: citaID
        }
    }

    return { error: false, message: "" }
};

const postPoneCitas: RequestHandler = async (req, res) => {
    try {

        const { citas, dias, horas, minutos, segundos }: PostPoneObject = req.body

        if (!citas || !citas.length) {
            return res.status(404).json({ message: "Debes agregar citas para posponerlas" })
        }

        if (!citas.every((cita) => isValidObjectId(cita))) {
            return res.status(400).json({ message: "Verifique que todas las citas sean validas" })
        }

        const allMyCitas = await CitaModel.find({
            $or: [
                { psicologoPrincipal: req.psicologo?._id },
                { psicologosColaboradores: { $in: [req.psicologo?._id] } }
            ]
        })

        const allCitasID = allMyCitas.map(cita => cita.id);
        const isAnyIdCita = citas.some(id => !allCitasID.includes(id))


        if (!allMyCitas.length || isAnyIdCita) {
            return res.status(404).json({ message: "No se encontro ninguna cita para posponer" })
        }

        const citasFecha = allMyCitas.filter(cita => citas.includes(cita.id)).map(cita => ({
            fecha: new Date(
                moment(cita.fecha)
                    .add(dias || 0, 'days')
                    .add(horas || 0, 'hours')
                    .add(minutos || 0, 'minutes')
                    .add(segundos || 0, 'seconds').toString()
            ),
            id: cita.id
        }))

        const validateDate = await validateCitas(citasFecha, allMyCitas)

        if (validateDate.error) {
            return res.status(400).json(validateDate);
        }

        const update = citasFecha.map(cita => ({
            updateOne: {
                filter: { _id: cita.id },
                update: { $set: { fecha: cita.fecha } }
            }
        }))

        await CitaModel.bulkWrite(update);
        const updatedCitas = await CitaModel.find({
            _id: { $in: citas },
            $or: [
                { psicologoPrincipal: req.psicologo?._id },
                { psicologosColaboradores: { $in: [req.psicologo?._id] } }
            ]
        })
        return res.status(200).json(updatedCitas)
    } catch (error) {
        console.log(error);
        return res.status(404).json(error)
    }
}

const deleteMultipleCitas: RequestHandler = async(req,res)=>{
    try {
        const {citas} : DeleteCitasBody  = req.body
        
        //Check if citas id are valid
        const validIDs = citas.every((id)=> isValidObjectId(id))
        
        if(!validIDs){
            return res.status(400).json({message: "Alguna cita no tiene un id valido"})
        }


        await CitaModel.deleteMany({
            _id:{$in: citas}
        });

        return res.status(200).json({message: "Citas eliminadas !"})
    } catch (error) {
        console.log(error)
        return res.status(400).json(error)
    }
}

export {
    createCita,
    updateCita,
    deleteCita,
    getAllMyCitas,
    getCita,
    postPoneCitas,
    deleteMultipleCitas
}