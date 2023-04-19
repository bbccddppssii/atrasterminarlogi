import { Router } from "express";
import {
    createCita,
    updateCita,
    deleteCita,
    getAllMyCitas,
    getCita,
    postPoneCitas,
    deleteMultipleCitas,
    getCitaByRange,
    getCitaMonth,
} from "../controllers/CitaController";
import { checkObjectId } from "../middleware/checkObjectId";
import { checkPsicoAuth } from "../middleware/checkPsicoAuth";

const router = Router()

router.post("/rango",checkPsicoAuth,getCitaByRange)
router.post("/mes",checkPsicoAuth,getCitaMonth)
router.post("/posponer",checkPsicoAuth,postPoneCitas)
router.post("/eliminar-citas",checkPsicoAuth,deleteMultipleCitas)

router.route("/")
.get(checkPsicoAuth,getAllMyCitas)
.post(checkPsicoAuth,createCita)


router.route("/:id")
.get(checkPsicoAuth,checkObjectId,getCita)
.put(checkPsicoAuth,checkObjectId,updateCita)
.delete(checkPsicoAuth,checkObjectId,deleteCita)



export default router