import { RequestHandler } from "express";
import z, { ZodError } from "zod"
import { listZodErrors } from "../helpers/listZodErrors";
import CitaModel, { Cita, TipoCaso } from "../models/Cita";
import SesionesModel, { Sesiones } from "../models/Sesiones";

enum TipoSession {
    AP = "asesoria_psicopedagogica",
    OP = "orientacion_pedagogica",
    OV = "orientacion_vocacional",
    AA = "apoyo_academico",
    AS = "apoyo_socioemocional",
}


const now = new Date();
const CitaSchema = z.object({
    estudiante: z.string({ required_error: 'El estudiante es obligatorio' }),

    fecha: z.date().min(now).default(now),

    tipoCaso: z.nativeEnum(TipoCaso, { errorMap: () => ({ message: 'Tipo de caso es invalido' }) }),

    psicologosColaboradores: z.string().array().optional(),

    psicologoPrincipal: z.string(),

    sesion: z.boolean().default(true)
})

const SesionSchema = z.object({
    estudiante: z.string().min(1, "Debes agregar un estudiante"),

    citas: z.string().array().optional(),

    fecha: z.date().min(new Date()),

    tipo: z.nativeEnum(TipoSession, { errorMap: () => ({ message: "El tipo de session no es valido" }) }),

    psicologo: z.string()
})


const createSession: RequestHandler = async (req, res) => {
    try {
        if (!req.body?.citas) {
            return res.status(400).json({ message: "Debes agregar el campo 'citas' " })
        }

        if(!req.body.citas.length){
            return res.status(400).json({ message: "Debes agregar al menos una cita" })     
        }

        const safeCitas: Array<Cita> = req.body?.citas.map((cita: Cita) => {
            return new CitaModel(CitaSchema.parse({
                ...cita,
                fecha: new Date(cita.fecha)
            }))
        })

        const citas = await CitaModel.insertMany(safeCitas)

        const citasId = citas.map(cita => cita.id)

        const session = await new SesionesModel(SesionSchema.parse({
            ...req.body,
            citas: citasId,
            psicologo: req.psicologo?.id,
            fecha: new Date(req.body.fecha)
        })).save();

        return res.status(201).json(session)
    } catch (error) {
        console.log(error);
        if (error instanceof ZodError) return res.status(400).json(listZodErrors(error))

        return res.status(400).json(error)
    }
}
const deleteSession: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params
        const session = await SesionesModel.findOneAndDelete({
            _id: id,
            psicologo: req.psicologo?._id,
        })


        if (!session) {
            return res.status(404).json({ message: "Esa session no se a encontrado" })
        }

        await CitaModel.deleteMany({ _id: { $in: session?.citas } });


        return res.status(200).json({ message: "La session ha sido eliminada !" })
    } catch (error) {
        console.log(error);
        if (error instanceof ZodError) return res.status(400).json(listZodErrors(error))

        return res.status(400).json(error)
    }
}
const getSession: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const sesiones = await SesionesModel.findOne({
            _id: id,
            psicologo: req.psicologo?.id
        })
        if (!sesiones) {
            return res.status(404).json({ message: "No se han encontrado sesiones !" })
        }
        return res.status(200).json(sesiones);
    } catch (error) {
        if (error instanceof ZodError) return res.status(400).json(listZodErrors(error))

        return res.status(400).json(error)
    }
}
const getAllSession: RequestHandler = async (req, res) => {
    try {
        const sesiones = await SesionesModel.findOne({ psicologo: req.psicologo?._id })
        if (!sesiones) {
            return res.status(404).json({ message: "No se han encontrado sesiones !" })
        }
    } catch (error) {
        if (error instanceof ZodError) return res.status(400).json(listZodErrors(error))

        return res.status(400).json(error)
    }
}

export {
    createSession,
    deleteSession,
    getSession,
    getAllSession
}