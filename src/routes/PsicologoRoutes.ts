import { Router } from "express";
import { createPsicologo, deletePsicologo, getAllPsicologos, getPsicologo, getPsicologosColaboradores, updatePsicologo } from "../controllers/PsicologoController";
import { checkAdminAuth } from "../middleware/checkAdminAuth";
import { checkPsicoAuth } from "../middleware/checkPsicoAuth";


const router = Router()


router.get("/psicologosColaboradores",checkPsicoAuth,getPsicologosColaboradores);

router.route("/")
    .get(checkAdminAuth, getAllPsicologos)
    .post(checkAdminAuth, createPsicologo)

router.route("/:id")
    .put(checkAdminAuth, updatePsicologo)
    .get(checkAdminAuth, getPsicologo)
    .delete(checkAdminAuth, deletePsicologo)


export default router