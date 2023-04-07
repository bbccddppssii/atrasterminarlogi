import { RequestHandler } from "express";
import z, { ZodError } from "zod";
import Psicologo from "../models/Psicologos";
import bcrypt from "bcrypt";

enum NivelAcademico{
  Bachillerato='bachillerato'
}

const PsicologoSchema = z.object({
  nombre: z.string({ required_error: "El nombre es obligatorio" }).min(1, "El Nombre no puede estar vacio"),

  apellido: z.string({ required_error: "El apellido es obligatorio" }).min(1, "El apellido no puede estar vacio"),

  email: z.string({ required_error: "El email es obligatorio" }).min(1, "El Email esta vacio").email("Debe ser un email").regex(/@cdb.edu.sv\s*$/, "El correo no es de la institucion"),

  password: z.string({ required_error: "La contraseña es obligatoria" }).min(6, "La contraseña debe ser minimo de 6 caracteres"),

  role: z.enum(["psicologo"],{
    errorMap: ()=>{return {message: "El rol no existe o debe ser 'psicologo'"}}
  }),

  datosPersonales: z.object({
    
    nivelAcademico: z.nativeEnum(NivelAcademico,{
      errorMap: ()=>{return {message: 'El nivel academico no es valido'}}
    })

  },{required_error: "Datos personales son obligatorios"})
});

const UpdatePsicologoSchema = z.object({
  nombre: z.string({ required_error: "El nombre es obligatorio" }).min(1, "El Nombre no puede estar vacio").optional(),

  apellido: z.string({ required_error: "El apellido es obligatorio" }).min(1, "El apellido no puede estar vacio").optional(),

  email: z.string({ required_error: "El email es obligatorio" }).min(1, "El Email esta vacio").email("Debe ser un email").regex(/@cdb.edu.sv\s*$/, "El correo no es de la institucion").optional(),

  password: z.string({ required_error: "La contraseña es obligatoria" }).min(6, "La contraseña debe ser minimo de 6 caracteres").optional(),

  role: z.enum(["psicologo"],{
    errorMap: ()=>{return {message: "El rol no existe o debe ser 'psicologo'"}}
  }).optional(),

  datosPersonales: z.object({
    
    nivelAcademico: z.nativeEnum(NivelAcademico,{
      errorMap: ()=>{return {message: 'El nivel academico no es valido'}}
    }).optional()

  }).optional()
});

const createPsicologo: RequestHandler = async (req, res) => {
  try {
    const newPsicologo = new Psicologo(PsicologoSchema.parse(req.body));

    if(await Psicologo.findOne({email: newPsicologo.email})){
        return res.status(400).json({message: "Ya existe un psicologo con ese correo electronico !"})
    }

    //Hashing password (Was Very Buggy with @pre hooks)
    newPsicologo.password = await bcrypt.hash(newPsicologo.password, 10);

    await newPsicologo.save();

    return res.status(200).json(newPsicologo);
 
  } catch (error) {
    console.log(error);
   
    if (error instanceof ZodError) {
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
const updatePsicologo: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const isUpdated = UpdatePsicologoSchema.parse(req.body);

    if (isUpdated.password) {
      isUpdated.password = await bcrypt.hash(isUpdated.password, 10);
    }

    const updatePsicologo = await Psicologo.findByIdAndUpdate(
      id,
      isUpdated,
      { new: true }
    );

    return res.status(200).json(updatePsicologo);
  } catch (error) {
    console.log(error);
    if (error instanceof ZodError) {
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
const deletePsicologo: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const psicologo = await Psicologo.findByIdAndDelete(id);

    if(!psicologo){
        return res.status(404).json({message: "Psicologo no encontrado !"})
    }

    return res.status(200).json({ message: "Psicologo eliminado !" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};
const getPsicologo: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const psicologo = await Psicologo.findById(id);

    if (!psicologo) {
      return res.status(404).json({ message: "Psicologo no encontrado" });
    }

    return res.status(200).json(psicologo);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const getAllPsicologos: RequestHandler = async (req, res) => {
  try {
    const psicologo = await Psicologo.find().select("-password -createdAt -updatedAt -__v -role -datosPersonales._id");

    if (!psicologo) {
      return res.status(404).json({ message: "No hay ningun psicologo" });
    }

    return res.status(200).json(psicologo);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};
const getPsicologosColaboradores: RequestHandler = async (req, res) => {
  try {
    const psicologo = await Psicologo.find().where("_id").ne(req.psicologo?._id).select("-password -createdAt -updatedAt -__v -role -datosPersonales._id");

    if (!psicologo) {
      return res.status(404).json({ message: "No hay ningun psicologo" });
    }

    return res.status(200).json(psicologo);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

export {
  createPsicologo,
  updatePsicologo,
  deletePsicologo,
  getPsicologo,
  getAllPsicologos,
  getPsicologosColaboradores,
};
