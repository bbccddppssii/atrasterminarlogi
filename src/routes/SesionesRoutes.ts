import { Router } from "express";
import { createSession, deleteSession } from "../controllers/SesionesController";
import { checkObjectId } from "../middleware/checkObjectId";
import { checkPsicoAuth } from "../middleware/checkPsicoAuth";

const router = Router()

//GET all session
//POST create a session
//PUT edit type session
//DELETE delete session 

router.route("/")
    .get(checkPsicoAuth)
    .post(checkPsicoAuth,createSession)

router.route("/:id")
    .delete(checkPsicoAuth, checkObjectId,deleteSession)

export default router