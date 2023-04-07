import { Router } from "express";
import {
    createEstudiante,
    updateEstudiante,
    deleteEstudiante,
    getEstudiante,
    getAllEstudiante,
    getEstudianteCodigo,
} from "../controllers/EstudianteController";
import { checkPsicoAuth } from "../middleware/checkPsicoAuth";


const router = Router()


router.route("/")
.get(checkPsicoAuth,getAllEstudiante)
.post(checkPsicoAuth,createEstudiante)

router.route("/:id")
.put(checkPsicoAuth,updateEstudiante)
.get(checkPsicoAuth,getEstudiante)
    .delete(checkPsicoAuth,deleteEstudiante)
    
    router.route("/codigo/:codigo")
    .get(checkPsicoAuth,getEstudianteCodigo)
    
export default router