import { RequestHandler } from "express";
import z, { ZodError } from "zod";
import EstudianteModel from "../models/Estudiante";
import bcrypt from "bcrypt";
import transformData from "../helpers/transformUpdateEstudiante";

const EstudianteSchema = z.object({
  nombre: z.string({ required_error: "El nombre es obligatorio" }).min(1, "El Nombre no puede estar vacio"),

  apellido: z.string({ required_error: "El apellido es obligatorio" }).min(1, "El apellido no puede estar vacio"),

  email: z.string({ required_error: "El email es obligatorio" }).min(1, "El Email esta vacio").email("Debe ser un email").regex(/@cdb.edu.sv\s*$/, "El correo no es de la institucion"),

  password: z.string().min(6, "La contraseña debe ser minimo de 6 caracteres").optional(),

  role: z.enum(["estudiante"], {
    errorMap: () => { return { message: "El rol no existe o debe ser 'estudiante'" } }
  }),

  datosPersonales: z.object({

    nivelBachiller: z.number().min(0, 'Nivel de bachiller invalido').max(3, 'Nivel de bachiller invalido'),
    
    especialidad: z.enum(['DSW', 'ATPS', 'ECA', 'EMCA', 'MNTO', 'DG'], {
      errorMap: () => { return { message: `La especialidad no es valida  ['DSW', 'ATPS', 'ECA', 'EMCA', 'MNTO', 'DG']` } }
    }).optional(),

    seccion: z.enum(['A','B','C','D','E','F','G','H','I'], {
      errorMap: () => { return { message: 'La seccion no es valida' } }
    }),
    codigo: z.number({ required_error: "El codigo es obligatorio" }).min(20000000, "El codigo es invalido").max(99999999, "El codigo es invalido")

  }, { required_error: "Datos personales son obligatorios" })

}).refine(({datosPersonales}) => datosPersonales.nivelBachiller>0 ? !!datosPersonales.especialidad : true,
   {message: 'La especialidad es necesaria si esta en un nivel de bachillerato'})

const UpdateEstudianteSchema = z.object({
  nombre: z.string({ required_error: "El nombre es obligatorio" }).min(1, "El Nombre no puede estar vacio").optional(),

  apellido: z.string({ required_error: "El apellido es obligatorio" }).min(1, "El apellido no puede estar vacio").optional(),

  email: z.string({ required_error: "El email es obligatorio" }).min(1, "El Email esta vacio").email("Debe ser un email").regex(/@cdb.edu.sv\s*$/, "El correo no es de la institucion").optional(),

  password: z.string({ required_error: "La contraseña es obligatoria" }).min(6, "La contraseña debe ser minimo de 6 caracteres").optional(),

  role: z.enum(["estudiante"], {
    errorMap: () => { return { message: "El rol no existe o debe ser 'estudiante'  " } }
  }).optional(),

  datosPersonales: z.object({

    nivelBachiller: z.number().min(0, 'Nivel de bachiller invalido').max(3, 'Nivel de bachiller invalido').optional(),
    
    especialidad: z.enum(['DSW', 'ATPS', 'ECA', 'EMCA', 'MNTO', 'DG'], {
      errorMap: () => { return { message: 'La especialidad no es valida' } }
    }).optional(),

    seccion: z.enum(['A','B','C','D','E','F','G','H','I'], {
      errorMap: () => { return { message: 'La seccion no es valida' } }
    }).optional(),
    
    codigo: z.number({ required_error: "El codigo es obligatorio" }).min(1, "El codigo no puede estar vacio").max(99999999, "El codigo es invalido").optional()

  }, { required_error: "Datos personales son obligatorios" }).optional()

}).refine((schema) => schema.datosPersonales?.nivelBachiller && schema.datosPersonales?.nivelBachiller>0 ? !!schema.datosPersonales?.especialidad : true,
{message: 'La especialidad es necesaria si esta en un nivel de bachillerato'});


const createEstudiante: RequestHandler = async (req, res) => {

  try {
    const newEstudiante = new EstudianteModel(EstudianteSchema.parse(req.body));

    if (await EstudianteModel.findOne({ $or: [{ email: newEstudiante.email }, { 'datosPersonales.codigo': newEstudiante.datosPersonales.codigo }] })) {
      return res.status(400).json({ message: "Ya existe un estudiante con ese correo electronico o ese codigo !" })
    }

    const estudiantePassword = Math.random().toString(36).slice(-8);

    //Hashing password (Was Very Buggy with @pre hooks)
    newEstudiante.password = await bcrypt.hash(estudiantePassword, 10);
    newEstudiante.defaultPassword = estudiantePassword;
    

    await newEstudiante.save();

    return res.status(200).json({
      newEstudiante,
    });

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
const updateEstudiante: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const isUpdated = UpdateEstudianteSchema.parse(req.body);

    if (isUpdated.password) {
      isUpdated.password = await bcrypt.hash(isUpdated.password, 10);
    }


    const sameEmailOrCode = await EstudianteModel.findOne({$and: [{_id: {$ne: id} },{ $or: [{ email: isUpdated.email }, { 'datosPersonales.codigo': isUpdated?.datosPersonales?.codigo }] }]});
    

    if ((isUpdated.email || isUpdated.datosPersonales?.codigo) && sameEmailOrCode) {
      return res.status(400).json({ message: "Ya existe un estudiante con ese correo electronico o ese codigo !" })
    }

    const payload = transformData(isUpdated);

    const updated = await EstudianteModel.findByIdAndUpdate(
      id,
      payload,
      { new: true }
    );

    return res.status(200).json(updated);
    
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
const deleteEstudiante: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const estudiante = await EstudianteModel.findByIdAndDelete(id);

    if (!estudiante) {
      return res.status(404).json({ message: "Estudiante no encontrado !" })
    }

    return res.status(200).json({ message: "Estudiante eliminado !" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};
const getEstudiante: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const estudiante = await EstudianteModel.findById(id);

    if (!estudiante) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    return res.status(200).json(estudiante);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};
const getEstudianteCodigo: RequestHandler = async(req,res)=>{
  try {
    const { codigo } = req.params;

    const estudiante = await EstudianteModel.findOne({"datosPersonales.codigo": codigo});
    console.log(codigo)
    console.log(estudiante)
    if (!estudiante) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    return res.status(200).json(estudiante);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}
const getAllEstudiante: RequestHandler = async (req, res) => {
  try {
    const estudiante = await EstudianteModel.find();

    if (!estudiante) {
      return res.status(404).json({ message: "No hay ningun estudiante" });
    }

    return res.status(200).json(estudiante);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

export {
    createEstudiante,
    updateEstudiante,
    deleteEstudiante,
    getEstudiante,
    getEstudianteCodigo,
    getAllEstudiante,
};
